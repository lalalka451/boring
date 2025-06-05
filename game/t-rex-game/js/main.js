// T-Rex Dinosaur Game - Main Entry Point

// Global game instance
let game;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('T-Rex Dinosaur Game Loading...');
    
    // Initialize the game
    game = new Game();
    
    console.log('T-Rex Dinosaur Game Loaded Successfully!');
    
    // Add some additional event listeners for better user experience
    setupAdditionalControls();
});

function setupAdditionalControls() {
    // Prevent default behavior for arrow keys and space to avoid page scrolling
    document.addEventListener('keydown', function(e) {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
    
    // Handle window focus/blur for pause functionality
    window.addEventListener('blur', function() {
        if (game && game.gameState === 'playing') {
            // Optionally pause the game when window loses focus
            console.log('Window lost focus');
        }
    });
    
    window.addEventListener('focus', function() {
        if (game && game.gameState === 'playing') {
            // Resume game when window gains focus
            console.log('Window gained focus');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Optionally adjust canvas size or game elements
        console.log('Window resized');
    });
    
    // Touch controls for mobile devices
    setupTouchControls();
}

function setupTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    
    // Touch start event
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        
        if (game.gameState === 'start') {
            game.startGame();
        } else if (game.gameState === 'playing') {
            game.player.jump();
        } else if (game.gameState === 'gameOver') {
            game.restartGame();
        }
    }, { passive: false });
    
    // Touch move event for ducking
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchY = touch.clientY - rect.top;
        
        // If touch is in lower half of canvas, duck
        if (game.gameState === 'playing' && touchY > canvas.height / 2) {
            game.player.duck();
        }
    }, { passive: false });
    
    // Touch end event
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        
        if (game.gameState === 'playing') {
            game.player.stopDucking();
        }
    }, { passive: false });
}

// Utility functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// Debug functions (can be called from browser console)
window.debugGame = {
    getGameState: () => game ? game.gameState : 'Game not initialized',
    getScore: () => game ? game.score : 0,
    getHighScore: () => game ? game.highScore : 0,
    getGameSpeed: () => game ? game.gameSpeed : 0,
    getObstacleCount: () => game ? game.obstacles.length : 0,
    setGameSpeed: (speed) => {
        if (game) {
            game.gameSpeed = speed;
            console.log(`Game speed set to: ${speed}`);
        }
    },
    addScore: (points) => {
        if (game) {
            game.score += points;
            game.updateScoreDisplay();
            console.log(`Added ${points} points. New score: ${game.score}`);
        }
    },
    clearObstacles: () => {
        if (game) {
            game.obstacles = [];
            console.log('All obstacles cleared');
        }
    }
};

// Performance monitoring
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
        frameCount = 0;
        lastFrameTime = currentTime;
        
        // Log FPS every 5 seconds in debug mode
        if (window.location.search.includes('debug=true')) {
            console.log(`FPS: ${fps}`);
        }
    }
    
    requestAnimationFrame(updateFPS);
}

// Start FPS monitoring
updateFPS();

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, Player, Obstacle, Background, Cloud };
}
