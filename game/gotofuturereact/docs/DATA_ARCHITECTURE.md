# Data-Driven Architecture Guide

## Overview

GoToFuture now uses a **data-driven architecture** that separates game content (data) from game logic (code). This provides several advantages:

- ✅ **Designer-Friendly**: Non-programmers can modify game balance
- ✅ **Hot Updates**: Change game data without rebuilding
- ✅ **Type Safety**: Zod schema validation ensures data integrity
- ✅ **Remote Loading**: Support for CDN-hosted game data
- ✅ **Version Control**: Track data changes separately from code

## Architecture Components

### 1. JSON Data Files (`src/data/*.json`)

Game content is stored in separate JSON files:

```
src/data/
├── eras.json          # Game eras and progression
├── resources.json     # All game resources
├── buildings.json     # Buildings and their properties
├── achievements.json  # Achievement definitions
└── schema.ts         # Zod validation schemas
```

### 2. Data Validation (`src/data/schema.ts`)

Uses Zod schemas to ensure data integrity:

```typescript
import { validateGameData } from './schema';

// Validates structure and types at runtime
const validData = validateGameData(rawData);
```

### 3. Data Loader (`src/data/dataLoader.ts`)

Handles loading data with fallbacks:

```typescript
import { getGameData } from './dataLoader';

// Loads from remote source with local fallback
const gameData = await getGameData();
```

## Data File Formats

### Eras (`eras.json`)
```json
{
  "stone_age": {
    "id": "stone_age",
    "name": "石器时代",
    "description": "人类文明的起点",
    "icon": "🗿",
    "unlockRequirements": {},
    "advanceRequirements": {
      "population": 1000,
      "buildings": { "simple_hut": 10 }
    },
    "techMultipliers": {
      "population_cap": 1.0,
      "food_production": 1.0
    }
  }
}
```

### Resources (`resources.json`)
```json
{
  "wood": {
    "id": "wood",
    "name": "木材",
    "icon": "🪵",
    "category": "basic",
    "baseValue": 10,
    "maxValue": 1000000000000,
    "growthRate": 0,
    "description": "建造和燃料的基础材料"
  }
}
```

### Buildings (`buildings.json`)
```json
{
  "gathering_hut": {
    "id": "gathering_hut",
    "name": "采集小屋",
    "icon": "🏠",
    "category": "basic",
    "era": "stone_age",
    "description": "派遣工人采集木材和食物",
    "baseCost": { "wood": 25 },
    "costMultiplier": 1.15,
    "maxCount": 1000000,
    "unlockRequirements": {
      "resources": { "wood": 15 }
    },
    "production": { "wood": 2, "food": 1 },
    "consumption": {},
    "workerCapacity": 2,
    "workerRequirement": 1
  }
}
```

## Workflow Options

### Option 1: Direct JSON Editing (Current)

**Pros**: Simple, immediate, version controlled
**Cons**: Manual editing, potential for errors

1. Edit JSON files directly in `src/data/`
2. Run `npm run validate-data` to check format
3. Test in development: `npm run dev`

### Option 2: Google Sheets Integration

**Pros**: Designer-friendly, collaborative, formulas
**Cons**: Requires setup, export step

1. **Setup**: Create Google Sheets with proper structure
2. **Configure**: Set environment variables:
   ```bash
   GOOGLE_SHEETS_API_KEY=your_api_key
   GOOGLE_SHEETS_ID=your_sheet_id
   ```
3. **Export**: Run `npm run export-sheets`
4. **Deploy**: Commit generated JSON files

### Option 3: Remote Data Loading

**Pros**: Hot updates, A/B testing, no deployments
**Cons**: Network dependency, caching complexity

1. **Host Data**: Upload JSON files to CDN
2. **Configure**: Set environment variables:
   ```bash
   VITE_DATA_URL=https://cdn.example.com/gamedata
   VITE_DATA_VERSION=v1
   ```
3. **Deploy**: Game loads remote data with local fallback

## Development Workflow

### Adding New Content

1. **Add to JSON**: Edit appropriate JSON file
2. **Validate**: Run `npm run validate-data`
3. **Test**: Start dev server and verify changes
4. **Commit**: Version control the JSON changes

### Balancing Changes

1. **Identify Issue**: Gameplay feedback or analytics
2. **Modify Values**: Edit JSON files or spreadsheet
3. **A/B Test**: Deploy different versions to test
4. **Measure**: Collect data on player behavior
5. **Finalize**: Apply winning configuration

### Schema Updates

When adding new fields:

1. **Update Schema**: Modify `src/data/schema.ts`
2. **Update Types**: Modify `src/types/game.ts` if needed
3. **Update Data**: Add new fields to JSON files
4. **Update Logic**: Implement new field handling in game code

## Remote Data Setup

### CDN Structure
```
https://cdn.example.com/gamedata/
├── v1/
│   ├── eras.json
│   ├── resources.json
│   ├── buildings.json
│   └── achievements.json
└── v2/
    ├── eras.json
    ├── resources.json
    ├── buildings.json
    └── achievements.json
```

### Environment Configuration
```bash
# .env.production
VITE_DATA_URL=https://cdn.example.com/gamedata
VITE_DATA_VERSION=v1

# .env.development  
VITE_DATA_URL=http://localhost:3001/data
VITE_DATA_VERSION=dev
```

## Best Practices

### Data Design
- **Consistent IDs**: Use snake_case for all IDs
- **Meaningful Names**: Clear, descriptive names for players
- **Balanced Values**: Test progression curves carefully
- **Future-Proof**: Design for extensibility

### Performance
- **Reasonable Sizes**: Keep JSON files under 1MB each
- **Caching**: Use appropriate cache headers
- **Compression**: Enable gzip/brotli on server
- **Lazy Loading**: Load data sections as needed

### Validation
- **Always Validate**: Never skip schema validation
- **Fail Fast**: Catch data errors early in development
- **Meaningful Errors**: Provide clear error messages
- **Test Coverage**: Include data validation in tests

### Version Control
- **Separate Commits**: Data changes separate from code
- **Clear Messages**: Describe balance changes clearly
- **Branching**: Use feature branches for major changes
- **Rollback Plan**: Keep previous versions accessible

## Troubleshooting

### Common Issues

**Data Validation Fails**
- Check JSON syntax with online validator
- Verify all required fields are present
- Ensure data types match schema

**Remote Loading Fails**
- Check network connectivity
- Verify CDN URLs are accessible
- Check CORS headers on remote server

**Performance Issues**
- Monitor data file sizes
- Check network loading times
- Optimize JSON structure

### Debug Tools

```typescript
// Check data loading status
import { getDataStatus } from './dataLoader';
console.log(getDataStatus());

// Force refresh remote data
import { getGameData } from './dataLoader';
const freshData = await getGameData(true);

// Clear cache for testing
import { clearDataCache } from './dataLoader';
clearDataCache();
```

## Migration Guide

### From TypeScript to JSON

1. **Extract Data**: Copy data objects from TS files
2. **Convert Format**: Transform to JSON structure
3. **Add Validation**: Create Zod schemas
4. **Update Imports**: Change to use data loader
5. **Test Thoroughly**: Verify all functionality works

This data-driven architecture provides a solid foundation for scalable game content management while maintaining type safety and developer experience.
