/**
 * Resource Management Slice
 * Handles all resource-related state and operations
 */

import { StateCreator } from 'zustand';
import { ResourceSnapshot } from '../../types/game';
import { gameData } from '../../data/gameData';
import { addBig, subtractBig, minBig, maxBig, toBigInt } from '../../utils/big';

export interface ResourceSlice {
  // Resource state
  resources: Record<string, ResourceSnapshot>;
  unlockedResources: Set<string>;
  
  // Resource operations
  addResource: (resourceId: string, amount: bigint) => void;
  subtractResource: (resourceId: string, amount: bigint) => void;
  setResource: (resourceId: string, amount: bigint) => void;
  setResourceCap: (resourceId: string, cap: bigint) => void;
  setResourcePerSec: (resourceId: string, perSec: bigint) => void;
  
  // Resource queries
  getResource: (resourceId: string) => ResourceSnapshot | null;
  hasResource: (resourceId: string, amount: bigint) => boolean;
  canAfford: (cost: Record<string, number>) => boolean;
  
  // Resource unlocking
  unlockResource: (resourceId: string) => void;
  isResourceUnlocked: (resourceId: string) => boolean;
  
  // Bulk operations
  spendResources: (cost: Record<string, number>) => boolean;
  updateResourceProduction: () => void;
  applyResourceTick: (deltaTime: number) => void;
}

export const createResourceSlice: StateCreator<ResourceSlice, [], [], ResourceSlice> = (set, get) => ({
  // Initial resource state
  resources: {
    population: { amount: 10n, cap: 50n, perSec: 0n },
    food: { amount: 50n, cap: 1000n, perSec: 0n },
    wood: { amount: 10n, cap: 1000n, perSec: 0n },
    genius_coins: { amount: 0n, cap: 1000000n, perSec: 0n }
  },
  
  unlockedResources: new Set(['population', 'food', 'wood', 'genius_coins']),
  
  // Resource operations
  addResource: (resourceId: string, amount: bigint) => {
    const state = get();
    const resource = state.resources[resourceId];
    if (!resource) return;
    
    const newAmount = minBig(addBig(resource.amount, amount), resource.cap);
    
    set({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          amount: newAmount
        }
      }
    });
  },
  
  subtractResource: (resourceId: string, amount: bigint) => {
    const state = get();
    const resource = state.resources[resourceId];
    if (!resource) return;
    
    const newAmount = maxBig(subtractBig(resource.amount, amount), 0n);
    
    set({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          amount: newAmount
        }
      }
    });
  },
  
  setResource: (resourceId: string, amount: bigint) => {
    const state = get();
    const resource = state.resources[resourceId];
    if (!resource) return;
    
    const clampedAmount = minBig(maxBig(amount, 0n), resource.cap);
    
    set({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          amount: clampedAmount
        }
      }
    });
  },
  
  setResourceCap: (resourceId: string, cap: bigint) => {
    const state = get();
    const resource = state.resources[resourceId];
    if (!resource) return;
    
    set({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          cap: maxBig(cap, 0n),
          amount: minBig(resource.amount, cap)
        }
      }
    });
  },
  
  setResourcePerSec: (resourceId: string, perSec: bigint) => {
    const state = get();
    const resource = state.resources[resourceId];
    if (!resource) return;
    
    set({
      resources: {
        ...state.resources,
        [resourceId]: {
          ...resource,
          perSec
        }
      }
    });
  },
  
  // Resource queries
  getResource: (resourceId: string) => {
    const state = get();
    return state.resources[resourceId] || null;
  },
  
  hasResource: (resourceId: string, amount: bigint) => {
    const state = get();
    const resource = state.resources[resourceId];
    return resource ? resource.amount >= amount : false;
  },
  
  canAfford: (cost: Record<string, number>) => {
    const state = get();
    return Object.entries(cost).every(([resourceId, amount]) => {
      const resource = state.resources[resourceId];
      return resource && resource.amount >= toBigInt(amount);
    });
  },
  
  // Resource unlocking
  unlockResource: (resourceId: string) => {
    const state = get();
    if (state.unlockedResources.has(resourceId)) return;
    
    const resourceData = gameData.resources[resourceId];
    if (!resourceData) return;
    
    // Add to unlocked set
    const newUnlockedResources = new Set(state.unlockedResources);
    newUnlockedResources.add(resourceId);
    
    // Initialize resource if not exists
    const newResources = { ...state.resources };
    if (!newResources[resourceId]) {
      newResources[resourceId] = {
        amount: toBigInt(resourceData.baseValue || 0),
        cap: toBigInt(resourceData.maxValue || 1000),
        perSec: 0n
      };
    }
    
    set({
      unlockedResources: newUnlockedResources,
      resources: newResources
    });
  },
  
  isResourceUnlocked: (resourceId: string) => {
    const state = get();
    return state.unlockedResources.has(resourceId);
  },
  
  // Bulk operations
  spendResources: (cost: Record<string, number>) => {
    const state = get();
    
    // Check if we can afford all costs
    if (!state.canAfford(cost)) return false;
    
    // Deduct all resources
    const newResources = { ...state.resources };
    Object.entries(cost).forEach(([resourceId, amount]) => {
      const resource = newResources[resourceId];
      if (resource) {
        newResources[resourceId] = {
          ...resource,
          amount: subtractBig(resource.amount, toBigInt(amount))
        };
      }
    });
    
    set({ resources: newResources });
    return true;
  },
  
  updateResourceProduction: () => {
    // This will be called by the building slice to update production rates
    // Implementation moved to building slice to avoid circular dependencies
  },
  
  applyResourceTick: (deltaTime: number) => {
    const state = get();
    const newResources = { ...state.resources };
    
    Object.entries(newResources).forEach(([resourceId, resource]) => {
      if (resource.perSec !== 0n) {
        const production = (resource.perSec * toBigInt(deltaTime)) / 1000n;
        const newAmount = addBig(resource.amount, production);
        const clampedAmount = minBig(newAmount, resource.cap);
        
        newResources[resourceId] = {
          ...resource,
          amount: maxBig(clampedAmount, 0n)
        };
      }
    });
    
    set({ resources: newResources });
  }
});
