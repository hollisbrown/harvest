const COST_GROW = 15;
const COST_SPLIT = 30;
const COST_LEAF = 60;
const COST_FRUIT = 50;

//const audioMusic = new Audio("music.mp3");
const audioBuild = new Audio("build.mp3");
const audioClick = new Audio("click.mp3");

const icons = [new Image, new Image, new Image, new Image, new Image, new Image, new Image];
icons[1].src = "img/cross.png";
icons[2].src = "img/branch.png";
icons[3].src = "img/split.png";
icons[4].src = "img/leaf.png";
icons[5].src = "img/fruit.png";
icons[6].src = "img/speaker.png";

let time = 0;
let timeLast = 0;
let pointerX;
let pointerY;
let isPointerDown = false;
let isSelecting = false;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let plant = [];
let lastId = 0;
let selectedId = 0;

let rotationOffset = 0;
let timer = 0;
let timerMax = 4;
let power;
let harvest;
let timeLeft;

let lastScore = 0;
let highScore = 0;
let isPlaying = false;
let rainParticles = [];

const powerMax = 100;
const fruitSizeMax = 20;
const startSpeed = 5;
const absorbSpeed = 4;
const growSpeed = 10;

class Segment {
    constructor(parent) {
        this.parent = parent;
        this.id = getNextId();
        this.distanceToRoot = 0;
        this.children = [];
        this.isSelectable = true;
        this.isLeaf = false;
        this.isFruit = false;
        this.fruitSize = 5;
        this.matrixFruit;
        this.matrix;

        if (parent) {
            parent.isSelectable = false;
            parent.children.push(this);
            this.distanceToRoot = parent.distanceToRoot;
            this.distanceToRoot += 1;
        }
    }

    render() {
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -35);
        ctx.stroke();
        ctx.translate(0, -5);

        if (this.isLeaf) {
            ctx.save();
            ctx.fillStyle = "#fff";

            ctx.rotate(1);
            leaf(2, 0, 12, 30);

            ctx.rotate(-1.9);
            leaf(-2, 0, 12, 30);

            ctx.restore();

        } else if (this.isFruit) {
            ctx.save();
            ctx.fillStyle = "#ff2222";
            bezierCircle(0, 0, this.fruitSize * 1.5, this.fruitSize * 1.5);
            this.matrixFruit = ctx.getTransform();
            ctx.restore();
        }

        ctx.translate(0, -30);
        this.matrix = ctx.getTransform();

        for (let i = 0; i < this.children.length; i++) {
            ctx.save();
            ctx.lineWidth = 10;
            if (this.children.length > 1) {
                let rotation = i - 0.5;
                rotation += getSine(i / 5);
                ctx.rotate(rotation);
            } else {
                ctx.rotate(getSine(i / 3));
            }
            this.children[i].render();
            ctx.restore();
        }
    }
}

window.onload = function () {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerdown", onPointerDown);
    timeLast = Date.now();
    requestAnimationFrame(loop);
}

function loop() {
    time = Date.now() - timeLast;
    update(time / 1000);
    timeLast = Date.now();
    requestAnimationFrame(loop);
    isPointerDown = false;

}

function setup() {
    power = 50;
    harvest = 0;
    timeLeft = 100;
    plant = [];
    plant.push(new Segment(null));
    plant.push(new Segment(plant[0]));
    for (let i = 0; i < 100; i++) {
        rainParticles[i] = Math.random();
    }
}

function update(deltaTime) {
    timer += deltaTime;
    if (timer >= timerMax) {
        timer = 0;
    }

    if (!isPlaying) {
        renderMenuMain();
        return;
    }

    // SIMULATION
    timeLeft -= deltaTime;
    if (timeLeft < 1) {
        isPlaying = false;
        lastScore = harvest;
        if (lastScore > highScore) {
            highScore = lastScore;
        }
    }

    for (let i = 0; i < plant.length; i++) {
        if (plant[i].isLeaf) {
            let absorbAmount = deltaTime * absorbSpeed;
            if (plant[i].children.length == 1) {
                if (plant[i].children[0].isLeaf) {
                    absorbAmount = absorbAmount / 2;
                }
            }
            power += absorbAmount;
        }
        if (plant[i].isFruit) {
            let growAmount = deltaTime * growSpeed;
            if (plant[i].fruitSize < fruitSizeMax && power > growAmount) {
                plant[i].fruitSize += growAmount / 4;
                power -= growAmount;
            }
        }
    }

    power += deltaTime * startSpeed;
    if (power > powerMax) {
        power = powerMax;
    }

    // RENDERING
    renderBackground();
    renderPlant();
    renderPower();
    renderHarvestButtons();
    renderSelectButtons();
    renderBuildMenu();
    renderMenuTop();
}

