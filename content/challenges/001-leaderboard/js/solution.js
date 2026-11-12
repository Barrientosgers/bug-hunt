// leaderboard.js: powers the "Top Snackers" list on the home screen.
// `players` comes straight from the API: [{ name: "Ana", points: "95" }, ...]

function formatEntry(player, position) {
  return `${position}. ${player.name} - ${player.points} pts`;
}

// Returns the `n` players with the most points, best first.
function topPlayers(players, n) {
  const ranked = [...players].sort((a, b) => Number(b.points) - Number(a.points));
  return ranked.slice(0, n);
}

function renderLeaderboard(players, n) {
  return topPlayers(players, n).map((player, index) => formatEntry(player, index + 1));
}
