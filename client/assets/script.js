document.getElementById("showTeams").addEventListener("click", function() {
    document.getElementById("teams").style.display = "block";
    document.getElementById("matches").style.display = "none";
    getTeams();
});

document.getElementById("showMatches").addEventListener("click", function() {
    document.getElementById("teams").style.display = "none";
    document.getElementById("matches").style.display = "block";
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