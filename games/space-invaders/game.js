// Space Invaders Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

// Game variables
let player;
let bullets = [];
let enemies = [];
let enemyRows = 3;
let enemyColumns = 8;
let enemyWidth = 50;
let enemyHeight = 30;
let enemyPadding = 20;
let enemyOffsetTop = 50;
let enemyDirection = 1;
let gameOver = false;
let score = 0;

// Player object
function createPlayer() {
    return {
        x: canvas.width / 2 - 25,
        y: canvas.height - 50,
        width: 50,
        height: 20,
        speed: 8,
        color: '#6e45e2',
        shoot: function() {
            bullets.push({
                x: this.x + this.width / 2 - 2.5,
                y: this.y,
                width: 5,
                height: 10,
                speed: 10,
                color: '#88d3ce'
            });
        }
    };
}

// Initialize game
function initGame() {
    player = createPlayer();
    bullets = [];
    enemies = [];
    gameOver = false;
    score = 0;
    enemyDirection = 1;
    
    // Create enemies
    for (let r = 0; r < enemyRows; r++) {
        for (let c = 0; c < enemyColumns; c++) {
            enemies.push({
                x: c * (enemyWidth + enemyPadding) + enemyPadding,
                y: r * (enemyHeight + enemyPadding) + enemyOffsetTop,
                width: enemyWidth,
                height: enemyHeight,
                color: r === 0 ? '#ff9a76' : r === 1 ? '#ffbd2e' : '#27ca3f'
            });
        }
    }
}

// Draw functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details
    ctx.fillStyle = '#4a2cb9';
    ctx.fillRect(player.x, player.y + player.height, player.width, 5);
    ctx.fillRect(player.x + 10, player.y - 10, 30, 10);
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw enemy details
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
        ctx.fillRect(enemy.x + enemy.width - 18, enemy.y + 10, 8, 8);
        ctx.fillRect(enemy.x + 15, enemy.y + enemy.height - 10, enemy.width - 30, 5);
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Montserrat';
    ctx.fillText('Score: ' + score, 20, 30);
}

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

// Update functions
function updatePlayer() {
    // Player movement handled by key events
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        
        // Remove bullets that go off screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (
                bullets[i] &&
                bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y
            ) {
                // Collision detected
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 100;
                break;
            }
        }
    }
}

function updateEnemies() {
    // Move enemies
    let moveDown = false;
    
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].x += enemyDirection;
        
        // Check if enemies hit the edge
        if (
            (enemyDirection > 0 && enemies[i].x + enemies[i].width > canvas.width) ||
            (enemyDirection < 0 && enemies[i].x < 0)
        ) {
            moveDown = true;
        }
        
        // Check if enemies reached the player
        if (enemies[i].y + enemies[i].height > player.y) {
            gameOver = true;
        }
    }
    
    if (moveDown) {
        enemyDirection *= -1;
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].y += 20;
        }
    }
    
    // Check if all enemies are defeated
    if (enemies.length === 0) {
        // Next level
        enemyRows = Math.min(enemyRows + 1, 5);
        initGame();
    }
}

// Input handling
let keys = {};

document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    
    if (e.key === ' ' && !gameOver) {
        player.shoot();
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
        // Update game state
        if (keys['ArrowLeft'] && player.x > 0) {
            player.x -= player.speed;
        }
        
        if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
            player.x += player.speed;
        }
        
        updatePlayer();
        updateBullets();
        updateEnemies();
        
        // Draw game
        drawPlayer();
        drawBullets();
        drawEnemies();
        drawScore();
    } else {
        drawGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
initGame();
gameLoop();
