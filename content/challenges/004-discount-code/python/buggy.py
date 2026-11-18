# discounts.py: works out the promo-code discount at checkout. All money is in cents.


def discount_cents(subtotal_cents, code):
    if code == "SNACK10":
        return round(subtotal_cents * 0.1)
    elif code == "FIVEOFF":
        min(500, subtotal_cents)  # $5 off, but never more than the cart is worth
    else:
        return 0


def final_total_cents(subtotal_cents, code):
    return subtotal_cents - discount_cents(subtotal_cents, code)
