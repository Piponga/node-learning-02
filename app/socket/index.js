const config = require('../../config');
const async = require('async');
const connect = require('connect');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const sessionStore = require('../lib/sessionStore');
const User = require('../models/user').User;
const Rnd = require('../lib/Rnd');

const canvasPaints = [];
const rooms = {};
let lastRoomIndex = 0;
const availableRoomNamesArr = [];
const availableRoomNamesSet = new Set();
const roomState = {
    ships: {}
};

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

    // console.log('retrieving user ' + session.user);

    User.findById(session.user, function (err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        // console.log('user findbyid result: ' + user);
        return callback(null, user);
    });
}

function checkRoomFullness(roomName) {
    if (rooms[roomName].clientsCount >= config.socket.maxClientsInRoom) {
        availableRoomNamesSet.delete(roomName);
    } else if (rooms[roomName].clientsCount === 0) {
        delete rooms[roomName];
        availableRoomNamesSet.delete(roomName);
        availableRoomNamesArr.push(roomName);
    } else {
        availableRoomNamesSet.add(roomName);
    }
    console.log(444, rooms, rooms.hasOwnProperty(roomName) ? rooms[roomName].ships : '');
    console.log(555, availableRoomNamesSet);
    console.log(666, availableRoomNamesArr);
}

function getRoomName() {
    if (availableRoomNamesSet.size > 0) {
        return availableRoomNamesSet.values().next().value;
    }

    let roomName = '';

    if (availableRoomNamesArr.length > 0) {
        roomName = availableRoomNamesArr.pop();
    } else {
        lastRoomIndex++;
        roomName = 'room' + lastRoomIndex;
    }

    rooms[roomName] = {
        clientsCount: 0,
        ships: {},
        boosters: {}
    };

    availableRoomNamesSet.add(roomName);

    return roomName;
}

module.exports = function (server) {
    const origins = process.env.NODE_ENV !== 'production' ? 'localhost:*' : 'piponga.com:*';
    const io = require('socket.io')(server, {
        origins: origins,
        serveClient: false,
        pingInterval: 10000,
        pingTimeout: 5000
    });

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



    io.on('connection', (socket) => {
        // io.of('').clients((error, clients) => {
        //     if (error) throw error;
        //     console.log(22, clients);
        // });

        const handshake = socket.request;
        if (!handshake.user) return false;

        let username = '';
        username = handshake.user.username;

        socket.roomName = getRoomName();

        socket.join(socket.roomName, () => {
            socket.emit('room-wars-connect', username);

            if (io.of('/').adapter.rooms.hasOwnProperty(socket.roomName)) {
                rooms[socket.roomName].clientsCount = io.of('/').adapter.rooms[socket.roomName].length;

                checkRoomFullness(socket.roomName);
            } else {
                console.log('------------- room is not exist');
            }
        });

/*        socket.emit('myconnect');

        socket.broadcast.emit('join', username);

        socket.on('message', (data, cb) => {
            socket.broadcast.emit('message', username, data);
            cb(data);
        });

        socket.on('canvas-get', () => {

            // socket.local.emit('canvas-get', canvasPaints);
        });
        socket.on('canvas-draw', data => {
            console.log(data)
            // canvasPaints.push(data);
            // socket.broadcast.emit('canvas-draw', data);
        });
        socket.on('canvas-clear', data => {
            canvasPaints = [];
            socket.broadcast.emit('canvas-clear', data);
        });*/

        socket.on('ship-join', data => {
            let room = rooms[socket.roomName];

            room.ships[data.user] = {};
            room.ships[data.user].pos = data.pos;
            room.ships[data.user].rot = data.rot;
            socket.broadcast.to(socket.roomName).emit('ship-join', data);
        });

        // socket.on('ship-respawn', data => {
        //     if (!roomState.ships.hasOwnProperty(data.user)) roomState.ships[data.user] = {};
        //     roomState.ships[data.user].pos = data.pos;
        //     roomState.ships[data.user].rot = data.rot;
        //     socket.broadcast.emit('ship-respawn', data);
        // });
        socket.on('room-get', () => {
            socket.emit('room-get', rooms[socket.roomName]);
        });
        // socket.on('ship-move', data => {
        //     if (!roomState.ships.hasOwnProperty(username)) roomState.ships[username] = {};
        //     if (data.pos) roomState.ships[username].pos = data.pos;
        //     if (data.rot) roomState.ships[username].rot = data.rot;
        //     socket.broadcast.emit('ship-move', username, data);
        // });
        // socket.on('ship-died', () => {
        //     roomState.ships[username] = {};
        //     socket.broadcast.emit('ship-died', username);
        // });

        socket.on('disconnect', () => {
            if (rooms[socket.roomName].ships.hasOwnProperty(username)) delete rooms[socket.roomName].ships[username];
            socket.broadcast.to(socket.roomName).emit('ship-leave', username);

            if (io.of('/').adapter.rooms.hasOwnProperty(socket.roomName)) {
                rooms[socket.roomName].clientsCount = io.of('/').adapter.rooms[socket.roomName].length;

            } else {
                rooms[socket.roomName].clientsCount = 0;

                console.log('------------- room is not exist', io.of('/').adapter.rooms);
            }
            checkRoomFullness(socket.roomName);
        });

        // check if the socket suddenly became offline
        socket.pingCounter = 0;
        let pingPongTimer = setInterval(function () {
            if (socket.pingCounter > 5) {
                clearInterval(this);
                setTimeout(() => socket.disconnect(true), 0);
            }

            socket.pingCounter++;
            socket.emit('server-ping');
        }, 1000);
        socket.on('client-pong', () => {
             socket.pingCounter--;
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