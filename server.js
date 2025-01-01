const express = require('express');
const fs = require('fs');

const app = express()

app.use(express.json())
app.use(express.static("client"))

app.get("/api/home", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    let topTeam = teams.find(team => team.position === 1);
    let nextMatch = matches.find(match => match.order === 1);
    resp.json({topTeam, nextMatch})
})

app.get("/api/standings", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    teams.sort((a, b) => a.position - b.position);
    resp.json(teams)
})

app.get("/api/schedule", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    matches.sort((a, b) => a.order - b.order);
    resp.json(matches)
})



console.log("Server running at: http://localhost:8090")

app.listen(8090)