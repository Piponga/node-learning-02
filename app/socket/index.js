const config = require('../../config');
const async = require('async');
const connect = require('connect');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const sessionStore = require('../lib/sessionStore');
const User = require('../models/user').User;

function loadSession(sid, callback) {
    sessionStore.load(sid, function (err, session) {
        if (arguments.length === 0) {
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function loadUser(session, callback) {
    if (!session.user) {
        console.log('session is anonymous: ' + session.id);
        return callback(null, null);
    }

    console.log('retrieving user ' + session.user);

    User.findById(session.user, function (err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        console.log('user findbyid result: ' + user);
        callback(null, user);
    });
}

module.exports = function (server) {
    const io = require('socket.io')(server);

    io.set('origins', 'localhost:*');

    io.use(function(socket, next) {
        const handshake = socket.request;

        async.waterfall([
            function (callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                const sidCookie = handshake.cookies[config.session.key];
                const sid = cookieParser.signedCookie(sidCookie, config.session.secret);

                loadSession(sid, callback);
                // callback(null, null);
            },
            function (session, callback) {
                if (!session) {
                    callback(401);
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            function (user, callback) {
                if (!user) {
                    callback(403);
                }

                handshake.user = user;
                callback(null);
            }
        ], function (err) {
            if (!err) {
                next();
            } else {
                next(new Error('not authorized'));
            }
        });
    });

    io.on('connection', (socket) => {

        const handshake = socket.request;
        let username = '';
        username = handshake.user.username;

        socket.broadcast.emit('join', username);

        socket.on('message', (data, cb) => {
            socket.broadcast.emit('message', username, data);
            cb(data);
        });

        socket.on('disconnect', () => {
            socket.broadcast.emit('leave', username);
        });

    });

    io.on('sessreload', (sid) => {

        // console.log(111, io.sockets);

        io.of('').clients((err, clients) => {
            if (err) throw err;
            console.log(888, sid, clients, io.sockets.sockets);

            clients.forEach((client) => {
                console.log(666, io.sockets[client]);
            });
        });



    });

    return io;
};