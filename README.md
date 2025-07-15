# 🏈 NFL Perry Game Mode Chrome Assistant

This Chrome Extension enhances [nflperry.com/game-mode](https://nflperry.com/game-mode) by automatically suggesting the best fantasy football players each round — based on historical single-season fantasy point totals.

When a team is randomly selected, the assistant:
- Detects which team is randomly selected
- Finds the players with top fantasy season points from that team
- Recommends the top 5 players in a floating panel on the page

---

## 🔧 How It Works

- Monitors the team name as it's selected on the game page
- Uses a local `best_seasons.json` file containing preprocessed player stats
- Filters players by team and eligible fantasy positions
- Sorts by single-season fantasy points and shows the best fits

---

 ## Limitations
 
 - Right now, it only has the correct options up until 2021 due to limited access for recent player fantasy data
 - The chrome assistant can't detect which positions have been chosen yet.
