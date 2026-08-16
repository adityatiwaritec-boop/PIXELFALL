/* =========================================
   PIXELFALL
   GAME + SOUND ENGINE
========================================= */


/* =========================================
   CANVAS
========================================= */

const canvas =
    document.getElementById(
        "gameCanvas"
    );

const ctx =
    canvas.getContext("2d");


const GAME_WIDTH = 1000;

const GAME_HEIGHT = 562;


canvas.width =
    GAME_WIDTH;

canvas.height =
    GAME_HEIGHT;


/* =========================================
   ELEMENTS
========================================= */

const startScreen =
    document.getElementById(
        "startScreen"
    );

const pauseScreen =
    document.getElementById(
        "pauseScreen"
    );

const gameOverScreen =
    document.getElementById(
        "gameOverScreen"
    );

const startBtn =
    document.getElementById(
        "startBtn"
    );

const pauseBtn =
    document.getElementById(
        "pauseBtn"
    );

const resumeBtn =
    document.getElementById(
        "resumeBtn"
    );

const restartPauseBtn =
    document.getElementById(
        "restartPauseBtn"
    );

const restartBtn =
    document.getElementById(
        "restartBtn"
    );

const closeGameBtn =
    document.getElementById(
        "closeGameBtn"
    );

const soundBtn =
    document.getElementById(
        "soundBtn"
    );

const dashBtn =
    document.getElementById(
        "dashBtn"
    );

const scoreElement =
    document.getElementById(
        "score"
    );

const coinsElement =
    document.getElementById(
        "coins"
    );

const livesElement =
    document.getElementById(
        "lives"
    );

const finalScoreElement =
    document.getElementById(
        "finalScore"
    );

const highScoreElement =
    document.getElementById(
        "highScore"
    );

const mobileControls =
    document.getElementById(
        "mobileControls"
    );

const joystick =
    document.getElementById(
        "joystick"
    );

const joystickKnob =
    document.getElementById(
        "joystickKnob"
    );


/* =========================================
   GAME STATE
========================================= */

let gameRunning = false;

let paused = false;

let score = 0;

let coins = 0;

let lives = 3;

let level = 1;

let lastTime = 0;

let enemyTimer = 0;

let coinTimer = 0;

let enemies = [];

let coinsArray = [];

let particles = [];

let keys = {};


/* =========================================
   JOYSTICK
========================================= */

let joystickActive = false;

let joystickX = 0;

let joystickY = 0;

let joystickPointerId = null;


/* =========================================
   SOUND ENGINE
========================================= */

let audioContext = null;

let masterGain = null;

let ambientOscillator = null;

let ambientGain = null;

let soundEnabled =
    localStorage.getItem(
        "pixelfallSound"
    ) !== "off";


/* =========================================
   CREATE AUDIO
========================================= */

function initAudio() {

    if (audioContext) {

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }

        return;

    }


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        console.log(
            "Web Audio API is not supported."
        );

        return;

    }


    audioContext =
        new AudioContext();


    masterGain =
        audioContext.createGain();


    masterGain.gain.value =
        soundEnabled
            ? 0.65
            : 0;


    masterGain.connect(
        audioContext.destination
    );

}


/* =========================================
   PLAY TONE
========================================= */

function playTone(
    frequency,
    duration,
    type = "sine",
    volume = 0.15,
    slideTo = null
) {

    if (!soundEnabled) {
        return;
    }


    initAudio();


    if (!audioContext) {
        return;
    }


    const oscillator =
        audioContext.createOscillator();


    const gain =
        audioContext.createGain();


    oscillator.type =
        type;


    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );


    if (
        slideTo !== null
    ) {

        oscillator.frequency.linearRampToValueAtTime(
            slideTo,
            audioContext.currentTime +
                duration
        );

    }


    gain.gain.setValueAtTime(
        0,
        audioContext.currentTime
    );


    gain.gain.linearRampToValueAtTime(
        volume,
        audioContext.currentTime +
            0.01
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
            duration
    );


    oscillator.connect(gain);

    gain.connect(masterGain);


    oscillator.start();


    oscillator.stop(
        audioContext.currentTime +
            duration +
            0.02
    );

}


