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
            if (err) return callback(err);
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
        return callback(null, user);
    });
}

module.exports = function (server) {
    const io = require('socket.io')(server);

    io.set('origins', 'localhost:*');

    io.use(function(socket, next) {
        const handshake = socket.request;

        handshake.cookies = cookie.parse(handshake.headers.cookie || '');
        const sidCookie = handshake.cookies[config.session.key];
        const sid = cookieParser.signedCookie(sidCookie, config.session.secret);

        loadSession(sid, (err, session) => {
            if (err) return next(err);

            socket.request.session = session;
            return next();
        });
    });

    io.use(function(socket, next) {
        const session = socket.request.session;

        if (!session) {
            return next(401);
        }

        loadUser(session, (err, user) => {
            if (err) return next(err);

            socket.request.user = user;
            return next();
        });
    });


    // io.use(function(socket, next) {
    //     const handshake = socket.request;
    //
    //     async.waterfall([
    //         function (callback) {
    //             handshake.cookies = cookie.parse(handshake.headers.cookie || '');
    //             const sidCookie = handshake.cookies[config.session.key];
    //             const sid = cookieParser.signedCookie(sidCookie, config.session.secret);
    //
    //
    //             loadSession(sid, callback);
    //         },
    //         function (session, callback) {
    //             if (!session) {
    //                 callback(401);
    //             }
    //
    //             handshake.session = session;
    //             loadUser(session, callback);
    //         },
    //         function (user, callback) {
    //             if (!user) {
    //                 callback(403);
    //             }
    //
    //             handshake.user = user;
    //             callback(null);
    //         }
    //     ], function (err) {
    //         if (!err) {
    //             console.log(222)
    //             return next();
    //         } else {
    //             console.log(333)
    //             // next(new Error('not authorized'));
    //             return next(err);
    //         }
    //     });
    // });

    io.on('connection', (socket) => {

        const handshake = socket.request;
        if (!handshake.user) return false;

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
        const connected = io.of('').connected;

        for(let key in connected) {
            const socket = connected[key];

            if (socket.request.session.id !== sid) return;

            loadSession(sid, (err, session) => {
                if (err) {
                    socket.emit('error', 'server error');
                    socket.disconnect();
                    return;
                }

                if (!session) {
                    socket.emit('logout');
                    // socket.emit('error', 'handshake unauthorized');
                    socket.disconnect();
                    return;
                }

                socket.request.session = session;
            });
        }
    });

    return io;
};