// GENERAL

function onMouseMove(evt) {
    let canvasRect = canvas.getBoundingClientRect();
    pointerX = evt.x - canvasRect.left,
        pointerY = evt.y - canvasRect.top;
}

function onPointerDown(evt) {
    let canvasRect = canvas.getBoundingClientRect();
    pointerX = evt.x - canvasRect.left,
        pointerY = evt.y - canvasRect.top;
    isPointerDown = true;
}

function getTimeOffset(offset) {
    let t = (timer + offset) % timerMax;
    let fac = (t / timerMax);
    return fac;
}

function getSine(offset) {
    let t = (timer + offset) % timerMax;
    let fac = (t / timerMax) * Math.PI * 2;
    return (Math.sin(fac) / 50);
}

function getNextId() {
    lastId += 1;
    return lastId - 1;
}


// RENDERING

function renderBackground() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, -50);
    ctx.rotate(0.1);
    for (let i = 0; i < rainParticles.length; i++) {
        raindrop(rainParticles[i] * 480, getTimeOffset(rainParticles[i] * 4211), 30);
    }
    ctx.restore();
}

function renderPlant() {
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height-40);
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    plant[0].render();
    ctx.restore();

    // GROUND
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.bezierCurveTo(canvas.width - 100, canvas.height - 40, canvas.width - 100, canvas.height - 60, canvas.width / 2, canvas.height - 60);
    ctx.bezierCurveTo(100, canvas.height - 60, 100, canvas.height - 40, 0, canvas.height - 40);
    ctx.fill();
}

function renderMenuTop() {
    label("TIME: " + Math.floor(timeLeft), 65, 20, 16);
    label("HARVEST: " + harvest, canvas.width - 70, 20, 16);
}

function renderMenuMain() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    label("HARVEST", x, y - 100, 40);
    label("SCORE: " + lastScore, x, y, 16);
    label("HIGHSCORE: " + highScore, x, y + 20, 16);

    if (button(x, y + 100, "#666", 1, 3)) {
        if (isPointerDown) {
            // audioMusic.pause();
            // audioMusic.currentTime = 0;
            // audioMusic.play();
            setup();
            isPlaying = true;
        }
    }
}

function renderBuildMenu() {
    if (selectedId == 0) {
        return;
    }

    let point = new DOMPoint(0, 0);
    point = plant[selectedId].matrix.transformPoint(point);


    if (button(point.x, point.y, "#222", 1, 1)) {
        if (isPointerDown) {
            audioClick.currentTime = 0;
            audioClick.play();
            isPointerDown = false;
            selectedId = 0;
        }
    }

    if (button(point.x - 40, point.y - 32, "#555", 1, 2)) {
        if (isPointerDown) {
            if (power >= COST_GROW) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                isPointerDown = false;
                power -= COST_GROW;
                plant.push(new Segment(plant[selectedId]));
                selectedId = 0;
            }
        } else {
            renderCost(COST_GROW);
        }
    }

    if (button(point.x - 40, point.y + 32, "#555", 1, 3)) {
        if (isPointerDown) {
            if (power >= COST_SPLIT) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                isPointerDown = false;
                power -= COST_SPLIT;
                plant.push(new Segment(plant[selectedId]));
                plant.push(new Segment(plant[selectedId]));
                selectedId = 0;
            }
        } else {
            renderCost(COST_SPLIT);
        }
    }

    if (button(point.x + 40, point.y - 32, "#555", 1, 4)) {
        if (isPointerDown) {
            if (power >= COST_LEAF) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                isPointerDown = false;
                power -= COST_LEAF;
                let segment = new Segment(plant[selectedId]);
                segment.isLeaf = true;
                plant.push(segment);
                selectedId = 0;
            }
        } else {
            renderCost(COST_LEAF);
        }
    }

    if (button(point.x + 40, point.y + 32, "#555", 1, 5)) {
        if (isPointerDown) {
            if (power >= COST_FRUIT) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                isPointerDown = false;
                power -= COST_FRUIT;
                let segment = new Segment(plant[selectedId]);
                segment.isFruit = true;
                plant.push(segment);
                selectedId = 0;
            }
        } else {
            renderCost(COST_FRUIT);
        }
    }

}

