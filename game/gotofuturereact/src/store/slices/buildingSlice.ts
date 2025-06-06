/**
 * Building Management Slice
 * Handles building construction, worker assignment, and production calculations
 */

import { StateCreator } from 'zustand';
import { BuildingInstance } from '../../types/game';
import { gameData } from '../../data/gameData';
import { toBigInt, addBig, subtractBig, minBig, maxBig } from '../../utils/big';

// Import other slices for cross-slice operations
import { ResourceSlice } from './resourceSlice';
import { UiSlice } from './uiSlice';

export interface BuildingSlice {
  // Building state
  buildings: Record<string, BuildingInstance>;
  unlockedBuildings: Set<string>;
  
  // Building operations
  buildBuilding: (buildingId: string, quantity?: number) => boolean;
  clickBuilding: (buildingId: string) => void;
  
  // Worker management
  assignWorker: (buildingId: string, amount?: number) => boolean;
  unassignWorker: (buildingId: string, amount?: number) => boolean;
  getTotalAssignedWorkers: () => number;
  
  // Building queries
  canBuildBuilding: (buildingId: string, quantity?: number) => boolean;
  calculateBuildingCost: (buildingId: string, quantity: number) => Record<string, number>;
  getBuildingEfficiency: (buildingId: string) => number;
  getBuildingCount: (buildingId: string) => bigint;
  getBuildingWorkers: (buildingId: string) => bigint;
  
  // Building unlocking
  unlockBuilding: (buildingId: string) => void;
  isBuildingUnlocked: (buildingId: string) => boolean;
  
  // Production calculations
  updateBuildingProduction: () => void;
  calculateTotalProduction: () => Record<string, bigint>;
}

export const createBuildingSlice: StateCreator<
  BuildingSlice & ResourceSlice & UiSlice,
  [],
  [],
  BuildingSlice
