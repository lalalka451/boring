/**
 * System Management Slice
 * Handles game progression, achievements, and system-level operations
 */

import { StateCreator } from 'zustand';
import { gameData } from '../../data/gameData';

export interface SystemSlice {
  // Core game state
  version: number;
  playerName: string;
  eraId: string;
  playthrough: number;
  globalMultiplier: number;
  totalPlaytime: number;
  lastSave: number;
  lastTick: number;
  
  // Statistics
  statistics: {
    totalClicks: number;
    totalBuildings: number;
    totalResources: number;
    totalPrestige: number;
    totalPlaytime: number;
  };
  
  // Achievements
  achievements: Set<string>;
  
  // System operations
  tick: () => void;
  saveGame: () => void;
  resetGame: (keepPrestige?: boolean) => void;
  setPlayerName: (name: string) => void;
  
  // Progression
  checkUnlocks: () => void;
  checkEraAdvancement: () => void;
  checkAchievements: () => void;
  meetsRequirements: (requirements: any) => boolean;
  
  // Prestige system
  canPrestige: () => boolean;
  calculatePrestigeGain: () => number;
  prestige: () => boolean;
  
  // Achievement system
  unlockAchievement: (achievementId: string) => void;
  isAchievementUnlocked: (achievementId: string) => boolean;
  
  // Statistics tracking
  incrementStat: (statName: keyof SystemSlice['statistics'], amount?: number) => void;
  setStat: (statName: keyof SystemSlice['statistics'], value: number) => void;
}

export const createSystemSlice: StateCreator<SystemSlice, [], [], SystemSlice> = (set, get) => ({
  // Initial system state
  version: 2,
  playerName: '文明建造者',
  eraId: 'stone_age',
  playthrough: 1,
  globalMultiplier: 1.0,
  totalPlaytime: 0,
  lastSave: Date.now(),
  lastTick: Date.now(),
  
  // Initial statistics
  statistics: {
    totalClicks: 0,
    totalBuildings: 0,
    totalResources: 0,
    totalPrestige: 0,
    totalPlaytime: 0
  },
  
  // Initial achievements
  achievements: new Set<string>(),
  
  // System operations
  tick: () => {
    const state = get();
    const now = Date.now();
    const deltaTime = now - state.lastTick;
    
    // Update playtime
    const newPlaytime = state.totalPlaytime + deltaTime;
    
    set({
      lastTick: now,
      totalPlaytime: newPlaytime,
      statistics: {
        ...state.statistics,
        totalPlaytime: newPlaytime
      }
    });
    
    // Check for progression updates
    state.checkUnlocks();
    state.checkEraAdvancement();
    state.checkAchievements();
  },
  
  saveGame: () => {
    set({ lastSave: Date.now() });
  },
  
  resetGame: (keepPrestige = false) => {
    const state = get();
    
    const newState = {
      eraId: 'stone_age',
      totalPlaytime: keepPrestige ? state.totalPlaytime : 0,
      statistics: {
        totalClicks: 0,
        totalBuildings: 0,
        totalResources: 0,
        totalPrestige: keepPrestige ? state.statistics.totalPrestige : 0,
        totalPlaytime: keepPrestige ? state.statistics.totalPlaytime : 0
      }
    };
    
    if (!keepPrestige) {
      newState.statistics.totalPrestige = 0;
      set({
        ...newState,
        playthrough: 1,
        globalMultiplier: 1.0,
        achievements: new Set<string>()
      });
    } else {
      set(newState);
    }
  },
  
  setPlayerName: (name: string) => {
    set({ playerName: name });
  },
  
  // Progression
  checkUnlocks: () => {
    // This will be implemented by the main store combining all slices
    // to avoid circular dependencies
  },
  
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
        
        // Trigger unlock check after era change
        setTimeout(() => {
          state.checkUnlocks();
        }, 100);
      }
    }
  },
  
  checkAchievements: () => {
    const state = get();
    
    Object.entries(gameData.achievements || {}).forEach(([achievementId, achievement]) => {
      if (state.isAchievementUnlocked(achievementId)) return;
      
      if (state.meetsRequirements(achievement.requirements)) {
        state.unlockAchievement(achievementId);
      }
    });
  },
  
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
  },
  
  // Prestige system
  canPrestige: () => {
    const state = get();
    // Simplified prestige condition - can be expanded
    return state.eraId === 'space_age' || state.eraId === 'multidimensional_age';
  },
  
  calculatePrestigeGain: () => {
    const state = get();
    const eraIds = Object.keys(gameData.eras);
    const currentEraIndex = eraIds.indexOf(state.eraId);
    
    // Base gain from era progression
    const eraBonus = Math.max(0, currentEraIndex - 1) * 0.1;
    
    // Bonus from total buildings
    const buildingBonus = Math.log10(Math.max(1, state.statistics.totalBuildings)) * 0.05;
    
    return Math.max(0.01, eraBonus + buildingBonus);
  },
  
  prestige: () => {
    const state = get();
    if (!state.canPrestige()) return false;
    
    const prestigeGain = state.calculatePrestigeGain();
    const newMultiplier = state.globalMultiplier + prestigeGain;
    
    // Reset game but keep prestige progress
    state.resetGame(true);
    
    set({
      playthrough: state.playthrough + 1,
      globalMultiplier: newMultiplier,
      statistics: {
        ...state.statistics,
        totalPrestige: state.statistics.totalPrestige + 1
      }
    });
    
    return true;
  },
  
  // Achievement system
  unlockAchievement: (achievementId: string) => {
    const state = get();
    if (state.achievements.has(achievementId)) return;
    
    const newAchievements = new Set(state.achievements);
    newAchievements.add(achievementId);
    
    set({ achievements: newAchievements });
  },
  
  isAchievementUnlocked: (achievementId: string) => {
    const state = get();
    return state.achievements.has(achievementId);
  },
  
  // Statistics tracking
  incrementStat: (statName: keyof SystemSlice['statistics'], amount = 1) => {
    const state = get();
    set({
      statistics: {
        ...state.statistics,
        [statName]: state.statistics[statName] + amount
      }
    });
  },
  
  setStat: (statName: keyof SystemSlice['statistics'], value: number) => {
    const state = get();
    set({
      statistics: {
        ...state.statistics,
        [statName]: value
      }
    });
  }
});
