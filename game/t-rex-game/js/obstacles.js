// T-Rex Dinosaur Game - Obstacles Class

class Obstacle {
    constructor(x, type, canvasHeight) {
        this.x = x;
        this.type = type; // 'cactus' or 'bird'
        this.canvasHeight = canvasHeight;
        
        if (type === 'cactus') {
            this.width = 20;
            this.height = 40;
            this.y = canvasHeight - 60; // Ground level
        } else if (type === 'bird') {
            this.width = 30;
            this.height = 20;
            // Birds can fly at different heights
            const heights = [canvasHeight - 100, canvasHeight - 80, canvasHeight - 60];
            this.y = heights[Math.floor(Math.random() * heights.length)];
        }
        
        // Animation properties for birds
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 300; // milliseconds per frame
    }
    
    update(gameSpeed, deltaTime = 16) {
        // Move obstacle to the left
        this.x -= gameSpeed;
        
        // Update animation for birds
        if (this.type === 'bird') {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.animationFrame = (this.animationFrame + 1) % 2;
                this.animationTimer = 0;
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        if (this.type === 'cactus') {
            this.renderCactus(ctx);
        } else if (this.type === 'bird') {
            this.renderBird(ctx);
        }
        
        ctx.restore();
    }
    
    renderCactus(ctx) {
        // Set cactus color
        ctx.fillStyle = '#27ae60';
        
        // Main stem
        ctx.fillRect(this.x + 8, this.y, 4, this.height);
        
        // Left arm
        ctx.fillRect(this.x + 2, this.y + 10, 8, 4);
        ctx.fillRect(this.x + 2, this.y + 10, 4, 15);
        
        // Right arm
        ctx.fillRect(this.x + 10, this.y + 20, 8, 4);
        ctx.fillRect(this.x + 14, this.y + 15, 4, 15);
        
        // Spikes
        ctx.fillStyle = '#1e8449';
        // Left arm spikes
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(this.x + 1, this.y + 12 + i * 4, 2, 1);
            ctx.fillRect(this.x + 8, this.y + 12 + i * 4, 2, 1);
        }
        
        // Right arm spikes
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(this.x + 13, this.y + 17 + i * 4, 2, 1);
            ctx.fillRect(this.x + 18, this.y + 17 + i * 4, 2, 1);
        }
        
        // Main stem spikes
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(this.x + 7, this.y + 2 + i * 4, 2, 1);
            ctx.fillRect(this.x + 11, this.y + 4 + i * 4, 2, 1);
        }
    }
    
    renderBird(ctx) {
        // Set bird color
        ctx.fillStyle = '#34495e';
        
        // Body
        ctx.fillRect(this.x + 10, this.y + 8, 12, 6);
        
        // Head
        ctx.fillRect(this.x + 20, this.y + 6, 8, 8);
        
        // Beak
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x + 28, this.y + 9, 4, 2);
        
        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 23, this.y + 8, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 24, this.y + 8, 1, 1);
        
        // Wings (animated)
        ctx.fillStyle = '#2c3e50';
        if (this.animationFrame === 0) {
            // Wings up
            ctx.fillRect(this.x + 8, this.y + 4, 8, 3);
            ctx.fillRect(this.x + 16, this.y + 4, 8, 3);
        } else {
            // Wings down
            ctx.fillRect(this.x + 8, this.y + 12, 8, 3);
            ctx.fillRect(this.x + 16, this.y + 12, 8, 3);
        }
        
        // Tail
        ctx.fillRect(this.x + 2, this.y + 10, 8, 2);
        
        // Feet
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x + 12, this.y + 14, 2, 3);
        ctx.fillRect(this.x + 18, this.y + 14, 2, 3);
    }
}

// Cloud class for background decoration
class Cloud {
    constructor(x, y, size = 1) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.width = 60 * size;
        this.height = 30 * size;
    }
    
    update(speed) {
        this.x -= speed * 0.3; // Clouds move slower than ground
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        
        // Cloud circles
        const radius = 8 * this.size;
        ctx.beginPath();
        ctx.arc(this.x + radius, this.y + radius, radius, 0, Math.PI * 2);
        ctx.arc(this.x + radius * 2, this.y + radius * 0.7, radius * 1.2, 0, Math.PI * 2);
        ctx.arc(this.x + radius * 3, this.y + radius, radius, 0, Math.PI * 2);
        ctx.arc(this.x + radius * 4, this.y + radius * 1.2, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