/* =========================================
   COIN SOUND
========================================= */

function playCoinSound() {

    if (!soundEnabled) {
        return;
    }


    playTone(
        700,
        0.08,
        "sine",
        0.12,
        1000
    );


    setTimeout(
        function () {

            playTone(
                1000,
                0.1,
                "sine",
                0.1,
                1300
            );

        },
        55
    );

}


/* =========================================
   DASH SOUND
========================================= */

function playDashSound() {

    playTone(
        180,
        0.18,
        "sawtooth",
        0.12,
        800
    );

}


/* =========================================
   HIT SOUND
========================================= */

function playHitSound() {

    playTone(
        110,
        0.22,
        "square",
        0.16,
        45
    );


    setTimeout(
        function () {

            playTone(
                70,
                0.18,
                "sawtooth",
                0.1,
                35
            );

        },
        60
    );

}


/* =========================================
   LIFE LOST SOUND
========================================= */

function playLifeLostSound() {

    playTone(
        300,
        0.18,
        "square",
        0.12,
        100
    );


    setTimeout(
        function () {

            playTone(
                150,
                0.25,
                "square",
                0.12,
                60
            );

        },
        90
    );

}


/* =========================================
   GAME START SOUND
========================================= */

function playStartSound() {

    playTone(
        300,
        0.12,
        "sine",
        0.1,
        500
    );


    setTimeout(
        function () {

            playTone(
                500,
                0.12,
                "sine",
                0.1,
                800
            );

        },
        100
    );


    setTimeout(
        function () {

            playTone(
                800,
                0.2,
                "sine",
                0.12,
                1100
            );

        },
        200
    );

}


/* =========================================
   LEVEL UP SOUND
========================================= */

function playLevelUpSound() {

    playTone(
        500,
        0.12,
        "square",
        0.1,
        700
    );


    setTimeout(
        function () {

            playTone(
                700,
                0.12,
                "square",
                0.1,
                950
            );

        },
        100
    );


    setTimeout(
        function () {

            playTone(
                950,
                0.25,
                "square",
                0.12,
                1200
            );

        },
        200
    );

}


/* =========================================
   PAUSE SOUND
========================================= */

function playPauseSound() {

    playTone(
        400,
        0.08,
        "triangle",
        0.08,
        250
    );

}


/* =========================================
   GAME OVER SOUND
========================================= */

function playGameOverSound() {

    playTone(
        400,
        0.25,
        "sawtooth",
        0.13,
        220
    );


    setTimeout(
        function () {

            playTone(
                220,
                0.3,
                "sawtooth",
                0.12,
                90
            );

        },
        180
    );


    setTimeout(
        function () {

            playTone(
                100,
                0.45,
                "sawtooth",
                0.1,
                45
            );

        },
        400
    );

}


/* =========================================
   AMBIENT SOUND
========================================= */

function startAmbientSound() {

    if (
        !soundEnabled ||
        !audioContext ||
        ambientOscillator
    ) {

        return;

    }


    ambientOscillator =
        audioContext.createOscillator();


    ambientGain =
        audioContext.createGain();


    ambientOscillator.type =
        "sine";


    ambientOscillator.frequency.value =
        55;


    ambientGain.gain.value =
        0.018;


    ambientOscillator.connect(
        ambientGain
    );


    ambientGain.connect(
        masterGain
    );


    ambientOscillator.start();

}


function stopAmbientSound() {

    if (
        ambientOscillator
    ) {

        try {

            ambientOscillator.stop();

        } catch (error) {

            console.log(error);

        }

    }


    ambientOscillator = null;

    ambientGain = null;

}


/* =========================================
   SOUND TOGGLE
========================================= */

