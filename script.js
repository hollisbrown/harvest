const COST_GROW = 15;
const COST_SPLIT = 30;
const COST_LEAF = 60;
const COST_FRUIT = 50;

const audioMusic = new Audio("music.mp3");
const audioBuild = new Audio("build.mp3");
const audioClick = new Audio("click.mp3");


const icons = [new Image, new Image, new Image, new Image, new Image, new Image];
icons[1].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAKtJREFUWEftlUEOwCAIBOX/j7bxYGOMrbPQ1As9w+6ErmDl8GeH/UsC5ARyAmgCtdZqZqi2P2vasxVtQl2UQig9W4BmrggqtU0bAVAI1VwC2EF4zGWAJwivuQtghOih7AA0pOMBxBlYXc2I8f2yIuf4GMBsHAGRf8EqcL+F8M3IC4EnQAxIzZw5BKAIK7VoD6iCu43pnoC6ZD47x5E9QXpRBoiQtyYBcgI5gQs+Rngh8Va3MQAAAABJRU5ErkJgggAA";
icons[2].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAGxJREFUWEftl0sKwCAQxXz3P/QUF26E0plnYUDiXhOCH9RoHmrmDwQoQIGjAhER8xhLstexJy74ukdcCUtgh59IlAXe4K5ESeAL7kikBbLwqkRaYH+0WjfhlEGAAhSgAAX++k/YbwECFLimwAN6GkQhDlhyFwAAAABJRU5ErkJggg==";
icons[3].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAKFJREFUWEftl1EKwCAMQ9f7H7rDgUNkNQkIfiz77pJHrAHjOvzFYf/LAE7ACVAJZGa26xoR2+ehYDfvfYEg1PklwCyGINT5J9WqCSuxCkKdf3W+AJDYDKHOj57SDqDz78IjEPrHAFICTBco8S9vwbgo7JLNC43OnwZogyoEYy4BKBCsuQywOhbFVOoBtikN8L8Edr0nYBPuMqp0DOAEjidwA8F3aCHocMaeAAAAAElFTkSuQmCC";
icons[4].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAALdJREFUWEftltEKwCAIRfP/P7rhQBBpodfIBe1lL4XHc3ONWvFDxfXbBTjbQO+9E1GqidTmXwDwFGUswAake35nIJYBoBAQgHQtRTMWwgC6uAVALIQAbPGtAKPico/wFNhYvHeM20ApwKz4KIbIWXAZiHSvY/HEcAYAd/JlwR7AiP53rUeTrPGM4VaAbPdhA9aEBkBvxFAENq7S/4EVxeEIZCpQ7dokHEG5gVUWYAOR78ds7QW4Bh6QZ5Ahli/b5gAAAABJRU5ErkJgggAA";
icons[5].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAKxJREFUWEftlNsKgDAMQ9f//+jKhMoYs3c2hfrqbM4SG2iHHzis3wrA7QAiIgC4v6fo3QM6QB8ShQgDRCHcAF04w4UQAEFEYvgXAFn+/MHDFnDvuLJTOTAPt7SnFI8IEBFfOTXDswAZ4tKabgHgIF4Bsm4vxVAA33Vg7HrL3q/Ocl2wZQvcABkuhJswAiGJ3/2gzdfaCxpxEwCBciBa0fHSage0TlnPFUA5UA5cfNhYIY+BSZ8AAAAASUVORK5CYIIA";

let time = 0;
let timeLast = 0;
let mouseX;
let mouseY;
let isPointerDown = false;
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

window.onload = function () {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerdown", onPointerDown);
    timeLast = Date.now();
    requestAnimationFrame(loop);
}

function onMouseMove(evt) {
    let canvasRect = canvas.getBoundingClientRect();
    mouseX = evt.x - canvasRect.left,
        mouseY = evt.y - canvasRect.top;
}

function onPointerDown(evt) {
    isPointerDown = true;
}

function loop() {
    time = Date.now() - timeLast;
    update(time / 1000);
    timeLast = Date.now();
    requestAnimationFrame(loop);
    reset();
}

function reset() {
    isPointerDown = false;
}

function getSine(offset) {
    let t = (timer + offset) % timerMax;
    let fac = (t / timerMax) * Math.PI * 2;
    return (Math.sin(fac) / 50);
}

function getTimeOffset(offset) {
    let t = (timer + offset) % timerMax;
    let fac = (t / timerMax);
    return fac;
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
        renderMenu();
        return;
    }

    //simulation
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

    //render
    renderBackground();
    renderPlant();
    renderPower();
    renderSelectButtons();
    renderHarvestButtons();
    renderBuildMenu();
    renderStats();
}