> = (set, get) => ({
  // Initial building state
  buildings: {
    tree: { count: 1n, workers: 0n }
  },
  
  unlockedBuildings: new Set(['tree']),
  
  // Building operations
  buildBuilding: (buildingId: string, quantity = 1) => {
    const state = get();
    
    if (!state.canBuildBuilding(buildingId, quantity)) return false;
    
    const cost = state.calculateBuildingCost(buildingId, quantity);
    
    // Spend resources
    if (!state.spendResources(cost)) return false;
    
    // Add building
    const newBuildings = { ...state.buildings };
    if (!newBuildings[buildingId]) {
      newBuildings[buildingId] = { count: 0n, workers: 0n };
    }
    
    newBuildings[buildingId] = {
      ...newBuildings[buildingId],
      count: addBig(newBuildings[buildingId].count, toBigInt(quantity))
    };
    
    const buildingData = gameData.buildings[buildingId];
    
    // Handle special effects
    if (buildingData.specialEffect === 'unlock_resource') {
      if (buildingId === 'quarry' && !state.resources.stone) {
        state.unlockResource('stone');
        state.addLogEntry('🔓 解锁新资源: 石头');
      }
    }
    
    set({ buildings: newBuildings });
    state.addLogEntry(`🏗️ 建造了 ${quantity} 个 ${buildingData.name}`);
    
    // Update production rates
    setTimeout(() => {
      state.updateBuildingProduction();
    }, 0);
    
    return true;
  },
  
  clickBuilding: (buildingId: string) => {
    const state = get();
    const buildingData = gameData.buildings[buildingId];
    
    if (!buildingData?.clickable || !buildingData.clickProduction) return;
    
    Object.entries(buildingData.clickProduction).forEach(([resourceId, amount]) => {
      state.addResource(resourceId, toBigInt(amount));
    });
    
    state.addLogEntry(`🌳 点击${buildingData.name}获得资源`);
  },
  
  // Worker management
  assignWorker: (buildingId: string, amount = 1) => {
    const state = get();
    const buildingState = state.buildings[buildingId];
    const buildingData = gameData.buildings[buildingId];
    
    if (!buildingState || !buildingData) return false;
    
    const availableWorkers = state.resources.population.amount - toBigInt(state.getTotalAssignedWorkers());
    const maxCapacity = (buildingData.workerCapacity || 0) * Number(buildingState.count);
    const currentWorkers = Number(buildingState.workers);
    const canAssign = Math.min(Number(availableWorkers), amount, maxCapacity - currentWorkers);
    
    if (canAssign <= 0) return false;
    
    const newBuildings = { ...state.buildings };
    newBuildings[buildingId] = {
      ...buildingState,
      workers: addBig(buildingState.workers, toBigInt(canAssign))
    };
    
    set({ buildings: newBuildings });
    state.addLogEntry(`👷 分配了 ${canAssign} 个工人到 ${buildingData.name}`);
    
    // Update production rates
    setTimeout(() => {
      state.updateBuildingProduction();
    }, 0);
    
    return true;
  },
  
  unassignWorker: (buildingId: string, amount = 1) => {
    const state = get();
    const buildingState = state.buildings[buildingId];
    const buildingData = gameData.buildings[buildingId];
    
    if (!buildingState || !buildingData) return false;
    
    const currentWorkers = Number(buildingState.workers);
    const canUnassign = Math.min(amount, currentWorkers);
    
    if (canUnassign <= 0) return false;
    
    const newBuildings = { ...state.buildings };
    newBuildings[buildingId] = {
      ...buildingState,
      workers: subtractBig(buildingState.workers, toBigInt(canUnassign))
    };
    
    set({ buildings: newBuildings });
    state.addLogEntry(`👷 从 ${buildingData.name} 撤回了 ${canUnassign} 个工人`);
    
    // Update production rates
    setTimeout(() => {
      state.updateBuildingProduction();
    }, 0);
    
    return true;
  },
  
  getTotalAssignedWorkers: () => {
    const state = get();
    return Object.values(state.buildings).reduce((total, building) => {
      return total + Number(building.workers);
    }, 0);
  },
  
  // Building queries
  canBuildBuilding: (buildingId: string, quantity = 1) => {
    const state = get();
    const buildingData = gameData.buildings[buildingId];
    
    if (!buildingData || !state.isBuildingUnlocked(buildingId)) return false;
    
    const currentCount = Number(state.getBuildingCount(buildingId));
    if (currentCount + quantity > buildingData.maxCount) return false;
    
    const cost = state.calculateBuildingCost(buildingId, quantity);
    return state.canAfford(cost);
  },
  
  calculateBuildingCost: (buildingId: string, quantity: number) => {
    const state = get();
    const buildingData = gameData.buildings[buildingId];
    if (!buildingData) return {};
    
    const currentCount = Number(state.getBuildingCount(buildingId));
    const totalCost: Record<string, number> = {};
    
    Object.entries(buildingData.baseCost).forEach(([resourceId, baseAmount]) => {
      let cost = 0;
      for (let i = 0; i < quantity; i++) {
        const buildingNumber = currentCount + i;
        const multipliedCost = Number(baseAmount) * Math.pow(buildingData.costMultiplier, buildingNumber);
        cost += Math.floor(multipliedCost);
      }
      totalCost[resourceId] = cost;
    });
    
    return totalCost;
  },
  
  getBuildingEfficiency: (buildingId: string) => {
    const state = get();
    const buildingData = gameData.buildings[buildingId];
    const buildingState = state.buildings[buildingId];
    
    if (!buildingData || !buildingState || buildingState.count === 0n) {
      return 0.0;
    }
    
    // Buildings that don't use workers operate at 100% efficiency
    if (!buildingData.workerCapacity || buildingData.workerCapacity === 0) {
      return 1.0;
    }
    
    const workersAssigned = Number(buildingState.workers);
    if (workersAssigned === 0) {
      return 0.0;
    }
    
    const numBuildings = Number(buildingState.count);
    
    // Calculate efficiency based on worker requirement
    if (buildingData.workerRequirement && buildingData.workerRequirement > 0) {
      const avgWorkersPerInstance = workersAssigned / numBuildings;
      return Math.min(1.0, avgWorkersPerInstance / buildingData.workerRequirement);
    } else {
      const totalCapacityForGroup = buildingData.workerCapacity * numBuildings;
      if (totalCapacityForGroup === 0) return 0.0;
      return Math.min(1.0, workersAssigned / totalCapacityForGroup);
    }
  },
  
  getBuildingCount: (buildingId: string) => {
    const state = get();
    return state.buildings[buildingId]?.count || 0n;
  },
  
  getBuildingWorkers: (buildingId: string) => {
    const state = get();
    return state.buildings[buildingId]?.workers || 0n;
  },
  
  // Building unlocking
  unlockBuilding: (buildingId: string) => {
    const state = get();
    if (state.unlockedBuildings.has(buildingId)) return;
    
    const newUnlockedBuildings = new Set(state.unlockedBuildings);
    newUnlockedBuildings.add(buildingId);
    
    set({ unlockedBuildings: newUnlockedBuildings });
  },
  
  isBuildingUnlocked: (buildingId: string) => {
    const state = get();
    return state.unlockedBuildings.has(buildingId);
  },
  
  // Production calculations
  updateBuildingProduction: () => {
    const state = get();
    const newResources = { ...state.resources };
    
    // Reset all production rates
    Object.keys(newResources).forEach(resourceId => {
      newResources[resourceId] = {
        ...newResources[resourceId],
        perSec: 0n
      };
    });
    
    // Calculate production from all buildings
    Object.entries(state.buildings).forEach(([buildingId, buildingState]) => {
      const buildingData = gameData.buildings[buildingId];
      if (!buildingData || buildingState.count === 0n) return;
      
      const count = buildingState.count;
      const efficiency = state.getBuildingEfficiency(buildingId);
      
      // Add production
      if (buildingData.production) {
        Object.entries(buildingData.production).forEach(([resourceId, amount]) => {
          if (newResources[resourceId]) {
            const production = toBigInt(Math.floor(Number(count) * Number(amount) * efficiency));
            newResources[resourceId].perSec = addBig(newResources[resourceId].perSec, production);
          }
        });
      }
      
      // Subtract consumption
      if (buildingData.consumption) {
        Object.entries(buildingData.consumption).forEach(([resourceId, amount]) => {
          if (newResources[resourceId]) {
            const consumption = toBigInt(Math.floor(Number(count) * Number(amount) * efficiency));
            newResources[resourceId].perSec = subtractBig(newResources[resourceId].perSec, consumption);
          }
        });
      }
    });
    
    set({ resources: newResources });
  },
  
  calculateTotalProduction: () => {
    const state = get();
    const production: Record<string, bigint> = {};
    
    Object.entries(state.buildings).forEach(([buildingId, buildingState]) => {
      const buildingData = gameData.buildings[buildingId];
      if (!buildingData || buildingState.count === 0n) return;
      
      const count = buildingState.count;
      const efficiency = state.getBuildingEfficiency(buildingId);
      
      if (buildingData.production) {
        Object.entries(buildingData.production).forEach(([resourceId, amount]) => {
          const prod = toBigInt(Math.floor(Number(count) * Number(amount) * efficiency));
          production[resourceId] = addBig(production[resourceId] || 0n, prod);
        });
      }
    });
    
    return production;
  }
});
