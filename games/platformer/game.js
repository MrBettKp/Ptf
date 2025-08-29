// Platformer Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');

// Game variables
let player;
let platforms = [];
let coins = [];
let enemies = [];
let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let gravity = 0.5;
let keys = {};

// Player class
class Player {
    constructor() {
        this.width = 30;
        this.height = 40;
        this.x = 100;
        this.y = canvas.height - 200;
        this.velocityY = 0;
        this.velocityX = 0;
        this.jumping = false;
        this.speed = 5;
        this.jumpPower = 12;
        this.color = '#6e45e2';
    }
    
    update() {
        // Apply gravity
        this.velocityY += gravity;
        this.y += this.velocityY;
        
        // Apply horizontal movement
        if (keys['ArrowLeft']) {
            this.velocityX = -this.speed;
        } else if (keys['ArrowRight']) {
            this.velocityX = this.speed;
        } else {
            this.velocityX = 0;
        }
        
        this.x += this.velocityX;
        
        // Boundary checking
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y > canvas.height) {
            this.y = canvas.height;
            this.velocityY = 0;
            this.jumping = false;
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                gameOver = true;
            }
        }
        
        // Platform collision
        platforms.forEach(platform => {
            if (
                this.y + this.height > platform.y &&
                this.y < platform.y &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.velocityY > 0
            ) {
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.jumping = false;
            }
        });
        
        // Coin collection
        coins.forEach((coin, index) => {
            if (
                this.x + this.width > coin.x &&
                this.x < coin.x + coin.width &&
                this.y + this.height > coin.y &&
                this.y < coin.y + coin.height
            ) {
                coins.splice(index, 1);
                score += 10;
                scoreElement.textContent = score;
                
                // Level progression
                if (coins.length === 0) {
                    level++;
                    levelElement.textContent = level;
                    generateLevel();
                }
            }
        });
        
        // Enemy collision
        enemies.forEach((enemy, index) => {
            if (
                this.x + this.width > enemy.x &&
                this.x < enemy.x + enemy.width &&
                this.y + this.height > enemy.y &&
                this.y < enemy.y + enemy.height
            ) {
                // If player is above enemy, defeat enemy
                if (this.y + this.height < enemy.y + enemy.height / 2 && this.velocityY > 0) {
                    enemies.splice(index, 1);
                    this.velocityY = -this.jumpPower / 1.5;
                    score += 20;
                    scoreElement.textContent = score;
                } else {
                    // Player gets hurt
                    lives--;
                    livesElement.textContent = lives;
                    this.x = 100;
                    this.y = canvas.height - 200;
                    if (lives <= 0) {
                        gameOver = true;
                    }
                }
            }
        });
    }
    
    jump() {
        if (!this.jumping) {
            this.velocityY = -this.jumpPower;
            this.jumping = true;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw player details
        ctx.fillStyle = '#4a2cb9';
        ctx.fillRect(this.x + 5, this.y + 10, 8, 8);
        ctx.fillRect(this.x + this.width - 13, this.y + 10, 8, 8);
        
        // Draw a smile
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 25, 5, 0, Math.PI);
        ctx.strokeStyle = '#4a2cb9';
        ctx.stroke();
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height, color = '#88d3ce') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add platform details
        ctx.strokeStyle = '#4a2cb9';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Coin class
class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
    }
    
    draw() {
        ctx.fillStyle = '#ffbd2e';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ff9a76';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Shine effect
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 2, this.y + this.height / 2 - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2 + level * 0.5;
        this.direction = 1;
        this.moveDistance = 150;
        this.startX = x;
        this.color = '#ff5f56';
    }
    
    update() {
        this.x += this.speed * this.direction;
        
        // Change direction if moved too far
        if (Math.abs(this.x - this.startX) > this.moveDistance) {
            this.direction *= -1;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw enemy eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y + 8, 5, 5);
        ctx.fillRect(this.x + this.width - 10, this.y + 8, 5, 5);
        
        // Draw enemy mouth
        ctx.fillRect(this.x + 8, this.y + 20, this.width - 16, 3);
    }
}

// Generate game level
function generateLevel() {
    platforms = [];
    coins = [];
    enemies = [];
    
    // Create ground platform
    platforms.push(new Platform(0, canvas.height - 20, canvas.width, 20, '#4a2cb9'));
    
    // Add platforms based on level
    const platformCount = 5 + level * 2;
    for (let i = 0; i < platformCount; i++) {
        const width = 80 + Math.random() * 100;
        const x = Math.random() * (canvas.width - width);
        const y = canvas.height - 100 - Math.random() * 300;
        platforms.push(new Platform(x, y, width, 15));
    }
    
    // Add coins
    const coinCount = 10 + level * 3;
    for (let i = 0; i < coinCount; i++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const x = platform.x + Math.random() * (platform.width - 15);
        const y = platform.y - 20;
        coins.push(new Coin(x, y));
    }
    
    // Add enemies
    const enemyCount = Math.min(2 + level, 5);
    for (let i = 0; i < enemyCount; i++) {
        const platform = platforms[Math.floor(Math.random() * (platforms.length - 5)) + 5];
        const x = platform.x + Math.random() * (platform.width - 30);
        const y = platform.y - 30;
        enemies.push(new Enemy(x, y));
    }
}

// Draw game over screen
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '40px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '24px Montserrat';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '20px Montserrat';
    ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 40);
}

// Draw level complete screen
function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '40px Montserrat';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '24px Montserrat';
    ctx.fillText('Get ready for level ' + (level + 1), canvas.width / 2, canvas.height / 2);
    
    ctx.font = '20px Montserrat';
    ctx.fillText('Press any key to continue', canvas.width / 2, canvas.height / 2 + 40);
}

// Initialize game
function initGame() {
    player = new Player();
    score = 0;
    lives = 3;
    level = 1;
    gameOver = false;
    
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    
    generateLevel();
}

// Input handling
document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    
    if (e.key === ' ' && !player.jumping) {
        player.jump();
    }
});

document.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

restartBtn.addEventListener('click', initGame);

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!gameOver) {
        // Draw background
        ctx.fillStyle = '#4a2cb9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw platforms
        platforms.forEach(platform => platform.draw());
        
        // Draw coins
        coins.forEach(coin => coin.draw());
        
        // Update and draw enemies
        enemies.forEach(enemy => {
            enemy.update();
            enemy.draw();
        });
        
        // Update and draw player
        player.update();
        player.draw();
    } else {
        drawGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
initGame();
gameLoop();
