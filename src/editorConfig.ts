/**
 * Monaco (the editor from VS Code) is loaded from the jsDelivr CDN at runtime, like
 * Pyodide, so it adds nothing to our bundle. This version must match the installed
 * `monaco-editor` package (a test checks it).
 */
export const MONACO_VERSION = '0.57.0'
export const MONACO_CDN_PATH = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`
