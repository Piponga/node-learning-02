
var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    lineWidth = 2;

function init() {
    var colors = document.getElementsByClassName('color');

    for (var i=0; i < colors.length; i++) {
        var el = colors[i];
        var colorName = el.getAttribute('id');

        el.style.backgroundColor = colorName;
    }

    canvas = document.getElementById('whiteboard');
    if (!canvas) return;

    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);

    window.addEventListener('resize', onResize, false);
    onResize();
    erase(false);

    socket.emit('canvas-get');
}

function color(obj) {
    switch (obj.id) {
        case "green":
            x = "green";
            break;
        case "blue":
            x = "blue";
            break;
        case "red":
            x = "red";
            break;
        case "yellow":
            x = "yellow";
            break;
        case "orange":
            x = "orange";
            break;
        case "black":
            x = "black";
            break;
        case "white":
            x = "white";
            break;
    }
    if (x === "white") lineWidth = 14;
    else lineWidth = 2;
}

function draw(prevX, prevY, currX, currY, x, lineWidth, emit) {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();

    var data = {
        x0: prevX,
        y0: prevY,
        x1: currX,
        y1: currY,
        ss: x,
        lw: lineWidth
    };

    if (!emit) return;
    socket.emit('canvas-draw', data);
}

socket.on('canvas-draw', function (data) {
    if (!socket.isMyConnected) return;

    draw(data.x0, data.y0, data.x1, data.y1, data.ss, data.lw, false);
});

socket.on('canvas-clear', function () {
    if (!socket.isMyConnected) return;
    erase(false);
});
socket.on('canvas-get', function (data) {
    if (!data) return;

    for (var i=0; i < data.length; i++) {
        draw(data[i].x0, data[i].y0, data[i].x1, data[i].y1, data[i].ss, data[i].lw, false);
    }
});

function erase(emit) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!emit) return;
    socket.emit('canvas-clear');
}

function findxy(res, e) {
    if (res === 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = x;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res === 'up' || res === "out") {
        flag = false;
    }
    if (res === 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw(prevX, prevY, currX, currY, x, lineWidth, true);
        }
    }
}

window.onload = function () {
    init();
};

function onResize() {
    var top = window.getComputedStyle(canvas).getPropertyValue('top');
    top = Number(/\d+/.exec(top)[0]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - top;
}