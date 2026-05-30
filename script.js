const canvas = document.getElementById("Canvas");
const ctx = canvas.getContext("2d");
const keys = {}

const audioCtx = new (window.AudioContext)();


function beep(duration, frequency, type = 'sine') {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + (duration / 1000));
    oscillator.stop(audioCtx.currentTime + (duration / 1000));
}

const LEVEL_BOUNDS_LEFT = 0;
const LEVEL_BOUNDS_RIGHT = canvas.width - 128;
const LEVEL_BOUNDS_TOP = 0;
const LEVEL_BOUNDS_BOTTOM = canvas.height;
const TILE_SIZE = 32;
const TOTAL_TILES_X = Math.round(LEVEL_BOUNDS_RIGHT / TILE_SIZE);
const TOTAL_TILES_Y = Math.round(LEVEL_BOUNDS_BOTTOM / TILE_SIZE);



ctx.font = '16px monospace'

var score = 0;
var rowLength;

var tiles = [];
tiles.length = TOTAL_TILES_X * TOTAL_TILES_Y;
tiles.fill(0);

function GetTile(x, y) {
    let index = Math.floor(y / TILE_SIZE) * TOTAL_TILES_X + Math.floor(x / TILE_SIZE);
    if (index < 0 || index > TOTAL_TILES_X * TOTAL_TILES_Y) return 0
    else return tiles[index];
} 

function SetTile(x, y, id) {
    let index = Math.floor(y / TILE_SIZE) * TOTAL_TILES_X + Math.floor(x / TILE_SIZE);
    if (index < 0 || index > TOTAL_TILES_X * TOTAL_TILES_Y) return;
    tiles[index] = id;
}

img = new Image();
img.src = "assets/tenshi.png";


