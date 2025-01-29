const express = require('express'); // import node module
const fs = require('fs'); // import node module

const app = express(); // create app

app.use(express.json()); // app uses json
app.use(express.static('client')); // serve index.html

function sortTeams (teams) {
    teams.sort((a, b) => {
        if (b.points === a.points) { // if points are equal, sort by games played (ascending)
            return a.gamesPlayed - b.gamesPlayed;
        }
        return b.points - a.points; // otherwise, sort by points (descending)
    });
    teams.forEach((team, index) => {
        team.position = index + 1; // assign position based on sorted order
    });
    return teams; // return sorted teams
}

app.get('/api/teams', function (req, resp) {
    const teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8')); // read teams data
    if (req.query.id) { // if id query parameter is present
        const team = teams.find(team => team.id === req.query.id); // find team by id
        if (!team) {
            resp.status(404).send('No team with this ID!'); // send 404 if not found
            return;
        }
        resp.status(200).send(team); // send found team
        return;
    }
    if (req.query.position) { // if position query parameter is present
        const team = teams.find(team => team.position === parseInt(req.query.position)); // find team by position
        if (!team) {
            resp.status(404).send('No team at this position!'); // send 404 if not found
            return;
        }
        resp.status(200).send(team); // send found team
        return;
    }
    const teamList = teams.map(team => ({
        id: team.id,
        name: team.name
    })); // create list of teams with id and name
    resp.status(200).send(teamList); // send team list
});

app.post('/api/teams', function (req, resp) {
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8')); // read teams data
    if (teams.find(team => team.id === 'FAN')) {
        resp.status(409).send('You have already added your fantasy team!'); // send 409 if fantasy team already exists
        return;
    }
    if (req.body.name && req.body.gamesPlayed && req.body.points && req.body.name.length > 0 && parseInt(req.body.gamesPlayed) && parseInt(req.body.gamesPlayed) > -1 && parseInt(req.body.points) && parseInt(req.body.points) > -1) {
        const team = {
            id: 'FAN', // set id to 'FAN'
            position: -1, // initial position
            logo: 'assets/logos/FAN.svg', // set logo path
            name: req.body.name, // set team name
            gamesPlayed: parseInt(req.body.gamesPlayed), // set games played
            points: parseInt(req.body.points) // set points
        };
        teams.push(team); // add new team to teams array
        teams = sortTeams(teams); // sort teams
        fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2)); // write updated teams data
        resp.status(201).send(teams); // send updated teams
    } else {
        resp.status(400).send('Invalid team!'); // send 400 if invalid team data
    }
});

app.delete('/api/teams/:id', function (req, resp) {
    if (req.params.id !== 'FAN') {
        resp.status(403).send('You can only delete your fantasy team!'); // send 403 if trying to delete non-fantasy team
        return;
    }
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8')); // read teams data
    teams = teams.filter(team => team.id !== 'FAN'); // filter out fantasy team
    teams = sortTeams(teams); // sort teams
    fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2)); // write updated teams data
    resp.status(200).send(teams); // send updated teams
});

app.get('/api/matches', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8')); // read matches data
    if (req.query.id) { // if id query parameter is present
        const match = matches.find(match => match.id === req.query.id); // find match by id
        if (!match) {
            resp.status(404).send('No match with this ID!'); // send 404 if not found
            return;
        }
        resp.status(200).send(match); // send found match
        return;
    }
    const matchList = matches.map(match => ({
        id: match.id,
        away: match.away.id,
        home: match.home.id,
        date: match.date
    })); // create list of matches with id, away team, home team, and date
    resp.status(200).send(matchList); // send match list
});

app.get('/api/matches/next', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8')); // read matches data
    const match = matches[0]; // get the next match
    if (!match) {
        resp.status(404).send('No upcoming match!'); // send 404 if no upcoming match
        return;
    }
    resp.status(200).send(match); // send next match
});

app.post('/api/matches', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8')); // read matches data
    const teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8')); // read teams data
    const fantasyMatches = matches.filter(match => match.id[0] === 'F'); // filter out non-fantasy matches
    let maxFantasyMatch;
    if (fantasyMatches.length > 0) {
        maxFantasyMatch = Math.max(...fantasyMatches.map(match => parseInt(match.id.slice(1, match.id.length)))); // get max fantasy match id
    } else {
        maxFantasyMatch = 0; // set to 0 if no fantasy matches
    }
    if (req.body.away && req.body.home && req.body.odds && req.body.datetime && teams.find(team => team.id === req.body.away) && teams.find(team => team.id === req.body.home) && parseInt(req.body.odds) && parseInt(req.body.odds) > 0 && parseInt(req.body.odds) < 100 && !isNaN(new Date(req.body.datetime).getTime())) {
        const match = {
            id: 'F' + (maxFantasyMatch + 1), // set fantasy match id
            away: {
                id: req.body.away, // set away team id
                name: teams.find(team => team.id === req.body.away).name, // set away team name
                votes: 100 - parseInt(req.body.odds) // set away team votes
            },
            home: {
                id: req.body.home, // set home team id
                name: teams.find(team => team.id === req.body.home).name, // set home team name
                votes: parseInt(req.body.odds) // set home team votes
            },
            date: req.body.datetime + ':00' // set match datetime
        };
        matches.push(match); // add new match to matches array
        matches.sort((a, b) => new Date(a.date) - new Date(b.date)); // sort matches by date
        fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2)); // write updated matches data
        resp.status(201).send(matches); // send updated matches
    } else {
        resp.status(400).send('Invalid match!'); // send 400 if invalid match data
    }
});

app.delete('/api/matches/:id', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8')); // read matches data
    if (matches.find(match => match.id === req.params.id) && req.params.id[0] !== 'F') {
        resp.status(403).send('You can only delete a fantasy matches!'); // send 403 if trying to delete non-fantasy match
        return;
    }
    const newMatches = matches.filter(match => match.id !== req.params.id); // filter out match by id parameter
    if (JSON.stringify(newMatches) === JSON.stringify(matches)) {
        resp.status(404).send('Match not found!'); // send 404 if match not found (no match was filtered out)
        return;
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(newMatches, null, 2)); // write updated matches data
    resp.status(200).send(newMatches); // send updated matches
});

app.patch('/api/matches/:id/vote', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8')); // read matches data
    const match = matches.find(match => match.id === req.params.id); // find match by id parameter
    if (!match) {
        resp.status(404).send('Match not found!'); // send 404 if match not found
        return;
    } else if (match.id[0] === 'F') {
        resp.status(403).send('You cannot vote on a fantasy match!'); // send 403 if trying to vote on fantasy match
        return;
    }
    if (req.body.vote !== 1 && req.body.vote !== -1) {
        resp.status(400).send('Invalid vote!'); // send 400 if invalid vote
        return;
    }
    if (match.away.id === req.body.team) {
        match.away.votes += req.body.vote; // update away team votes
    } else if (match.home.id === req.body.team) {
        match.home.votes += req.body.vote; // update home team votes
    } else {
        resp.status(400).send('Invalid team!'); // send 400 if invalid team
        return;
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2)); // write updated matches data
    resp.status(200).send(match); // send updated match
});

app.get('/api/standings', function (req, resp) {
    const teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8')); // read teams data
    resp.status(200).send(teams); // send sorted teams
});

app.get('/api/schedule', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8')); // read matches data
    resp.status(200).send(matches); // send matches
});

module.exports = app; // export app
