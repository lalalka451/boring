// Tetris Game - Board Class

class Board {
    constructor(width = BOARD_WIDTH, height = BOARD_HEIGHT) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = BLOCK_SIZE;
    }
    
    createEmptyGrid() {
        return Array(this.height).fill().map(() => Array(this.width).fill(0));
    }
    
    reset() {
        this.grid = this.createEmptyGrid();
    }
    
    isValidPosition(piece, x, y, rotation = piece.rotation) {
        const shape = piece.getShape(rotation);
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.width || newY >= this.height) {
                        return false;
                    }
                    
                    // Check collision with existing blocks (but allow negative Y for spawning)
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    placePiece(piece) {
        const shape = piece.getShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = piece.x + col;
                    const y = piece.y + row;
                    
                    if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                        this.grid[y][x] = piece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        const clearedRows = [];
        
        for (let row = this.height - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell !== 0)) {
                clearedRows.push(row);
                this.grid.splice(row, 1);
                this.grid.unshift(Array(this.width).fill(0));
                linesCleared++;
                row++; // Check the same row again since we shifted everything down
            }
        }
        
        return { linesCleared, clearedRows };
    }
    
    getDropPosition(piece) {
        let dropY = piece.y;
        
        while (this.isValidPosition(piece, piece.x, dropY + 1)) {
            dropY++;
        }
        
        return dropY;
    }
    
    isGameOver() {
        // Check if any blocks are above the visible area
        for (let col = 0; col < this.width; col++) {
            if (this.grid[0][col] !== 0) {
                return true;
            }
        }
        return false;
    }
    
    render(currentPiece = null, ghostPiece = true) {
        // Clear canvas
        this.ctx.fillStyle = COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.drawGrid();
        
        // Draw placed blocks
        this.drawPlacedBlocks();
        
        // Draw ghost piece
        if (currentPiece && ghostPiece) {
            this.drawGhostPiece(currentPiece);
        }
        
        // Draw current piece
        if (currentPiece) {
            this.drawPiece(currentPiece, currentPiece.x, currentPiece.y);
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.height * this.blockSize);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.width * this.blockSize, y * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    drawPlacedBlocks() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.grid[row][col]) {
                    this.drawBlock(col, row, this.grid[row][col]);
                }
            }
        }
    }
    
    drawGhostPiece(piece) {
        const ghostY = this.getDropPosition(piece);
        const shape = piece.getShape();
        
        this.ctx.fillStyle = COLORS.GHOST;
        this.ctx.strokeStyle = piece.color;
        this.ctx.lineWidth = 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = (piece.x + col) * this.blockSize;
                    const y = (ghostY + row) * this.blockSize;
                    
                    if (ghostY + row >= 0) {
                        this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
                        this.ctx.strokeRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
                    }
                }
            }
        }
    }
    
    drawPiece(piece, x, y) {
        const shape = piece.getShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const blockX = x + col;
                    const blockY = y + row;
                    
                    if (blockY >= 0) {
                        this.drawBlock(blockX, blockY, piece.color);
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;
        
        // Main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Highlight (top and left)
        this.ctx.fillStyle = this.lightenColor(color, 0.3);
        this.ctx.fillRect(pixelX + 1, pixelY + 1, this.blockSize - 2, 3);
        this.ctx.fillRect(pixelX + 1, pixelY + 1, 3, this.blockSize - 2);
        
        // Shadow (bottom and right)
        this.ctx.fillStyle = this.darkenColor(color, 0.3);
        this.ctx.fillRect(pixelX + 1, pixelY + this.blockSize - 4, this.blockSize - 2, 3);
        this.ctx.fillRect(pixelX + this.blockSize - 4, pixelY + 1, 3, this.blockSize - 2);
        
        // Border
        this.ctx.strokeStyle = this.darkenColor(color, 0.5);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX + 0.5, pixelY + 0.5, this.blockSize - 1, this.blockSize - 1);
    }
    
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Animation for line clearing
    animateLineClear(clearedRows, callback) {
        let animationFrame = 0;
        const maxFrames = 10;
        
        const animate = () => {
            this.render();
            
            // Flash the cleared lines
            this.ctx.fillStyle = animationFrame % 2 === 0 ? '#ffffff' : '#ffff00';
            
            clearedRows.forEach(row => {
                this.ctx.fillRect(0, row * this.blockSize, this.width * this.blockSize, this.blockSize);
            });
            
            animationFrame++;
            
            if (animationFrame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                callback();
            }
        };
        
        animate();
    }
}
