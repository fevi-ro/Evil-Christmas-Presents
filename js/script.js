const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let score = 0;
ctx.font = '50px Impact'


let timeToNextPresent = 0;
let presentInterval = 500;
let lastTime = 0;


let presents = [];
class Present {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier
        this.height = this.spriteHeight * this.sizeModifier
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'images/gift.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';


    }

    update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;

        this.timeSinceFlap += deltaTime;


        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
        }
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }

}

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = '/images/boom.png'
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = '/sounds/boom.wav';
        this.timeSinceLastFrame = 0;
        this.timeInterval = 200;
        this.markedForDeletion = false;

    }

    update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime
        if (this.timeSinceLastFrame > this.timeInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true;
        }
    }

        draw(){
            ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size);
        }
    
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('Score: ' + score, 50, 70)
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 55, 80)

}

window.addEventListener('click', function (e) {
    console.log(e.x, e.y)
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1) //detect collision by color
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    presents.forEach(element => {
        if (element.randomColors[0] === pc[0] && element.randomColors[1] === pc[1] && element.randomColors[2] === pc[2]) {
            element.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(element.x, element.y, element.size))
            console.log(explosions);
        }
    })
})

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextPresent += deltaTime;
    if (timeToNextPresent > presentInterval) {
        presents.push(new Present());
        timeToNextPresent = 0;
        presents.sort(function (a, b) {
            return a.width - b.width
        })
        //console.log(presents);

    }
    drawScore();
    [...presents, ...explosions].forEach(element => element.update());
    [...presents, ...explosions].forEach(element => element.draw());
    presents = presents.filter(element => !element.markedForDeletion);
    explosions = explosions.filter(element => !element.markedForDeletion);
    requestAnimationFrame(animate)
}

animate(0);




