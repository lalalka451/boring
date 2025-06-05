# BBTAN Clone - Break Brick Game

A simple HTML5 Canvas implementation of the popular BBTAN (Break Brick) mobile game.

## How to Play

1. **Aim**: Drag from the bottom of the screen to aim your ball
2. **Shoot**: Release to fire the ball in the aimed direction
3. **Break Bricks**: Hit bricks to reduce their number. When a brick reaches 0, it disappears
4. **Survive**: Each round, bricks move down one row and a new row appears at the top
5. **Game Over**: When bricks reach the bottom of the screen

## Features

- **Physics-based ball movement** with wall bouncing
- **Colorful bricks** with hit counters
- **Progressive difficulty** - brick strength increases each round
- **Responsive controls** - works on both desktop and mobile
- **Clean UI** with round counter

## Controls

- **Mouse/Touch**: Drag to aim, release to shoot
- **Aim Line**: Visual indicator shows ball trajectory

## Technical Details

- Built with HTML5 Canvas and vanilla JavaScript
- Uses `requestAnimationFrame` for smooth 60 FPS gameplay
- Pointer events for cross-platform input handling
- Simple AABB collision detection
- Tailwind CSS for styling

## File Structure

```
bbtan/
├── index.html          # Complete game in a single file
└── README.md          # This documentation
```

## Future Enhancements

### Core Gameplay
- [ ] Multiple balls per shot (collect balls as power-ups)
- [ ] Ball collection and launch delay for machine-gun effect
- [ ] Landing spot indicator (white circle)
- [ ] Power-ups: extra balls, lasers, bombs

### Polish
- [ ] Sound effects for ball bouncing and brick breaking
- [ ] Particle effects for brick destruction
- [ ] Screen shake on impact
- [ ] Score system and high score persistence
- [ ] Pause/resume functionality

### Mobile Experience
- [ ] Haptic feedback (vibration)
- [ ] Full-screen mode
- [ ] PWA capabilities for installation
- [ ] Orientation lock

### Difficulty & Balance
- [ ] Faster brick HP scaling
- [ ] Variable brick layouts
- [ ] Special brick types
- [ ] Boss levels

## Getting Started

Simply open `index.html` in any modern web browser. No build process or dependencies required!

## License

This is a learning project inspired by BBTAN by 111%. For educational purposes only.
