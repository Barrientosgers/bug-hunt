# leaderboard.py: powers the "Top Snackers" list on the home screen.
# `players` comes straight from the API: [{"name": "Ana", "points": "95"}, ...]


def format_entry(player, position):
    return f"{position}. {player['name']} - {player['points']} pts"


def top_players(players, n):
    """Return the `n` players with the most points, best first."""
    ranked = sorted(players, key=lambda player: int(player["points"]), reverse=True)
    return ranked[:n]


def render_leaderboard(players, n):
    top = top_players(players, n)
    return [format_entry(player, i + 1) for i, player in enumerate(top)]
