// Tetris Game - Piece Class

class Piece {
    constructor(type, x = 3, y = -1) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.tetromino = TETROMINOS[type];
        this.color = this.tetromino.color;
        this.lockDelay = 0;
        this.maxLockDelay = 500; // milliseconds
        this.moveResetCount = 0;
        this.maxMoveResets = 15;
    }
    
    getShape(rotation = this.rotation) {
        const shapes = this.tetromino.shape;
        return shapes[rotation % shapes.length];
    }
    
    rotate(board, direction = 1) {
        const newRotation = (this.rotation + direction + 4) % 4;
        
        // Try basic rotation first
        if (board.isValidPosition(this, this.x, this.y, newRotation)) {
            this.rotation = newRotation;
            this.resetLockDelay();
            return true;
        }
        
        // Try wall kicks
        const wallKicks = getWallKickData(this.type, this.rotation, newRotation);
        
        for (const [dx, dy] of wallKicks) {
            if (board.isValidPosition(this, this.x + dx, this.y + dy, newRotation)) {
                this.x += dx;
                this.y += dy;
                this.rotation = newRotation;
                this.resetLockDelay();
                return true;
            }
        }
        
        return false;
    }
    
    move(board, dx, dy) {
        if (board.isValidPosition(this, this.x + dx, this.y + dy)) {
            this.x += dx;
            this.y += dy;
            
            // Reset lock delay if piece moved down or sideways while on ground
            if (dy !== 0 || !board.isValidPosition(this, this.x, this.y + 1)) {
                this.resetLockDelay();
            }
            
            return true;
        }
        return false;
    }
    
    moveLeft(board) {
        return this.move(board, -1, 0);
    }
    
    moveRight(board) {
        return this.move(board, 1, 0);
    }
    
    moveDown(board) {
        return this.move(board, 0, 1);
    }
    
    hardDrop(board) {
        let dropDistance = 0;
        
        while (this.moveDown(board)) {
            dropDistance++;
        }
        
        return dropDistance;
    }
    
    canLock(board) {
        return !board.isValidPosition(this, this.x, this.y + 1);
    }
    
    updateLockDelay(deltaTime) {
        if (this.canLock) {
            this.lockDelay += deltaTime;
            return this.lockDelay >= this.maxLockDelay;
        } else {
            this.lockDelay = 0;
            return false;
        }
    }
    
    resetLockDelay() {
        if (this.moveResetCount < this.maxMoveResets) {
            this.lockDelay = 0;
            this.moveResetCount++;
        }
    }
    
    clone() {
        const clonedPiece = new Piece(this.type, this.x, this.y);
        clonedPiece.rotation = this.rotation;
        return clonedPiece;
    }
    
    // Get the bounding box of the piece
    getBoundingBox() {
        const shape = this.getShape();
        let minX = shape[0].length;
        let maxX = -1;
        let minY = shape.length;
        let maxY = -1;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    minX = Math.min(minX, col);
                    maxX = Math.max(maxX, col);
                    minY = Math.min(minY, row);
                    maxY = Math.max(maxY, row);
                }
            }
        }
        
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }
    
    // Get the spawn position for the piece
    getSpawnPosition() {
        const boundingBox = this.getBoundingBox();
        return {
            x: Math.floor((BOARD_WIDTH - boundingBox.width) / 2),
            y: -boundingBox.minY
        };
    }
    
    // Reset piece to spawn position
    resetToSpawn() {
        const spawnPos = this.getSpawnPosition();
        this.x = spawnPos.x;
        this.y = spawnPos.y;
        this.rotation = 0;
        this.lockDelay = 0;
        this.moveResetCount = 0;
    }
}

// Preview canvas renderer for next and hold pieces
class PieceRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 20;
    }
    
    render(piece) {
        // Clear canvas
        this.ctx.fillStyle = COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!piece) return;
        
        const shape = piece.getShape();
        const boundingBox = piece.getBoundingBox();
        
        // Center the piece in the canvas
        const offsetX = (this.canvas.width - boundingBox.width * this.blockSize) / 2;
        const offsetY = (this.canvas.height - boundingBox.height * this.blockSize) / 2;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const x = offsetX + (col - boundingBox.minX) * this.blockSize;
                    const y = offsetY + (row - boundingBox.minY) * this.blockSize;
                    
                    this.drawBlock(x, y, piece.color);
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        // Main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Highlight (top and left)
        this.ctx.fillStyle = this.lightenColor(color, 0.3);
        this.ctx.fillRect(x + 1, y + 1, this.blockSize - 2, 2);
        this.ctx.fillRect(x + 1, y + 1, 2, this.blockSize - 2);
        
        // Shadow (bottom and right)
        this.ctx.fillStyle = this.darkenColor(color, 0.3);
        this.ctx.fillRect(x + 1, y + this.blockSize - 3, this.blockSize - 2, 2);
        this.ctx.fillRect(x + this.blockSize - 3, y + 1, 2, this.blockSize - 2);
        
        // Border
        this.ctx.strokeStyle = this.darkenColor(color, 0.5);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 0.5, y + 0.5, this.blockSize - 1, this.blockSize - 1);
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
    
    clear() {
        this.ctx.fillStyle = COLORS.EMPTY;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
