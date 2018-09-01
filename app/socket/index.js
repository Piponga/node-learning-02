module.exports = function (server) {
    const io = require('socket.io')(server);

    io.set('origins', 'localhost:*');

    io.on('connection', (socket) => {
        socket.on('message', (data, cb) => {
            socket.broadcast.emit('message', data);
            cb(data);
        });
    });
};