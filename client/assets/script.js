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
                        <img src="assets/logos/${match.team1}.svg" class="img-fluid img-vote" style="max-width: 100px;" onclick="vote('${match.team1}', ${match.id})">
                        <h5 class="card-title">${match.team1} @ ${match.team2}</h5>
                        <img src="assets/logos/${match.team2}.svg" class="img-fluid img-vote" style="max-width: 100px;" onclick="vote('${match.team2}', ${match.id})">
                    </div>
                    <p class="card-text">${match.date} | ${match.time}</p>
                </div>`
                section.appendChild(card);
                const totalVotes = match.team1Votes + match.team2Votes;
                const team1Percent = Math.round((match.team1Votes / totalVotes) * 100);
                const team2Percent = Math.round((match.team2Votes / totalVotes) * 100);
                const bar = document.createElement("div");
                bar.className = "progress";
                bar.style.height = "30px";
                bar.innerHTML = `
                <div id="team1Bar${match.id}" class="progress-bar progress-bar-left" role="progressbar" style="width: ${team1Percent}%" 
                 aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                ${match.team1Votes} votes
                </div>
                <div id="team2Bar${match.id}" class="progress-bar progress-bar-right" role="progressbar" style="width: ${team2Percent}%" 
                 aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                ${match.team2Votes} votes
                </div>`;
                section.appendChild(bar);
            }
        });
}

function vote(team, id) {
    fetch("/api/vote", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id,
            team: team
        })
    })
        .then(resp => resp.json())
        .then(match => {
            const totalVotes = match.team1Votes + match.team2Votes;
            const team1Percent = Math.round((match.team1Votes / totalVotes) * 100);
            const team2Percent = Math.round((match.team2Votes / totalVotes) * 100);
            document.getElementById(`team1Bar${match.id}`).style.width = `${team1Percent}%`;
            document.getElementById(`team2Bar${match.id}`).style.width = `${team2Percent}%`;
            document.getElementById(`team1Bar${match.id}`).innerHTML = `${match.team1Votes} votes`;
            document.getElementById(`team2Bar${match.id}`).innerHTML = `${match.team2Votes} votes`;
        })
}


document.addEventListener("DOMContentLoaded", viewHome);

document.getElementById("showStandings").addEventListener("click", viewStandings);
document.getElementById("showSchedule").addEventListener("click", viewSchedule);
document.getElementById("title").addEventListener("click", viewHome);

document.getElementById("seeTheStandings").addEventListener("click", viewStandings);
document.getElementById("seeTheSchedule").addEventListener("click", viewSchedule);