function toggleSound() {

    soundEnabled =
        !soundEnabled;


    localStorage.setItem(
        "pixelfallSound",
        soundEnabled
            ? "on"
            : "off"
    );


    updateSoundButton();


    if (soundEnabled) {

        initAudio();


        if (
            masterGain
        ) {

            masterGain.gain.setTargetAtTime(
                0.65,
                audioContext.currentTime,
                0.03
            );

        }


        playTone(
            600,
            0.12,
            "sine",
            0.1,
            900
        );


        startAmbientSound();

    } else {

        if (
            masterGain &&
            audioContext
        ) {

            masterGain.gain.setTargetAtTime(
                0,
                audioContext.currentTime,
                0.03
            );

        }


        stopAmbientSound();

    }

}


function updateSoundButton() {

    soundBtn.textContent =
        soundEnabled
            ? "🔊"
            : "🔇";

}


/* =========================================
   HIGH SCORE
========================================= */

let highScore =
    Number(
        localStorage.getItem(
            "pixelfallHighScore"
        ) || 0
    );


highScoreElement.textContent =
    highScore;


/* =========================================
   PLAYER
========================================= */

const player = {

    x: 120,

    y:
        GAME_HEIGHT / 2,

    width: 38,

    height: 42,

    speed: 260,

    dashSpeed: 700,

    dashTime: 0,

    dashCooldown: 0,

    invincible: 0,

    glow: 0

};


/* =========================================
   KEYBOARD
========================================= */

window.addEventListener(
    "keydown",
    function (event) {

        keys[
            event.key.toLowerCase()
        ] = true;


        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            dash();

        }


        if (
            event.key.toLowerCase() ===
            "p"
        ) {

            togglePause();

        }

    }
);


window.addEventListener(
    "keyup",
    function (event) {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =========================================
   BUTTON EVENTS
========================================= */

startBtn.addEventListener(
    "click",
    startGame
);


pauseBtn.addEventListener(
    "click",
    togglePause
);


resumeBtn.addEventListener(
    "click",
    togglePause
);


restartPauseBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);


closeGameBtn.addEventListener(
    "click",
    closeGame
);


soundBtn.addEventListener(
    "click",
    toggleSound
);


dashBtn.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        dash();

    }
);


/* =========================================
   START GAME
========================================= */

async function startGame() {

    /*
       Audio must be initialized
       from a user interaction.
    */

    initAudio();


    if (
        audioContext &&
        audioContext.state ===
        "suspended"
    ) {

        await audioContext.resume();

    }


    playStartSound();


    startAmbientSound();


    /*
       FULLSCREEN
    */

    try {

        if (
            document
                .documentElement
                .requestFullscreen &&
            !document.fullscreenElement
        ) {

            await document
                .documentElement
                .requestFullscreen();

        }

    } catch (error) {

        console.log(
            "Fullscreen not available.",
            error
        );

    }


    /*
       LANDSCAPE
    */

    try {

        if (
            screen.orientation &&
            screen.orientation.lock
        ) {

            await screen.orientation.lock(
                "landscape"
            );

        }

    } catch (error) {

        console.log(
            "Landscape lock not available.",
            error
        );

    }


    /* RESET */

    score = 0;

    coins = 0;

    lives = 3;

    level = 1;

    enemyTimer = 0;

    coinTimer = 0;

    enemies = [];

    coinsArray = [];

    particles = [];


    player.x = 120;

    player.y =
        GAME_HEIGHT / 2;

    player.dashTime = 0;

    player.dashCooldown = 0;

    player.invincible = 0;


    joystickActive = false;

    joystickX = 0;

    joystickY = 0;

    resetJoystick();


    gameRunning = true;

    paused = false;


    startScreen.classList.add(
        "hidden"
    );


    pauseScreen.classList.add(
        "hidden"
    );


    gameOverScreen.classList.add(
        "hidden"
    );


    updateMobileControls();

    updateHUD();


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop(time) {

    if (!gameRunning) {

        return;

    }


    const delta =
        Math.min(
            (time - lastTime) /
                1000,

            0.05
        );


    lastTime = time;


    if (!paused) {

        update(delta);

        draw();

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================
   UPDATE
========================================= */

function update(dt) {

    updatePlayer(dt);

    spawnEnemies(dt);

    spawnCoins(dt);

    updateEnemies(dt);

    updateCoins(dt);

    updateParticles(dt);

    checkCollisions();

    updateLevel();


    if (
        player.invincible > 0
    ) {

        player.invincible -= dt;

    }


    if (
        player.dashCooldown > 0
    ) {

        player.dashCooldown -= dt;

    }

}


/* =========================================
   PLAYER
========================================= */

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


    if (
        joystickActive
    ) {

        dx += joystickX;

        dy += joystickY;

    }


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance > 1
    ) {

        dx /= distance;

        dy /= distance;

    }


    let speed =
        player.speed;


    if (
        player.dashTime > 0
    ) {

        speed =
            player.dashSpeed;

        player.dashTime -= dt;

    }


    player.x +=
        dx *
        speed *
        dt;


    player.y +=
        dy *
        speed *
        dt;


    player.x =
        Math.max(
            20,

            Math.min(
                GAME_WIDTH -
                    player.width -
                    20,

                player.x
            )
        );


    player.y =
        Math.max(
            60,

            Math.min(
                GAME_HEIGHT -
                    player.height -
                    20,

                player.y
            )
        );


    player.glow +=
        dt * 5;

}


/* =========================================
   DASH
========================================= */

function dash() {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }


    if (
        player.dashCooldown > 0
    ) {

        return;

    }


    player.dashTime =
        0.15;


    player.dashCooldown =
        1.5;


    playDashSound();


    createParticles(
        player.x +
            player.width / 2,

        player.y +
            player.height / 2,

        18
    );

}


