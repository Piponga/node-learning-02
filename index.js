const config = require('./config');
// const path = require('path');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const server = require('http').Server(app);
// const io = require('socket.io')(server);

app.set('view engine', 'pug');
app.set('views', './app/resources');

// app.use(express.static(path.join(__dirname, 'app/resources')));
app.use(express.static('app/resources'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

const session = require('express-session');
const sessionStore = require('./app/lib/sessionStore');
app.use(session({
    secret: config.session.secret,
    key: config.session.key,
    cookie: config.session.cookie,
    store: sessionStore,
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(require('./app/middleware/loadUser'));

require('./app/routes')(app);

const port = config.port;
server.listen(port, (err) => {
    if (err) {
        return console.log('error in request', err);
    }
    console.log(`server is listening on ${port}`);
});

const io = require('./app/socket')(server);
app.set('io', io);