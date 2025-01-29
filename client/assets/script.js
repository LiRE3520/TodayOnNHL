async function viewStandings () {
    try {
        const response = await fetch('/api/standings'); // fetch standings data
        const teams = await response.json(); // parse response as JSON
        document.getElementById('standings').style.display = 'block'; // show standings section
        document.getElementById('home').style.display = 'none'; // hide home section
        document.getElementById('schedule').style.display = 'none'; // hide schedule section
        getStandings(teams); // update standings table
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to load standing'); // show error toast
    }
}

async function viewSchedule () {
    try {
        const response = await fetch('/api/schedule'); // fetch schedule data
        const matches = await response.json(); // parse response as JSON
        document.getElementById('standings').style.display = 'none'; // hide standings section
        document.getElementById('home').style.display = 'none'; // hide home section
        document.getElementById('schedule').style.display = 'block'; // show schedule section
        getSchedule(matches); // update schedule cards
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to load schedule'); // show error toast
    }
}

async function viewHome () {
    try {
        let response = await fetch('/api/teams?position=1'); // fetch top team data
        const team = await response.json(); // parse response as JSON
        document.getElementById('standings').style.display = 'none'; // hide standings section
        document.getElementById('home').style.display = 'block'; // show home section
        document.getElementById('schedule').style.display = 'none'; // hide schedule section
        document.getElementById('topTeamHeader').innerHTML = team.name; // update top team name
        document.getElementById('topTeamLogo').src = team.logo; // update top team logo
        response = await fetch('/api/matches/next'); // fetch next match data
        const match = await response.json(); // parse response as JSON
        document.getElementById('nextMatchHeader').innerHTML = `
        ${match.away.name} @ ${match.home.name}`; // update next match header
        document.getElementById('nextMatchLogos').innerHTML = `
        <img src="assets/logos/${match.away.id}.svg" class="d-block mx-auto mb-4 home-img">
        <img src="assets/logos/${match.home.id}.svg" class="d-block mx-auto mb-4 home-img">`; // update next match logos
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to load home'); // show error toast
    }
}

function getStandings (teams) {
    let buttonText = 'Add Your Fantasy Team'; // default button text
    const body = document.getElementById('standingsTableBody');
    body.innerHTML = ''; // clear standings table body
    for (const team of teams) {
        const row = document.createElement('tr'); // create table row
        if (team.id === 'FAN') { // if team is fantasy team
            row.style.setProperty('--bs-table-bg', '#ff7d7d'); // set row background colour if fantasy team
            row.style.setProperty('--bs-table-accent-bg', '#ff7d7d'); // weird properties are bootstrap striped table properties which were overriding my background colour
            row.style.setProperty('--bs-table-hover-bg', '#ff7d7d');
            row.style.setProperty('--bs-table-striped-bg', '#ff7d7d');
            row.style.backgroundColor = '#ff7d7d';
            buttonText = 'Remove Your Fantasy Team'; // update button text
        }
        row.innerHTML = `
            <th scope="row">${team.position}</th>
            <td><img src="${team.logo}" height=35 width=35></img></td>
            <td>${team.name}</td>
            <td>${team.gamesPlayed}</td>
            <td>${team.points}</td>`; // populate row with team data
        body.appendChild(row); // append row to table body
    }
    const buttonDiv = document.getElementById('fantasyTeamButtonDiv');
    if (buttonText === 'Remove Your Fantasy Team') {
        buttonDiv.innerHTML = `
        <button class="btn page-btn" type="button" onclick="removeFantasyTeam()">${buttonText}</button>`; // create remove button
    } else {
        buttonDiv.innerHTML = `
        <button class="btn page-btn" type="button" data-bs-toggle="modal" data-bs-target="#fantasyTeamModal">${buttonText}</button>`; // create add button
    }
}

