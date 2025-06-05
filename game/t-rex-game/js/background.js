// T-Rex Dinosaur Game - Background Class

class Background {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.groundY = canvasHeight - 20;
        
        // Ground elements
        this.groundElements = [];
        this.initializeGround();
        
        // Clouds
        this.clouds = [];
        this.initializeClouds();
        
        // Mountains/hills in background
        this.mountains = [];
        this.initializeMountains();
    }
    
    initializeGround() {
        // Create ground texture elements (rocks, grass patches)
        for (let i = 0; i < this.canvasWidth + 100; i += 20) {
            if (Math.random() < 0.3) {
                this.groundElements.push({
                    x: i,
                    y: this.groundY + Math.random() * 10,
                    type: Math.random() < 0.5 ? 'rock' : 'grass',
                    size: 0.5 + Math.random() * 0.5
                });
            }
        }
    }
    
    initializeClouds() {
        // Create initial clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push(new Cloud(
                Math.random() * this.canvasWidth * 2,
                20 + Math.random() * 60,
                0.5 + Math.random() * 1
            ));
        }
    }
    
    initializeMountains() {
        // Create background mountains
        for (let i = 0; i < 8; i++) {
            this.mountains.push({
                x: i * 150 - 100,
                y: this.canvasHeight - 150,
                width: 100 + Math.random() * 100,
                height: 80 + Math.random() * 70,
                color: `hsl(${200 + Math.random() * 40}, 30%, ${60 + Math.random() * 20}%)`
            });
        }
    }
    
    update(gameSpeed) {
        // Update ground elements
        this.groundElements.forEach(element => {
            element.x -= gameSpeed;
        });
        
        // Remove off-screen ground elements and add new ones
        this.groundElements = this.groundElements.filter(element => element.x > -50);
        while (this.groundElements.length < 50) {
            const lastElement = this.groundElements[this.groundElements.length - 1];
            const newX = lastElement ? lastElement.x + 20 + Math.random() * 40 : this.canvasWidth;
            
            if (Math.random() < 0.3) {
                this.groundElements.push({
                    x: newX,
                    y: this.groundY + Math.random() * 10,
                    type: Math.random() < 0.5 ? 'rock' : 'grass',
                    size: 0.5 + Math.random() * 0.5
                });
            }
        }
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.update(gameSpeed);
        });
        
        // Remove off-screen clouds and add new ones
        this.clouds = this.clouds.filter(cloud => cloud.x > -cloud.width);
        while (this.clouds.length < 5) {
            this.clouds.push(new Cloud(
                this.canvasWidth + Math.random() * 200,
                20 + Math.random() * 60,
                0.5 + Math.random() * 1
            ));
        }
        
        // Update mountains (move very slowly)
        this.mountains.forEach(mountain => {
            mountain.x -= gameSpeed * 0.1;
        });
        
        // Add new mountains as needed
        if (this.mountains[this.mountains.length - 1].x < this.canvasWidth) {
            this.mountains.push({
                x: this.mountains[this.mountains.length - 1].x + 150,
                y: this.canvasHeight - 150,
                width: 100 + Math.random() * 100,
                height: 80 + Math.random() * 70,
                color: `hsl(${200 + Math.random() * 40}, 30%, ${60 + Math.random() * 20}%)`
            });
        }
        
        // Remove off-screen mountains
        this.mountains = this.mountains.filter(mountain => mountain.x > -mountain.width);
    }
    
    render(ctx) {
        // Render sky gradient
        this.renderSky(ctx);
        
        // Render mountains
        this.renderMountains(ctx);
        
        // Render clouds
        this.clouds.forEach(cloud => {
            cloud.render(ctx);
        });
        
        // Render ground
        this.renderGround(ctx);
        
        // Render ground elements
        this.renderGroundElements(ctx);
    }
    
    renderSky(ctx) {
        // Create sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    renderMountains(ctx) {
        this.mountains.forEach(mountain => {
            ctx.fillStyle = mountain.color;
            ctx.beginPath();
            ctx.moveTo(mountain.x, mountain.y + mountain.height);
            ctx.lineTo(mountain.x + mountain.width / 2, mountain.y);
            ctx.lineTo(mountain.x + mountain.width, mountain.y + mountain.height);
            ctx.closePath();
            ctx.fill();
        });
    }
    
    renderGround(ctx) {
        // Main ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, this.groundY, this.canvasWidth, this.canvasHeight - this.groundY);
        
        // Ground surface
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, this.groundY, this.canvasWidth, 5);
        
        // Ground line pattern
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < this.canvasWidth; x += 10) {
            ctx.moveTo(x, this.groundY);
            ctx.lineTo(x, this.groundY + 2);
        }
        ctx.stroke();
    }
    
    renderGroundElements(ctx) {
        this.groundElements.forEach(element => {
            if (element.type === 'rock') {
                ctx.fillStyle = '#696969';
                ctx.fillRect(
                    element.x, 
                    element.y, 
                    4 * element.size, 
                    3 * element.size
                );
            } else if (element.type === 'grass') {
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(
                    element.x, 
                    element.y, 
                    2 * element.size, 
                    6 * element.size
                );
                ctx.fillRect(
                    element.x + 2 * element.size, 
                    element.y + 1, 
                    2 * element.size, 
                    5 * element.size
                );
            }
        });
    }
}