/* =========================================
   ENEMIES
========================================= */

function spawnEnemies(dt) {

    enemyTimer -= dt;


    if (
        enemyTimer > 0
    ) {

        return;

    }


    enemyTimer =
        Math.max(
            0.35,

            1.2 -
                level * 0.06
        );


    const size =
        28 +
        Math.random() * 20;


    enemies.push({

        x:
            GAME_WIDTH + size,

        y:
            70 +
            Math.random() *
            (
                GAME_HEIGHT -
                130
            ),

        width:
            size,

        height:
            size,

        speed:
            90 +
            Math.random() * 80 +
            level * 8,

        wave:
            Math.random() * 10

    });

}


/* =========================================
   ENEMY UPDATE
========================================= */

function updateEnemies(dt) {

    enemies.forEach(
        function (enemy) {

            enemy.x -=
                enemy.speed *
                dt;


            enemy.wave +=
                dt * 4;


            enemy.y +=
                Math.sin(
                    enemy.wave
                ) *
                20 *
                dt;

        }
    );


    enemies =
        enemies.filter(
            function (enemy) {

                if (
                    enemy.x <
                    -100
                ) {

                    score += 5;

                    return false;

                }


                return true;

            }
        );

}


/* =========================================
   COINS
========================================= */

function spawnCoins(dt) {

    coinTimer -= dt;


    if (
        coinTimer > 0
    ) {

        return;

    }


    coinTimer = 1.4;


    coinsArray.push({

        x:
            GAME_WIDTH + 20,

        y:
            70 +
            Math.random() *
            (
                GAME_HEIGHT -
                140
            ),

        radius: 10,

        rotation: 0

    });

}


function updateCoins(dt) {

    coinsArray.forEach(
        function (coin) {

            coin.x -=
                170 *
                dt;


            coin.rotation +=
                dt * 5;

        }
    );


    coinsArray =
        coinsArray.filter(
            function (coin) {

                return (
                    coin.x > -30
                );

            }
        );

}


/* =========================================
   LEVEL
========================================= */

function updateLevel() {

    const newLevel =
        Math.floor(
            score / 250
        ) + 1;


    if (
        newLevel > level
    ) {

        level =
            newLevel;


        playLevelUpSound();


        createParticles(
            GAME_WIDTH / 2,

            GAME_HEIGHT / 2,

            40
        );

    }

}


/* =========================================
   COLLISIONS
========================================= */