function renderBackground() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 480, 480);
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
    ctx.translate(240, 440);
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    plant[0].draw();
    ctx.restore();

    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.bezierCurveTo(canvas.width - 100, canvas.height - 40, canvas.width - 100, canvas.height - 60, canvas.width / 2, canvas.height - 60);
    ctx.bezierCurveTo(100, canvas.height - 60, 100, canvas.height - 40, 0, canvas.height - 40);
    ctx.fill();
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

            if (button(point.x, point.y, "#333", 0.2, 1, 24)) {
                if (isPointerDown) {
                    audioClick.currentTime = 0;
                    audioClick.play();
                    reset();
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

            if (plant[i].distanceToRoot >= 10) {
                continue;
            }

            if (plant[i].id == selectedId) {
                continue;
            }

            let point = new DOMPoint(0, 0);
            point = plant[i].matrix.transformPoint(point);
            if (button(point.x, point.y, "#aaaaaa", 0.2, 0, 24)) {
                if (isPointerDown) {
                    audioClick.currentTime = 0;
                    audioClick.play();
                    reset();
                    selectedId = i;
                }
            }
        }
    }
}

function renderBuildMenu() {
    if (selectedId == 0) {
        return;
    }

    let point = new DOMPoint(0, 0);
    point = plant[selectedId].matrix.transformPoint(point);


    if (button(point.x, point.y, "#222", 1, 1, 24)) {
        if (isPointerDown) {
            audioClick.currentTime = 0;
            audioClick.play();
            reset();
            selectedId = 0;
        }
    }

    if (button(point.x - 30, point.y - 18, "#555", 1, 2)) {
        if (isPointerDown) {
            if (power >= COST_GROW) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                reset();
                power -= COST_GROW;
                plant.push(new Segment(plant[selectedId]));
                selectedId = 0;
            }
        } else {
            renderCost(COST_GROW);
        }
    }

    if (button(point.x - 30, point.y + 18, "#555", 1, 3)) {
        if (isPointerDown) {
            if (power >= COST_SPLIT) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                reset();
                power -= COST_SPLIT;
                plant.push(new Segment(plant[selectedId]));
                plant.push(new Segment(plant[selectedId]));
                selectedId = 0;
            }
        } else {
            renderCost(COST_SPLIT);
        }
    }

    if (button(point.x + 30, point.y - 18, "#555", 1, 4)) {
        if (isPointerDown) {
            if (power >= COST_LEAF) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                reset();
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

    if (button(point.x + 30, point.y + 18, "#555", 1, 5)) {
        if (isPointerDown) {
            if (power >= COST_FRUIT) {
                audioBuild.currentTime = 0;
                audioBuild.play();
                reset();
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

function renderStats() {
    label("TIME LEFT: " + Math.floor(timeLeft), 120, 10, 16);
    label("HARVEST: " + harvest, canvas.width - 120, 10, 16);
}

function renderMenu() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    label("HARVEST", x, y - 100, 40);
    label("SCORE: " + lastScore, x, y, 16);
    label("HIGHSCORE: " + highScore, x, y + 20, 16);
    if (button(x, y + 100, "#666", 1, 3, 32)) {
        if (isPointerDown) {
            audioMusic.currentTime = 0;
            audioMusic.play();
            setup();
            isPlaying = true;
        }
    }
}

function getNextId() {
    lastId += 1;
    return lastId - 1;
}

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

    draw() {
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -30);
        ctx.stroke();
        ctx.translate(0, -10);

        if (this.isLeaf) {
            ctx.save();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.rotate(2);
            ctx.roundRect(-5, 0, 10, 20, [5, 5, 10, 0]);
            ctx.fill();
            ctx.beginPath();
            ctx.rotate(-4);
            ctx.roundRect(-5, 0, 10, 20, [5, 5, 0, 10]);
            ctx.fill();
            ctx.restore();
        } else if (this.isFruit) {
            ctx.save();
            ctx.fillStyle = "#ff2222";
            ctx.beginPath();
            ctx.roundRect(-this.fruitSize / 2, -this.fruitSize / 2, this.fruitSize, this.fruitSize, this.fruitSize);
            ctx.fill();
            this.matrixFruit = ctx.getTransform();
            ctx.restore();
        }

        ctx.translate(0, -20);
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
            this.children[i].draw();
            ctx.restore();
        }

        // //debug
        // ctx.fillStyle = "#111111";
        // ctx.fillRect(0,0,20,20);
        // ctx.fillStyle = "#ff0000";
        // ctx.font = "16px Courier New";
        // ctx.fillText(this.distanceToRoot,8,16);
    }

}

function button(_x, _y, color, alpha = 1, icon = 0, size = 32) {
    const w = size;
    const h = size;
    const x = _x - w / 2;
    const y = _y - h / 2;

    const isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 15);
    ctx.fill();

    if (isHovered) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 15);
        ctx.fill();

    }
    ctx.globalAlpha = 1;
    if (icon != 0) {
        ctx.drawImage(icons[icon], x, y, size, size);
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

function raindrop(x, fac, length) {
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, fac * (canvas.height * (x % 3 + 1)));
    ctx.lineTo(x, fac * (canvas.height * (x % 3 + 1)) + length);
    ctx.stroke();
}
