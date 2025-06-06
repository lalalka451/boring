class CandyCrushGame {
    constructor() {
        this.board = [];
        this.boardSize = 8;
        this.candyTypes = ['🍭', '🍬', '🧁', '🍪', '🎂', '🍩'];
        this.candyColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.score = 0;
        this.moves = 30;
        this.level = 1;
        this.targetScore = 1000;
        this.selectedCandy = null;
        this.isAnimating = false;
        this.powerUps = { bomb: 3, rainbow: 2 };
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateUI();
    }

    createBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = this.getRandomCandy();
            }
        }
        // Ensure no initial matches
        this.removeInitialMatches();
    }

    getRandomCandy() {
        const index = Math.floor(Math.random() * this.candyTypes.length);
        return {
            type: this.candyTypes[index],
            color: this.candyColors[index],
            id: Math.random().toString(36).substr(2, 9)
        };
    }

    removeInitialMatches() {
        let hasMatches = true;
        while (hasMatches) {
            hasMatches = false;
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.hasMatchAt(row, col)) {
                        this.board[row][col] = this.getRandomCandy();
                        hasMatches = true;
                    }
                }
            }
        }
    }

    hasMatchAt(row, col) {
        const candy = this.board[row][col];
        
        // Check horizontal match
        let horizontalCount = 1;
        // Check left
        for (let c = col - 1; c >= 0 && this.board[row][c].type === candy.type; c--) {
            horizontalCount++;
        }
        // Check right
        for (let c = col + 1; c < this.boardSize && this.board[row][c].type === candy.type; c++) {
            horizontalCount++;
        }
        
        // Check vertical match
        let verticalCount = 1;
        // Check up
        for (let r = row - 1; r >= 0 && this.board[r][col].type === candy.type; r--) {
            verticalCount++;
        }
        // Check down
        for (let r = row + 1; r < this.boardSize && this.board[r][col].type === candy.type; r++) {
            verticalCount++;
        }
        
        return horizontalCount >= 3 || verticalCount >= 3;
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const candy = this.board[row][col];
                const candyElement = document.createElement('div');
                candyElement.className = `candy ${candy.color}`;
                candyElement.textContent = candy.type;
                candyElement.dataset.row = row;
                candyElement.dataset.col = col;
                candyElement.dataset.id = candy.id;

                gameBoard.appendChild(candyElement);
            }
        }
    }

    updateCandyElement(element, candy, row, col) {
        if (element && candy) {
            element.className = `candy ${candy.color}`;
            element.textContent = candy.type;
            element.dataset.row = row;
            element.dataset.col = col;
            element.dataset.id = candy.id;
            // Remove any existing classes that might interfere
            element.classList.remove('selected', 'matching');
        }
    }

    bindEvents() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (e) => this.handleCandyClick(e));
        
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restart());
        document.getElementById('close-modal-btn').addEventListener('click', () => this.hideModal('game-over-modal'));
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        
        // Power-up events
        document.querySelectorAll('.power-up').forEach(powerUp => {
            powerUp.addEventListener('click', (e) => this.activatePowerUp(e));
        });
    }

    handleCandyClick(e) {
        if (this.isAnimating || this.moves <= 0) return;
        
        const candyElement = e.target;
        if (!candyElement.classList.contains('candy')) return;
        
        const row = parseInt(candyElement.dataset.row);
        const col = parseInt(candyElement.dataset.col);
        
        if (!this.selectedCandy) {
            this.selectCandy(candyElement, row, col);
        } else {
            if (this.selectedCandy.row === row && this.selectedCandy.col === col) {
                this.deselectCandy();
            } else if (this.isAdjacent(this.selectedCandy.row, this.selectedCandy.col, row, col)) {
                this.swapCandies(this.selectedCandy.row, this.selectedCandy.col, row, col);
            } else {
                this.deselectCandy();
                this.selectCandy(candyElement, row, col);
            }
        }
    }

    selectCandy(element, row, col) {
        this.selectedCandy = { element, row, col };
        element.classList.add('selected');
    }

    deselectCandy() {
        if (this.selectedCandy) {
            this.selectedCandy.element.classList.remove('selected');
            this.selectedCandy = null;
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async swapCandies(row1, col1, row2, col2) {
        this.isAnimating = true;

        // Get the DOM elements before swapping
        const element1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const element2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);

        // Swap candies in board
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;

        // Update only the swapped elements instead of re-rendering entire board
        this.updateCandyElement(element1, this.board[row1][col1], row1, col1);
        this.updateCandyElement(element2, this.board[row2][col2], row2, col2);

        // Check for matches
        const hasMatches = this.hasMatchAt(row1, col1) || this.hasMatchAt(row2, col2);

        if (hasMatches) {
            this.moves--;
            this.deselectCandy();
            await this.processMatches();
        } else {
            // Swap back if no matches
            this.board[row1][col1] = this.board[row2][col2];
            this.board[row2][col2] = temp;

            // Update elements back to original state
            this.updateCandyElement(element1, this.board[row1][col1], row1, col1);
            this.updateCandyElement(element2, this.board[row2][col2], row2, col2);
            this.deselectCandy();
        }

        this.updateUI();
        this.checkGameState();
        this.isAnimating = false;
    }

    async processMatches() {
        let totalMatches = 0;
        let hasMatches = true;
        
        while (hasMatches) {
            const matches = this.findAllMatches();
            if (matches.length === 0) {
                hasMatches = false;
                break;
            }
            
            totalMatches += matches.length;
            this.score += matches.length * 10 * this.level;
            
            // Animate matching candies
            this.animateMatches(matches);
            await this.delay(300);
            
            // Remove matches and apply gravity
            this.removeMatches(matches);
            await this.applyGravity();
            await this.delay(300);
            
            this.renderBoard();
        }
        
        if (totalMatches > 0) {
            this.createParticleEffect(totalMatches);
        }
    }

    findAllMatches() {
        const matches = [];
        const visited = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const key = `${row}-${col}`;
                if (!visited.has(key) && this.hasMatchAt(row, col)) {
                    const matchGroup = this.getMatchGroup(row, col);
                    matchGroup.forEach(pos => {
                        const posKey = `${pos.row}-${pos.col}`;
                        if (!visited.has(posKey)) {
                            matches.push(pos);
                            visited.add(posKey);
                        }
                    });
                }
            }
        }
        
        return matches;
    }

    getMatchGroup(row, col) {
        const candy = this.board[row][col];
        const matches = [];
        
        // Find horizontal matches
        const horizontalMatches = [{ row, col }];
        // Check left
        for (let c = col - 1; c >= 0 && this.board[row][c].type === candy.type; c--) {
            horizontalMatches.unshift({ row, col: c });
        }
        // Check right
        for (let c = col + 1; c < this.boardSize && this.board[row][c].type === candy.type; c++) {
            horizontalMatches.push({ row, col: c });
        }
        
        if (horizontalMatches.length >= 3) {
            matches.push(...horizontalMatches);
        }
        
        // Find vertical matches
        const verticalMatches = [{ row, col }];
        // Check up
        for (let r = row - 1; r >= 0 && this.board[r][col].type === candy.type; r--) {
            verticalMatches.unshift({ row: r, col });
        }
        // Check down
        for (let r = row + 1; r < this.boardSize && this.board[r][col].type === candy.type; r++) {
            verticalMatches.push({ row: r, col });
        }
        
        if (verticalMatches.length >= 3) {
            matches.push(...verticalMatches);
        }
        
        // Remove duplicates
        const uniqueMatches = [];
        const seen = new Set();
        matches.forEach(match => {
            const key = `${match.row}-${match.col}`;
            if (!seen.has(key)) {
                uniqueMatches.push(match);
                seen.add(key);
            }
        });
        
        return uniqueMatches;
    }

    animateMatches(matches) {
        matches.forEach(match => {
            const element = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            if (element) {
                element.classList.add('matching');
            }
        });
    }

    removeMatches(matches) {
        matches.forEach(match => {
            this.board[match.row][match.col] = null;
        });
    }

    async applyGravity() {
        for (let col = 0; col < this.boardSize; col++) {
            let writeIndex = this.boardSize - 1;
            
            // Move existing candies down
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    if (row !== writeIndex) {
                        this.board[writeIndex][col] = this.board[row][col];
                        this.board[row][col] = null;
                    }
                    writeIndex--;
                }
            }
            
            // Fill empty spaces with new candies
            for (let row = writeIndex; row >= 0; row--) {
                this.board[row][col] = this.getRandomCandy();
            }
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('level').textContent = this.level;
        document.getElementById('target-score').textContent = this.targetScore;
        
        // Update power-ups
        document.querySelector('#bomb-power .count').textContent = this.powerUps.bomb;
        document.querySelector('#rainbow-power .count').textContent = this.powerUps.rainbow;
    }

    checkGameState() {
        if (this.score >= this.targetScore) {
            this.levelComplete();
        } else if (this.moves <= 0) {
            this.gameOver();
        }
    }

    levelComplete() {
        const bonus = this.moves * 50;
        this.score += bonus;
        document.getElementById('bonus-score').textContent = bonus;
        this.showModal('level-complete-modal');
    }

    gameOver() {
        document.getElementById('final-score').textContent = this.score;
        this.showModal('game-over-modal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    nextLevel() {
        this.level++;
        this.moves = 30;
        this.targetScore = this.targetScore * 1.5;
        this.powerUps.bomb = Math.min(this.powerUps.bomb + 1, 5);
        this.powerUps.rainbow = Math.min(this.powerUps.rainbow + 1, 3);
        
        this.hideModal('level-complete-modal');
        this.createBoard();
        this.renderBoard();
        this.updateUI();
    }

    restart() {
        this.score = 0;
        this.moves = 30;
        this.level = 1;
        this.targetScore = 1000;
        this.powerUps = { bomb: 3, rainbow: 2 };
        this.selectedCandy = null;
        this.isAnimating = false;
        
        this.hideModal('game-over-modal');
        this.hideModal('level-complete-modal');
        this.createBoard();
        this.renderBoard();
        this.updateUI();
    }

    showHint() {
        // Find possible moves
        const possibleMoves = this.findPossibleMoves();
        if (possibleMoves.length > 0) {
            const hint = possibleMoves[0];
            const element1 = document.querySelector(`[data-row="${hint.from.row}"][data-col="${hint.from.col}"]`);
            const element2 = document.querySelector(`[data-row="${hint.to.row}"][data-col="${hint.to.col}"]`);
            
            element1.style.boxShadow = '0 0 20px #ffff00';
            element2.style.boxShadow = '0 0 20px #ffff00';
            
            setTimeout(() => {
                element1.style.boxShadow = '';
                element2.style.boxShadow = '';
            }, 2000);
        }
    }

    findPossibleMoves() {
        const moves = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Check right
                if (col < this.boardSize - 1) {
                    if (this.wouldCreateMatch(row, col, row, col + 1)) {
                        moves.push({
                            from: { row, col },
                            to: { row, col: col + 1 }
                        });
                    }
                }
                
                // Check down
                if (row < this.boardSize - 1) {
                    if (this.wouldCreateMatch(row, col, row + 1, col)) {
                        moves.push({
                            from: { row, col },
                            to: { row: row + 1, col }
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    wouldCreateMatch(row1, col1, row2, col2) {
        // Temporarily swap
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
        
        const hasMatch = this.hasMatchAt(row1, col1) || this.hasMatchAt(row2, col2);
        
        // Swap back
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
        
        return hasMatch;
    }

    activatePowerUp(e) {
        const powerUpType = e.currentTarget.dataset.type;
        
        if (this.powerUps[powerUpType] > 0) {
            this.powerUps[powerUpType]--;
            
            if (powerUpType === 'bomb') {
                this.activateBomb();
            } else if (powerUpType === 'rainbow') {
                this.activateRainbow();
            }
            
            this.updateUI();
        }
    }

    activateBomb() {
        // Remove random 3x3 area
        const centerRow = Math.floor(Math.random() * (this.boardSize - 2)) + 1;
        const centerCol = Math.floor(Math.random() * (this.boardSize - 2)) + 1;
        
        const matches = [];
        for (let r = centerRow - 1; r <= centerRow + 1; r++) {
            for (let c = centerCol - 1; c <= centerCol + 1; c++) {
                matches.push({ row: r, col: c });
            }
        }
        
        this.score += matches.length * 20;
        this.animateMatches(matches);
        
        setTimeout(() => {
            this.removeMatches(matches);
            this.applyGravity().then(() => {
                this.renderBoard();
                this.processMatches();
            });
        }, 300);
    }

    activateRainbow() {
        // Remove all candies of a random type
        const randomType = this.candyTypes[Math.floor(Math.random() * this.candyTypes.length)];
        const matches = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col].type === randomType) {
                    matches.push({ row, col });
                }
            }
        }
        
        this.score += matches.length * 30;
        this.animateMatches(matches);
        
        setTimeout(() => {
            this.removeMatches(matches);
            this.applyGravity().then(() => {
                this.renderBoard();
                this.processMatches();
            });
        }, 300);
    }

    createParticleEffect(matchCount) {
        const container = document.getElementById('particles-container');
        const particles = ['✨', '💫', '⭐', '🌟'];
        
        for (let i = 0; i < matchCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            
            container.appendChild(particle);
            
            setTimeout(() => {
                container.removeChild(particle);
            }, 2000);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CandyCrushGame();
});
