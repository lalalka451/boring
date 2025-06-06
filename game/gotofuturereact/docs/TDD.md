# GoToFuture - Technical Design Document (TDD)

## 1. Technical Overview

### 1.1 Technology Stack
- **Frontend Framework**: React 18.2.0
- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **State Management**: Zustand 4.4.7
- **Data Validation**: Zod 3.22.4
- **Styling**: CSS3 with Grid/Flexbox
- **Icons**: Unicode Emojis
- **Package Manager**: npm

### 1.2 Architecture Pattern
- **Pattern**: Data-Driven Component Architecture with Centralized State
- **Data Flow**: JSON Config → Validation → Zustand → Components
- **Persistence**: Browser localStorage via Zustand persist
- **Modularity**: Feature-based component organization
- **Data Management**: JSON files with Zod schema validation

### 1.3 Browser Requirements
- **JavaScript**: ES2020+ (BigInt support required)
- **CSS**: Grid and Flexbox support
- **Storage**: localStorage (minimum 5MB)
- **Performance**: 60 FPS rendering capability

## 2. System Architecture

### 2.1 Project Structure
```
src/
├── components/           # React components
│   ├── tabs/            # Tab-specific components
│   ├── modals/          # Modal dialogs
│   ├── minigames/       # Mini-game components
│   ├── BuildingCard.tsx # Building display with worker management
│   ├── Header.tsx       # Top navigation
│   ├── Sidebar.tsx      # Resource display and worker info
│   ├── MainContent.tsx  # Main game area
│   └── ActivityLog.tsx  # Event logging
├── store/               # State management
│   └── gameStore.ts     # Zustand store with worker logic
├── data/                # Data-driven architecture
│   ├── eras.json        # Era definitions and requirements
│   ├── resources.json   # Resource properties and unlock conditions
│   ├── buildings.json   # Building configurations and worker requirements
│   ├── achievements.json # Achievement definitions and rewards
│   ├── gameData.ts      # Data loader with validation
│   ├── schema.ts        # Zod validation schemas
│   └── dataLoader.ts    # Advanced data loading with remote support
├── types/               # TypeScript definitions
│   ├── game.ts          # Core game types
│   └── fish.ts          # Mini-game specific types
├── App.tsx              # Root component
├── App.css              # Global styles
└── main.tsx             # Application entry point
```

### 2.2 Data Flow Architecture
```
JSON Files → Zod Validation → Game Data → Zustand Store → React Components → UI
     ↓              ↓             ↓            ↑                ↓
Remote Data → Schema Check → Type Safety → localStorage ←→ User Actions
```

## 3. State Management

### 3.1 Zustand Store Design
```typescript
interface GameStore extends GameState {
  // UI State
  currentTab: TabType;
  isLoading: boolean;
  
  // Game Actions
  tick: () => void;
  buildBuilding: (id: string, qty?: number) => boolean;
  clickBuilding: (id: string) => void;
  
  // System Actions
  saveGame: () => void;
  resetGame: (keepPrestige?: boolean) => void;
  prestige: () => boolean;
}
```

### 3.2 State Persistence
- **Storage**: localStorage with JSON serialization
- **BigInt Handling**: Convert to/from strings for storage
- **Versioning**: Schema version for migration support
- **Compression**: Minimal data structure for efficiency

### 3.3 State Updates
- **Frequency**: 250ms game tick (4 FPS)
- **Batching**: Multiple updates per tick batched
- **Optimization**: Only update changed values
- **Validation**: Type checking on all state changes

## 4. Game Engine

### 4.1 Core Game Loop
```typescript
tick() {
  1. Calculate time delta
  2. Calculate building efficiency (based on workers)
  3. Update resource production (efficiency-adjusted)
  4. Apply consumption
  5. Handle population dynamics
  6. Check unlock conditions
  7. Trigger era advancement
  8. Update UI state
}
```

### 4.2 Worker Management System
```typescript
// Efficiency calculation per building type
getBuildingEfficiency(buildingId: string): number {
  const workersAssigned = buildingState.workers;
  const numBuildings = buildingState.count;
  const avgWorkersPerBuilding = workersAssigned / numBuildings;

  if (buildingData.workerRequirement) {
    return Math.min(1.0, avgWorkersPerBuilding / buildingData.workerRequirement);
  } else {
    return Math.min(1.0, workersAssigned / totalCapacity);
  }
}

// Production calculation with efficiency
production = baseProduction × buildingCount × efficiency
```

### 4.2 BigInt Mathematics
- **Purpose**: Handle extremely large numbers (up to 10^24)
- **Operations**: Addition, subtraction, multiplication
- **Formatting**: K, M, B, T, P, E, Z, Y suffixes
- **Precision**: No floating-point errors

### 4.3 Resource System
```typescript
interface ResourceSnapshot {
  amount: bigint;    // Current amount
  cap: bigint;       // Maximum capacity
  perSec: bigint;    // Production rate
}
```

## 5. Component Architecture

