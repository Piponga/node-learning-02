// var socket = io.connect('http://localhost:3000');
var socket = io('', {
    'reconnectionDelay': 1000,
    'timeout': 10000
});
socket.isMyConnected = false;

var LINES = 18;
var ul = $('.room ul');
var form = $('.form');
var input = $('.form-control');

var appendUl = function (data, color) {
    $(ul).append('<li style="color: ' + (color !== undefined ? color : "white") + '">' + data + '</li>');

    var liArr = $('li').get();
    if (liArr.length > LINES) {
        liArr[0].remove();
    }

    ul.scrollTop($(document).height());
};

form.submit(function (e) {
    e.preventDefault();
    var message = input.val();
    input.val('');

    if (message === '') return false;

    socket.emit('message', message, function (data) {
        appendUl('я: ' + data);
    });
});

socket.on('message', function (username, data) {
    if (!socket.isMyConnected) return;
    appendUl(username + ': ' + data);
});

socket.on('join', function (username) {
    if (!socket.isMyConnected) return;
    appendUl(username + ' вошёл в чат', 'gray');
});
socket.on('leave', function (username) {
    if (!socket.isMyConnected) return;
    appendUl(username + ' вышел из чата', 'gray');
});

socket.on('logout', function () {
    socket.isMyConnected = false;
    window.location.href = '/';
});

socket.on('myconnect', function () {
    socket.isMyConnected = true;
    $('ul').empty();
    appendUl('Соединение установлено', 'green');
    input.attr('disabled', false);
});

socket.on('disconnect', function () {
    socket.isMyConnected = false;
    appendUl('Соединение потеряно', 'red');
    input.attr('disabled', true);
});

socket.on('connect_timeout', function () {
    console.log('connect_timeout');
    socket.close();
});
