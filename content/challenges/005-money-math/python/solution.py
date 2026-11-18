# receipt.py: totals an order. The menu API sends prices in dollars, e.g. {"price": 0.1, "qty": 1}.


def order_total_cents(items):
    total = 0
    for item in items:
        total += round(item["price"] * 100) * item["qty"]
    return total


def format_money(cents):
    sign = "-" if cents < 0 else ""
    return f"{sign}${abs(cents) / 100:.2f}"
