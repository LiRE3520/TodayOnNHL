const express = require('express')
const app = express()

app.use(express.static("client"))

app.get('/', function(req, resp){
    resp.send('Hello world')
})

console.log("Server running at: http://127.0.0.1:8090/")

app.listen(8090)