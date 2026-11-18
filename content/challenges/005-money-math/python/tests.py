def test_adds_a_10_cent_item_and_a_20_cent_item_exactly():
    items = [{"price": 0.1, "qty": 1}, {"price": 0.2, "qty": 1}]
    assert order_total_cents(items) == 30


def test_ten_10_cent_items_cost_exactly_one_dollar():
    items = [{"price": 0.1, "qty": 1} for _ in range(10)]
    assert order_total_cents(items) == 100


def test_multiplies_the_price_by_the_quantity():
    assert order_total_cents([{"price": 19.99, "qty": 3}]) == 5997


def test_an_empty_order_costs_nothing():
    assert order_total_cents([]) == 0


def test_formats_cents_as_dollars():
    assert format_money(1999) == "$19.99"


def test_bonus_formats_a_refund_with_the_minus_sign_first():
    assert format_money(-250) == "-$2.50"