function renderHarvestButtons() {
    if (selectedId != 0) {
        return;
    }

    for (let i = 0; i < plant.length; i++) {
        if (plant[i].isFruit && plant[i].fruitSize > fruitSizeMax - 1) {

            if (!plant[i].matrixFruit) {
                return;
            }

            let point = new DOMPoint(0, 0);
            point = plant[i].matrixFruit.transformPoint(point);

            if (button(point.x, point.y, "#333", 0.2, 1)) {
                if (isPointerDown) {
                    audioClick.currentTime = 0;
                    audioClick.play();
                    isPointerDown = false;
                    plant[i].fruitSize = 0;
                    harvest += 1;
                }
            }
        }
    }
}

function renderSelectButtons() {
    if (selectedId != 0) {
        return;
    }

    for (let i = 0; i < plant.length; i++) {
        if (plant[i].isSelectable) {
            if (!plant[i].matrix) {
                continue;
            }

            // // MAXIMUM BRANCH LENGTH
            // if (plant[i].distanceToRoot >= 10) {
            //     continue;
            // }

            if (plant[i].id == selectedId) {
                continue;
            }

            let point = new DOMPoint(0, 0);
            point = plant[i].matrix.transformPoint(point);
            if (button(point.x, point.y, "#aaaaaa", 0.2, 0)) {
                if (isPointerDown) {
                    audioClick.currentTime = 0;
                    audioClick.play();
                    isPointerDown = false;
                    selectedId = i;
                }
            }
        }
    }
}

function renderPower() {
    const y = canvas.height - 20;
    const w = canvas.width - 20;
    const min = w / powerMax;

    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.2;
    ctx.fillRect(10, y, w, 10);

    ctx.globalAlpha = 1;
    ctx.fillRect(10, y, min * power, 10);
}

function renderCost(cost) {
    const y = canvas.height - 20;
    const w = canvas.width - 20;
    const min = w / powerMax;

    ctx.globalAlpha = 0.8;
    if (cost > power) {
        ctx.fillStyle = "#aa6666";
        ctx.strokeStyle = "#aa6666";
    } else {
        ctx.fillStyle = "#66aa66";
        ctx.strokeStyle = "#66aa66";
    }

    ctx.fillRect(10, y, min * cost, 10);
}

function button(_x, _y, color, alpha = 1, icon = 0, size = 34) {
    const w = size;
    const h = size;
    const x = _x - w / 2;
    const y = _y - h / 2;

    const isHovered = pointerX > x && pointerX < x + w && pointerY > y && pointerY < y + h;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    bezierCircle(_x, _y, w, h);

    if (isHovered) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        bezierCircle(_x, _y, w, h);
    }

    ctx.globalAlpha = 1;
    if (icon != 0) {
        ctx.drawImage(icons[icon], x + (size - 32) / 2, y + (size - 32) / 2, 32, 32);
    }

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = .5;
    ctx.stroke();
    return isHovered;
}

function label(str, _x, _y, _size = 16) {
    const size = _size;
    const x = _x;
    const y = _y + size / 2;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = size + "px Courier New";
    ctx.fillText(str, x, y);
}

function bezierCircle(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.bezierCurveTo(x + w / 4, y - h / 2, x + w / 2, y - h / 4, x + w / 2, y);
    ctx.bezierCurveTo(x + w / 2, y + h / 4, x + w / 4, y + h / 2, x, y + h / 2);
    ctx.bezierCurveTo(x - w / 4, y + h / 2, x - w / 2, y + h / 4, x - w / 2, y);
    ctx.bezierCurveTo(x - w / 2, y - h / 4, x - w / 4, y - h / 2, x, y - h / 2);
    ctx.fill();
}

function leaf(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - w / 4, y, x - w / 2, y - h / 6, x - w / 2, y - h / 4);
    ctx.bezierCurveTo(x - w / 2, y - h * 0.5, x - w / 3, y - h * 0.66, x, y - h);
    ctx.bezierCurveTo(x + w / 3, y - h * 0.66, x + w / 2, y - h * 0.5, x + w / 2, y - h / 4);
    ctx.bezierCurveTo(x + w / 2, y - h / 6, x + w / 4, y, x, y);
    ctx.fill();
}

function raindrop(x, fac, length) {
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, fac * (canvas.height * (x % 3 + 1)));
    ctx.lineTo(x, fac * (canvas.height * (x % 3 + 1)) + length);
    ctx.stroke();
}