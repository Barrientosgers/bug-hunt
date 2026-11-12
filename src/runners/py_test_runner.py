"""A tiny pytest-style test runner.

Tests are plain functions named ``test_*`` that use plain ``assert``. Functions named
``test_bonus_*`` are bonus tests (extra findings that never block "solved").

Used in two places, so CI and the browser behave identically:
  * the verify script:  python3 -I py_test_runner.py  (JSON on stdin, JSON on stdout)
  * Pyodide, inside a Web Worker:  run_tests(user_code, test_code)

SAFETY: this executes untrusted code with ``exec``. Only run it in a Web Worker or a
subprocess, never in the main page. Keep it compatible with Python 3.9+.
"""

import ast
import contextlib
import io
import json
import sys

TEST_FILE = "<tests>"


def _safe_repr(value):
    try:
        return repr(value)
    except Exception:
        return "<unprintable>"


def _explain_assertion(error, test_lines):
    """Turn a failed ``assert a == b`` into got/expected values (best effort)."""
    frame = None
    line_no = None
    tb = error.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == TEST_FILE:
            frame, line_no = tb.tb_frame, tb.tb_lineno
        tb = tb.tb_next
    if frame is None or line_no is None or line_no > len(test_lines):
        return {"message": str(error) or "assertion failed"}

    source = test_lines[line_no - 1].strip()
    details = {"message": str(error) or "assertion failed: " + source}
    try:
        node = ast.parse(source).body[0]
        test = node.test
        if (
            isinstance(node, ast.Assert)
            and isinstance(test, ast.Compare)
            and len(test.ops) == 1
            and isinstance(test.ops[0], ast.Eq)
        ):
            def evaluate(expr):
                wrapped = ast.fix_missing_locations(ast.Expression(expr))
                code = compile(wrapped, TEST_FILE, "eval")
                return eval(code, frame.f_globals, frame.f_locals)

            # Re-evaluating runs the player's code again, so throw away its output.
            with contextlib.redirect_stdout(io.StringIO()):
                got = evaluate(test.left)
                expected = evaluate(test.comparators[0])
            details["got"] = _safe_repr(got)
            details["expected"] = _safe_repr(expected)
            details["message"] = "values are not equal: " + ast.unparse(test)
    except Exception:
        pass
    return details


def run_tests(user_code, test_code):
    result = {"tests": [], "console": []}
    namespace = {"__name__": "bughunt_sandbox"}
    captured = io.StringIO()

    with contextlib.redirect_stdout(captured):
        try:
            exec(compile(user_code, "<your code>", "exec"), namespace)
            exec(compile(test_code, TEST_FILE, "exec"), namespace)
        except BaseException as error:  # SyntaxError, NameError, SystemExit, ...
            result["error"] = "{}: {}".format(type(error).__name__, error)
            result["console"] = captured.getvalue().splitlines()
            return result

        test_lines = test_code.splitlines()
        for name, fn in list(namespace.items()):
            is_test = name.startswith("test_") and callable(fn)
            if not is_test or fn.__code__.co_filename != TEST_FILE:
                continue
            outcome = {"name": name, "bonus": name.startswith("test_bonus_")}
            try:
                fn()
                outcome["passed"] = True
            except AssertionError as error:
                outcome["passed"] = False
                outcome.update(_explain_assertion(error, test_lines))
            except Exception as error:
                outcome["passed"] = False
                outcome["message"] = "{}: {}".format(type(error).__name__, error)
            result["tests"].append(outcome)

    result["console"] = captured.getvalue().splitlines()
    return result


if __name__ == "__main__":
    payload = json.load(sys.stdin)
    print(json.dumps(run_tests(payload["code"], payload["tests"])))
