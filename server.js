const express = require('express');
const fs = require('fs');

const app = express()

app.use(express.json())
app.use(express.static("client"))

function sortTeams(teams) {
    teams.sort((a, b) => {
        if (b.points === a.points) {
            return a.gamesPlayed - b.gamesPlayed;
        }
        return b.points - a.points;
    }); 
    teams.forEach((team, index) => {
        team.position = index + 1;
    });  
    return teams
}

app.get("/api/teams", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    if (req.query.id) {
        let team = teams.find(team => team.id === req.query.id);
        if (!team) {
            resp.status(400).send("No team with this ID!");
            return
        }
        resp.send(team)
        return
    }
    if (req.query.position) {
        let team = teams.find(team => team.position === parseInt(req.query.position));
        if (!team) {
            resp.status(400).send("No team at this position!");
            return
        }
        resp.send(team)
        return
    }
    let teamList = teams.map(team => ({
        id: team.id,
        name: team.name
    }));
    resp.send(teamList)
})

app.post("/api/teams", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    if (teams.find(team => team.id === "FAN")) {
        resp.status(400).send("You have already added your fantasy team!");
        return;
    }
    if (req.body.name.length > 0 && parseInt(req.body.gamesPlayed) && parseInt(req.body.gamesPlayed) > -1 && parseInt(req.body.points) && parseInt(req.body.points) > -1) {
        let team = {
            id: "FAN",
            position: -1,
            logo: "assets/logos/FAN.svg",
            name: req.body.name,
            gamesPlayed: parseInt(req.body.gamesPlayed),
            points: parseInt(req.body.points),
        }
        teams.push(team);
        teams = sortTeams(teams);
        fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2));
        resp.send(teams)
    } else {
        resp.status(400).send("Invalid team!");
    }
})

app.delete("/api/teams", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'))
    teams = teams.filter(team => team.id !== "FAN");
    teams = sortTeams(teams); 
    fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2))
    resp.send(teams)
})

app.get("/api/matches", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    if (req.query.id) {
        let match = matches.find(match => match.id === req.query.id);
        if (!match) {
            resp.status(400).send("No match with this ID!");
            return
        }
        resp.send(match)
        return
    }
    if (req.query.next && req.query.next === "true") {
        let match = matches[0]
        if (!match) {
            resp.status(400).send("No upcoming match!");
            return
        }
        resp.send(match)
        return
    }
    let matchList = matches.map(match => ({
        id: match.id,
        away: match.away,
        home: match.home,
        date: match.date
    }));
    resp.send(matchList)
})

app.post("/api/matches", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    fantasyMatches = matches.filter(match => match.id[0] === "F");
    if (fantasyMatches.length > 0) {
        maxFantasyMatch = Math.max(...fantasyMatches.map(match => parseInt(match.id.slice(1, match.id.length))));
    } else {
        maxFantasyMatch = 0;
    }
    let match = {
        id: "F" + (maxFantasyMatch + 1),
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
        date: req.body.datetime + ":00",
    }
    matches.push(match);
    matches.sort((a, b) => new Date(a.date) - new Date(b.date));
    fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2));
    resp.send(matches)
})

app.delete("/api/matches", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    let newMatches = matches.filter(match => match.id !== req.body.match);
    if (JSON.stringify(newMatches) === JSON.stringify(matches)) {
        resp.status(400).send("Match not found!");
        return
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(newMatches, null, 2));
    resp.send(newMatches)
})

app.patch("/api/matches/:id", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    let match = matches.find(match => match.id === req.params.id);
    if (!match) {
        resp.status(400).send("Match not found!");
        return
    } else if (match.id[0] === "F") {
        resp.status(400).send("You cannot vote on a fantasy match!");
        return
    }
    if (match.away.id === req.body.team) {
        match.away.votes += req.body.vote
    } else {
        match.home.votes += req.body.vote
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2));
    resp.send(match)
})

app.get("/api/standings", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    teams.sort((a, b) => a.position - b.position);
    resp.send(teams)
})

app.get("/api/schedule", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    resp.send(matches)
})

app.listen(8090, '10.247.157.33', () => {
    console.log("Server running at: http://10.247.157.33:8090")
})