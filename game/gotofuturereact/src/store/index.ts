/**
 * Main Store Entry Point
 * Combines all slices into a unified, type-safe game store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Import all slices
import { UiSlice, createUiSlice } from './slices/uiSlice';
import { ResourceSlice, createResourceSlice } from './slices/resourceSlice';
import { BuildingSlice, createBuildingSlice } from './slices/buildingSlice';
import { SystemSlice, createSystemSlice } from './slices/systemSlice';

// Import utilities
import { formatNumber } from '../utils/big';
import { gameData } from '../data/gameData';

// Combined store interface
export interface GameStore extends UiSlice, ResourceSlice, BuildingSlice, SystemSlice {
  // Utility functions (re-exported for compatibility)
  formatNumber: (num: bigint) => string;
}

// Create the combined store
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      // Create all slices
      const uiSlice = createUiSlice(set, get);
      const resourceSlice = createResourceSlice(set, get);
      const buildingSlice = createBuildingSlice(set, get);
      const systemSlice = createSystemSlice(set, get);
      
      // Override some methods to handle cross-slice interactions
      const enhancedSystemSlice = {
        ...systemSlice,
        
        // Enhanced tick that coordinates all slices
        tick: () => {
          const state = get();
          const now = Date.now();
          // Prevent large deltaTime jumps if tab was inactive
          const deltaTime = Math.min(now - state.lastTick, 1000); // Cap deltaTime to 1 second

          if (deltaTime <= 0) return; // Avoid processing if no time has passed

          // Update building production first - This is crucial
          state.updateBuildingProduction();

          // Apply resource changes based on new perSec rates
          state.applyResourceTick(deltaTime);

          // Update system state
          const totalBuildings = Object.values(state.buildings).reduce(
            (sum, building) => sum + Number(building.count), 0
          );

          const totalResources = Object.values(state.resources).reduce(
            (sum, resource) => sum + Number(resource.amount), 0
          );

          const newPlaytime = state.totalPlaytime + deltaTime;

          // Batch state updates for better performance
          set(prevState => ({
            lastTick: now,
            totalPlaytime: newPlaytime,
            statistics: {
              ...prevState.statistics,
              totalBuildings,
              totalResources,
              totalPlaytime: newPlaytime
            }
          }));

          // Progression checks - consider throttling these in the future
          state.checkUnlocks();
          state.checkEraAdvancement();
          state.checkAchievements();
        },
        
        // Enhanced checkUnlocks that works with all slices
        checkUnlocks: () => {
          const state = get();
          let hasNewUnlocks = false;
          
          // Check building unlocks
          Object.entries(gameData.buildings).forEach(([buildingId, buildingData]) => {
            if (state.isBuildingUnlocked(buildingId)) return;
            
            if (state.meetsRequirements(buildingData.unlockRequirements)) {
              state.unlockBuilding(buildingId);
              state.addLogEntry(`🔓 解锁新建筑: ${buildingData.name}`);
              hasNewUnlocks = true;
            }
          });
          
          // Check resource unlocks
          Object.entries(gameData.resources).forEach(([resourceId, resourceData]) => {
            if (state.isResourceUnlocked(resourceId)) return;
            
            // Check era-based unlocking
            const eraIds = Object.keys(gameData.eras);
            const currentEraIndex = eraIds.indexOf(state.eraId);
            const resourceEraIndex = resourceData.unlockEra ? eraIds.indexOf(resourceData.unlockEra) : 0;
            
            if (currentEraIndex >= resourceEraIndex) {
              state.unlockResource(resourceId);
              state.addLogEntry(`🔓 解锁新资源: ${resourceData.name}`);
              hasNewUnlocks = true;
            }
          });
          
          if (hasNewUnlocks) {
            // Update production after unlocks
            state.updateBuildingProduction();
          }
        },
        
        // Enhanced checkEraAdvancement with logging
        checkEraAdvancement: () => {
          const state = get();
          const currentEra = gameData.eras[state.eraId];
          
          if (!currentEra?.advanceRequirements) return;
          
          if (state.meetsRequirements(currentEra.advanceRequirements)) {
            const eraIds = Object.keys(gameData.eras);
            const currentIndex = eraIds.indexOf(state.eraId);
            
            if (currentIndex < eraIds.length - 1) {
              const newEraId = eraIds[currentIndex + 1];
              const newEra = gameData.eras[newEraId];
              
              set({ eraId: newEraId });
              state.addLogEntry(`🎉 进入新时代: ${newEra.name} ${newEra.icon}`);
              
              // Trigger unlock check for new era
              setTimeout(() => {
                state.checkUnlocks();
              }, 100);
            }
          }
        },
        
        // Enhanced meetsRequirements that works with all slices
        meetsRequirements: (requirements: any) => {
          const state = get();
          if (!requirements) return true;
          
          // Check era requirement
          if (requirements.era) {
            const eraIds = Object.keys(gameData.eras);
            const currentIndex = eraIds.indexOf(state.eraId);
            const requiredIndex = eraIds.indexOf(requirements.era);
            if (currentIndex < requiredIndex) return false;
          }
          
          // Check population requirement
          if (requirements.population && state.resources.population.amount < BigInt(requirements.population)) {
            return false;
          }
          
          // Check resource requirements
          if (requirements.resources) {
            for (const [resourceId, amount] of Object.entries(requirements.resources)) {
              if (!state.hasResource(resourceId, BigInt(amount as number))) {
                return false;
              }
            }
          }
          
          // Check building requirements
          if (requirements.buildings) {
            for (const [buildingId, count] of Object.entries(requirements.buildings)) {
              if (state.getBuildingCount(buildingId) < BigInt(count as number)) {
                return false;
              }
            }
          }
          
          // Check playthrough requirement
          if (requirements.playthrough && state.playthrough < requirements.playthrough) {
            return false;
          }
          
          // Check statistics requirements
          if (requirements.statistics) {
            for (const [statName, value] of Object.entries(requirements.statistics)) {
              const currentValue = state.statistics[statName as keyof typeof state.statistics];
              if (currentValue < (value as number)) {
                return false;
              }
            }
          }
          
          return true;
        }
      };
      
      // Enhanced building slice with statistics tracking
      const enhancedBuildingSlice = {
        ...buildingSlice,
        
        buildBuilding: (buildingId: string, quantity = 1) => {
          const result = buildingSlice.buildBuilding(buildingId, quantity);
          if (result) {
            get().incrementStat('totalBuildings', quantity);
          }
          return result;
        },
        
        clickBuilding: (buildingId: string) => {
          buildingSlice.clickBuilding(buildingId);
          get().incrementStat('totalClicks', 1);
        }
      };
      
      return {
        // Combine all slices
        ...uiSlice,
        ...resourceSlice,
        ...enhancedBuildingSlice,
        ...enhancedSystemSlice,
        
        // Utility functions
        formatNumber
      };
    },
    {
      name: 'gotofuture-game-state',
      version: 3, // Increment version for new architecture
      storage: createJSONStorage(() => localStorage),
      
      // Serialize state for persistence
      partialize: (state) => ({
        version: state.version,
        playerName: state.playerName,
        eraId: state.eraId,
        playthrough: state.playthrough,
        globalMultiplier: state.globalMultiplier,
        totalPlaytime: state.totalPlaytime,
        lastSave: state.lastSave,
        lastTick: state.lastTick,
        statistics: state.statistics,
        achievements: Array.from(state.achievements),
        unlockedBuildings: Array.from(state.unlockedBuildings),
        unlockedResources: Array.from(state.unlockedResources),
        resources: Object.fromEntries(
          Object.entries(state.resources).map(([id, resource]) => [
            id,
            {
              amount: resource.amount.toString(),
              cap: resource.cap.toString(),
              perSec: resource.perSec.toString()
            }
          ])
        ),
        buildings: Object.fromEntries(
          Object.entries(state.buildings).map(([id, building]) => [
            id,
            {
              count: building.count.toString(),
              workers: building.workers.toString()
            }
          ])
        )
      }),
      
      // Deserialize state from persistence
      merge: (persistedState: any, currentState) => {
        if (!persistedState || persistedState.version !== currentState.version) {
          return currentState; // Reset if version mismatch
        }
        
        // Convert string BigInts back to BigInt
        const resources: Record<string, any> = {};
        if (persistedState.resources) {
          Object.entries(persistedState.resources).forEach(([id, resource]: [string, any]) => {
            resources[id] = {
              amount: BigInt(resource.amount || '0'),
              cap: BigInt(resource.cap || '1000'),
              perSec: BigInt(resource.perSec || '0')
            };
          });
        }
        
        const buildings: Record<string, any> = {};
        if (persistedState.buildings) {
          Object.entries(persistedState.buildings).forEach(([id, building]: [string, any]) => {
            buildings[id] = {
              count: BigInt(building.count || '0'),
              workers: BigInt(building.workers || '0')
            };
          });
        }
        
        return {
          ...currentState,
          ...persistedState,
          resources: { ...currentState.resources, ...resources },
          buildings: { ...currentState.buildings, ...buildings },
          achievements: new Set(persistedState.achievements || []),
          unlockedBuildings: new Set(persistedState.unlockedBuildings || ['tree']),
          unlockedResources: new Set(persistedState.unlockedResources || ['population', 'food', 'wood', 'genius_coins'])
        };
      }
    }
  )
);

// Game loop management
let gameLoopInterval: number;

export const startGameLoop = () => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
  
  gameLoopInterval = window.setInterval(() => {
    useGameStore.getState().tick();
  }, 250); // 4 FPS for smooth gameplay
};

export const stopGameLoop = () => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
};

// Auto-start the game loop when the module loads
if (typeof window !== 'undefined') {
  startGameLoop();
}

// Export individual slices for testing
export type { UiSlice, ResourceSlice, BuildingSlice, SystemSlice };
