const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");

const restartBtn = document.getElementById("restartBtn");
const restartBtn1 = document.getElementById("restartBtn1");

const scoreElement = document.getElementById("score");
const coinsElement = document.getElementById("coins");
const livesElement = document.getElementById("lives");

const finalScoreElement = document.getElementById("finalScore");
const highScoreElement = document.getElementById("highScore");

const levelMessage = document.getElementById("levelMessage");


// --------------------------------------------------
// CANVAS
// --------------------------------------------------

const WIDTH = 1000;
const HEIGHT = 562;

canvas.width = WIDTH;
canvas.height = HEIGHT;


// --------------------------------------------------
// GAME STATE
// --------------------------------------------------

let gameRunning = false;
let paused = false;

let score = 0;
let coins = 0;
let lives = 3;

let level = 1;

let lastTime = 0;

let enemyTimer = 0;
let coinTimer = 0;

let particles = [];

let keys = {};


// --------------------------------------------------
// HIGH SCORE
// --------------------------------------------------

let highScore = Number(
    localStorage.getItem("pixelfallHighScore") || 0
);

highScoreElement.textContent = highScore;


// --------------------------------------------------
// PLAYER
// --------------------------------------------------

const player = {

    x: 120,
    y: HEIGHT / 2,

    width: 38,
    height: 42,

    speed: 260,

    vx: 0,
    vy: 0,

    dashSpeed: 700,

    dashTime: 0,
    dashCooldown: 0,

    invincible: 0,

    glow: 0

};


// --------------------------------------------------
// ARRAYS
// --------------------------------------------------

let enemies = [];
let coinsArray = [];
let powerUps = [];


// --------------------------------------------------
// INPUT
// --------------------------------------------------

window.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

    if (event.code === "Space") {

        event.preventDefault();

        dash();
    }

    if (event.key.toLowerCase() === "p") {

        togglePause();
    }

});


window.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;

});


// --------------------------------------------------
// BUTTONS
// --------------------------------------------------

startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", togglePause);

resumeBtn.addEventListener("click", togglePause);

restartBtn.addEventListener("click", startGame);

restartBtn1.addEventListener("click", startGame);


// --------------------------------------------------
// START GAME
// --------------------------------------------------

function startGame() {

    score = 0;
    coins = 0;
    lives = 3;

    level = 1;

    enemies = [];
    coinsArray = [];
    powerUps = [];
    particles = [];

    player.x = 120;
    player.y = HEIGHT / 2;

    player.invincible = 0;
    player.dashTime = 0;
    player.dashCooldown = 0;

    gameRunning = true;
    paused = false;

    startScreen.classList.add("hidden");
    pauseScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    updateHUD();

    showLevel();

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

}


// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------

function gameLoop(time) {

    if (!gameRunning) return;

    const delta = Math.min(
        (time - lastTime) / 1000,
        0.05
    );

    lastTime = time;

    if (!paused) {

        update(delta);

        draw();

    }

    requestAnimationFrame(gameLoop);

}


// --------------------------------------------------
// UPDATE
// --------------------------------------------------

function update(dt) {

    updatePlayer(dt);

    spawnEnemies(dt);

    spawnCoins(dt);

    updateEnemies(dt);

    updateCoins(dt);

    updatePowerUps(dt);

    updateParticles(dt);

    checkCollisions();

    updateLevel();

    if (player.invincible > 0) {

        player.invincible -= dt;

    }

    if (player.dashCooldown > 0) {

        player.dashCooldown -= dt;

    }

}


// --------------------------------------------------
// PLAYER
// --------------------------------------------------

function updatePlayer(dt) {

    let dx = 0;
    let dy = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy -= 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy += 1;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx += 1;
    }


    // Normalize diagonal movement

    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(
            dx * dx + dy * dy
        );

        dx /= length;
        dy /= length;

    }


    let speed = player.speed;

    if (player.dashTime > 0) {

        speed = player.dashSpeed;

        player.dashTime -= dt;

    }


    player.x += dx * speed * dt;
    player.y += dy * speed * dt;


    // Boundaries

    player.x = Math.max(
        20,
        Math.min(
            WIDTH - player.width - 20,
            player.x
        )
    );

    player.y = Math.max(
        70,
        Math.min(
            HEIGHT - player.height - 20,
            player.y
        )
    );


    player.glow += dt * 5;

}


