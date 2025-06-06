# Tetris - Classic Block Puzzle Game

A faithful recreation of the classic Tetris game with modern features, built with HTML5 Canvas and JavaScript.

## 🎮 Game Features

### Core Gameplay
- **7 Classic Tetrominos**: I, O, T, S, Z, J, L pieces with authentic colors
- **SRS Rotation System**: Super Rotation System with wall kicks
- **Line Clearing**: Clear 1-4 lines simultaneously for points
- **Progressive Difficulty**: Speed increases every 10 lines
- **Ghost Piece**: Preview where your piece will land

### Advanced Features
- **Hold System**: Hold a piece for later use (C key)
- **Next Piece Preview**: See the next piece coming
- **7-Bag Random Generator**: Ensures fair piece distribution
- **Lock Delay**: Extra time to move pieces when they hit the bottom
- **Soft/Hard Drop**: Control piece descent speed
- **Score System**: Points for lines, drops, and level multipliers

### Modern Enhancements
- **Responsive Design**: Works on desktop and mobile
- **Touch Controls**: Mobile-friendly swipe and tap controls
- **Statistics Tracking**: Count of each piece type used
- **High Score Persistence**: Saves your best score locally
- **Smooth Animations**: Line clear effects and visual feedback
- **Pause/Resume**: Pause functionality with P key

## 🕹️ Controls

### Desktop Controls
- **←→** - Move piece left/right
- **↓** - Soft drop (faster descent)
- **↑** - Rotate piece clockwise
- **SPACE** - Hard drop (instant drop)
- **C** - Hold current piece
- **P** - Pause/Resume game

### Mobile Controls
- **TAP** - Rotate piece
- **SWIPE LEFT/RIGHT** - Move piece
- **SWIPE DOWN** - Soft drop
- **SWIPE UP** - Hard drop
- **Mobile Buttons** - On-screen controls for all actions

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Click "Start Game" or press SPACE to begin
3. Use arrow keys to move and rotate pieces
4. Clear lines by filling complete rows
5. Try to achieve the highest score possible!

## 📁 Project Structure

```
tetris/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Game styling and responsive design
├── js/
│   ├── main.js            # Entry point and initialization
│   ├── game.js            # Main game logic and state management
│   ├── board.js           # Game board and rendering
│   ├── piece.js           # Tetromino pieces and movement
│   └── tetrominos.js      # Piece definitions and constants
├── assets/
│   └── images/            # Game assets
└── README.md              # This file
```

## 🎯 Game Mechanics

### Scoring System
- **Single Line**: 100 × level
- **Double Lines**: 300 × level  
- **Triple Lines**: 500 × level
- **Tetris (4 lines)**: 800 × level
- **Soft Drop**: 1 point per cell
- **Hard Drop**: 2 points per cell

### Level Progression
- Start at Level 1
- Advance one level every 10 lines cleared
- Higher levels = faster piece descent
- Maximum level affects drop speed

### Piece Statistics
Track usage of each tetromino type:
- I-Piece (Cyan) - The line piece
- O-Piece (Yellow) - The square
- T-Piece (Purple) - The T-shape
- S-Piece (Green) - The S-shape
- Z-Piece (Red) - The Z-shape  
- J-Piece (Blue) - The J-shape
- L-Piece (Orange) - The L-shape

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas**: High-performance 2D rendering
- **JavaScript ES6+**: Modern JavaScript with classes
- **CSS3**: Responsive design and animations
- **Local Storage**: High score and settings persistence

### Performance Features
- **RequestAnimationFrame**: Smooth 60fps gameplay
- **Efficient Rendering**: Optimized canvas drawing
- **Memory Management**: Proper cleanup and object pooling
- **Input Handling**: Responsive key repeat and timing

### Game Systems
- **SRS (Super Rotation System)**: Industry-standard rotation
- **7-Bag Randomizer**: Fair piece distribution
- **Lock Delay System**: Allows piece adjustment on landing
- **Wall Kick System**: Smart rotation collision handling

## 🎨 Customization

### Modifying Game Settings
Adjust game parameters in `js/tetrominos.js`:

```javascript
// Scoring values
const SCORING = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800
};

// Level speeds (milliseconds between drops)
const LEVEL_SPEEDS = [800, 717, 633, 550, ...];
```

### Adding New Features
The modular structure makes it easy to add features:

1. **New Piece Types**: Add to `TETROMINOS` object
2. **Custom Scoring**: Modify `SCORING` constants
3. **Visual Effects**: Extend rendering methods
4. **Game Modes**: Add new game states

## 🐛 Debug Mode

Enable debug mode by adding `?debug=true` to the URL:
```
file:///path/to/index.html?debug=true
```

### Debug Features
- FPS counter in console
- Access to `debugTetris` object
- Performance monitoring
- Game state inspection

### Debug Commands
```javascript
debugTetris.getGameState()      // Get current state
debugTetris.addScore(1000)      // Add points
debugTetris.setLevel(5)         // Change level
debugTetris.spawnPiece('I')     // Spawn specific piece
debugTetris.clearBoard()        // Clear the board
```

## 📱 Mobile Optimization

### Responsive Features
- Adaptive layout for different screen sizes
- Touch-friendly button controls
- Swipe gesture recognition
- Optimized canvas scaling

### Touch Gestures
- **Single Tap**: Rotate piece
- **Horizontal Swipe**: Move left/right
- **Downward Swipe**: Soft drop
- **Upward Swipe**: Hard drop

## 🌟 Future Enhancements

- [ ] Sound effects and background music
- [ ] Multiple game modes (Sprint, Ultra, etc.)
- [ ] Online leaderboards
- [ ] Multiplayer support
- [ ] Custom themes and skins
- [ ] Achievement system
- [ ] Replay system
- [ ] AI opponent mode

## 📄 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with Canvas support

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing Tetris!** 🧩
