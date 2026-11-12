def make_players():
    return [
        {"name": "Ana", "points": "95"},
        {"name": "Ben", "points": "120"},
        {"name": "Cy", "points": "8"},
    ]


def names(players):
    return [player["name"] for player in players]


def test_ranks_120_points_above_95_points():
    assert names(top_players(make_players(), 3)) == ["Ben", "Ana", "Cy"]


def test_returns_only_the_top_n_players():
    assert names(top_players(make_players(), 2)) == ["Ben", "Ana"]


def test_sorts_correctly_when_every_score_has_the_same_number_of_digits():
    players = [
        {"name": "Dee", "points": "40"},
        {"name": "Eli", "points": "70"},
        {"name": "Fay", "points": "10"},
    ]
    assert names(top_players(players, 3)) == ["Eli", "Dee", "Fay"]


def test_renders_numbered_leaderboard_lines():
    assert render_leaderboard(make_players(), 1) == ["1. Ben - 120 pts"]


def test_bonus_does_not_reorder_the_original_players_list():
    players = make_players()
    top_players(players, 3)
    assert names(players) == ["Ana", "Ben", "Cy"]