// --------------------------------------------------
// DASH
// --------------------------------------------------

function dash() {

    if (!gameRunning || paused) return;

    if (player.dashCooldown > 0) return;

    player.dashTime = 0.15;

    player.dashCooldown = 1.5;

    createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        18,
        "#8b5cf6"
    );

}


// --------------------------------------------------
// ENEMIES
// --------------------------------------------------

function spawnEnemies(dt) {

    enemyTimer -= dt;

    if (enemyTimer > 0) return;


    enemyTimer =
        Math.max(
            0.35,
            1.25 - level * 0.07
        );


    const size =
        28 + Math.random() * 20;

    const y =
        80 +
        Math.random() *
        (HEIGHT - 130);


    const speed =
        90 +
        Math.random() * 70 +
        level * 8;


    enemies.push({

        x: WIDTH + size,

        y: y,

        width: size,

        height: size,

        speed: speed,

        type:
            Math.random() < 0.2
                ? "fast"
                : "normal",

        phase: Math.random() * Math.PI * 2

    });

}


function updateEnemies(dt) {

    enemies.forEach(enemy => {

        enemy.x -= enemy.speed * dt;

        enemy.phase += dt * 4;

        if (enemy.type === "fast") {

            enemy.y +=
                Math.sin(enemy.phase) *
                40 *
                dt;

        }

    });


    enemies = enemies.filter(enemy => {

        if (enemy.x < -100) {

            score += 5;

            return false;

        }

        return true;

    });

}


// --------------------------------------------------
// COINS
// --------------------------------------------------

function spawnCoins(dt) {

    coinTimer -= dt;

    if (coinTimer > 0) return;

    coinTimer = 1.4;


    coinsArray.push({

        x: WIDTH + 30,

        y:
            80 +
            Math.random() *
            (HEIGHT - 140),

        radius: 10,

        rotation: 0

    });

}


function updateCoins(dt) {

    coinsArray.forEach(coin => {

        coin.x -= 170 * dt;

        coin.rotation += dt * 5;

    });


    coinsArray =
        coinsArray.filter(
            coin => coin.x > -30
        );

}


// --------------------------------------------------
// POWER UPS
// --------------------------------------------------

function updatePowerUps(dt) {

    powerUps.forEach(power => {

        power.x -= 160 * dt;

        power.rotation += dt * 4;

    });


    powerUps =
        powerUps.filter(
            power => power.x > -50
        );

}


// --------------------------------------------------
// LEVEL
// --------------------------------------------------

function updateLevel() {

    const newLevel =
        Math.floor(score / 250) + 1;


    if (newLevel > level) {

        level = newLevel;

        showLevel();

        createParticles(
            WIDTH / 2,
            HEIGHT / 2,
            50,
            "#22d3ee"
        );

    }

}


function showLevel() {

    levelMessage.textContent =
        `LEVEL ${level}`;

    levelMessage.classList.remove(
        "hidden"
    );


    setTimeout(() => {

        levelMessage.classList.add(
            "hidden"
        );

    }, 1300);

}


// --------------------------------------------------
// COLLISION
// --------------------------------------------------

function checkCollisions() {

    // Enemy collision

    enemies.forEach((enemy, index) => {

        if (
            player.invincible <= 0 &&
            isColliding(player, enemy)
        ) {

            enemies.splice(index, 1);

            lives--;

            player.invincible = 1.2;

            createParticles(
                player.x + player.width / 2,
                player.y + player.height / 2,
                25,
                "#ef4444"
            );

            updateHUD();


            if (lives <= 0) {

                endGame();

            }

        }

    });


    // Coin collision

    coinsArray.forEach((coin, index) => {

        const distance =
            Math.hypot(
                player.x +
                    player.width / 2 -
                    coin.x,

                player.y +
                    player.height / 2 -
                    coin.y
            );


        if (distance < 28) {

            coinsArray.splice(index, 1);

            coins++;

            score += 25;

            createParticles(
                coin.x,
                coin.y,
                15,
                "#facc15"
            );

            updateHUD();

        }

    });

}


