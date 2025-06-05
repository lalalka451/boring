# T-Rex Dinosaur Game - Chrome Dino Runner

A faithful recreation of the classic Chrome offline dinosaur game, built with HTML5 Canvas and JavaScript.

## 🎮 Game Features

- **Classic Gameplay**: Jump and duck to avoid obstacles
- **Progressive Difficulty**: Game speed increases over time
- **Score System**: Earn points for surviving longer
- **High Score Tracking**: Persistent high score storage
- **Responsive Design**: Works on desktop and mobile devices
- **Touch Controls**: Mobile-friendly touch interface
- **Smooth Animations**: Fluid character and obstacle animations

## 🕹️ Controls

### Desktop
- **SPACE** - Jump
- **DOWN ARROW** - Duck
- **R** - Restart game (when game over)

### Mobile
- **TAP** - Jump
- **TOUCH & HOLD LOWER HALF** - Duck

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Click "Start Game" or press SPACE to begin
3. Avoid cacti and birds by jumping and ducking
4. Try to beat your high score!

## 📁 Project Structure

```
t-rex-game/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Game styling
├── js/
│   ├── main.js         # Entry point and initialization
│   ├── game.js         # Main game logic and state management
│   ├── player.js       # Player (T-Rex) class
│   ├── obstacles.js    # Obstacle classes (cacti, birds)
│   └── background.js   # Background and environment
├── assets/
│   └── images/         # Game images (if any)
└── README.md           # This file
```

## 🎯 Game Mechanics

### Player
- **Jumping**: T-Rex can jump to avoid ground obstacles
- **Ducking**: T-Rex can duck to avoid flying obstacles
- **Animation**: Running animation with alternating leg positions

### Obstacles
- **Cacti**: Ground-based obstacles that require jumping
- **Birds**: Flying obstacles at various heights that require ducking or jumping

### Scoring
- **Points**: Earn 10 points for each obstacle avoided
- **Speed**: Game speed gradually increases for added difficulty
- **High Score**: Best score is saved locally in browser storage

### Background
- **Parallax Scrolling**: Mountains, clouds, and ground move at different speeds
- **Dynamic Elements**: Procedurally generated ground details and clouds
- **Sky Gradient**: Beautiful sky background with gradient effect

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas**: For game rendering
- **JavaScript ES6+**: Game logic and classes
- **CSS3**: Styling and responsive design
- **Local Storage**: High score persistence

### Performance Features
- **RequestAnimationFrame**: Smooth 60fps animation
- **Efficient Rendering**: Optimized drawing operations
- **Memory Management**: Proper cleanup of off-screen objects
- **FPS Monitoring**: Built-in performance tracking (debug mode)

## 🎨 Customization

### Modifying Game Settings
You can adjust various game parameters in the `Game` class constructor:

```javascript
// In js/game.js
this.gameSpeed = 2;           // Initial game speed
this.gravity = 0.5;           // Gravity strength
this.jumpPower = 12;          // Jump height
this.obstacleInterval = 2000; // Time between obstacles (ms)
```

### Adding New Obstacles
Create new obstacle types by extending the `Obstacle` class:

```javascript
// In js/obstacles.js
class NewObstacle extends Obstacle {
    constructor(x, canvasHeight) {
        super(x, 'newType', canvasHeight);
        // Custom properties
    }
    
    render(ctx) {
        // Custom rendering logic
    }
}
```

## 🐛 Debug Mode

Enable debug mode by adding `?debug=true` to the URL:
```
file:///path/to/index.html?debug=true
```

Debug features:
- FPS counter in console
- Access to `window.debugGame` object with utility functions

### Debug Commands
Open browser console and use:
```javascript
debugGame.getGameState()     // Get current game state
debugGame.getScore()         // Get current score
debugGame.setGameSpeed(5)    // Set custom game speed
debugGame.clearObstacles()   // Remove all obstacles
debugGame.addScore(100)      // Add points to score
```

## 🌟 Future Enhancements

- [ ] Sound effects and background music
- [ ] Power-ups and special abilities
- [ ] Different dinosaur characters
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] Multiplayer mode
- [ ] Leaderboard system

## 📱 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with Canvas support

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Enjoy playing the T-Rex Dinosaur Game!** 🦕
