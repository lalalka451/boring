// Tetris Game - Main Game Logic

class TetrisGame {
    constructor() {
        this.board = new Board();
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        
        // Game state
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.highScore = localStorage.getItem('tetrisHighScore') || 0;
        
        // Timing
        this.dropTimer = 0;
        this.dropInterval = getLevelSpeed(this.level);
        this.lastTime = 0;
        
        // Input handling
        this.keys = {};
        this.keyRepeatTimers = {};
        this.keyRepeatDelay = 150;
        this.keyRepeatInterval = 50;
        
        // Piece bag for random generation
        this.pieceBag = [];
        this.bagIndex = 0;
        
        // Statistics
        this.statistics = {
            I: 0, O: 0, T: 0, S: 0, Z: 0, J: 0, L: 0
        };
        
        // Renderers
        this.nextRenderer = new PieceRenderer('nextCanvas');
        this.holdRenderer = new PieceRenderer('holdCanvas');
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.setupEventListeners();
        this.generatePieceBag();
        this.nextPiece = this.getNextPiece();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Button event listeners
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // Mobile controls
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        const mobileButtons = {
            'leftBtn': () => this.movePiece(-1, 0),
            'rightBtn': () => this.movePiece(1, 0),
            'downBtn': () => this.movePiece(0, 1),
            'rotateBtn': () => this.rotatePiece(),
            'hardDropBtn': () => this.hardDrop(),
            'holdBtn': () => this.holdCurrentPiece()
        };
        
        Object.entries(mobileButtons).forEach(([id, action]) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    action();
                });
                button.addEventListener('click', action);
            }
        });
    }
    
    generatePieceBag() {
        this.pieceBag = createTetrominoBag();
        this.bagIndex = 0;
    }
    
    getNextPiece() {
        if (this.bagIndex >= this.pieceBag.length) {
            this.generatePieceBag();
        }
        
        const type = this.pieceBag[this.bagIndex++];
        const piece = new Piece(type);
        piece.resetToSpawn();
        
        // Update statistics
        this.statistics[type]++;
        this.updateStatistics();
        
        return piece;
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getNextPiece();
        this.canHold = true;
        
        // Check if game is over
        if (!this.board.isValidPosition(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
            return false;
        }
        
        this.updateDisplay();
        return true;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.statistics = { I: 0, O: 0, T: 0, S: 0, Z: 0, J: 0, L: 0 };
        
        this.board.reset();
        this.generatePieceBag();
        this.nextPiece = this.getNextPiece();
        this.holdPiece = null;
        this.canHold = true;
        
        this.dropTimer = 0;
        this.dropInterval = getLevelSpeed(this.level);
        
        this.spawnPiece();
        this.hideOverlay();
        this.updateDisplay();
        this.gameLoop();
    }
    
    restartGame() {
        this.startGame();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('PAUSED', 'Press P to resume');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore);
        }
        
        this.showOverlay('GAME OVER', `Final Score: ${this.score}`);
        this.updateDisplay();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (!this.currentPiece) return;
        
        // Handle key repeats
        this.handleKeyRepeats(deltaTime);
        
        // Update drop timer
        this.dropTimer += deltaTime;
        if (this.dropTimer >= this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTimer = 0;
        }
        
        // Update lock delay
        if (this.currentPiece.canLock(this.board)) {
            if (this.currentPiece.updateLockDelay(deltaTime)) {
                this.lockPiece();
            }
        }
    }
    
    render() {
        this.board.render(this.currentPiece);
        this.nextRenderer.render(this.nextPiece);
        this.holdRenderer.render(this.holdPiece);
    }
    
    handleKeyDown(e) {
        if (this.gameState !== 'playing') {
            if (e.code === 'Space' && this.gameState === 'menu') {
                this.startGame();
            } else if (e.code === 'KeyP' && this.gameState === 'paused') {
                this.togglePause();
            }
            return;
        }
        
        this.keys[e.code] = true;
        
        switch (e.code) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                this.startKeyRepeat('ArrowLeft', () => this.movePiece(-1, 0));
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                this.startKeyRepeat('ArrowRight', () => this.movePiece(1, 0));
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                this.startKeyRepeat('ArrowDown', () => this.movePiece(0, 1));
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'KeyC':
                this.holdCurrentPiece();
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
        this.stopKeyRepeat(e.code);
    }
    
    startKeyRepeat(key, action) {
        this.stopKeyRepeat(key);
        
        this.keyRepeatTimers[key] = setTimeout(() => {
            const repeat = () => {
                if (this.keys[key] && this.gameState === 'playing') {
                    action();
                    this.keyRepeatTimers[key] = setTimeout(repeat, this.keyRepeatInterval);
                }
            };
            repeat();
        }, this.keyRepeatDelay);
    }
    
    stopKeyRepeat(key) {
        if (this.keyRepeatTimers[key]) {
            clearTimeout(this.keyRepeatTimers[key]);
            delete this.keyRepeatTimers[key];
        }
    }
    
    handleKeyRepeats(deltaTime) {
        // This method is called every frame to handle smooth key repeats
        // The actual repeat logic is handled in startKeyRepeat/stopKeyRepeat
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        const moved = this.currentPiece.move(this.board, dx, dy);
        
        if (moved && dy > 0) {
            this.score += SCORING.SOFT_DROP;
            this.updateDisplay();
        }
        
        return moved;
    }
    
    rotatePiece(direction = 1) {
        if (!this.currentPiece) return false;
        
        return this.currentPiece.rotate(this.board, direction);
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        const dropDistance = this.currentPiece.hardDrop(this.board);
        this.score += dropDistance * SCORING.HARD_DROP;
        this.lockPiece();
        this.updateDisplay();
    }
    
    holdCurrentPiece() {
        if (!this.currentPiece || !this.canHold) return;
        
        if (this.holdPiece) {
            // Swap current and hold pieces
            const temp = this.holdPiece;
            this.holdPiece = new Piece(this.currentPiece.type);
            this.currentPiece = temp;
            this.currentPiece.resetToSpawn();
        } else {
            // Move current piece to hold
            this.holdPiece = new Piece(this.currentPiece.type);
            this.spawnPiece();
        }
        
        this.canHold = false;
        this.updateDisplay();
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        this.board.placePiece(this.currentPiece);
        
        const { linesCleared, clearedRows } = this.board.clearLines();
        
        if (linesCleared > 0) {
            this.handleLinesCleared(linesCleared);
            
            // Animate line clear
            this.board.animateLineClear(clearedRows, () => {
                this.spawnPiece();
            });
        } else {
            this.spawnPiece();
        }
    }
    
    handleLinesCleared(linesCleared) {
        this.lines += linesCleared;
        
        // Calculate score
        let lineScore = 0;
        switch (linesCleared) {
            case 1: lineScore = SCORING.SINGLE; break;
            case 2: lineScore = SCORING.DOUBLE; break;
            case 3: lineScore = SCORING.TRIPLE; break;
            case 4: lineScore = SCORING.TETRIS; break;
        }
        
        this.score += lineScore * this.level;
        
        // Level progression
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = getLevelSpeed(this.level);
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    updateStatistics() {
        Object.entries(this.statistics).forEach(([type, count]) => {
            const element = document.getElementById(`stat-${type}`);
            if (element) {
                element.textContent = count;
            }
        });
    }
    
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        document.getElementById('gameOverlay').classList.remove('hidden');
        
        // Show appropriate buttons
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        if (this.gameState === 'menu') {
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            restartBtn.style.display = 'none';
        } else if (this.gameState === 'paused') {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            pauseBtn.textContent = 'Resume';
            restartBtn.style.display = 'inline-block';
        } else if (this.gameState === 'gameOver') {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'none';
            restartBtn.style.display = 'inline-block';
        }
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
}