// --------------------------------------------------
// COLLISION FUNCTION
// --------------------------------------------------

function isColliding(a, b) {

    return (

        a.x < b.x + b.width &&

        a.x + a.width > b.x &&

        a.y < b.y + b.height &&

        a.y + a.height > b.y

    );

}


// --------------------------------------------------
// PARTICLES
// --------------------------------------------------

function createParticles(
    x,
    y,
    amount,
    color
) {

    for (let i = 0; i < amount; i++) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            40 +
            Math.random() * 150;


        particles.push({

            x,
            y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life: 0.5 +
                Math.random() * 0.5,

            size:
                2 +
                Math.random() * 4,

            color

        });

    }

}


function updateParticles(dt) {

    particles.forEach(particle => {

        particle.x +=
            particle.vx * dt;

        particle.y +=
            particle.vy * dt;

        particle.vx *= 0.96;
        particle.vy *= 0.96;

        particle.life -= dt;

    });


    particles =
        particles.filter(
            p => p.life > 0
        );

}


// --------------------------------------------------
// DRAW
// --------------------------------------------------

function draw() {

    drawBackground();

    drawGrid();

    drawCoins();

    drawPowerUps();

    drawEnemies();

    drawPlayer();

    drawParticles();

    drawDashIndicator();

}


// --------------------------------------------------
// BACKGROUND
// --------------------------------------------------

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            WIDTH,
            HEIGHT
        );

    gradient.addColorStop(
        0,
        "#050510"
    );

    gradient.addColorStop(
        0.5,
        "#0d0920"
    );

    gradient.addColorStop(
        1,
        "#050510"
    );


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    // stars

    for (let i = 0; i < 70; i++) {

        const x =
            (i * 137) %
            WIDTH;

        const y =
            (i * 71) %
            HEIGHT;

        const size =
            1 + (i % 2);


        ctx.fillStyle =
            "rgba(255,255,255,0.25)";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );

    }

}


// --------------------------------------------------
// GRID
// --------------------------------------------------

function drawGrid() {

    ctx.strokeStyle =
        "rgba(139,92,246,0.08)";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < WIDTH;
        x += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, HEIGHT);

        ctx.stroke();

    }


    for (
        let y = 0;
        y < HEIGHT;
        y += 50
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(WIDTH, y);

        ctx.stroke();

    }

}


// --------------------------------------------------
// PLAYER DRAW
// --------------------------------------------------

function drawPlayer() {

    const x = player.x;
    const y = player.y;


    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible * 10
        ) % 2 === 0
    ) {

        return;

    }


    ctx.save();


    // Glow

    ctx.shadowColor =
        "#a78bfa";

    ctx.shadowBlur =
        25 +
        Math.sin(player.glow) * 5;


    // Ghost body

    ctx.fillStyle = "#f8fafc";

    ctx.beginPath();

    ctx.arc(
        x + player.width / 2,
        y + 17,
        17,
        Math.PI,
        0
    );

    ctx.lineTo(
        x + player.width,
        y + player.height
    );


    ctx.lineTo(
        x + player.width * 0.75,
        y + player.height - 7
    );


    ctx.lineTo(
        x + player.width * 0.5,
        y + player.height
    );


    ctx.lineTo(
        x + player.width * 0.25,
        y + player.height - 7
    );


    ctx.lineTo(
        x,
        y + player.height
    );


    ctx.closePath();

    ctx.fill();


    // Eyes

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#11111b";

    ctx.beginPath();

    ctx.arc(
        x + 13,
        y + 17,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        x + 25,
        y + 17,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();

}


