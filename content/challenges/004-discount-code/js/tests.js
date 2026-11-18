test('SNACK10 takes 10% off', () => {
  expect(discountCents(2000, 'SNACK10')).toBe(200);
});

test('an unknown code gives no discount', () => {
  expect(discountCents(2000, 'NOPE')).toBe(0);
});

test('FIVEOFF takes $5 off', () => {
  expect(discountCents(2000, 'FIVEOFF')).toBe(500);
});

test('FIVEOFF never takes off more than the cart is worth', () => {
  expect(discountCents(300, 'FIVEOFF')).toBe(300);
});

test('the final total with FIVEOFF is the subtotal minus $5', () => {
  expect(finalTotalCents(2000, 'FIVEOFF')).toBe(1500);
});

test.bonus('codes typed in lowercase still work', () => {
  expect(discountCents(2000, 'snack10')).toBe(200);
});
