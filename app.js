const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static('client'));

function sortTeams (teams) {
    teams.sort((a, b) => {
        if (b.points === a.points) {
            return a.gamesPlayed - b.gamesPlayed;
        }
        return b.points - a.points;
    });
    teams.forEach((team, index) => {
        team.position = index + 1;
    });
    return teams;
}

app.get('/api/teams', function (req, resp) {
    const teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    if (req.query.id) {
        const team = teams.find(team => team.id === req.query.id);
        if (!team) {
            resp.status(404).send('No team with this ID!');
            return;
        }
        resp.send(team);
        return;
    }
    if (req.query.position) {
        const team = teams.find(team => team.position === parseInt(req.query.position));
        if (!team) {
            resp.status(404).send('No team at this position!');
            return;
        }
        resp.send(team);
        return;
    }
    const teamList = teams.map(team => ({
        id: team.id,
        name: team.name
    }));
    resp.send(teamList);
});

app.post('/api/teams', function (req, resp) {
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    if (teams.find(team => team.id === 'FAN')) {
        resp.status(403).send('You have already added your fantasy team!');
        return;
    }
    if (req.body.name && req.body.gamesPlayed && req.body.points && req.body.name.length > 0 && parseInt(req.body.gamesPlayed) && parseInt(req.body.gamesPlayed) > -1 && parseInt(req.body.points) && parseInt(req.body.points) > -1) {
        const team = {
            id: 'FAN',
            position: -1,
            logo: 'assets/logos/FAN.svg',
            name: req.body.name,
            gamesPlayed: parseInt(req.body.gamesPlayed),
            points: parseInt(req.body.points)
        };
        teams.push(team);
        teams = sortTeams(teams);
        fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2));
        resp.status(200).send(teams);
    } else {
        resp.status(400).send('Invalid team!');
    }
});

app.delete('/api/teams/:id', function (req, resp) {
    if (req.params.id !== 'FAN') {
        resp.status(403).send('You can only delete your fantasy team!');
        return;
    }
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    teams = teams.filter(team => team.id !== 'FAN');
    teams = sortTeams(teams);
    fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2));
    resp.status(200).send(teams);
});

app.get('/api/matches', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    if (req.query.id) {
        const match = matches.find(match => match.id === req.query.id);
        if (!match) {
            resp.status(404).send('No match with this ID!');
            return;
        }
        resp.send(match);
        return;
    }
    const matchList = matches.map(match => ({
        id: match.id,
        away: match.away.id,
        home: match.home.id,
        date: match.date
    }));
    resp.send(matchList);
});

app.get('/api/matches/next', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    const match = matches[0];
    if (!match) {
        resp.status(404).send('No upcoming match!');
        return;
    }
    resp.send(match);
});

app.post('/api/matches', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    const teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    const fantasyMatches = matches.filter(match => match.id[0] === 'F');
    let maxFantasyMatch;
    if (fantasyMatches.length > 0) {
        maxFantasyMatch = Math.max(...fantasyMatches.map(match => parseInt(match.id.slice(1, match.id.length))));
    } else {
        maxFantasyMatch = 0;
    }
    if (req.body.away && req.body.home && req.body.odds && req.body.datetime && teams.find(team => team.id === req.body.away) && teams.find(team => team.id === req.body.home) && parseInt(req.body.odds) && parseInt(req.body.odds) > 0 && parseInt(req.body.odds) < 100 && !isNaN(new Date(req.body.datetime).getTime())) {
        const match = {
            id: 'F' + (maxFantasyMatch + 1),
            away: {
                id: req.body.away,
                name: teams.find(team => team.id === req.body.away).name,
                votes: 100 - parseInt(req.body.odds)
            },
            home: {
                id: req.body.home,
                name: teams.find(team => team.id === req.body.home).name,
                votes: parseInt(req.body.odds)
            },
            date: req.body.datetime + ':00'
        };
        matches.push(match);
        matches.sort((a, b) => new Date(a.date) - new Date(b.date));
        fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2));
        resp.status(200).send(matches);
    } else {
        resp.status(400).send('Invalid match!');
    }
});

app.delete('/api/matches/:id', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    if (matches.find(match => match.id === req.params.id) && req.params.id[0] !== 'F') {
        resp.status(403).send('You can only delete a fantasy matches!');
        return;
    }
    const newMatches = matches.filter(match => match.id !== req.params.id);
    if (JSON.stringify(newMatches) === JSON.stringify(matches)) {
        resp.status(404).send('Match not found!');
        return;
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(newMatches, null, 2));
    resp.status(200).send(newMatches);
});

app.patch('/api/matches/:id/vote', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    const match = matches.find(match => match.id === req.params.id);
    if (!match) {
        resp.status(404).send('Match not found!');
        return;
    } else if (match.id[0] === 'F') {
        resp.status(403).send('You cannot vote on a fantasy match!');
        return;
    }
    if (req.body.vote !== 1 && req.body.vote !== -1) {
        resp.status(400).send('Invalid vote!');
        return;
    }
    if (match.away.id === req.body.team) {
        match.away.votes += req.body.vote;
    } else if (match.home.id === req.body.team) {
        match.home.votes += req.body.vote;
    } else {
        resp.status(400).send('Invalid team!');
        return;
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2));
    resp.status(200).send(match);
});

app.get('/api/standings', function (req, resp) {
    const teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    teams.sort((a, b) => a.position - b.position);
    resp.send(teams);
});

app.get('/api/schedule', function (req, resp) {
    const matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    resp.send(matches);
});

module.exports = app;
