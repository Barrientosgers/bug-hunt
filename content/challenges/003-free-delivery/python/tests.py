def test_charges_the_fee_just_under_the_minimum():
    assert delivery_fee(2499) == 299


def test_delivery_is_free_at_exactly_25_dollars():
    assert delivery_fee(2500) == 0


def test_delivery_is_free_above_the_minimum():
    assert delivery_fee(3000) == 0


def test_the_total_at_exactly_25_dollars_has_no_fee_added():
    assert order_total(2500) == 2500


def test_the_total_below_the_minimum_includes_the_fee():
    assert order_total(1000) == 1299


def test_bonus_an_empty_cart_has_no_delivery_fee():
    assert delivery_fee(0) == 0
