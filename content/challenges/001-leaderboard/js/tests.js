const makePlayers = () => [
  { name: 'Ana', points: '95' },
  { name: 'Ben', points: '120' },
  { name: 'Cy', points: '8' },
];

test('ranks 120 points above 95 points', () => {
  const names = topPlayers(makePlayers(), 3).map((p) => p.name);
  expect(names).toEqual(['Ben', 'Ana', 'Cy']);
});

test('returns only the top n players', () => {
  const names = topPlayers(makePlayers(), 2).map((p) => p.name);
  expect(names).toEqual(['Ben', 'Ana']);
});

test('sorts correctly when every score has the same number of digits', () => {
  const players = [
    { name: 'Dee', points: '40' },
    { name: 'Eli', points: '70' },
    { name: 'Fay', points: '10' },
  ];
  const names = topPlayers(players, 3).map((p) => p.name);
  expect(names).toEqual(['Eli', 'Dee', 'Fay']);
});

test('renders numbered leaderboard lines', () => {
  const lines = renderLeaderboard(makePlayers(), 1);
  expect(lines).toEqual(['1. Ben - 120 pts']);
});

test.bonus('does not reorder the original players list', () => {
  const players = makePlayers();
  topPlayers(players, 3);
  expect(players.map((p) => p.name)).toEqual(['Ana', 'Ben', 'Cy']);
});
