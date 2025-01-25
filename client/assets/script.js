function viewStandings() {
    document.getElementById("standings").style.display = "block";
    document.getElementById("home").style.display = "none";
    document.getElementById("schedule").style.display = "none";
    fetch("/api/standings")
        .then(resp => resp.json())
        .then(teams => getStandings(teams));
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
            ${data.nextMatch.away} @ ${data.nextMatch.home}`;
            document.getElementById("nextMatchLogos").innerHTML = `
            <img src="assets/logos/${data.nextMatch.away}.svg" class="img-fluid" height=190 width=190>
            <img src="assets/logos/${data.nextMatch.home}.svg" class="img-fluid" height=190 width=190>`;
        });
}

function getStandings(teams) {
    let buttonText = "Add Your Fantasy Team";
    const body = document.getElementById("standingsBody")
        body.innerHTML = "";
        for (let team of teams) {
            const row = document.createElement("tr");
            if (team.id === "FAN") {
                row.style.setProperty("--bs-table-bg", "#ff7d7d");
                row.style.setProperty("--bs-table-accent-bg", "#ff7d7d");
                row.style.setProperty("--bs-table-hover-bg", "#ff7d7d");
                row.style.setProperty("--bs-table-striped-bg", "#ff7d7d");
                row.style.backgroundColor = "#ff7d7d";
                buttonText = "Remove Your Fantasy Team";
            }
            row.innerHTML = `
                <th scope="row">${team.position}</th>
                <td><img src="${team.logo}" height=35 width=35></img></td>
                <td>${team.name}</td>
                <td>${team.gamesPlayed}</td>
                <td>${team.points}</td>`;
            body.appendChild(row);
        }
    const buttonDiv = document.getElementById("teamButtonDiv");
    if (buttonText === "Remove Your Fantasy Team") {
        buttonDiv.innerHTML = `
        <button class="btn btn-addTeam" type="button" onclick="removeFantasyTeam()">${buttonText}</button>`;
    } else {
        buttonDiv.innerHTML = `
        <button class="btn btn-addTeam" type="button" data-bs-toggle="modal" data-bs-target="#teamModal">${buttonText}</button>`;
    }
}

function removeFantasyTeam() {
    document.getElementById("teamButtonDiv").innerHTML = "";
    fetch("/api/team/remove", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(resp => resp.json())
    .then(teams => getStandings(teams));
}

function getSchedule() {
    fetch("/api/schedule")
        .then(resp => resp.json())
        .then(matches => {
            const cards = document.getElementById("matchCards")
            cards.innerHTML = ""
            for (let match of matches) {
                const card = document.createElement("div");
                card.className = "card text-center mb-3";
                card.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-around align-items-center">
                        <img src="assets/logos/${match.away}.svg" class="img-fluid img-vote" style="max-width: 100px;" onclick="vote('${match.away}', ${match.id})">
                        <h5 class="card-title">${match.away} @ ${match.home}</h5>
                        <img src="assets/logos/${match.home}.svg" class="img-fluid img-vote" style="max-width: 100px;" onclick="vote('${match.home}', ${match.id})">
                    </div>
                    <p class="card-text">${match.date} | ${match.time}</p>
                </div>`
                cards.appendChild(card);
                const bar = document.createElement("div");
                bar.className = "progress";
                bar.style.height = "30px";
                bar.innerHTML = `
                <div id="awayBar${match.id}" class="progress-bar progress-bar-left" role="progressbar" style="width: ${match.awayPercent}%" 
                 aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                ${match.awayVotes} votes
                </div>
                <div id="homeBar${match.id}" class="progress-bar progress-bar-right" role="progressbar" style="width: ${match.homePercent}%" 
                 aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
                ${match.homeVotes} votes
                </div>`;
                cards.appendChild(bar);
                const odds = document.createElement("div");
                odds.className = "d-flex justify-content-evenly my-3";
                odds.innerHTML = `
                <div id="awayOdds${match.id}" class="odds-display my-2">${match.awayOdds.toFixed(2)}</div>
                <h1 class="display-6 fw-bold my-3" style="font-size: 28px;">- The User's Odds -</h1>
                <div id="homeOdds${match.id}" class="odds-display my-2">${match.homeOdds.toFixed(2)}</div>`
                cards.appendChild(odds);
            }
        buttonDiv = document.getElementById("matchButtonDiv");
        buttonDiv.innerHTML = `<button class="btn btn-addTeam" type="button" data-bs-toggle="modal" data-bs-target="#matchModal">Add A Fantasy Match</button>`
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
            document.getElementById(`awayBar${match.id}`).style.width = `${match.awayPercent}%`;
            document.getElementById(`homeBar${match.id}`).style.width = `${match.homePercent}%`;
            document.getElementById(`awayBar${match.id}`).innerHTML = `${match.awayVotes} votes`;
            document.getElementById(`homeBar${match.id}`).innerHTML = `${match.homeVotes} votes`;
            const awayOdds = document.getElementById(`awayOdds${match.id}`);
            const homeOdds = document.getElementById(`homeOdds${match.id}`);
            awayOdds.classList.add("invert");
            homeOdds.classList.add("invert");
            awayOdds.innerText = match.awayOdds.toFixed(2);
            homeOdds.innerText = match.homeOdds.toFixed(2);
            setTimeout(() => {
                awayOdds.classList.remove("invert")
                homeOdds.classList.remove("invert")
            }, 1000);
            createToast(`You're backing the ${team}`);
        })
}

function createToast(message) {
    const container = document.getElementById('toastContainer');
    const newToast = document.createElement('div');
    newToast.className = 'toast bg-dark';
    newToast.role = 'alert';
    newToast['aria-live'] = 'assertive';
    newToast['aria-atomic'] = 'true';
    newToast.innerHTML = `
    <div class="toast-header">
        <strong class="me-auto">TodayOnNHL</strong>
        <small>Just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    <div id="toastBody" class="text-white toast-body">
        ${message}
    </div>`;
    container.appendChild(newToast);
    const toastInstance = bootstrap.Toast.getOrCreateInstance(newToast);
    toastInstance.show();
}

document.addEventListener("DOMContentLoaded", viewHome);

document.getElementById("showStandings").addEventListener("click", viewStandings);
document.getElementById("showSchedule").addEventListener("click", viewSchedule);
document.getElementById("goToHome").addEventListener("click", viewHome);

document.getElementById("seeTheStandings").addEventListener("click", viewStandings);
document.getElementById("seeTheSchedule").addEventListener("click", viewSchedule);

const teamForm = document.getElementById("fantasyTeamForm")
teamForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = new FormData(teamForm);
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
    const response = await fetch('/api/team/add',
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
              },
            body: formJSON
        });
        if (!response.ok) { 
            const errorMessage = await response.text();
            createToast(errorMessage);
            return;
        }
    const teams = await response.json();
    document.getElementById("teamButtonDiv").innerHTML = "";
    getStandings(teams);
});

const matchForm = document.getElementById("fantasyMatchForm")
matchForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const formData = new FormData(matchForm);
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
    console.log(formJSON)
    const response = await fetch('/api/matches',
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
              },
            body: formJSON
        });
        if (!response.ok) { 
            const errorMessage = await response.text();
            createToast(errorMessage);
            return;
        }
    const matches = await response.json();
    document.getElementById("matchButtonDiv").innerHTML = "";
    getSchedule(matches);
}); 