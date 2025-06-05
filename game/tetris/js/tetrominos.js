// Tetris Game - Tetromino Definitions

// Tetromino shapes and their rotations
const TETROMINOS = {
    I: {
        shape: [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0]
            ],
            [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0]
            ],
            [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ]
        ],
        color: '#00f5ff'
    },
    O: {
        shape: [
            [
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        ],
        color: '#ffff00'
    },
    T: {
        shape: [
            [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [0, 1, 0]
            ]
        ],
        color: '#a000f0'
    },
    S: {
        shape: [
            [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 1],
                [0, 0, 1]
            ],
            [
                [0, 0, 0],
                [0, 1, 1],
                [1, 1, 0]
            ],
            [
                [1, 0, 0],
                [1, 1, 0],
                [0, 1, 0]
            ]
        ],
        color: '#00f000'
    },
    Z: {
        shape: [
            [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 0, 1],
                [0, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 1, 0],
                [1, 1, 0],
                [1, 0, 0]
            ]
        ],
        color: '#f00000'
    },
    J: {
        shape: [
            [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 1]
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [1, 1, 0]
            ]
        ],
        color: '#0000f0'
    },
    L: {
        shape: [
            [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 0, 0],
                [1, 1, 1],
                [1, 0, 0]
            ],
            [
                [1, 1, 0],
                [0, 1, 0],
                [0, 1, 0]
            ]
        ],
        color: '#ff8000'
    }
};

// Array of tetromino types for random generation
const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Wall kick data for SRS (Super Rotation System)
const WALL_KICKS = {
    'JLSTZ': {
        '0->1': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '1->0': [[1, 0], [1, -1], [0, 2], [1, 2]],
        '1->2': [[1, 0], [1, -1], [0, 2], [1, 2]],
        '2->1': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '2->3': [[1, 0], [1, 1], [0, -2], [1, -2]],
        '3->2': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '3->0': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '0->3': [[1, 0], [1, 1], [0, -2], [1, -2]]
    },
    'I': {
        '0->1': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
        '1->0': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
        '1->2': [[-1, 0], [2, 0], [-1, 2], [2, -1]],
        '2->1': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
        '2->3': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
        '3->2': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
        '3->0': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
        '0->3': [[-1, 0], [2, 0], [-1, 2], [2, -1]]
    }
};

// Scoring system
const SCORING = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2
};

// Level progression
const LEVEL_SPEEDS = [
    800, 717, 633, 550, 467, 383, 300, 217, 133, 100,
    83, 83, 83, 67, 67, 67, 50, 50, 50, 33,
    33, 33, 33, 33, 33, 33, 33, 33, 33, 17
];

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Colors for empty cells and grid
const COLORS = {
    EMPTY: '#1a202c',
    GRID: '#2d3748',
    GHOST: 'rgba(255, 255, 255, 0.3)'
};

// Utility function to get a random tetromino type
function getRandomTetrominoType() {
    return TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
}

// Utility function to create a bag of tetrominos (7-bag system)
function createTetrominoBag() {
    const bag = [...TETROMINO_TYPES];
    // Fisher-Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

// Utility function to get wall kick data
function getWallKickData(type, fromRotation, toRotation) {
    const key = `${fromRotation}->${toRotation}`;
    if (type === 'I') {
        return WALL_KICKS.I[key] || [];
    } else if (type === 'O') {
        return []; // O piece doesn't need wall kicks
    } else {
        return WALL_KICKS.JLSTZ[key] || [];
    }
}

// Utility function to get level speed
function getLevelSpeed(level) {
    if (level >= LEVEL_SPEEDS.length) {
        return LEVEL_SPEEDS[LEVEL_SPEEDS.length - 1];
    }
    return LEVEL_SPEEDS[level - 1];
}
