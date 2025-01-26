async function viewStandings() {
    try {
        const response = await fetch("/api/standings");
        const teams = await response.json();
        document.getElementById("standings").style.display = "block";
        document.getElementById("home").style.display = "none";
        document.getElementById("schedule").style.display = "none";
        getStandings(teams);
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to load standings");
    }
}
async function viewSchedule() {
    try {
        const response = await fetch("/api/schedule");
        const matches = await response.json();
        document.getElementById("standings").style.display = "none";
        document.getElementById("home").style.display = "none";
        document.getElementById("schedule").style.display = "block";
        getSchedule(matches);
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to load schedule");
    }
}
async function viewHome() {
    try {
        let response = await fetch("/api/teams?position=1")
        const team = await response.json()
        document.getElementById("standings").style.display = "none";
        document.getElementById("home").style.display = "block";
        document.getElementById("schedule").style.display = "none";
        document.getElementById("topTeamHeader").innerHTML = team.name;
        document.getElementById("topTeamLogo").innerHTML = `
        <img src="${team.logo}" class="img-fluid" height=190 width=190>`
        response = await fetch("/api/matches?next=true")
        const match = await response.json()
        document.getElementById("nextMatchHeader").innerHTML = `
        ${match.away.name} @ ${match.home.name}`;
        document.getElementById("nextMatchLogos").innerHTML = `
        <img src="assets/logos/${match.away.id}.svg" class="img-fluid" height=190 width=190>
        <img src="assets/logos/${match.home.id}.svg" class="img-fluid" height=190 width=190>`
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to load home");
    }
}

function getStandings(teams) {
    let buttonText = "Add Your Fantasy Team";
    const body = document.getElementById("standingsTableBody")
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
    const buttonDiv = document.getElementById("fantasyTeamButtonDiv");
    if (buttonText === "Remove Your Fantasy Team") {
        buttonDiv.innerHTML = `
        <button class="btn page-btn" type="button" onclick="removeFantasyTeam()">${buttonText}</button>`;
    } else {
        buttonDiv.innerHTML = `
        <button class="btn page-btn" type="button" data-bs-toggle="modal" data-bs-target="#fantasyTeamModal">${buttonText}</button>`;
    }
}
async function getSchedule(matches) {
    const cards = document.getElementById("matchCards")
    cards.innerHTML = ""
    for (let match of matches) {
        const card = document.createElement("div");
        card.className = "card text-center mb-3";
        let cardContent = `<div class="card-body">`
        if (match.id[0] === "F") {
            cardContent += `
            <h5 class="card-title fantasy-header">FANTASY</h5>
            <div class="d-flex justify-content-around align-items-center">
            <img src="assets/logos/${match.away.id}.svg" class="img-fluid vote-img" style="max-width: 100px;">
            <h5 class="card-title">${match.away.name} @ ${match.home.name}</h5>
            <img src="assets/logos/${match.home.id}.svg" class="img-fluid vote-img" style="max-width: 100px;">`
        } else {
            cardContent += `
            <div class="d-flex justify-content-around align-items-center">
            <img src="assets/logos/${match.away.id}.svg" class="img-fluid vote-img" style="max-width: 100px;" onclick="vote('${match.away.id}', '${match.id}')">
            <h5 class="card-title">${match.away.name} @ ${match.home.name}</h5>
            <img src="assets/logos/${match.home.id}.svg" class="img-fluid vote-img" style="max-width: 100px;" onclick="vote('${match.home.id}', '${match.id}')">`
        }
        cardContent += `
            </div>
            <p class="card-text">${match.date.slice(0, 10)} | ${match.date.slice(11, 16)} GMT</p>
        </div>`
        card.innerHTML = cardContent;
        cards.appendChild(card);
        const awayPercent = (match.away.votes / (match.away.votes + match.home.votes)) * 100;
        const homePercent = (match.home.votes / (match.away.votes + match.home.votes)) * 100;
        const awayOdds = 100 / awayPercent;
        const homeOdds = 100 / homePercent;
        const bar = document.createElement("div");
        bar.className = "progress";
        bar.style.height = "30px";
        let barContent = `
        <div id="awayBar${match.id}" class="progress-bar progress-bar-left" role="progressbar" style="width: ${awayPercent}%" 
            aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">`
        if (match.id[0] != "F") {
            barContent += `${match.away.votes} votes`
        }
        barContent+= `
        </div>
        <div id="homeBar${match.id}" class="progress-bar progress-bar-right" role="progressbar" style="width: ${homePercent}%" 
            aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">`
        if (match.id[0] != "F") {
            barContent += `${match.home.votes} votes`
        }
        barContent += `</div>`;
        bar.innerHTML = barContent;
        cards.appendChild(bar);
        const odds = document.createElement("div");
        odds.className = "d-flex justify-content-evenly my-3";
        let oddsContent = `<div id="awayOdds${match.id}" class="odds-display my-2">${awayOdds.toFixed(2)}</div>`
        if (match.id[0] === "F") {
            oddsContent += `<h1 class="display-6 fw-bold my-3" style="font-size: 28px;">- Your Odds -</h1>`
        } else {
            oddsContent += `<h1 class="display-6 fw-bold my-3" style="font-size: 28px;">- The Fan's Odds -</h1>`
        }
        oddsContent += `<div id="homeOdds${match.id}" class="odds-display my-2">${homeOdds.toFixed(2)}</div>`
        odds.innerHTML = oddsContent;
        cards.appendChild(odds);
    }
    const awaySelect = document.getElementById("awaySelect");
    const homeSelect = document.getElementById("homeSelect");
    awaySelect.innerHTML = ``
    homeSelect.innerHTML = ``
    const response = await fetch("/api/teams")
    const teams = await response.json()
    for (let team of teams) {
        awaySelect.innerHTML += `
        <option value="${team.id}">${team.name}</option>`
        homeSelect.innerHTML += `
        <option value="${team.id}">${team.name}</option>`
    }
    const removeSelect = document.getElementById("removeSelect");
    const fantasyMatches = matches.filter(match => match.id[0] === "F");
    removeSelect.innerHTML = ""
    for (let match of fantasyMatches) {
        removeSelect.innerHTML += `
        <option value="${match.id}">${match.away.name} @ ${match.home.name}</option>`
    }
}

