// orders.js: powers the "Last 7 days" summary on the merchant dashboard.
// `day` is a day number (1 = launch day). Orders look like { id: "A1", day: 20, cents: 1250 }.

// `today` counts as day 1 of the window, so "the last 7 days" means today and the 6 days before it.
function isRecent(order, today, days) {
  const age = today - order.day; // 0 means "placed today"
  return age >= 0 && age < days;
}

function recentOrders(orders, today, days) {
  return orders.filter((order) => isRecent(order, today, days));
}

function recentTotalCents(orders, today, days) {
  return recentOrders(orders, today, days).reduce((sum, order) => sum + order.cents, 0);
}
