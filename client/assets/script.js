document.getElementById("showTeams").addEventListener("click", function() {
    document.getElementById("teams").style.display = "block";
    document.getElementById("matches").style.display = "none";
    getTeams();
});

document.getElementById("showMatches").addEventListener("click", function() {
    document.getElementById("teams").style.display = "none";
    document.getElementById("matches").style.display = "block";
    getMatches();
});

function getTeams() {
    fetch("/api/teams")
        .then(resp => resp.json())
        .then(teams => {
            teams.sort((a, b) => a.position - b.position);
            const body = document.getElementById("teamsTableBody")
            body.innerHTML = "";
            for (let team of teams) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <th scope="row">${team.position}</th>
                    <td><img src="${team.logo}" height=35 width=35></img></td>
                    <td>${team.name}</td>
                    <td>${team.gamesPlayed}</td>
                    <td>${team.points}</td>`;
                body.appendChild(row);}
        });
}

function getMatches() {
    fetch("/api/matches")
        .then(resp => resp.json())
        .then(matches => {
            matches.sort((a, b) => a.order - b.order);
            const section = document.getElementById("matches")
            section.innerHTML = "";
            for (let match of matches) {
                const card = document.createElement("div");
                card.className = "card text-center mb-3";
                card.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-around align-items-center">
                        <img src="assets/logos/${match.team1}.svg" class="img-fluid" style="max-width: 100px;">
                        <h5 class="card-title">${match.team1} vs. ${match.team2}</h5>
                        <img src="assets/logos/${match.team2}.svg" class="img-fluid" style="max-width: 100px;">
                    </div>
                    <p class="card-text">${match.date} | ${match.time}</p>
                </div>`
                section.appendChild(card);
            }
        });
}