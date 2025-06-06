# GoToFuture - API Documentation

## Game Store API

### State Management

#### Core State
```typescript
interface GameState {
  version: number;
  playerName: string;
  eraId: string;
  playthrough: number;
  globalMultiplier: number;
  totalPlaytime: number;
  lastSave: number;
  lastTick: number;
  resources: Record<string, ResourceSnapshot>;
  buildings: Record<string, BuildingInstance>;
  achievements: Set<string>;
  unlockedBuildings: Set<string>;
  unlockedResources: Set<string>;
  statistics: GameStatistics;
}

interface BuildingInstance {
  count: bigint;
  workers: bigint;  // New: Worker assignment
}
```

#### Resource Management
```typescript
// Get current resource amount
const wood = useGameStore(state => state.resources.wood.amount);

// Check if player can afford a cost
const canAfford = useGameStore(state => state.canAfford({ wood: 100, stone: 50 }));

// Format large numbers for display
const formatted = useGameStore(state => state.formatNumber(1000000n)); // "1.00M"
```

#### Building System
```typescript
// Build a building
const buildBuilding = useGameStore(state => state.buildBuilding);
buildBuilding('gathering_hut', 1); // Returns boolean success

// Click a clickable building
const clickBuilding = useGameStore(state => state.clickBuilding);
clickBuilding('tree');

// Check if building can be built
const canBuild = useGameStore(state => state.canBuildBuilding('gathering_hut', 1));

// Calculate building cost
const cost = useGameStore(state => state.calculateBuildingCost('gathering_hut', 1));
```

#### Worker Management (New)
```typescript
// Assign workers to a building
const assignWorker = useGameStore(state => state.assignWorker);
assignWorker('gathering_hut', 1); // Assign 1 worker

// Unassign workers from a building
const unassignWorker = useGameStore(state => state.unassignWorker);
unassignWorker('gathering_hut', 1); // Remove 1 worker

// Get total assigned workers
const getTotalAssignedWorkers = useGameStore(state => state.getTotalAssignedWorkers);
const totalWorkers = getTotalAssignedWorkers(); // Returns number

// Get building efficiency
const getBuildingEfficiency = useGameStore(state => state.getBuildingEfficiency);
const efficiency = getBuildingEfficiency('gathering_hut'); // Returns 0.0 to 1.0
```

#### Game Actions
```typescript
// Manual save
const saveGame = useGameStore(state => state.saveGame);
saveGame();

// Reset game
const resetGame = useGameStore(state => state.resetGame);
resetGame(true); // Soft reset (keep prestige)
resetGame(false); // Hard reset (lose everything)

// Prestige
const prestige = useGameStore(state => state.prestige);
if (useGameStore.getState().canPrestige()) {
  prestige();
}
```

### UI State Management
```typescript
// Tab navigation
const currentTab = useGameStore(state => state.currentTab);
const setCurrentTab = useGameStore(state => state.setCurrentTab);
setCurrentTab('buildings');

// Player name
const playerName = useGameStore(state => state.playerName);
const setPlayerName = useGameStore(state => state.setPlayerName);
setPlayerName('NewName');
```

## Component API

### BuildingCard Component
```typescript
interface BuildingCardProps {
  building: BuildingData;
}

// Usage
<BuildingCard building={gameData.buildings.gathering_hut} />
```

### Modal Components
```typescript
interface ResetModalProps {
  onClose: () => void;
}

// Usage
{showResetModal && <ResetModal onClose={() => setShowResetModal(false)} />}
```

### Mini-Game Components
```typescript
interface MiniGameProps {
  onClose: () => void;
}

// Usage
<FishingGame onClose={() => setActiveGame(null)} />
<ParkingGame onClose={() => setActiveGame(null)} />
<SlotMachine onClose={() => setActiveGame(null)} />
```

## Data-Driven Architecture API

### Data Loading
```typescript
// Load game data with validation
import { getGameData } from '../data/dataLoader';
const gameData = await getGameData(); // With caching and remote support

// Validate data manually
import { validateGameData } from '../data/schema';
const validatedData = validateGameData(rawData);

// Access static data (synchronous)
import { gameData } from '../data/gameData';
const currentEra = gameData.eras[eraId];
```

### Data Status
```typescript
// Check data loading status
import { getDataStatus } from '../data/dataLoader';
const status = getDataStatus();
// Returns: { hasCachedData, lastLoadTime, cacheAge, isStale }

// Force refresh remote data
const freshData = await getGameData(true);

// Clear cache for testing
import { clearDataCache } from '../data/dataLoader';
clearDataCache();
```

## Game Data API

