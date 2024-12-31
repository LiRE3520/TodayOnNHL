const express = require('express');
const fs = require('fs');

const app = express()

let teams = require('./data/teams.json')

app.use(express.json())
app.use(express.static("client"))

app.get("/api/teams", function(req,resp){
    resp.json(teams)
})

















console.log("Server running at: http://localhost:8090")

app.listen(8090)