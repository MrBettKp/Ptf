// Simple animation for the hero canvas
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 480;
    canvas.height = 320;
    
    // Game objects
    const player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 40,
        width: 30,
        height: 15,
        color: '#6e45e2'
    };
    
    const enemies = [];
    const bullets = [];
    const stars = [];
    
    // Create stars for background
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 1
        });
    }
    
    // Create enemies
    for (let i = 0; i < 8; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height / 2),
            width: 30,
            height: 20,
            color: '#ff9a76',
            speedX: Math.random() * 2 - 1
        });
    }
    
    // Animation loop
    function animate() {
        // Clear canvas
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Move stars
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });
        
        // Draw player
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Draw and update enemies
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Move enemies
            enemy.x += enemy.speedX;
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                enemy.speedX *= -1;
            }
        });
        
        // Draw and update bullets
        bullets.forEach((bullet, index) => {
            ctx.fillStyle = '#88d3ce';
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Move bullet
            bullet.y -= 5;
            
            // Remove bullet if off screen
            if (bullet.y < 0) {
                bullets.splice(index, 1);
            }
        });
        
        // Occasionally shoot bullets
        if (Math.random() < 0.05) {
            bullets.push({
                x: player.x + player.width / 2,
                y: player.y
            });
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
