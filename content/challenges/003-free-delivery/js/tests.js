test('charges the fee just under the minimum', () => {
  expect(deliveryFee(2499)).toBe(299);
});

test('delivery is free at exactly $25.00', () => {
  expect(deliveryFee(2500)).toBe(0);
});

test('delivery is free above the minimum', () => {
  expect(deliveryFee(3000)).toBe(0);
});

test('the total at exactly $25.00 has no fee added', () => {
  expect(orderTotal(2500)).toBe(2500);
});

test('the total below the minimum includes the fee', () => {
  expect(orderTotal(1000)).toBe(1299);
});

test.bonus('an empty cart has no delivery fee', () => {
  expect(deliveryFee(0)).toBe(0);
});
