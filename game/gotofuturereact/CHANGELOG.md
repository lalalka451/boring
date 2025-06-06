# Changelog

All notable changes to the GoToFuture React project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-XX

### 🎉 Major Release: Data-Driven Architecture + Worker Management System

### Added
- **Worker Management System**
  - Visual worker assignment interface with +/- buttons
  - Real-time efficiency calculation based on worker allocation
  - Per-building-instance efficiency calculation
  - Worker capacity and requirement system
  - Available workers display in sidebar

- **Data-Driven Architecture**
  - JSON configuration files for all game content
  - Zod schema validation for runtime data integrity
  - Remote data loading support with local fallback
  - Google Sheets integration for content management
  - Hot reload support for data changes

- **New Buildings**
  - Quarry: Unlocks stone resource
  - Herb Garden: Population growth bonus
  - Bronze Workshop: Metal processing
  - Copper/Tin Mines: Raw material extraction

- **Enhanced Resource System**
  - Progressive resource unlocking (stone unlocked by Quarry)
  - 17 total resource types across all eras
  - Complex production chains with worker dependencies

- **Developer Tools**
  - `npm run export-sheets`: Export data from Google Sheets
  - `npm run validate-data`: Validate JSON data integrity
  - `npm run type-check`: TypeScript type checking
  - Comprehensive error handling and debugging tools

### Changed
- **Building Efficiency Algorithm**
  - Fixed efficiency calculation for multiple building instances
  - Workers now properly distribute across building instances
  - Efficiency = (Average Workers per Building) / (Required Workers per Building)

- **Game Progression**
  - More logical resource unlock sequence
  - Stone requires Quarry construction to unlock
  - Balanced building costs and requirements
  - Improved early game pacing

- **User Interface**
  - Enhanced building cards with worker management controls
  - Real-time production rate display
  - Improved visual feedback for worker assignment
  - Better mobile responsiveness

- **Technical Architecture**
  - Migrated from TypeScript data to JSON configuration
  - Added runtime validation with Zod schemas
  - Improved state management with worker tracking
  - Enhanced error handling and recovery

### Fixed
- **Worker Efficiency Calculation**
  - Fixed incorrect efficiency calculation for multiple buildings
  - Resolved production rate discrepancies
  - Corrected worker assignment logic

- **Resource Production**
  - Fixed buildings producing resources without workers
  - Corrected per-second calculation accuracy
  - Resolved BigInt conversion issues

- **Type Safety**
  - Fixed TypeScript compilation errors
  - Added proper type assertions for JSON imports
  - Resolved runtime type validation issues

- **UI/UX Issues**
  - Fixed building unlock progression
  - Improved button states and disabled conditions
  - Enhanced visual feedback for user actions

### Technical Details

#### New Dependencies
- `zod@3.22.4`: Runtime schema validation
- Enhanced TypeScript configuration for JSON imports

#### Architecture Changes
- **Data Layer**: JSON files with Zod validation
- **State Management**: Enhanced Zustand store with worker logic
- **Component Architecture**: Improved separation of concerns
- **Build Process**: Added data validation to build pipeline

#### Performance Improvements
- Optimized efficiency calculations
- Reduced unnecessary re-renders
- Improved BigInt mathematical operations
- Enhanced memory management

#### Breaking Changes
- Game data structure changed from TypeScript to JSON
- Worker assignment API added to game store
- Building efficiency calculation algorithm updated
- Save file format updated (automatic migration included)

### Documentation
- Updated all documentation files to reflect new architecture
- Added comprehensive API documentation for worker management
- Enhanced deployment guide with new environment variables
- Created data architecture guide for content management

### Migration Guide
Existing save files will be automatically migrated to the new format. No user action required.

For developers:
1. Update imports from `gameData.ts` to use new JSON structure
2. Use new worker management APIs for building efficiency
3. Update any custom building logic to use new efficiency calculation

---

## [1.0.0] - 2024-12-XX

### Initial Release
- Complete incremental/idle civilization building game
- 7 technological eras from Stone Age to Multidimensional Age
- 17 resource types with complex production chains
- 20+ unique buildings with various functions
- Mini-games: Fishing, Parking, Slot Machine
- Achievement system with 8+ achievements
- Prestige system with permanent bonuses
- React 18 + TypeScript + Zustand architecture
- BigInt support for extremely large numbers
- Mobile-responsive design
- Automatic save/load functionality

---

## Version Numbering

- **Major** (X.0.0): Breaking changes, major feature additions
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, small improvements

## Contributing

When contributing, please:
1. Update this changelog with your changes
2. Follow the format established above
3. Include both user-facing and technical changes
4. Reference issue numbers where applicable