async function getSchedule (matches) {
    const cards = document.getElementById('matchCards');
    cards.innerHTML = ''; // clear match cards
    for (const match of matches) {
        const card = document.createElement('div'); // create card div
        card.className = 'card text-center mb-3'; // set card class
        let cardContent = '<div class="card-body">';
        if (match.id[0] === 'F') { // if match is fantasy match
            cardContent += `
            <h5 class="card-title fantasy-header">FANTASY</h5>
            <div class="d-flex justify-content-around align-items-center">
            <img src="assets/logos/${match.away.id}.svg" class="img-fluid vote-img" style="max-width: 100px;">
            <h5 class="card-title">${match.away.name} @ ${match.home.name}</h5>
            <img src="assets/logos/${match.home.id}.svg" class="img-fluid vote-img" style="max-width: 100px;">`; // add fantasy header and dont add onclick="vote()"
        } else {
            cardContent += `
            <div class="d-flex justify-content-around align-items-center">
            <img src="assets/logos/${match.away.id}.svg" class="img-fluid vote-img" style="max-width: 100px;" onclick="vote('${match.away.id}', '${match.id}')">
            <h5 class="card-title">${match.away.name} @ ${match.home.name}</h5>
            <img src="assets/logos/${match.home.id}.svg" class="img-fluid vote-img" style="max-width: 100px;" onclick="vote('${match.home.id}', '${match.id}')">`;
        }
        cardContent += `
            </div>
            <p class="card-text">${match.date.slice(0, 10)} | ${match.date.slice(11, 16)} GMT</p>
        </div>`; // add match date and time
        card.innerHTML = cardContent; // set card content
        cards.appendChild(card); // append card to cards container
        const awayPercent = (match.away.votes / (match.away.votes + match.home.votes)) * 100; // calculate away team vote percentage
        const homePercent = (match.home.votes / (match.away.votes + match.home.votes)) * 100; // calculate home team vote percentage
        const awayOdds = 100 / awayPercent; // calculate away team odds
        const homeOdds = 100 / homePercent; // calculate home team odds
        const bar = document.createElement('div'); // create progress bar div
        bar.className = 'progress'; // set bootstrap progress bar class
        bar.style.height = '30px'; // set progress bar height
        let barContent = `
        <div id="awayBar${match.id}" class="progress-bar progress-bar-left" role="progressbar" style="width: ${awayPercent}%" 
            aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">`; // populate away bar content
        if (match.id[0] !== 'F') {
            barContent += `${match.away.votes} votes`; // display away team votes if not a fantasy team
        }
        barContent += `
        </div>
        <div id="homeBar${match.id}" class="progress-bar progress-bar-right" role="progressbar" style="width: ${homePercent}%" 
            aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">`; // populate home bar content
        if (match.id[0] !== 'F') {
            barContent += `${match.home.votes} votes`; // display home team votes if not a fantasy team
        }
        barContent += '</div>';
        bar.innerHTML = barContent; // set progress bar content
        cards.appendChild(bar); // append progress bar to cards container
        const odds = document.createElement('div'); // create odds div
        odds.className = 'd-flex justify-content-evenly my-3'; // set odds div class
        let oddsContent = `<div id="awayOdds${match.id}" class="odds-display my-2">${awayOdds.toFixed(2)}</div>`; // populate away odds content
        if (match.id[0] === 'F') {
            oddsContent += '<h1 class="display-6 fw-bold my-3" style="font-size: 28px;">- Your Odds -</h1>';
        } else {
            oddsContent += '<h1 class="display-6 fw-bold my-3" style="font-size: 28px;">- The Fan\'s Odds -</h1>';
        } // add odds header depending on match type
        oddsContent += `<div id="homeOdds${match.id}" class="odds-display my-2">${homeOdds.toFixed(2)}</div>`; // populate home odds content
        odds.innerHTML = oddsContent; // set odds content
        cards.appendChild(odds); // append odds to cards container
    }
    const awaySelect = document.getElementById('awaySelect'); // get bootstrap selects
    const homeSelect = document.getElementById('homeSelect');
    awaySelect.innerHTML = ''; // clear away team select options
    homeSelect.innerHTML = ''; // clear home team select options
    const response = await fetch('/api/teams'); // fetch teams data
    const teams = await response.json(); // parse response as JSON
    for (const team of teams) {
        awaySelect.innerHTML += `
        <option value="${team.id}">${team.name}</option>`; // populate away team select options
        homeSelect.innerHTML += `
        <option value="${team.id}">${team.name}</option>`; // populate home team select options
    }
    const removeSelect = document.getElementById('removeSelect');
    const fantasyMatches = matches.filter(match => match.id[0] === 'F'); // filter out non-fantasy matches
    removeSelect.innerHTML = ''; // clear remove match select options
    for (const match of fantasyMatches) {
        removeSelect.innerHTML += `
        <option value="${match.id}">${match.away.name} @ ${match.home.name}</option>`; // populate remove match select options
    }
}