function checkCollisions() {

    for (
        let i =
            enemies.length - 1;

        i >= 0;

        i--
    ) {

        const enemy =
            enemies[i];


        if (
            player.invincible <= 0 &&
            isColliding(
                player,
                enemy
            )
        ) {

            enemies.splice(
                i,
                1
            );


            lives--;


            player.invincible =
                1.2;


            playHitSound();

            playLifeLostSound();


            createParticles(
                player.x +
                    player.width / 2,

                player.y +
                    player.height / 2,

                25
            );


            updateHUD();


            if (
                lives <= 0
            ) {

                endGame();

                return;

            }

        }

    }


    for (
        let i =
            coinsArray.length - 1;

        i >= 0;

        i--
    ) {

        const coin =
            coinsArray[i];


        const distance =
            Math.hypot(

                player.x +
                    player.width / 2 -
                    coin.x,

                player.y +
                    player.height / 2 -
                    coin.y

            );


        if (
            distance < 28
        ) {

            coinsArray.splice(
                i,
                1
            );


            coins++;


            score += 25;


            playCoinSound();


            createParticles(
                coin.x,
                coin.y,
                15
            );


            updateHUD();

        }

    }

}


/* =========================================
   COLLISION HELPER
========================================= */

function isColliding(a, b) {

    return (

        a.x <
            b.x + b.width &&

        a.x + a.width >
            b.x &&

        a.y <
            b.y + b.height &&

        a.y + a.height >
            b.y

    );

}


/* =========================================
   PARTICLES
========================================= */

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;

        i < amount;

        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            40 +
            Math.random() *
            150;


        particles.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                0.5 +
                Math.random() *
                0.5,

            size:
                2 +
                Math.random() * 4

        });

    }

}


function updateParticles(dt) {

    particles.forEach(
        function (particle) {

            particle.x +=
                particle.vx *
                dt;


            particle.y +=
                particle.vy *
                dt;


            particle.vx *=
                0.96;


            particle.vy *=
                0.96;


            particle.life -=
                dt;

        }
    );


    particles =
        particles.filter(
            function (particle) {

                return (
                    particle.life > 0
                );

            }
        );

}


/* =========================================
   DRAW
========================================= */

function draw() {

    drawBackground();

    drawGrid();

    drawCoins();

    drawEnemies();

    drawPlayer();

    drawParticles();

    drawDashBar();

}


/* =========================================
   BACKGROUND
========================================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            GAME_WIDTH,
            GAME_HEIGHT
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


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );


    for (
        let i = 0;

        i < 80;

        i++
    ) {

        const x =
            (
                i * 137
            ) %
            GAME_WIDTH;


        const y =
            (
                i * 71
            ) %
            GAME_HEIGHT;


        ctx.fillStyle =
            "rgba(255,255,255,0.22)";


        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }

}


/* =========================================
   GRID
========================================= */

function drawGrid() {

    ctx.strokeStyle =
        "rgba(139,92,246,0.08)";


    ctx.lineWidth = 1;


    for (
        let x = 0;

        x < GAME_WIDTH;

        x += 50
    ) {

        ctx.beginPath();


        ctx.moveTo(
            x,
            0
        );


        ctx.lineTo(
            x,
            GAME_HEIGHT
        );


        ctx.stroke();

    }


    for (
        let y = 0;

        y < GAME_HEIGHT;

        y += 50
    ) {

        ctx.beginPath();


        ctx.moveTo(
            0,
            y
        );


        ctx.lineTo(
            GAME_WIDTH,
            y
        );


        ctx.stroke();

    }

}


/* =========================================
   PLAYER DRAW
========================================= */

function drawPlayer() {

    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible * 10
        ) % 2 === 0
    ) {

        return;

    }


    const x =
        player.x;


    const y =
        player.y;


    ctx.save();


    ctx.shadowColor =
        "#a78bfa";


    ctx.shadowBlur =
        20 +
        Math.sin(
            player.glow
        ) * 5;


    ctx.fillStyle =
        "#f8fafc";


    ctx.beginPath();


    ctx.arc(
        x +
            player.width / 2,

        y + 17,

        17,

        Math.PI,

        0
    );


    ctx.lineTo(
        x +
            player.width,

        y +
            player.height
    );


    ctx.lineTo(
        x +
            player.width * 0.75,

        y +
            player.height -
            7
    );


    ctx.lineTo(
        x +
            player.width / 2,

        y +
            player.height
    );


    ctx.lineTo(
        x +
            player.width * 0.25,

        y +
            player.height -
            7
    );


    ctx.lineTo(
        x,

        y +
            player.height
    );


    ctx.closePath();


    ctx.fill();


    ctx.shadowBlur = 0;


    ctx.fillStyle =
        "#11111b";


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


