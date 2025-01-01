function viewStandings() {
    document.getElementById("standings").style.display = "block";
    document.getElementById("home").style.display = "none";
    document.getElementById("schedule").style.display = "none";
    getStandings();
}

function viewSchedule() {
    document.getElementById("standings").style.display = "none";
    document.getElementById("home").style.display = "none";
    document.getElementById("schedule").style.display = "block";
    getSchedule();
}

function viewHome() {
    document.getElementById("standings").style.display = "none";
    document.getElementById("home").style.display = "block";
    document.getElementById("schedule").style.display = "none";
    getHome();
}

function getHome() {
    fetch("/api/home")
        .then(resp => resp.json())
        .then(data => {
            document.getElementById("topTeamName").innerHTML = data.topTeam.name;
            document.getElementById("topTeamLogo").innerHTML = `
            <img src="${data.topTeam.logo}" class="img-fluid" height=190 width=190>`
            document.getElementById("nextMatchTeams").innerHTML = `
            ${data.nextMatch.team1} @ ${data.nextMatch.team2}`;
            document.getElementById("nextMatchLogos").innerHTML = `
            <img src="assets/logos/${data.nextMatch.team1}.svg" class="img-fluid" height=190 width=190>
            <img src="assets/logos/${data.nextMatch.team2}.svg" class="img-fluid" height=190 width=190>`;
        });
}

function getStandings() {
    fetch("/api/standings")
        .then(resp => resp.json())
        .then(teams => {
            const body = document.getElementById("standingsBody")
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

function getSchedule() {
    fetch("/api/schedule")
        .then(resp => resp.json())
        .then(matches => {
            const section = document.getElementById("schedule")
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

document.addEventListener("DOMContentLoaded", viewHome);

document.getElementById("showStandings").addEventListener("click", viewStandings);
document.getElementById("showSchedule").addEventListener("click", viewSchedule);
document.getElementById("title").addEventListener("click", viewHome);

document.getElementById("seeTheStandings").addEventListener("click", viewStandings);
document.getElementById("seeTheSchedule").addEventListener("click", viewSchedule);