### Era System
```typescript
interface EraData {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockRequirements: Requirements;
  advanceRequirements: Requirements;
  techMultipliers: TechMultipliers;
}

// Access era data
const currentEra = gameData.eras[eraId];
```

### Resource System
```typescript
interface ResourceData {
  id: string;
  name: string;
  icon: string;
  category: string;
  baseValue: number;
  maxValue: number;
  growthRate: number;
  unlockEra?: string;
  recipe?: Record<string, number>;
  description: string;
}

// Access resource data
const woodData = gameData.resources.wood;
```

### Building System
```typescript
interface BuildingData {
  id: string;
  name: string;
  icon: string;
  category: string;
  era: string;
  description: string;
  baseCost: Record<string, number>;
  costMultiplier: number;
  maxCount: number;
  unlockRequirements: Requirements;
  production?: Record<string, number>;
  consumption?: Record<string, number>;
  workerCapacity?: number;        // Maximum workers per building
  workerRequirement?: number;     // Optimal workers per building
  populationCapacity?: number;
  clickable?: boolean;
  clickProduction?: Record<string, number>;
  specialEffect?: string;         // Special effects like "unlock_resource"
}

// Access building data
const treeData = gameData.buildings.tree;

// Worker-related building properties
const gatheringHut = gameData.buildings.gathering_hut;
console.log(gatheringHut.workerCapacity);    // 2 (max workers per building)
console.log(gatheringHut.workerRequirement); // 1 (optimal workers per building)
```

## Utility Functions

### Number Formatting
```typescript
// Format BigInt numbers with suffixes
formatNumber(1000n) // "1,000"
formatNumber(1000000n) // "1.00M"
formatNumber(1000000000n) // "1.00B"
```

### Requirement Checking
```typescript
// Check if requirements are met
const meetsRequirements = (requirements: Requirements) => boolean;

// Example requirements
const requirements = {
  era: 'bronze_age',
  resources: { wood: 100, stone: 50 },
  buildings: { gathering_hut: 5 },
  population: 100
};
```

### Cost Calculation
```typescript
// Calculate building cost with exponential scaling
const calculateBuildingCost = (buildingId: string, quantity: number) => {
  // Returns Record<string, number> of resource costs
};
```

## Event System

### Game Events
```typescript
// Events are logged to the activity log
addLogEntry('🌳 点击人树获得木材');
addLogEntry('🏗️ 建造了采集小屋');
addLogEntry('🎉 进入新时代: 青铜时代 🔥');
```

### State Subscriptions
```typescript
// Subscribe to specific state changes
const unsubscribe = useGameStore.subscribe(
  (state) => state.resources.wood.amount,
  (woodAmount) => {
    console.log('Wood amount changed:', woodAmount);
  }
);

// Cleanup
unsubscribe();
```

## Persistence API

### Save Data Structure
```typescript
interface SaveData {
  version: number;
  playerName: string;
  eraId: string;
  playthrough: number;
  globalMultiplier: number;
  totalPlaytime: number;
  lastSave: number;
  lastTick: number;
  resources: SerializedResources;
  buildings: SerializedBuildings;
  achievements: string[];
  unlockedBuildings: string[];
  unlockedResources: string[];
  statistics: GameStatistics;
}
```

### Manual Save/Load
```typescript
// Save game manually
useGameStore.getState().saveGame();

// Load is automatic on page load via Zustand persist

// Clear save data
localStorage.removeItem('gotofuture-game-state');
```

## Performance API

### Game Loop Control
```typescript
// Game tick runs every 250ms
const TICK_INTERVAL = 250;

// Manual tick (for testing)
useGameStore.getState().tick();
```

### Optimization Hooks
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateComplexValue(gameState);
}, [gameState.relevantProperty]);

// Stable callback references
const handleClick = useCallback(() => {
  buildBuilding('gathering_hut', 1);
}, [buildBuilding]);
```

## Error Handling

### Common Error Patterns
```typescript
// Building construction errors
try {
  const success = buildBuilding('invalid_building', 1);
  if (!success) {
    console.warn('Failed to build building');
  }
} catch (error) {
  console.error('Building error:', error);
}

// Resource validation
const isValidResource = (resourceId: string) => {
  return resourceId in gameData.resources;
};
```

### Debug Utilities
```typescript
// Development mode helpers
if (process.env.NODE_ENV === 'development') {
  // Add debug methods to window
  window.gameDebug = {
    addResource: (id: string, amount: number) => {
      const state = useGameStore.getState();
      // Add resource logic
    },
    unlockAll: () => {
      // Unlock all buildings and resources
    }
  };
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Compatibility**: React 18+, TypeScript 5+
