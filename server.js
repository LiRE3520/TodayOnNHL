const express = require('express');
const fs = require('fs');

const app = express()

app.use(express.json())
app.use(express.static("client"))

app.get("/api/home", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    matches.sort((a, b) => a.id - b.id);
    let topTeam = teams.find(team => team.position === 1);
    let nextMatch = matches[0];
    resp.json({topTeam, nextMatch})
})

app.get("/api/standings", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    teams.sort((a, b) => a.position - b.position);
    resp.json(teams)
})

app.get("/api/schedule", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    matches.sort((a, b) => a.id - b.id);
    resp.json(matches)
})

app.post("/api/vote", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    let match = matches.find(match => match.id === req.body.id);
    if (req.body.team === match.team1) {
        match.team1Votes++;
    } else {
        match.team2Votes++;
    }
    fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2));
    resp.json(match)
})

console.log("Server running at: http://localhost:8090")

app.listen(8090)