async function addFantasyTeam (event, teamForm) {
    event.preventDefault(); // prevent default form submission
    const formData = new FormData(teamForm); // get form data
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries())); // convert form data to JSON
    try {
        const response = await fetch('/api/teams', {
            method: 'POST', // set request method to POST
            headers: {
                'Content-Type': 'application/json' // set content type to JSON
            },
            body: formJSON // set request body to the form in a JSON string
        });
        if ((!response.ok) && ((response.status === 403) || (response.status === 400))) { // if response is not ok and status is 403 or 400
            const errorMessage = await response.text(); // get error message
            createToast(errorMessage); // show error toast
            return;
        }
        const teams = await response.json(); // parse response as JSON
        bootstrap.Modal.getInstance(document.getElementById('fantasyTeamModal')).hide(); // hide bootstrap modal
        document.getElementById('fantasyTeamButtonDiv').innerHTML = ''; // clear button div
        getStandings(teams); // update standings table
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to add fantasy team'); // show error toast
    }
}

async function removeFantasyTeam () {
    try {
        const response = await fetch('/api/teams/FAN', {
            method: 'DELETE', // set request method to DELETE
            headers: {
                'Content-Type': 'application/json' // set content type to JSON
            }
        });
        const teams = await response.json(); // parse response as JSON
        document.getElementById('fantasyTeamButtonDiv').innerHTML = ''; // clear button div
        getStandings(teams); // update standings table
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to remove fantasy team'); // show error toast
    }
}

async function addFantasyMatch (event, matchForm) {
    event.preventDefault(); // prevent default form submission
    const formData = new FormData(matchForm); // get form data
    const formJSON = JSON.stringify(Object.fromEntries(formData.entries())); // convert form data to JSON
    try {
        const response = await fetch('/api/matches', {
            method: 'POST', // set request method to POST
            headers: {
                'Content-Type': 'application/json' // set content type to JSON
            },
            body: formJSON // set request body to form in JSON string
        });
        const matches = await response.json(); // parse response as JSON
        bootstrap.Modal.getInstance(document.getElementById('addFantasyMatchModal')).hide(); // hide bootstrap modal
        getSchedule(matches); // update schedule cards
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to add fantasy match'); // show error toast
    }
}

async function removeFantasyMatch (event, removeForm) {
    event.preventDefault(); // prevent default form submission
    const formData = new FormData(removeForm); // get form data
    const matchID = formData.get('match'); // get match ID from form data
    try {
        const response = await fetch(`/api/matches/${matchID}`, {
            method: 'DELETE', // set request method to DELETE
            headers: {
                'Content-Type': 'application/json' // set content type to JSON
            }
        });
        if (!response.ok && response.status === 404) { // if response is not ok and status is 404
            const errorMessage = await response.text(); // get error message
            createToast(errorMessage); // show error toast
            return;
        }
        const matches = await response.json(); // parse response as JSON
        bootstrap.Modal.getInstance(document.getElementById('removeFantasyMatchModal')).hide(); // hide bootstrap modal
        getSchedule(matches); // update schedule table
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to remove fantasy match'); // show error toast
    }
}

