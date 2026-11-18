# receipt.py: totals an order. The menu API sends prices in dollars, e.g. {"price": 0.1, "qty": 1}.


def order_total_cents(items):
    total = 0
    for item in items:
        total += item["price"] * item["qty"]
    return total * 100


def format_money(cents):
    return f"${cents / 100:.2f}"