class Player {
    position = { x : 0, y : 0 };
    velocity = { x : 0, y : 0 };
    width = 32; height = 8;
    Update () {
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (keys['KeyD'] || keys['ArrowRight']) this.velocity.x += 3;
        if (keys['KeyA'] || keys['ArrowLeft']) this.velocity.x -= 3;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.x < LEVEL_BOUNDS_LEFT)
            this.position.x = LEVEL_BOUNDS_LEFT;
        if (this.position.x + this.width > LEVEL_BOUNDS_RIGHT)
            this.position.x = LEVEL_BOUNDS_RIGHT - this.width;
        if (this.position.y < LEVEL_BOUNDS_TOP)
            this.position.y = LEVEL_BOUNDS_TOP;
        if (this.position.y + this.height > LEVEL_BOUNDS_BOTTOM)
            this.position.y = LEVEL_BOUNDS_BOTTOM - this.height;
        
    }

    Draw() {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Ball {
    position = { x: LEVEL_BOUNDS_RIGHT / 2, y : 100 };
    velocity = { x: 0, y : 3.5 };
    radius = 8;
    Update() {

        // Horizontal Collision
        this.position.x += this.velocity.x;
        if (this.velocity.x < 0) {
            if (GetTile(this.position.x - this.radius, this.position.y - this.radius) ||
                GetTile(this.position.x - this.radius, this.position.y + this.radius)
            ) {
                beep(50, 700, 'sine');
                this.position.x = Math.floor((this.position.x + this.radius) / TILE_SIZE) * TILE_SIZE;
                this.velocity.x = Math.abs(this.velocity.x);
                if (GetTile(this.position.x - this.radius, this.position.y - this.radius)) {
                    SetTile(this.position.x - this.radius, this.position.y - this.radius, 0);
                    score += 100;
                }
                if (GetTile(this.position.x - this.radius, this.position.y + this.radius)) {
                    SetTile(this.position.x - this.radius, this.position.y + this.radius, 0);
                    score += 100;
                }
            }

            if (this.position.x < LEVEL_BOUNDS_LEFT + this.radius) {
                this.position.x = LEVEL_BOUNDS_LEFT + this.radius;
                this.velocity.x = Math.abs(this.velocity.x)
            }

        } else if (this.velocity.x > 0) {
            if (GetTile(this.position.x + this.radius, this.position.y - this.radius) ||
                GetTile(this.position.x + this.radius, this.position.y + this.radius)
            ) {
                beep(50, 700, 'sine');
                this.position.x = Math.ceil((this.position.x - this.radius) / TILE_SIZE) * TILE_SIZE;
                this.velocity.x = -Math.abs(this.velocity.x);
                if (GetTile(this.position.x + this.radius, this.position.y - this.radius)) {
                    SetTile(this.position.x + this.radius, this.position.y - this.radius, 0);
                    score += 100;
                }
                if (GetTile(this.position.x + this.radius, this.position.y + this.radius)) {
                    SetTile(this.position.x + this.radius, this.position.y + this.radius, 0);
                    score += 100;
                }
            }

            if (this.position.x > LEVEL_BOUNDS_RIGHT - this.radius) {
                this.position.x = LEVEL_BOUNDS_RIGHT - this.radius;
                this.velocity.x = -Math.abs(this.velocity.x)
            }
        }

        // Vertical Collision
        this.position.y += this.velocity.y;
        if (this.velocity.y < 0) {
            if (GetTile(this.position.x - this.radius, this.position.y - this.radius) ||
                GetTile(this.position.x + this.radius, this.position.y - this.radius)
            ) {
                beep(50, 700, 'sine');
                this.position.y = Math.floor((this.position.y + this.radius) / TILE_SIZE) * TILE_SIZE;
                this.velocity.y = Math.abs(this.velocity.y);
                if (GetTile(this.position.x - this.radius, this.position.y - this.radius)) {
                    SetTile(this.position.x - this.radius, this.position.y - this.radius, 0);
                    score += 100;
                }
                if (GetTile(this.position.x + this.radius, this.position.y - this.radius)) {
                    SetTile(this.position.x + this.radius, this.position.y - this.radius, 0);
                    score += 100;
                }
              
            }
            if (this.position.y < LEVEL_BOUNDS_TOP + this.radius) {
                this.position.y = LEVEL_BOUNDS_TOP + this.radius;
                this.velocity.y = Math.abs(this.velocity.y)
            }
        } else if (this.velocity.y > 0) {
            if (GetTile(this.position.x - this.radius, this.position.y + this.radius) ||
                GetTile(this.position.x + this.radius, this.position.y + this.radius)
            ) {
                beep(50, 700, 'sine');
                this.position.y = Math.ceil((this.position.y - this.radius) / TILE_SIZE) * TILE_SIZE;
                this.velocity.y = -Math.abs(this.velocity.y);
                if (GetTile(this.position.x - this.radius, this.position.y + this.radius)) {
                    SetTile(this.position.x - this.radius, this.position.y + this.radius, 0);
                    score += 100;
                }
                if (GetTile(this.position.x + this.radius, this.position.y + this.radius)) {
                    SetTile(this.position.x + this.radius, this.position.y + this.radius, 0);
                    score += 100;
                }
            }

            if (this.position.y > LEVEL_BOUNDS_BOTTOM - this.radius) {

                switch (gamestate) {
                    case "game":
                         for (let i = 2; i < TOTAL_TILES_X - 2; i++)
                            tiles[i] = 1;
                        for (let i = TOTAL_TILES_X + 2; i < TOTAL_TILES_X * 2 - 2; i++) 
                            tiles[i] = 1;
                        for (let i = TOTAL_TILES_X * 2 + 2; i < TOTAL_TILES_X * 3 - 2; i++) 
                            tiles[i] = 1;
                        score = 0;
                        player.position.x = LEVEL_BOUNDS_RIGHT / 2 - player.width / 2
                        gamestate = "start";
                        break;

                    case "win":
                        this.position.y = LEVEL_BOUNDS_BOTTOM - this.radius;
                        this.velocity.y = -Math.abs(this.velocity.y)
                        break;
                }

               
            }

            if (this.position.y + this.radius >= player.position.y - this.velocity.y &&
                this.position.y + this.radius / 2 <= player.position.y &&
                this.position.x + this.radius >= player.position.x &&
                this.position.x - this.radius <= player.position.x + player.width
            ) {
                this.position.y = player.position.y - this.radius;
                beep(100, 440, 'square');
                if (this.position.x > player.position.x + player.width * 0.9) {
                    this.velocity.x = 2;
                    this.velocity.y = -2;
                } else if (this.position.x > player.position.x + player.width * 0.5) {
                    this.velocity.x = 1;
                    this.velocity.y = -3;
                } else if ( this.position.x > player.position.x + player.width * 0.1) {
                    this.velocity.x = -1;
                    this.velocity.y = -3;
                } else {
                    this.velocity.x = -2;
                    this.velocity.y = -2;
                }  
            }
        } 
    }

    Draw() {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}







var player = new Player;
var ball = new Ball;
player.position.y = 310;
player.position.x = LEVEL_BOUNDS_RIGHT / 2 - player.width / 2;


var frame = 0;

setInterval(
    function () {
        frame++;
        if (frame > 3) frame = 0;
    }, 
    400
);

var gamestate = "start";

function Init() {
    for (let i = 2; i < TOTAL_TILES_X - 2; i++)
        tiles[i] = 1;
    for (let i = TOTAL_TILES_X + 2; i < TOTAL_TILES_X * 2 - 2; i++) 
        tiles[i] = 1;
    for (let i = TOTAL_TILES_X * 2 + 2; i < TOTAL_TILES_X * 3 - 2; i++) 
        tiles[i] = 1;

    

    Update();
}



function Update() {

    switch (gamestate) {
    case "start" :
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        player.Draw();

        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] == 0) continue;
            let x = Math.floor(i % TOTAL_TILES_X) * TILE_SIZE;
            let y = Math.floor(i / TOTAL_TILES_X) * TILE_SIZE;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        }
        ctx.textAlign = "center";
        ctx.fillText("Start", LEVEL_BOUNDS_RIGHT / 2, LEVEL_BOUNDS_BOTTOM / 2);
        break;

    case "game" :
        player.Update();
        ball.Update();

        // Clear
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.Draw();    
        ball.Draw();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.fillText("SCORE: " + score, LEVEL_BOUNDS_RIGHT + 4, 16);

        // Draw tiles
        let numTiles = 0

        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] == 0) continue;
            numTiles++;
            let x = Math.floor(i % TOTAL_TILES_X) * TILE_SIZE;
            let y = Math.floor(i / TOTAL_TILES_X) * TILE_SIZE;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        }

        if (numTiles == 0) gamestate = "win";

        ctx.drawImage(img, frame * 181, 0, 181, 220, LEVEL_BOUNDS_RIGHT + 16, 230, 90.5, 110 );
        break;

    case "win":
        player.Update();
        ball.Update();

        // Clear
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.Draw();    
        ball.Draw();
        ctx.fillStyle = "#ffffff";

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.fillText("SCORE: " + score, LEVEL_BOUNDS_RIGHT + 4, 16);

        ctx.drawImage(img, frame * 181, 0, 181, 220, LEVEL_BOUNDS_RIGHT + 16, 230, 90.5, 110 );
        
        ctx.textAlign = "center";
        ctx.fillText("WIN!!", LEVEL_BOUNDS_RIGHT / 2, LEVEL_BOUNDS_BOTTOM / 2);
        break;
    }


    ctx.lineWidth = 4;
    ctx.strokeStyle = 'white'
    ctx.beginPath();
    ctx.moveTo(LEVEL_BOUNDS_RIGHT, 0);
    ctx.lineTo(LEVEL_BOUNDS_RIGHT, canvas.height);    
    ctx.stroke();

    requestAnimationFrame(Update);
}

document.addEventListener('keydown', (event) => {keys[event.code] = true;});
document.addEventListener('keyup', (event) => {keys[event.code] = false;});
document.addEventListener(
    'mousedown',
    function(event) {
        if (event.button == 0) {
           
            if (gamestate == "start") {
                gamestate = "game";
                ball.position.x = LEVEL_BOUNDS_RIGHT / 2;
                ball.position.y = 100;
                ball.velocity.x = 0;
                ball.velocity.y = 3.5;
            }
        }
    }
)

document.onload(Init())