async function vote (teamID, matchID) {
    const votedMatches = JSON.parse(localStorage.getItem('votedMatches')) || []; // get voted matches from local storage
    const hasVoted = votedMatches.find(vote => vote.match.id === id); // check if user has already voted on this match
    if (hasVoted && hasVoted.match.team === team) {
        createToast("You're already backing this team!"); // show error toast if already voted for this team
        return;
    }
    try {
        let response = await fetch(`/api/matches/${matchID}/vote`, {
            method: 'PATCH', // set request method to PATCH
            headers: {
                'Content-Type': 'application/json' // set content type to JSON
            },
            body: JSON.stringify({
                teamID,
                vote: 1 // set vote to 1
            })
        });
        if (hasVoted) { // if user has already voted on this match removte vote from other team
            response = await fetch(`/api/matches/${matchID}/vote`, {
                method: 'PATCH', // set request method to PATCH
                headers: {
                    'Content-Type': 'application/json' // set content type to JSON
                },
                body: JSON.stringify({
                    team: hasVoted.match.team,
                    vote: -1 // set vote to -1
                })
            });
        }
        const match = await response.json(); // parse response as JSON
        const awayPercent = (match.away.votes / (match.away.votes + match.home.votes)) * 100; // calculate away team vote percentage
        const homePercent = (match.home.votes / (match.away.votes + match.home.votes)) * 100; // calculate home team vote percentage
        const awayOdds = 100 / awayPercent; // calculate away team odds
        const homeOdds = 100 / homePercent; // calculate home team odds
        document.getElementById(`awayBar${match.id}`).style.width = `${awayPercent}%`; // update away team progress bar width
        document.getElementById(`homeBar${match.id}`).style.width = `${homePercent}%`; // update home team progress bar width
        document.getElementById(`awayBar${match.id}`).innerHTML = `${match.away.votes} votes`; // update away team votes
        document.getElementById(`homeBar${match.id}`).innerHTML = `${match.home.votes} votes`; // update home team votes
        const awayOddsDisplay = document.getElementById(`awayOdds${match.id}`);
        const homeOddsDisplay = document.getElementById(`homeOdds${match.id}`);
        awayOddsDisplay.classList.add('invert'); // add invert class to away odds display
        homeOddsDisplay.classList.add('invert'); // add invert class to home odds display
        awayOddsDisplay.innerText = awayOdds.toFixed(2); // update away odds display
        homeOddsDisplay.innerText = homeOdds.toFixed(2); // update home odds display
        setTimeout(() => {
            awayOddsDisplay.classList.remove('invert'); // remove invert class from away odds display for transition effect
            homeOddsDisplay.classList.remove('invert'); // remove invert class from home odds display for transition effect
        }, 1000);
        if (team === match.away.id) {
            createToast(`You're backing the ${match.away.name}!`); // show success toast for away team
        } else {
            createToast(`You're backing the ${match.home.name}!`); // show success toast for home team
        }
        if (hasVoted) {
            hasVoted.match.team = team; // update voted team if already voted on this match
        } else {
            votedMatches.push({
                match: {
                    id,
                    team
                }
            }); // add new vote and match to voted matches if not already voted on this match
        }
        localStorage.setItem('votedMatches', JSON.stringify(votedMatches)); // save voted matches to local storage
    } catch (error) {
        console.error(error); // log error to console
        createToast('Network Error: Failed to vote'); // show error toast
    }
}

function createToast (message) {
    const container = document.getElementById('toastContainer'); // get bootstrap toast container
    const newToast = document.createElement('div');
    newToast.className = 'toast bg-dark'; // set bootstrap toast class
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
    </div>`; // create toast content and add message
    container.appendChild(newToast); // append toast to container
    const toastInstance = bootstrap.Toast.getOrCreateInstance(newToast); // create bootstrap toast instance
    toastInstance.show(); // show toast
}

document.addEventListener('DOMContentLoaded', viewHome); // view home when DOM content loaded

document.getElementById('goToHome').addEventListener('click', viewHome); // add event listener to home button
document.querySelectorAll('.standings-btn').forEach(button => {
    button.addEventListener('click', viewStandings); // add event listener to standings buttons
});
document.querySelectorAll('.schedule-btn').forEach(button => {
    button.addEventListener('click', viewSchedule); // add event listener to schedule buttons
});

const teamForm = document.getElementById('fantasyTeamForm');
teamForm.addEventListener('submit', function (event) {
    addFantasyTeam(event, teamForm); // add event listener to fantasy team form
});
const matchForm = document.getElementById('fantasyMatchForm');
matchForm.addEventListener('submit', function (event) {
    addFantasyMatch(event, matchForm); // add event listener to fantasy match form
});
const removeForm = document.getElementById('removeMatchForm');
removeForm.addEventListener('submit', function (event) {
    removeFantasyMatch(event, removeForm); // add event listener to remove fantasy match form
});