### 5.1 Component Hierarchy
```
App
├── Header
├── MainContainer
│   ├── Sidebar
│   ├── MainContent
│   │   ├── TabSystem
│   │   ├── BuildingsTab
│   │   │   └── BuildingCard[]
│   │   ├── MinigamesTab
│   │   ├── AchievementsTab
│   │   └── StatisticsTab
│   └── ActivityLog
└── Modals
    ├── ResetModal
    └── MiniGameModals
```

### 5.2 Component Design Patterns
- **Functional Components**: All components use hooks
- **Custom Hooks**: Shared logic extraction
- **Prop Drilling**: Minimal via Zustand
- **Event Handling**: Centralized in store actions

### 5.3 Performance Optimizations
- **React.memo**: Prevent unnecessary re-renders
- **useCallback**: Stable function references
- **useMemo**: Expensive calculations caching
- **Lazy Loading**: Code splitting for mini-games

## 6. Data Management

### 6.1 Game Data Structure
```typescript
interface GameData {
  eras: Record<string, EraData>;
  resources: Record<string, ResourceData>;
  buildings: Record<string, BuildingData>;
  achievements: Record<string, AchievementData>;
}
```

### 6.2 Configuration Management
- **Static Data**: Immutable game configuration
- **Hot Reloading**: Development-time data updates
- **Validation**: Runtime type checking
- **Extensibility**: Easy addition of new content

### 6.3 Save System
```typescript
interface SaveData {
  version: number;
  timestamp: number;
  gameState: SerializedGameState;
}
```

## 7. User Interface

### 7.1 Responsive Design
- **Breakpoints**: 768px (mobile), 1200px (desktop)
- **Layout**: CSS Grid for main layout, Flexbox for components
- **Typography**: Relative units (rem, em)
- **Touch Targets**: Minimum 44px for mobile

### 7.2 Styling Architecture
- **Global Styles**: App.css for layout and themes
- **Component Styles**: Co-located CSS files
- **CSS Variables**: Consistent color scheme
- **Animations**: CSS transitions for feedback

### 7.3 Accessibility
- **Semantic HTML**: Proper element usage
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Tab order and shortcuts
- **Color Contrast**: WCAG AA compliance

## 8. Performance Considerations

### 8.1 Rendering Performance
- **Virtual DOM**: React's efficient updates
- **Component Memoization**: Prevent unnecessary renders
- **State Normalization**: Flat state structure
- **Batch Updates**: Group state changes

### 8.2 Memory Management
- **Object Pooling**: Reuse temporary objects
- **Event Cleanup**: Remove listeners on unmount
- **Interval Management**: Clear timers properly
- **Garbage Collection**: Minimize object creation

### 8.3 Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Lazy load features
- **Asset Optimization**: Minimize CSS/JS
- **Compression**: Gzip/Brotli compression

## 9. Testing Strategy

### 9.1 Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: >80% code coverage target
- **Focus**: Game logic, calculations, state management
- **Mocking**: External dependencies and timers

### 9.2 Integration Testing
- **Component Integration**: Multi-component workflows
- **State Management**: Store action testing
- **User Flows**: Complete game scenarios
- **Performance**: Render time measurements

### 9.3 End-to-End Testing
- **Framework**: Playwright or Cypress
- **Scenarios**: Complete game progression
- **Cross-Browser**: Major browser compatibility
- **Mobile**: Touch interaction testing

## 10. Deployment & DevOps

### 10.1 Build Process
```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run dev      # Development server
```

### 10.2 Environment Configuration
- **Development**: Hot reload, source maps, debugging
- **Production**: Minification, optimization, error tracking
- **Staging**: Production-like testing environment

### 10.3 Monitoring
- **Error Tracking**: Runtime error collection
- **Performance**: Core Web Vitals monitoring
- **Analytics**: User behavior tracking
- **Logging**: Structured application logs

## 11. Security Considerations

### 11.1 Client-Side Security
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Escape dynamic content
- **CSRF Protection**: Token-based requests
- **Content Security Policy**: Restrict resource loading

### 11.2 Data Protection
- **Local Storage**: No sensitive data storage
- **Encryption**: Optional save file encryption
- **Privacy**: No personal data collection
- **GDPR Compliance**: User data control

## 12. Scalability & Maintenance

### 12.1 Code Maintainability
- **TypeScript**: Strong typing for reliability
- **ESLint/Prettier**: Code quality enforcement
- **Documentation**: Comprehensive code comments
- **Modular Design**: Easy feature addition/removal

### 12.2 Performance Scaling
- **Lazy Loading**: Load features on demand
- **Worker Threads**: Offload heavy calculations
- **Caching**: Intelligent data caching
- **CDN**: Static asset distribution

### 12.3 Feature Extensibility
- **Plugin Architecture**: Modular feature system
- **Configuration-Driven**: Data-based content
- **API Design**: Consistent interface patterns
- **Version Migration**: Backward compatibility

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Implementation Status**: Complete  
**Next Review**: Q1 2025
