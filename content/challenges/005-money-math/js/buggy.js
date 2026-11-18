// receipt.js: totals an order. The menu API sends prices in dollars, e.g. { price: 0.1, qty: 1 }.

function orderTotalCents(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return total * 100;
}

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
