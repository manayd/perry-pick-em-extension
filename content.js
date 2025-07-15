console.log("🏈 NFL Perry Assistant loaded");

let playerData = [];
let lastTeamName = "";
let debounceTimer = null;

// === LOAD JSON DATA ===
fetch(chrome.runtime.getURL("best_fantasy_seasons.json"))
  .then(res => res.json())
  .then(json => {
    playerData = json;
    console.log("✅ Loaded best_seasons.json with", playerData.length, "players");
    watchForTeamChanges();
  })
  .catch(err => {
    console.error("❌ Failed to load player data:", err);
  });

// === WATCH FOR TEAM CHANGES ===
function watchForTeamChanges() {
  const observer = new MutationObserver(() => {
    const teamEl = document.querySelector("span.text-2xl.font-extrabold");
    if (!teamEl) return;

    const teamName = teamEl.innerText.trim();

    if (teamName === lastTeamName) return;

    lastTeamName = teamName;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      console.log("🎯 Team selected:", teamName);

      // Debug logs
      console.log("🔑 All loaded teams:", [...new Set(playerData.map(p => p.FullTeamName))]);
      console.log("💡 Players for team:", playerData.filter(p => p.FullTeamName === teamName));

      const openPositions = getOpenPositions();
      console.log("📌 Open positions:", openPositions);

      const suggestions = getTopPlayers(teamName, openPositions);
      console.log("🧪 Top suggestions:", suggestions);

      showSuggestions(suggestions);
    }, 1500);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function getOpenPositions() {
  // All 7 rows
  const rows = Array.from(document.querySelectorAll("div.row"));

  // Define the 7 fantasy slots exactly, including flex slots
  const allPositions = ["QB", "RB", "WR", "WR", "TE", "FLEX", "FLEX"];

  // Find positions that are already selected
  const takenPositions = [];

  rows.forEach(row => {
    const classList = row.classList;

    // Check if this row is selected (opacity-100 and cursor-default)
    if (classList.contains("opacity-100") && classList.contains("cursor-default")) {
      // Find the selected position text inside the row
      // Assuming there is a select or input element with the position as text/value
      // This depends on website structure — example for a <select> element:
      const select = row.querySelector("select, input, .some-position-class");
      let pos = null;

      if (select) {
        if (select.tagName === "SELECT") {
          pos = select.value; // position abbreviation or name from dropdown
        } else if (select.tagName === "INPUT") {
          pos = select.value.trim();
        } else {
          pos = select.innerText.trim();
        }
      }

      if (pos) takenPositions.push(pos);
    }
  });

  // Now remove taken positions from allPositions (removing only one occurrence each time)
  const open = [...allPositions];
  takenPositions.forEach(pos => {
    const idx = open.indexOf(pos);
    if (idx !== -1) open.splice(idx, 1);
  });

  return open;
}


// === CHECK IF PLAYER POSITION IS ELIGIBLE GIVEN OPEN POSITIONS ===
function isEligible(position, openPositions) {
  const canPlayFlex = ["RB", "WR", "TE"];
  const direct = openPositions.includes(position);
  const flex = canPlayFlex.includes(position) && openPositions.includes("FLEX");
  return direct || flex;
}

// === GET TOP PLAYERS FOR TEAM AND OPEN POSITIONS ===
function getTopPlayers(teamName, openPositions, count = 5) {
  const playersOnTeam = playerData.filter(p => p.FullTeamName === teamName);
  const eligible = playersOnTeam.filter(p => isEligible(p.Pos, openPositions));

  return eligible
    .sort((a, b) => b.FantasyPoints - a.FantasyPoints)
    .slice(0, count);
}

// === SHOW SUGGESTIONS IN FLOATING BOX ===
function showSuggestions(players) {
  let box = document.getElementById("nfl-assistant-box");

  if (!box) {
    box = document.createElement("div");
    box.id = "nfl-assistant-box";
    box.style.position = "fixed";
    box.style.top = "10px";
    box.style.right = "10px";
    box.style.background = "white";
    box.style.border = "2px solid #222";
    box.style.borderRadius = "8px";
    box.style.padding = "10px";
    box.style.zIndex = "9999";
    box.style.boxShadow = "0 0 8px rgba(0,0,0,0.2)";
    box.style.maxWidth = "280px";
    box.style.fontSize = "14px";
    box.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    document.body.appendChild(box);
  }

  if (players.length === 0) {
    box.innerHTML = `<strong>🛑 No eligible players found</strong>`;
    return;
  }

  box.innerHTML = `
    <strong>🔥 Top Recommendations:</strong><br>
    ${players.map((p, i) =>
      `${i + 1}. ${p.Player} (${p.Pos})<br>&nbsp;&nbsp;${p.FantasyPoints.toFixed(1)} pts`
    ).join("<br>")}
  `;
}
