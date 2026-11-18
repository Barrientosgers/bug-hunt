// receipt.js: totals an order. The menu API sends prices in dollars, e.g. { price: 0.1, qty: 1 }.

function orderTotalCents(items) {
  let total = 0;
  for (const item of items) {
    total += Math.round(item.price * 100) * item.qty;
  }
  return total;
}

function formatMoney(cents) {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