// --------------------------------------------------
// ENEMY DRAW
// --------------------------------------------------

function drawEnemies() {

    enemies.forEach(enemy => {

        ctx.save();

        ctx.shadowColor =
            enemy.type === "fast"
                ? "#22d3ee"
                : "#ef4444";

        ctx.shadowBlur = 18;


        ctx.fillStyle =
            enemy.type === "fast"
                ? "#22d3ee"
                : "#ef4444";


        ctx.beginPath();

        ctx.arc(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            enemy.width / 2,
            0,
            Math.PI * 2
        );

        ctx.fill();


        // Eyes

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#080810";

        ctx.fillRect(
            enemy.x + enemy.width * 0.28,
            enemy.y + enemy.height * 0.35,
            5,
            5
        );

        ctx.fillRect(
            enemy.x + enemy.width * 0.62,
            enemy.y + enemy.height * 0.35,
            5,
            5
        );


        ctx.restore();

    });

}


// --------------------------------------------------
// COIN DRAW
// --------------------------------------------------

function drawCoins() {

    coinsArray.forEach(coin => {

        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.rotate(
            coin.rotation
        );


        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 15;

        ctx.fillStyle = "#facc15";


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;

        ctx.fillStyle = "#fff7ae";

        ctx.font =
            "bold 12px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "$",
            0,
            1
        );


        ctx.restore();

    });

}


// --------------------------------------------------
// POWER UP DRAW
// --------------------------------------------------

function drawPowerUps() {

    powerUps.forEach(power => {

        ctx.save();

        ctx.translate(
            power.x,
            power.y
        );

        ctx.rotate(
            power.rotation
        );


        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 20;

        ctx.fillStyle = "#22d3ee";

        ctx.fillRect(
            -12,
            -12,
            24,
            24
        );


        ctx.fillStyle = "#ffffff";

        ctx.font =
            "bold 15px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "⚡",
            0,
            1
        );


        ctx.restore();

    });

}


// --------------------------------------------------
// PARTICLES DRAW
// --------------------------------------------------

function drawParticles() {

    particles.forEach(particle => {

        ctx.globalAlpha =
            Math.max(
                0,
                particle.life
            );


        ctx.fillStyle =
            particle.color;


        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });


    ctx.globalAlpha = 1;

}


// --------------------------------------------------
// DASH INDICATOR
// --------------------------------------------------

function drawDashIndicator() {

    const width = 150;
    const height = 7;

    const x = 20;
    const y = 25;


    ctx.fillStyle =
        "rgba(255,255,255,0.15)";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    let percentage = 1;


    if (player.dashCooldown > 0) {

        percentage =
            1 -
            player.dashCooldown / 1.5;

    }


    ctx.fillStyle = "#8b5cf6";

    ctx.fillRect(
        x,
        y,
        width * percentage,
        height
    );


    ctx.font =
        "11px Arial";

    ctx.fillStyle = "#aaaabd";

    ctx.fillText(
        "DASH",
        x,
        y - 7
    );

}


// --------------------------------------------------
// HUD
// --------------------------------------------------

function updateHUD() {

    scoreElement.textContent =
        score;

    coinsElement.textContent =
        coins;

    livesElement.textContent =
        lives;

}


// --------------------------------------------------
// PAUSE
// --------------------------------------------------

function togglePause() {

    if (!gameRunning) return;

    paused = !paused;

    if (paused) {

        pauseScreen.classList.remove(
            "hidden"
        );

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        lastTime =
            performance.now();

    }

}


// --------------------------------------------------
// GAME OVER
// --------------------------------------------------

function endGame() {

    gameRunning = false;

    paused = false;


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "pixelfallHighScore",
            highScore
        );

    }


    finalScoreElement.textContent =
        score;

    highScoreElement.textContent =
        highScore;


    gameOverScreen.classList.remove(
        "hidden"
    );

}


// --------------------------------------------------
// INITIAL DRAW
// --------------------------------------------------

drawBackground();
drawGrid();