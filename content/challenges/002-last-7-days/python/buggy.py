# orders.py: powers the "Last 7 days" summary on the merchant dashboard.
# `day` is a day number (1 = launch day). Orders look like {"id": "A1", "day": 20, "cents": 1250}.


def is_recent(order, today, days):
    """`today` counts as day 1 of the window, so "the last 7 days" is today and the 6 days before it."""
    age = today - order["day"]  # 0 means "placed today"
    return age <= days


def recent_orders(orders, today, days):
    return [order for order in orders if is_recent(order, today, days)]


def recent_total_cents(orders, today, days):
    return sum(order["cents"] for order in recent_orders(orders, today, days))
