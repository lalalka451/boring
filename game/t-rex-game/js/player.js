// T-Rex Dinosaur Game - Player Class

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;
        this.velocityY = 0;
        this.isJumping = false;
        this.isDucking = false;
        this.groundY = y;
        this.gravity = 0.5;
        this.jumpPower = 12;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 200; // milliseconds per frame
    }
    
    update(deltaTime) {
        // Handle jumping physics
        if (this.isJumping || this.y < this.groundY) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            
            // Land on ground
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isJumping = false;
            }
        }
        
        // Update animation
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }
        
        // Adjust height when ducking
        if (this.isDucking) {
            this.height = 25;
            this.y = this.groundY + 25;
        } else {
            this.height = 50;
            if (!this.isJumping) {
                this.y = this.groundY;
            }
        }
    }
    
    jump() {
        if (!this.isJumping && !this.isDucking) {
            this.isJumping = true;
            this.velocityY = -this.jumpPower;
        }
    }
    
    duck() {
        if (!this.isJumping) {
            this.isDucking = true;
        }
    }
    
    stopDucking() {
        this.isDucking = false;
    }
    
    reset() {
        this.x = this.x; // Keep x position
        this.y = this.groundY;
        this.velocityY = 0;
        this.isJumping = false;
        this.isDucking = false;
        this.height = 50;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }
    
    render(ctx) {
        // Save context state
        ctx.save();
        
        // Set dinosaur color
        ctx.fillStyle = '#2c3e50';
        
        if (this.isDucking) {
            this.renderDucking(ctx);
        } else {
            this.renderStanding(ctx);
        }
        
        // Restore context state
        ctx.restore();
    }
    
    renderStanding(ctx) {
        // Body
        ctx.fillRect(this.x + 10, this.y + 15, 20, 25);
        
        // Head
        ctx.fillRect(this.x + 5, this.y, 25, 20);
        
        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 20, this.y + 5, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 21, this.y + 6, 2, 2);
        
        // Legs (animated)
        ctx.fillStyle = '#2c3e50';
        if (this.animationFrame === 0) {
            // Left leg forward
            ctx.fillRect(this.x + 12, this.y + 40, 4, 10);
            // Right leg back
            ctx.fillRect(this.x + 20, this.y + 40, 4, 10);
        } else {
            // Right leg forward
            ctx.fillRect(this.x + 20, this.y + 40, 4, 10);
            // Left leg back
            ctx.fillRect(this.x + 12, this.y + 40, 4, 10);
        }
        
        // Tail
        ctx.fillRect(this.x, this.y + 20, 15, 8);
        
        // Arms
        ctx.fillRect(this.x + 8, this.y + 18, 6, 3);
        ctx.fillRect(this.x + 26, this.y + 18, 6, 3);
    }
    
    renderDucking(ctx) {
        // Body (elongated)
        ctx.fillRect(this.x + 5, this.y + 10, 30, 15);
        
        // Head
        ctx.fillRect(this.x, this.y, 20, 15);
        
        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 12, this.y + 3, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 13, this.y + 4, 1, 1);
        
        // Legs (running animation)
        ctx.fillStyle = '#2c3e50';
        if (this.animationFrame === 0) {
            ctx.fillRect(this.x + 15, this.y + 20, 3, 5);
            ctx.fillRect(this.x + 25, this.y + 20, 3, 5);
        } else {
            ctx.fillRect(this.x + 18, this.y + 20, 3, 5);
            ctx.fillRect(this.x + 22, this.y + 20, 3, 5);
        }
        
        // Tail
        ctx.fillRect(this.x + 35, this.y + 12, 8, 6);
    }
}
