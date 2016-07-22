//(function () {
//    var canvas = $("#paint"); 
//    var ctx = canvas.getContext('2d');

//    var sketch = document.querySelector('#sketch');
//    var sketch_style = getComputedStyle(sketch);
//    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
//    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

//    var mouse = { x: 0, y: 0 };
//    var last_mouse = { x: 0, y: 0 };

//    /* Mouse Capturing Work */
//    canvas.addEventListener('mousemove', function (e) {
//        last_mouse.x = mouse.x;
//        last_mouse.y = mouse.y;

//        mouse.x = e.pageX - this.offsetLeft;
//        mouse.y = e.pageY - this.offsetTop;
//    }, false);


//    /* Drawing on Paint App */
//    ctx.lineWidth = 5;
//    ctx.lineJoin = 'round';
//    ctx.lineCap = 'round';
//    ctx.strokeStyle = 'blue';

//    canvas.addEventListener('mousedown', function (e) {
//        canvas.addEventListener('mousemove', onPaint, false);
//    }, false);

//    canvas.addEventListener('mouseup', function () {
//        canvas.removeEventListener('mousemove', onPaint, false);
//    }, false);

//    var onPaint = function () {
//        ctx.beginPath();
//        ctx.moveTo(last_mouse.x, last_mouse.y);
//        ctx.lineTo(mouse.x, mouse.y);
//        ctx.closePath();
//        ctx.stroke();
//    };

//}());


var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

function init() {
    canvas = document.getElementById('can');
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
    if (x == "white") y = 14;
    else y = 2;

}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = x;
    ctx.lineWidth = y;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    var m = confirm("Want to clear");
    if (m) {
        ctx.clearRect(0, 0, w, h);
        document.getElementById("canvasimg").style.display = "none";
    }
}

function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
}

function findxy(res, e) {
    if (res == 'down') {
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
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}