/* =========================================
   ENEMY DRAW
========================================= */

function drawEnemies() {

    enemies.forEach(
        function (enemy) {

            ctx.save();


            ctx.shadowColor =
                "#ef4444";


            ctx.shadowBlur =
                18;


            ctx.fillStyle =
                "#ef4444";


            ctx.beginPath();


            ctx.arc(

                enemy.x +
                    enemy.width / 2,

                enemy.y +
                    enemy.height / 2,

                enemy.width / 2,

                0,

                Math.PI * 2

            );


            ctx.fill();


            ctx.shadowBlur = 0;


            ctx.fillStyle =
                "#080810";


            ctx.fillRect(

                enemy.x +
                    enemy.width * 0.28,

                enemy.y +
                    enemy.height * 0.35,

                5,

                5

            );


            ctx.fillRect(

                enemy.x +
                    enemy.width * 0.62,

                enemy.y +
                    enemy.height * 0.35,

                5,

                5

            );


            ctx.restore();

        }
    );

}


/* =========================================
   COIN DRAW
========================================= */

function drawCoins() {

    coinsArray.forEach(
        function (coin) {

            ctx.save();


            ctx.translate(
                coin.x,
                coin.y
            );


            ctx.rotate(
                coin.rotation
            );


            ctx.shadowColor =
                "#facc15";


            ctx.shadowBlur =
                15;


            ctx.fillStyle =
                "#facc15";


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


            ctx.fillStyle =
                "#fff7ae";


            ctx.font =
                "bold 12px Arial";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                "$",
                0,
                1
            );


            ctx.restore();

        }
    );

}


/* =========================================
   PARTICLES DRAW
========================================= */

function drawParticles() {

    particles.forEach(
        function (particle) {

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life
                );


            ctx.fillStyle =
                "#a78bfa";


            ctx.beginPath();


            ctx.arc(

                particle.x,

                particle.y,

                particle.size,

                0,

                Math.PI * 2

            );


            ctx.fill();

        }
    );


    ctx.globalAlpha = 1;

}


/* =========================================
   DASH BAR
========================================= */

function drawDashBar() {

    const x = 20;

    const y = 25;

    const width = 150;

    const height = 7;


    ctx.fillStyle =
        "rgba(255,255,255,0.15)";


    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    let progress = 1;


    if (
        player.dashCooldown > 0
    ) {

        progress =
            1 -
            player.dashCooldown /
            1.5;

    }


    ctx.fillStyle =
        "#8b5cf6";


    ctx.fillRect(

        x,

        y,

        width *
            progress,

        height

    );


    ctx.font =
        "11px Arial";


    ctx.fillStyle =
        "#aaaabd";


    ctx.fillText(
        "DASH",
        x,
        y - 7
    );

}


/* =========================================
   HUD
========================================= */

function updateHUD() {

    scoreElement.textContent =
        score;


    coinsElement.textContent =
        coins;


    livesElement.textContent =
        lives;

}


/* =========================================
   PAUSE
========================================= */

