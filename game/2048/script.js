class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = localStorage.getItem('best2048') || 0;
        this.gameWon = false;
        this.gameOver = false;
        this.autoPlaying = false;
        this.autoPlayInterval = null;
        this.autoPlaySpeed = 2; // Default 2x speed
        this.addTileMode = false;
        this.selectedTileValue = 2;
        this.tileElements = new Map(); // Track tile elements for smooth animations
        this.nextTileId = 0; // Unique ID for each tile

        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;

        // Stop auto play if it's running
        if (this.autoPlaying) {
            this.toggleAutoPlay();
        }

        // Stop add tile mode if it's running
        if (this.addTileMode) {
            this.toggleAddTileMode();
        }

        this.createGrid();
        this.addRandomTile();
        this.addRandomTile();

        this.updateDisplay();
        this.hideGameMessage();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver && !this.gameWon) return;

            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
    }

    createGrid() {
        const gridContainer = document.getElementById('grid-container');
        const gameContainer = document.getElementById('game-container');

        // Clear existing grid
        gridContainer.innerHTML = '';

        // Calculate cell size and spacing based on grid size
        const cellSize = Math.max(60, Math.min(107, 500 / this.size - 10));
        const spacing = 10;
        const totalSize = this.size * cellSize + (this.size - 1) * spacing;

        // Set game container size
        gameContainer.style.width = `${totalSize + 20}px`;
        gameContainer.style.height = `${totalSize + 20}px`;

        // Create grid rows and cells
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'grid-row';

            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.marginRight = j < this.size - 1 ? `${spacing}px` : '0';
                row.appendChild(cell);
            }

            row.style.marginBottom = i < this.size - 1 ? `${spacing}px` : '0';
            gridContainer.appendChild(row);
        }

        // Store cell size for tile positioning
        this.cellSize = cellSize;
        this.spacing = spacing;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;

            // Mark this position for new tile animation
            this.newTilePosition = {row: randomCell.row, col: randomCell.col};
        }
    }
    

    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < this.size) {
                row.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.grid[i][j] = row[j];
            }
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < this.size) {
                row.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.grid[i][j] = row[j];
            }
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            while (column.length < this.size) {
                column.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }

        return true;
    }

    updateDisplay() {
        this.updateScore();
        this.updateGrid();
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('best2048', this.best);
        }
        document.getElementById('best').textContent = this.best;
    }

    updateGrid() {
        const container = document.getElementById('tile-container');
        const currentTiles = new Map();

        // Create a map of current grid positions to values
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const key = `${i}-${j}`;
                    currentTiles.set(key, this.grid[i][j]);
                }
            }
        }

        // Remove tiles that no longer exist
        this.tileElements.forEach((tileData, key) => {
            if (!currentTiles.has(key) || currentTiles.get(key) !== tileData.value) {
                if (tileData.element.parentNode) {
                    // Fade out and remove
                    tileData.element.style.transition = 'all 0.15s ease-out';
                    tileData.element.style.opacity = '0';
                    tileData.element.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        if (tileData.element.parentNode) {
                            tileData.element.parentNode.removeChild(tileData.element);
                        }
                    }, 150);
                }
                this.tileElements.delete(key);
            }
        });

        // Update or create tiles
        currentTiles.forEach((value, key) => {
            const [i, j] = key.split('-').map(Number);
            const left = j * (this.cellSize + this.spacing);
            const top = i * (this.cellSize + this.spacing);

            if (this.tileElements.has(key)) {
                // Update existing tile
                const tileData = this.tileElements.get(key);
                const tile = tileData.element;

                // Update position smoothly
                tile.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
                tile.style.left = `${left}px`;
                tile.style.top = `${top}px`;

                // Update value if changed (for merges)
                if (tileData.value !== value) {
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    tileData.value = value;

                    // Brief scale animation for merged tiles
                    tile.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        tile.style.transform = 'scale(1)';
                    }, 100);
                }
            } else {
                // Create new tile
                const tile = document.createElement('div');
                tile.className = `tile tile-${value}`;
                tile.textContent = value;
                tile.id = `tile-${this.nextTileId++}`;

                // Set size and position
                tile.style.left = `${left}px`;
                tile.style.top = `${top}px`;
                tile.style.width = `${this.cellSize}px`;
                tile.style.height = `${this.cellSize}px`;
                tile.style.lineHeight = `${this.cellSize}px`;

                // Adjust font size based on cell size and value
                let fontSize = Math.max(16, this.cellSize * 0.5);
                if (value >= 1024) {
                    fontSize = Math.max(14, this.cellSize * 0.35);
                } else if (value >= 128) {
                    fontSize = Math.max(16, this.cellSize * 0.4);
                }
                tile.style.fontSize = `${fontSize}px`;

                // Add hover effect (only if not auto-playing for performance)
                if (!this.autoPlaying) {
                    tile.addEventListener('mouseenter', () => {
                        tile.style.transform = 'scale(1.05)';
                        tile.style.zIndex = '10';
                    });

                    tile.addEventListener('mouseleave', () => {
                        tile.style.transform = 'scale(1)';
                        tile.style.zIndex = '2';
                    });
                }

                // Store tile data
                this.tileElements.set(key, {
                    element: tile,
                    value: value
                });

                container.appendChild(tile);
            }
        });
    }

    showGameMessage(message, className) {
        const messageElement = document.getElementById('game-message');
        const container = document.querySelector('.game-container');
        messageElement.querySelector('p').textContent = message;
        messageElement.style.display = 'block';
        container.classList.add(className);
    }

    hideGameMessage() {
        const messageElement = document.getElementById('game-message');
        const container = document.querySelector('.game-container');
        messageElement.style.display = 'none';
        container.classList.remove('game-won', 'game-over');
    }

    restart() {
        this.init();
    }

    toggleAutoPlay() {
        const button = document.getElementById('auto-play-btn');
        const speedContainer = document.getElementById('speed-container');

        if (this.autoPlaying) {
            // Stop auto play
            this.autoPlaying = false;
            clearInterval(this.autoPlayInterval);
            button.textContent = 'Auto Play';
            button.classList.remove('active');
            speedContainer.style.display = 'none';
        } else {
            // Start auto play
            this.autoPlaying = true;
            button.textContent = 'Stop Auto';
            button.classList.add('active');
            speedContainer.style.display = 'flex';
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        const baseDelay = 300; // Base delay in ms
        const delay = baseDelay / this.autoPlaySpeed;

        this.autoPlayInterval = setInterval(() => {
            if (this.gameOver || this.gameWon) {
                this.toggleAutoPlay();
                return;
            }

            const bestMove = this.getBestMove();
            if (bestMove) {
                this.move(bestMove);
            } else {
                this.toggleAutoPlay();
            }
        }, delay);
    }

    getBestMove() {
        const moves = ['left', 'right', 'up', 'down'];
        let bestMove = null;
        let bestScore = -1;

        for (const move of moves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestScore > 0 ? bestMove : null;
    }

    evaluateMove(direction) {
        // Create a copy of the current grid
        const originalGrid = this.grid.map(row => [...row]);
        const originalScore = this.score;

        // Try the move
        let moved = false;
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (!moved) {
            // Restore original state
            this.grid = originalGrid;
            this.score = originalScore;
            return 0;
        }

        // Calculate score for this move
        const scoreGain = this.score - originalScore;
        const emptyCells = this.countEmptyCells();
        const monotonicity = this.calculateMonotonicity();

        // Restore original state
        this.grid = originalGrid;
        this.score = originalScore;

        // Return a weighted score (prioritize score gain and empty cells)
        return scoreGain * 10 + emptyCells * 5 + monotonicity;
    }

    countEmptyCells() {
        let count = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    count++;
                }
            }
        }
        return count;
    }

    calculateMonotonicity() {
        let score = 0;

        // Check rows for monotonicity
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                if (this.grid[i][j] >= this.grid[i][j + 1]) {
                    score += 1;
                }
            }
        }

        // Check columns for monotonicity
        for (let j = 0; j < this.size; j++) {
            for (let i = 0; i < this.size - 1; i++) {
                if (this.grid[i][j] >= this.grid[i + 1][j]) {
                    score += 1;
                }
            }
        }

        return score;
    }

    setSpeed(speed) {
        this.autoPlaySpeed = speed;

        // Update active button
        document.querySelectorAll('.speed-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`speed-${speed}x`).classList.add('active');

        // If auto play is running, restart with new speed
        if (this.autoPlaying) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }

    toggleAddTileMode() {
        const button = document.getElementById('add-tile-btn');
        const tileSelectorContainer = document.getElementById('tile-selector-container');

        if (this.addTileMode) {
            // Stop add tile mode
            this.addTileMode = false;
            button.textContent = 'Add Tile';
            button.classList.remove('active');
            tileSelectorContainer.style.display = 'none';
            this.removeGridClickListeners();
        } else {
            // Start add tile mode
            this.addTileMode = true;
            button.textContent = 'Stop Adding';
            button.classList.add('active');
            tileSelectorContainer.style.display = 'flex';
            this.addGridClickListeners();
        }
    }

    setSelectedTile(value) {
        this.selectedTileValue = value;

        // Update active button
        document.querySelectorAll('.tile-selector-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`tile-${value}`).classList.add('active');
    }

    addGridClickListeners() {
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach((cell, index) => {
            const row = Math.floor(index / this.size);
            const col = index % this.size;

            if (this.grid[row][col] === 0) {
                cell.classList.add('clickable');
                cell.addEventListener('click', () => this.addTileToCell(row, col));
            }
        });
    }

    removeGridClickListeners() {
        const gridCells = document.querySelectorAll('.grid-cell');
        gridCells.forEach(cell => {
            cell.classList.remove('clickable');
            cell.replaceWith(cell.cloneNode(true)); // Remove all event listeners
        });
    }

    addTileToCell(row, col) {
        if (this.grid[row][col] === 0 && this.addTileMode) {
            this.grid[row][col] = this.selectedTileValue;
            this.updateDisplay();

            // Update clickable cells
            this.removeGridClickListeners();
            this.addGridClickListeners();

            // Check win condition after adding tile
            if (this.checkWin()) {
                this.gameWon = true;
                this.showGameMessage('You Win!', 'game-won');
            }
        }
    }

    setGridSize(newSize) {
        // Update active button
        document.querySelectorAll('.size-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`size-${newSize}x${newSize}`).classList.add('active');

        // Update grid size and restart game
        this.size = newSize;
        this.init();
    }

    createParticleEffect(x, y) {
        const container = document.getElementById('tile-container');
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 30 + Math.random() * 20;
            const offsetX = Math.cos(angle) * velocity;
            const offsetY = Math.sin(angle) * velocity;

            particle.style.left = `${x + this.cellSize / 2}px`;
            particle.style.top = `${y + this.cellSize / 2}px`;
            particle.style.setProperty('--offset-x', `${offsetX}px`);
            particle.style.setProperty('--offset-y', `${offsetY}px`);

            container.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    // Enhanced move method with particle effects
    move(direction) {
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        let mergedPositions = [];

        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            // Find merged positions and create particle effects
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] !== previousGrid[i][j] && this.grid[i][j] > 0) {
                        const x = j * (this.cellSize + this.spacing);
                        const y = i * (this.cellSize + this.spacing);
                        this.createParticleEffect(x, y);
                    }
                }
            }

            this.addRandomTile();
            this.updateDisplay();

            if (this.checkWin()) {
                this.gameWon = true;
                this.showGameMessage('You Win!', 'game-won');
            } else if (this.checkGameOver()) {
                this.gameOver = true;
                this.showGameMessage('Game Over!', 'game-over');
            }
        }
    }
}

// Initialize the game
const game = new Game2048();
