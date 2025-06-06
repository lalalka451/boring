// Tetris Game - Main Entry Point

// Global game instance
let tetrisGame;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tetris Game Loading...');
    
    // Initialize the game
    tetrisGame = new TetrisGame();
    
    console.log('Tetris Game Loaded Successfully!');
    
    // Add additional event listeners
    setupAdditionalControls();
    
    // Show initial overlay
    tetrisGame.showOverlay('TETRIS', 'Press SPACE to start');
});

function setupAdditionalControls() {
    // Prevent default behavior for arrow keys and space
    document.addEventListener('keydown', function(e) {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
    
    // Handle window focus/blur
    window.addEventListener('blur', function() {
        if (tetrisGame && tetrisGame.gameState === 'playing') {
            tetrisGame.togglePause();
        }
    });
    
    window.addEventListener('focus', function() {
        // Game will resume when user presses P or clicks resume
        console.log('Window gained focus');
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Update mobile controls visibility
        updateMobileControlsVisibility();
    });
    
    // Initial mobile controls setup
    updateMobileControlsVisibility();
    
    // Touch controls for canvas
    setupCanvasTouchControls();
}

function updateMobileControlsVisibility() {
    const mobileControls = document.getElementById('mobileControls');
    const isMobile = window.innerWidth <= 768;
    
    if (mobileControls) {
        mobileControls.style.display = isMobile ? 'flex' : 'none';
    }
}

function setupCanvasTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        
        if (!tetrisGame || tetrisGame.gameState !== 'playing') return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;
        
        const minSwipeDistance = 30;
        const maxTapTime = 200;
        
        // Tap (short touch)
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance && deltaTime < maxTapTime) {
            tetrisGame.rotatePiece();
            return;
        }
        
        // Swipe gestures
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    tetrisGame.movePiece(1, 0); // Right
                } else {
                    tetrisGame.movePiece(-1, 0); // Left
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    tetrisGame.movePiece(0, 1); // Down
                } else {
                    tetrisGame.hardDrop(); // Up (hard drop)
                }
            }
        }
    }, { passive: false });
    
    // Prevent scrolling on canvas
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
}

// Utility functions
function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getTimeString(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Debug functions (accessible from browser console)
window.debugTetris = {
    getGameState: () => tetrisGame ? tetrisGame.gameState : 'Game not initialized',
    getScore: () => tetrisGame ? tetrisGame.score : 0,
    getLevel: () => tetrisGame ? tetrisGame.level : 0,
    getLines: () => tetrisGame ? tetrisGame.lines : 0,
    getCurrentPiece: () => tetrisGame ? tetrisGame.currentPiece?.type : null,
    getNextPiece: () => tetrisGame ? tetrisGame.nextPiece?.type : null,
    getHoldPiece: () => tetrisGame ? tetrisGame.holdPiece?.type : null,
    getStatistics: () => tetrisGame ? tetrisGame.statistics : {},
    addScore: (points) => {
        if (tetrisGame) {
            tetrisGame.score += points;
            tetrisGame.updateDisplay();
            console.log(`Added ${points} points. New score: ${tetrisGame.score}`);
        }
    },
    setLevel: (level) => {
        if (tetrisGame) {
            tetrisGame.level = Math.max(1, level);
            tetrisGame.dropInterval = getLevelSpeed(tetrisGame.level);
            tetrisGame.updateDisplay();
            console.log(`Level set to: ${tetrisGame.level}`);
        }
    },
    clearBoard: () => {
        if (tetrisGame) {
            tetrisGame.board.reset();
            console.log('Board cleared');
        }
    },
    spawnPiece: (type) => {
        if (tetrisGame && TETROMINO_TYPES.includes(type)) {
            tetrisGame.currentPiece = new Piece(type);
            tetrisGame.currentPiece.resetToSpawn();
            console.log(`Spawned ${type} piece`);
        }
    }
};

// Performance monitoring
let frameCount = 0;
let lastFPSTime = performance.now();
let fps = 0;

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastFPSTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastFPSTime));
        frameCount = 0;
        lastFPSTime = currentTime;
        
        // Log FPS in debug mode
        if (window.location.search.includes('debug=true')) {
            console.log(`FPS: ${fps}`);
        }
    }
    
    requestAnimationFrame(updateFPS);
}

// Start FPS monitoring
updateFPS();

// Keyboard shortcuts help
function showKeyboardHelp() {
    const helpText = `
TETRIS CONTROLS:
├─ Movement ─────────────────
│  ← → : Move left/right
│  ↓   : Soft drop
│  ↑   : Rotate clockwise
│  
├─ Actions ──────────────────
│  SPACE : Hard drop
│  C     : Hold piece
│  P     : Pause/Resume
│  
├─ Mobile ───────────────────
│  TAP   : Rotate
│  SWIPE : Move/Drop
│  
└─ Debug ────────────────────
   Add ?debug=true to URL
   Use debugTetris.* in console
    `;
    
    console.log(helpText);
}

// Auto-show help in debug mode
if (window.location.search.includes('debug=true')) {
    setTimeout(showKeyboardHelp, 1000);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        TetrisGame, 
        Board, 
        Piece, 
        PieceRenderer,
        TETROMINOS,
        SCORING
    };
}

// Service Worker registration for offline play (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(function(registration) {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(function(registrationError) {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}
