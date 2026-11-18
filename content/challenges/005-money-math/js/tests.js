test('adds a 10 cent item and a 20 cent item exactly', () => {
  const items = [
    { price: 0.1, qty: 1 },
    { price: 0.2, qty: 1 },
  ];
  expect(orderTotalCents(items)).toBe(30);
});

test('ten 10 cent items cost exactly one dollar', () => {
  const items = Array.from({ length: 10 }, () => ({ price: 0.1, qty: 1 }));
  expect(orderTotalCents(items)).toBe(100);
});

test('multiplies the price by the quantity', () => {
  expect(orderTotalCents([{ price: 19.99, qty: 3 }])).toBe(5997);
});

test('an empty order costs nothing', () => {
  expect(orderTotalCents([])).toBe(0);
});

test('formats cents as dollars', () => {
  expect(formatMoney(1999)).toBe('$19.99');
});

test.bonus('formats a refund with the minus sign first', () => {
  expect(formatMoney(-250)).toBe('-$2.50');
});
