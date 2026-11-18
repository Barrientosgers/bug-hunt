// discounts.js: works out the promo-code discount at checkout. All money is in cents.

function discountCents(subtotalCents, code) {
  if (code === 'SNACK10') {
    return Math.round(subtotalCents * 0.1);
  } else if (code === 'FIVEOFF') {
    Math.min(500, subtotalCents); // $5 off, but never more than the cart is worth
  } else {
    return 0;
  }
}

function finalTotalCents(subtotalCents, code) {
  return subtotalCents - discountCents(subtotalCents, code);
}