async function addFantasyTeam(event, teamForm) {
    event.preventDefault();
    const formData = new FormData(teamForm);
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
    try {
        const response = await fetch('/api/teams', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
                },
            body: formJSON
        });
        if (!response.ok && response.status === 400) {
            const errorMessage = await response.text();
            createToast(errorMessage);
            return;
        }
        const teams = await response.json();
        bootstrap.Modal.getInstance(document.getElementById('fantasyTeamModal')).hide()
        document.getElementById("fantasyTeamButtonDiv").innerHTML = "";
        getStandings(teams);
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to add fantasy team");
    }
}
async function removeFantasyTeam() {
    try {
        const response = await fetch("/api/teams", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok && response.status === 400) {
            const errorMessage = await response.text();
            createToast(errorMessage);
            return;
        }
        const teams = await response.json();
        document.getElementById("fantasyTeamButtonDiv").innerHTML = "";
        getStandings(teams)
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to remove fantasy team");
    }
}
async function addFantasyMatch(event, matchForm) {
    event.preventDefault();
    const formData = new FormData(matchForm);
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
    try {
        const response = await fetch('/api/matches',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                  },
                body: formJSON
            });
        const matches = await response.json();
        bootstrap.Modal.getInstance(document.getElementById('addFantasyMatchModal')).hide()
        getSchedule(matches);
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to add fantasy match");
    }
}
async function removeFantasyMatch(event, removeForm) {
    event.preventDefault();
    const formData = new FormData(removeForm);
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries()));
    try {
        const response = await fetch('/api/matches',
            {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                  },
                body: formJSON
            });
        if (!response.ok && response.status === 400) {
            const errorMessage = await response.text();
            createToast(errorMessage);
            return;
        }
        const matches = await response.json();
        bootstrap.Modal.getInstance(document.getElementById('removeFantasyMatchModal')).hide()
        getSchedule(matches);
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to remove fantasy match");
    }
}
async function vote(team, id) {
    const votedMatches = JSON.parse(localStorage.getItem("votedMatches")) || [];
    const hasVoted = votedMatches.find(vote => vote.match.id === id);
    if (hasVoted && hasVoted.match.team === team) {
        createToast("You're already backing this team!");
        return;
    }
    try {
        let response = await fetch(`/api/matches/${id}`, {
            method: "PATCH",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                team: team,
                vote: 1
            })
        });
        if (hasVoted) {
            response = await fetch(`/api/matches/${id}`, {
                method: "PATCH",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    team: hasVoted.match.team,
                    vote: -1
                })
            });
        }
        const match = await response.json();
        const awayPercent = (match.away.votes / (match.away.votes + match.home.votes)) * 100;
        const homePercent = (match.home.votes / (match.away.votes + match.home.votes)) * 100;
        const awayOdds = 100 / awayPercent;
        const homeOdds = 100 / homePercent;
        document.getElementById(`awayBar${match.id}`).style.width = `${awayPercent}%`;
        document.getElementById(`homeBar${match.id}`).style.width = `${homePercent}%`;
        document.getElementById(`awayBar${match.id}`).innerHTML = `${match.away.votes} votes`;
        document.getElementById(`homeBar${match.id}`).innerHTML = `${match.home.votes} votes`;
        const awayOddsDisplay = document.getElementById(`awayOdds${match.id}`);
        const homeOddsDisplay = document.getElementById(`homeOdds${match.id}`);
        awayOddsDisplay.classList.add("invert");
        homeOddsDisplay.classList.add("invert");
        awayOddsDisplay.innerText = awayOdds.toFixed(2);
        homeOddsDisplay.innerText = homeOdds.toFixed(2);
        setTimeout(() => {
            awayOddsDisplay.classList.remove("invert")
            homeOddsDisplay.classList.remove("invert")
        }, 1000);
        if (team === match.away.id) {
            createToast(`You're backing the ${match.away.name}!`);
        } else {
            createToast(`You're backing the ${match.home.name}!`);
        }
        if (hasVoted) {
            hasVoted.match.team = team;
        } else {
            votedMatches.push({
                match: {
                    id: id,
                    team: team
                }
            })
        }
        localStorage.setItem("votedMatches", JSON.stringify(votedMatches));
    } catch (error) {
        console.error(error);
        createToast("Network Error: Failed to vote");
    }
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

document.getElementById("goToHome").addEventListener("click", viewHome);

document.querySelectorAll(".standings-btn").forEach(button => {
    button.addEventListener("click", viewStandings);
});
document.querySelectorAll(".schedule-btn").forEach(button => {
    button.addEventListener("click", viewSchedule);
});


const teamForm = document.getElementById("fantasyTeamForm")
teamForm.addEventListener("submit", function(event) {
    addFantasyTeam(event, teamForm);
});

const matchForm = document.getElementById("fantasyMatchForm")
matchForm.addEventListener("submit", function(event) {
    addFantasyMatch(event, matchForm);
}); 

const removeForm = document.getElementById("removeMatchForm")
removeForm.addEventListener("submit", function(event) {
    removeFantasyMatch(event, removeForm);
});