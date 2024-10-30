
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

// Game settings
const playerSpeed = 8;  // Increased speed for better control
const alienSpeed = 2;
const projectileSpeed = 10;

// Game state
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;

// Control state
let keys = { left: false, right: false, shoot: false };

// Load assets
const mushroomImg = new Image();
const alienImg = new Image();
const backgroundImg = new Image();
let assetsLoaded = false;

// Set image sources and onload handlers
mushroomImg.src = 'assets/mushroom_realistic.png';
alienImg.src = 'assets/alien_realistic.png';
backgroundImg.src = 'assets/space_background.png';

let loadedAssets = 0;
[mushroomImg, alienImg, backgroundImg].forEach((img) => {
    img.onload = () => {
        loadedAssets += 1;
        if (loadedAssets === 3) {
            assetsLoaded = true;
            console.log("All assets loaded successfully.");
        }
    };
});

// Player class
class Mushroom {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.projectiles = [];
    }

    draw() {
        if (assetsLoaded) {
            ctx.drawImage(mushroomImg, this.x, this.y, this.width, this.height);
        }
    }

    move() {
        if (keys.left && this.x > 0) this.x -= playerSpeed;
        if (keys.right && this.x < canvas.width - this.width) this.x += playerSpeed;
    }

    shoot() {
        if (keys.shoot) {
            this.projectiles.push(new Projectile(this.x + this.width / 2, this.y));
            keys.shoot = false;  // Prevent continuous shooting while holding space
        }
    }
}

// Projectile class
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.y -= projectileSpeed;
    }
}

// Alien class
class Alien {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
    }

    draw() {
        if (assetsLoaded) {
            ctx.drawImage(alienImg, this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.y += alienSpeed;
    }
}

// Initialize game objects
const mushroom = new Mushroom();
const aliens = [];

// Game functions
function spawnAlien() {
    if (Math.random() < 0.02) {
        aliens.push(new Alien());
    }
}

function detectCollisions() {
    mushroom.projectiles.forEach((projectile, pIndex) => {
        aliens.forEach((alien, aIndex) => {
            const dist = Math.hypot(projectile.x - (alien.x + alien.width / 2), projectile.y - (alien.y + alien.height / 2));
            if (dist < projectile.radius + alien.width / 2) {
                aliens.splice(aIndex, 1);
                mushroom.projectiles.splice(pIndex, 1);
                score += 10;
                scoreDisplay.innerText = `Score: ${score}`;
            }
        });
    });

    aliens.forEach((alien, index) => {
        const distToPlayer = Math.hypot(alien.x - mushroom.x, alien.y - mushroom.y);
        if (distToPlayer < alien.width / 2 + mushroom.width / 2) {
            aliens.splice(index, 1);
            lives -= 1;
            livesDisplay.innerText = `Lives: ${lives}`;
            if (lives <= 0) {
                gameOver = true;
                alert(`Game Over! Final Score: ${score}`);
                resetGame();
            }
        }
    });
}

function resetGame() {
    score = 0;
    lives = 3;
    aliens.length = 0;
    mushroom.projectiles.length = 0;
    scoreDisplay.innerText = `Score: ${score}`;
    livesDisplay.innerText = `Lives: ${lives}`;
    gameOver = false;
}

function updateGame() {
    if (gameOver || !gameStarted || !assetsLoaded) return;

    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    mushroom.move();
    mushroom.shoot();
    mushroom.draw();

    mushroom.projectiles.forEach((projectile, index) => {
        projectile.update();
        projectile.draw();
        if (projectile.y < 0) mushroom.projectiles.splice(index, 1);
    });

    spawnAlien();
    aliens.forEach((alien, index) => {
        alien.update();
        alien.draw();
        if (alien.y > canvas.height) {
            aliens.splice(index, 1);
        }
    });

    detectCollisions();

    if (!gameOver) requestAnimationFrame(updateGame);
}

// Event listeners for simultaneous controls
document.addEventListener('keydown', (e) => {
    if (gameStarted && !gameOver) {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
        if (e.key === ' ') keys.shoot = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Start button event listener
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        resetGame();
        console.log("Game started!");
        updateGame();
    }
});
