# 🍭 Candy Crush Game

A fully functional Candy Crush-style match-3 puzzle game built with HTML, CSS, and JavaScript.

## 🎮 How to Play

1. **Objective**: Match 3 or more candies of the same type to clear them and earn points
2. **Controls**: Click on a candy, then click on an adjacent candy to swap them
3. **Goal**: Reach the target score within the given number of moves
4. **Progression**: Complete levels to unlock new challenges with higher target scores

## ✨ Features

### Core Gameplay
- **8x8 Grid**: Classic match-3 game board
- **6 Candy Types**: Colorful candies with unique emojis (🍭, 🍬, 🧁, 🍪, 🎂, 🍩)
- **Match Detection**: Automatic detection of horizontal and vertical matches of 3+ candies
- **Gravity System**: Candies fall down when matches are cleared
- **Cascade Matching**: Chain reactions when new matches form after gravity

### Game Mechanics
- **Move Limit**: 30 moves per level
- **Scoring System**: 
  - Basic match: 10 points per candy × level multiplier
  - Power-up usage: Bonus points
  - Level completion bonus: 50 points per remaining move
- **Level Progression**: Target score increases by 50% each level
- **Hint System**: Shows possible moves when you're stuck

### Power-ups
- **💣 Bomb**: Clears a 3×3 area (3 uses per level, +1 each level)
- **🌈 Rainbow**: Removes all candies of a random type (2 uses per level, +1 each level)

### Visual Effects
- **Smooth Animations**: Candy swapping, falling, and matching animations
- **Particle Effects**: Celebratory particles when matches are made
- **Hover Effects**: Interactive candy highlighting
- **Responsive Design**: Works on desktop and mobile devices

## 🎯 Game Rules

1. **Valid Moves**: You can only swap adjacent candies (horizontally or vertically)
2. **Match Requirements**: Minimum 3 candies of the same type in a row or column
3. **No Match = No Move**: If a swap doesn't create a match, candies return to original positions
4. **Automatic Processing**: Matches are automatically detected and cleared
5. **Gravity**: New candies fall from the top to fill empty spaces

## 🏆 Winning & Losing

### Win Conditions
- Reach the target score within the move limit
- Advance to the next level with increased difficulty

### Lose Conditions
- Run out of moves before reaching the target score
- Game over screen appears with final score

## 🎨 Technical Features

### HTML Structure
- Semantic HTML5 markup
- Accessible game interface
- Modal dialogs for game states

### CSS Styling
- Modern gradient backgrounds
- Smooth CSS animations and transitions
- Responsive grid layout
- Mobile-friendly design

### JavaScript Implementation
- Object-oriented game architecture
- Efficient match detection algorithms
- Smooth animation system
- Event-driven user interactions

## 🚀 Getting Started

1. Open `index.html` in a web browser
2. The game will automatically initialize
3. Start playing by clicking on candies to make matches
4. Use the hint button if you need help finding moves
5. Try to reach the target score before running out of moves!

## 🎮 Controls

- **Mouse Click**: Select and swap candies
- **Restart Button**: Start a new game
- **Hint Button**: Highlight a possible move
- **Power-up Buttons**: Activate special abilities

## 🔧 Customization

The game can be easily customized by modifying:

- **Candy Types**: Change emojis and colors in the `candyTypes` and `candyColors` arrays
- **Board Size**: Modify `boardSize` property (default: 8×8)
- **Difficulty**: Adjust `targetScore`, `moves`, and scoring multipliers
- **Power-ups**: Add new power-up types and effects
- **Styling**: Customize colors, animations, and layout in `style.css`

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎉 Enjoy Playing!

Have fun matching candies and trying to beat your high score! The game gets progressively more challenging as you advance through the levels.
