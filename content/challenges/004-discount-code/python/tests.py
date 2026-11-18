def test_snack10_takes_10_percent_off():
    assert discount_cents(2000, "SNACK10") == 200


def test_an_unknown_code_gives_no_discount():
    assert discount_cents(2000, "NOPE") == 0


def test_fiveoff_takes_5_dollars_off():
    assert discount_cents(2000, "FIVEOFF") == 500


def test_fiveoff_never_takes_off_more_than_the_cart_is_worth():
    assert discount_cents(300, "FIVEOFF") == 300


def test_the_final_total_with_fiveoff_is_the_subtotal_minus_5_dollars():
    assert final_total_cents(2000, "FIVEOFF") == 1500


def test_bonus_codes_typed_in_lowercase_still_work():
    assert discount_cents(2000, "snack10") == 200