function togglePause() {

    if (!gameRunning) {

        return;

    }


    paused =
        !paused;


    playPauseSound();


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


/* =========================================
   GAME OVER
========================================= */

function endGame() {

    gameRunning = false;

    paused = false;


    stopAmbientSound();


    playGameOverSound();


    if (
        score > highScore
    ) {

        highScore =
            score;


        localStorage.setItem(
            "pixelfallHighScore",
            String(highScore)
        );

    }


    finalScoreElement.textContent =
        score;


    highScoreElement.textContent =
        highScore;


    gameOverScreen.classList.remove(
        "hidden"
    );


    updateMobileControls();

}


/* =========================================
   CLOSE GAME
========================================= */

async function closeGame() {

    gameRunning = false;

    paused = false;


    stopAmbientSound();


    enemies = [];

    coinsArray = [];

    particles = [];


    score = 0;

    coins = 0;

    lives = 3;

    level = 1;


    player.x = 120;

    player.y =
        GAME_HEIGHT / 2;


    resetJoystick();


    gameOverScreen.classList.add(
        "hidden"
    );


    pauseScreen.classList.add(
        "hidden"
    );


    startScreen.classList.remove(
        "hidden"
    );


    updateHUD();


    draw();


    try {

        if (
            document.fullscreenElement &&
            document.exitFullscreen
        ) {

            await document.exitFullscreen();

        }

    } catch (error) {

        console.log(
            "Could not exit fullscreen.",
            error
        );

    }


    try {

        if (
            screen.orientation &&
            screen.orientation.unlock
        ) {

            screen.orientation.unlock();

        }

    } catch (error) {

        console.log(
            "Could not unlock orientation.",
            error
        );

    }


    updateMobileControls();

}


/* =========================================
   JOYSTICK
========================================= */

joystick.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();


        joystickActive = true;


        joystickPointerId =
            event.pointerId;


        try {

            joystick.setPointerCapture(
                event.pointerId
            );

        } catch (error) {

            console.log(error);

        }


        updateJoystick(event);

    }
);


joystick.addEventListener(
    "pointermove",
    function (event) {

        if (
            !joystickActive
        ) {

            return;

        }


        if (
            event.pointerId !==
            joystickPointerId
        ) {

            return;

        }


        event.preventDefault();


        updateJoystick(event);

    }
);


joystick.addEventListener(
    "pointerup",
    function (event) {

        if (
            event.pointerId !==
            joystickPointerId
        ) {

            return;

        }


        stopJoystick();

    }
);


joystick.addEventListener(
    "pointercancel",
    stopJoystick
);


/* =========================================
   UPDATE JOYSTICK
========================================= */

function updateJoystick(event) {

    const rect =
        joystick.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        event.clientX -
        centerX;


    let dy =
        event.clientY -
        centerY;


    const maxDistance =
        rect.width / 2 -
        22;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance >
        maxDistance
    ) {

        dx =
            dx /
            distance *
            maxDistance;


        dy =
            dy /
            distance *
            maxDistance;

    }


    joystickX =
        dx /
        maxDistance;


    joystickY =
        dy /
        maxDistance;


    joystickKnob.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;

}


/* =========================================
   STOP JOYSTICK
========================================= */

function stopJoystick() {

    joystickActive = false;

    joystickPointerId = null;

    joystickX = 0;

    joystickY = 0;

    resetJoystick();

}


/* =========================================
   RESET JOYSTICK
========================================= */

function resetJoystick() {

    joystickKnob.style.transform =
        "translate(-50%, -50%)";

}


/* =========================================
   MOBILE CONTROLS
========================================= */

function updateMobileControls() {

    const touchDevice =
        window.matchMedia(
            "(pointer: coarse)"
        ).matches;


    const landscape =
        window.matchMedia(
            "(orientation: landscape)"
        ).matches;


    if (
        gameRunning &&
        touchDevice &&
        landscape
    ) {

        mobileControls.style.display =
            "block";

    } else {

        mobileControls.style.display =
            "none";

    }

}


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    function () {

        setTimeout(
            updateMobileControls,
            100
        );

    }
);


/* =========================================
   ORIENTATION
========================================= */

window.addEventListener(
    "orientationchange",
    function () {

        setTimeout(
            updateMobileControls,
            300
        );

    }
);


/* =========================================
   FULLSCREEN
========================================= */

document.addEventListener(
    "fullscreenchange",
    function () {

        setTimeout(
            updateMobileControls,
            200
        );

    }
);


/* =========================================
   INITIALIZE
========================================= */

updateSoundButton();

updateHUD();

updateMobileControls();

draw();
