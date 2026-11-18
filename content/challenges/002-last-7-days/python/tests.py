def order(order_id, day, cents=1000):
    return {"id": order_id, "day": day, "cents": cents}


def ids(orders):
    return [o["id"] for o in orders]


def test_includes_an_order_placed_today():
    assert ids(recent_orders([order("A", 20)], 20, 7)) == ["A"]


def test_includes_an_order_from_6_days_ago():
    assert ids(recent_orders([order("A", 14)], 20, 7)) == ["A"]


def test_leaves_out_an_order_from_exactly_7_days_ago():
    assert ids(recent_orders([order("A", 13)], 20, 7)) == []


def test_works_for_other_window_sizes_too():
    orders = [order("today", 20), order("yesterday", 19)]
    assert ids(recent_orders(orders, 20, 1)) == ["today"]


def test_adds_up_only_the_recent_orders():
    orders = [order("A", 20, 1000), order("B", 14, 500), order("C", 13, 9999)]
    assert recent_total_cents(orders, 20, 7) == 1500


def test_bonus_ignores_orders_dated_in_the_future():
    orders = [order("A", 20), order("glitch", 25)]
    assert ids(recent_orders(orders, 20, 7)) == ["A"]
