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
    resp.send({topTeam, nextMatch})
})

app.get("/api/standings", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    teams.sort((a, b) => a.position - b.position);
    resp.send(teams)
})

app.get("/api/schedule", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    matches.sort((a, b) => a.id - b.id);
    resp.send(matches)
})

app.post("/api/vote", function(req,resp){
    let matches = JSON.parse(fs.readFileSync('./data/matches.json', 'utf8'));
    let match = matches.find(match => match.id === req.body.id);
    if (req.body.team === match.away) {
        match.awayVotes++;
    } else {
        match.homeVotes++;
    }
    match.awayPercent = Math.round(match.awayVotes / (match.awayVotes + match.homeVotes) * 100)
    match.homePercent = Math.round(match.homeVotes / (match.awayVotes + match.homeVotes) * 100)
    match.awayOdds = 100 / match.awayPercent;
    match.homeOdds = 100 / match.homePercent;
    fs.writeFileSync('./data/matches.json', JSON.stringify(matches, null, 2));
    resp.send(match)
})

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


app.post("/api/team/add", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'));
    if (teams.find(team => team.id === "FAN")) {
        resp.status(400).send("You have already added your fantasy team!");
        return;
    }
    let team = {
        id: "FAN",
        position: -1,
        logo: "assets/logos/Fantasy.svg",
        name: req.body.teamName,
        gamesPlayed: parseInt(req.body.gamesPlayed),
        points: parseInt(req.body.teamPoints),
    }
    teams.push(team);
    teams = sortTeams(teams);
    fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2));
    resp.send(teams)
})

app.delete("/api/team/remove", function(req,resp){
    let teams = JSON.parse(fs.readFileSync('./data/teams.json', 'utf8'))
    teams = teams.filter(team => team.id !== "FAN");
    teams = sortTeams(teams); 
    fs.writeFileSync('./data/teams.json', JSON.stringify(teams, null, 2))
    resp.send(teams)
})


app.listen(8090, () => {
    console.log("Server running at: http://localhost:8090")
})