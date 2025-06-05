// T-Rex Dinosaur Game - Main Game Logic

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.highScore = localStorage.getItem('dinoHighScore') || 0;
        this.gameSpeed = 2;
        this.gravity = 0.5;
        this.jumpPower = 12;
        
        // Game objects
        this.player = null;
        this.obstacles = [];
        this.background = null;
        
        // Timing
        this.lastTime = 0;
        this.obstacleTimer = 0;
        this.obstacleInterval = 2000; // milliseconds
        
        // Initialize game elements
        this.init();
    }
    
    init() {
        // Initialize player
        this.player = new Player(this.canvas.width * 0.1, this.canvas.height - 60);
        
        // Initialize background
        this.background = new Background(this.canvas.width, this.canvas.height);
        
        // Update score display
        this.updateScoreDisplay();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.gameState === 'start') {
                        this.startGame();
                    } else if (this.gameState === 'playing') {
                        this.player.jump();
                    } else if (this.gameState === 'gameOver') {
                        this.restartGame();
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.gameState === 'playing') {
                        this.player.duck();
                    }
                    break;
                case 'KeyR':
                    e.preventDefault();
                    if (this.gameState === 'gameOver') {
                        this.restartGame();
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown' && this.gameState === 'playing') {
                this.player.stopDucking();
            }
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.player.reset();
        
        // Hide start screen
        document.getElementById('startScreen').classList.add('hidden');
        
        // Start game loop
        this.gameLoop();
    }
    
    restartGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.player.reset();
        
        // Hide game over screen
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Start game loop
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game objects
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update player
        this.player.update(deltaTime);
        
        // Update background
        this.background.update(this.gameSpeed);
        
        // Spawn obstacles
        this.obstacleTimer += deltaTime;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
            // Gradually decrease interval to increase difficulty
            this.obstacleInterval = Math.max(1000, this.obstacleInterval - 10);
        }
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.update(this.gameSpeed);
            
            // Remove obstacles that are off screen
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
                this.updateScoreDisplay();
            }
            
            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
            }
        });
        
        // Increase game speed gradually
        this.gameSpeed += 0.001;
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background
        this.background.render(this.ctx);
        
        // Render player
        this.player.render(this.ctx);
        
        // Render obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.render(this.ctx);
        });
    }
    
    spawnObstacle() {
        const type = Math.random() < 0.7 ? 'cactus' : 'bird';
        const obstacle = new Obstacle(this.canvas.width, type, this.canvas.height);
        this.obstacles.push(obstacle);
    }
    
    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.width > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dinoHighScore', this.highScore);
            this.updateScoreDisplay();
        }
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }
}
