# delivery.py: decides the delivery fee at checkout. All money is in cents.

FREE_DELIVERY_MIN_CENTS = 2500  # "Free delivery on orders of $25 or more"
DELIVERY_FEE_CENTS = 299


def delivery_fee(subtotal_cents):
    if subtotal_cents > FREE_DELIVERY_MIN_CENTS:
        return 0
    return DELIVERY_FEE_CENTS


def order_total(subtotal_cents):
    return subtotal_cents + delivery_fee(subtotal_cents)
