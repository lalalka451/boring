/**
 * Main Game Store - Combines all slices into a unified interface
 * This is the new modular architecture that will replace the monolithic gameStore.ts
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UiSlice, createUiSlice } from './slices/uiSlice';
import { ResourceSlice, createResourceSlice } from './slices/resourceSlice';
import { BuildingSlice, createBuildingSlice } from './slices/buildingSlice';
import { GameState } from '../types/game';
import { gameData } from '../data/gameData';
import { formatNumber } from '../utils/big';

// Combined store interface
export interface GameStore extends UiSlice, ResourceSlice, BuildingSlice {
  // Core game state
  version: number;
  playerName: string;
  eraId: string;
  playthrough: number;
  globalMultiplier: number;
  totalPlaytime: number;
  lastSave: number;
  lastTick: number;
  statistics: {
    totalClicks: number;
    totalBuildings: number;
    totalResources: number;
  };
  
  // Game loop
  tick: () => void;
  
  // Game progression
  checkUnlocks: () => void;
  checkEraAdvancement: () => void;
  meetsRequirements: (requirements: any) => boolean;
  
  // Prestige system
  canPrestige: () => boolean;
  prestige: () => boolean;
  
  // System actions
  saveGame: () => void;
  resetGame: (keepPrestige?: boolean) => void;
  setPlayerName: (name: string) => void;
  
  // Utility functions (re-exported for compatibility)
  formatNumber: (num: bigint) => string;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      // Create store object for slices
      const store = { setState: set, getState: get, destroy: () => {} };

      return {
        // Combine all slices
        ...createUiSlice(set, get, store),
        ...createResourceSlice(set, get, store),
        ...createBuildingSlice(set, get, store),
      
      // Core game state
      version: 2,
      playerName: '文明建造者',
      eraId: 'stone_age',
      playthrough: 1,
      globalMultiplier: 1.0,
      totalPlaytime: 0,
      lastSave: Date.now(),
      lastTick: Date.now(),
      statistics: {
        totalClicks: 0,
        totalBuildings: 0,
        totalResources: 0
      },
      
      // Game loop
      tick: () => {
        const state = get();
        const now = Date.now();
        const deltaTime = now - state.lastTick;
        
        // Apply resource production/consumption
        state.applyResourceTick(deltaTime);
        
        // Update statistics
        const totalBuildings = Object.values(state.buildings).reduce(
          (sum, building) => sum + Number(building.count), 0
        );
        
        const totalResources = Object.values(state.resources).reduce(
          (sum, resource) => sum + Number(resource.amount), 0
        );
        
        set({
          lastTick: now,
          totalPlaytime: state.totalPlaytime + deltaTime,
          statistics: {
            ...state.statistics,
            totalBuildings,
            totalResources
          }
        });
        
        // Check for unlocks and era advancement
        state.checkUnlocks();
        state.checkEraAdvancement();
      },
      
      // Game progression
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
          
          if (!resourceData.unlockEra || resourceData.unlockEra === state.eraId) {
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
      
      checkEraAdvancement: () => {
        const state = get();
        const currentEra = gameData.eras[state.eraId];
        if (!currentEra.advanceRequirements) return;
        
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
      
      meetsRequirements: (requirements: any) => {
        const state = get();
        if (!requirements) return true;
        
        // Check era requirement
        if (requirements.era && requirements.era !== state.eraId) {
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
        
        return true;
      },
      
      // Prestige system
      canPrestige: () => {
        const state = get();
        return state.isBuildingUnlocked('warp_drive_factory') && 
               state.getBuildingCount('warp_drive_factory') > 0n;
      },
      
      prestige: () => {
        const state = get();
        if (!state.canPrestige()) return false;
        
        const newMultiplier = state.globalMultiplier + 0.1;
        
        // Reset most progress but keep prestige bonuses
        state.resetGame(true);
        
        set({
          playthrough: state.playthrough + 1,
          globalMultiplier: newMultiplier
        });
        
        state.addLogEntry(`🌟 重生完成！获得 ${(newMultiplier * 100).toFixed(1)}% 全局倍率`);
        return true;
      },
      
      // System actions
      saveGame: () => {
        set({ lastSave: Date.now() });
        get().addLogEntry('💾 游戏已保存');
      },
      
      resetGame: (keepPrestige = false) => {
        const state = get();
        
        // Reset resources to initial state
        const initialResources = {
          population: { amount: 10n, cap: 50n, perSec: 0n },
          food: { amount: 50n, cap: 1000n, perSec: 0n },
          wood: { amount: 10n, cap: 1000n, perSec: 0n },
          genius_coins: { amount: 0n, cap: 1000000n, perSec: 0n }
        };
        
        // Reset buildings to initial state
        const initialBuildings = {
          tree: { count: 1n, workers: 0n }
        };
        
        // Reset unlocks to initial state
        const initialUnlockedBuildings = new Set(['tree']);
        const initialUnlockedResources = new Set(['population', 'food', 'wood', 'genius_coins']);
        
        set({
          eraId: 'stone_age',
          resources: initialResources,
          buildings: initialBuildings,
          unlockedBuildings: initialUnlockedBuildings,
          unlockedResources: initialUnlockedResources,
          totalPlaytime: keepPrestige ? state.totalPlaytime : 0,
          statistics: {
            totalClicks: 0,
            totalBuildings: 0,
            totalResources: 0
          },
          activityLog: ['🌟 欢迎来到GoToFuture！点击人树开始你的文明之旅。']
        });
        
        if (!keepPrestige) {
          set({
            playthrough: 1,
            globalMultiplier: 1.0
          });
        }
        
        state.addLogEntry(keepPrestige ? '🔄 软重置完成' : '🔄 完全重置完成');
      },
      
      setPlayerName: (name: string) => {
        set({ playerName: name });
      },

      // Utility functions (re-exported for compatibility)
      formatNumber
      };
    },
    {
      name: 'gotofuture-game-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        version: state.version,
        playerName: state.playerName,
        eraId: state.eraId,
        playthrough: state.playthrough,
        globalMultiplier: state.globalMultiplier,
        totalPlaytime: state.totalPlaytime,
        lastSave: state.lastSave,
        lastTick: state.lastTick,
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
        ),
        unlockedBuildings: Array.from(state.unlockedBuildings),
        unlockedResources: Array.from(state.unlockedResources),
        statistics: state.statistics
      }),
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;
        
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
          unlockedBuildings: new Set(persistedState.unlockedBuildings || ['tree']),
          unlockedResources: new Set(persistedState.unlockedResources || ['population', 'food', 'wood', 'genius_coins'])
        };
      }
    }
  )
);

// Start the game loop
let gameLoopInterval: number;

export const startGameLoop = () => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
  
  gameLoopInterval = window.setInterval(() => {
    useGameStore.getState().tick();
  }, 250); // 4 FPS
};

export const stopGameLoop = () => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
};

// Auto-start the game loop
if (typeof window !== 'undefined') {
  startGameLoop();
}
