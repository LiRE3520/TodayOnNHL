const app = require('./app'); // import API endpoints

app.listen(8090, '10.247.157.33', () => { // start the server
    console.log('Server running at: http://10.247.157.33:8090');
});
