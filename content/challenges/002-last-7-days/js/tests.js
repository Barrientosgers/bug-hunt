const order = (id, day, cents = 1000) => ({ id, day, cents });
const ids = (list) => list.map((o) => o.id);

test('includes an order placed today', () => {
  expect(ids(recentOrders([order('A', 20)], 20, 7))).toEqual(['A']);
});

test('includes an order from 6 days ago', () => {
  expect(ids(recentOrders([order('A', 14)], 20, 7))).toEqual(['A']);
});

test('leaves out an order from exactly 7 days ago', () => {
  expect(ids(recentOrders([order('A', 13)], 20, 7))).toEqual([]);
});

test('works for other window sizes too', () => {
  const orders = [order('today', 20), order('yesterday', 19)];
  expect(ids(recentOrders(orders, 20, 1))).toEqual(['today']);
});

test('adds up only the recent orders', () => {
  const orders = [order('A', 20, 1000), order('B', 14, 500), order('C', 13, 9999)];
  expect(recentTotalCents(orders, 20, 7)).toBe(1500);
});

test.bonus('ignores orders dated in the future', () => {
  const orders = [order('A', 20), order('glitch', 25)];
  expect(ids(recentOrders(orders, 20, 7))).toEqual(['A']);
});
