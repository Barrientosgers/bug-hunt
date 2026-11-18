// delivery.js: decides the delivery fee at checkout. All money is in cents.

const FREE_DELIVERY_MIN_CENTS = 2500; // "Free delivery on orders of $25 or more"
const DELIVERY_FEE_CENTS = 299;

function deliveryFee(subtotalCents) {
  if (subtotalCents === 0) {
    return 0; // nothing in the cart, nothing to deliver
  }
  if (subtotalCents >= FREE_DELIVERY_MIN_CENTS) {
    return 0;
  }
  return DELIVERY_FEE_CENTS;
}

function orderTotal(subtotalCents) {
  return subtotalCents + deliveryFee(subtotalCents);
}
