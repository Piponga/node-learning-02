const config = require('./config');
const express = require('express');
const app = express();
const server = require('http').Server(app);
// const io = require('socket.io')(server);

app.set('view engine', 'pug');
app.set('views','./app/resources');

const port = config.port;

require('./app/routes')(app);

server.listen(port, (err) => {
    if (err) {
        return console.log('error in request', err);
    }
    console.log(`server is listening on ${port}`);
});

require('./app/socket')(server);
