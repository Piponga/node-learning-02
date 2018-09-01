// var socket = io.connect('http://localhost:3000');
var socket = io('', {
    'reconnectionDelay': 1000,
    'timeout': 10000
});

var LINES = 18;
var ul = $('.room ul');
var form = $('.form');
var input = $('.form-control');

var appendUl = function (data, color) {
    $(ul).append('<li style="color: ' + (color !== undefined ? color : "black") + '">' + data + '</li>');

    var liArr = $('li').get();
    if (liArr.length > LINES) {
        liArr[0].remove();
    }
};

form.submit(function (e) {
    e.preventDefault();
    var message = input.val();
    input.val('');

    if (message === '') return false;

    socket.emit('message', message, function (data) {
        appendUl(data);
    });
});

socket.on('message', function (data) {
    appendUl(data);
});

socket.on('connect', function () {
    $('ul').empty();
    appendUl('Соединение установлено', 'green');
    input.attr('disabled', false);
});

socket.on('disconnect', function () {
    appendUl('Соединение потеряно', 'red');
    input.attr('disabled', true);
});

socket.on('connect_timeout', function () {
    console.log('connect_timeout');
    socket.close();
});
