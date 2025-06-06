import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, ResourceSnapshot, BuildingInstance, TabType } from '../types/game';
import { gameData } from '../data/gameData';

interface GameStore extends GameState {
  // UI State
  currentTab: TabType;
  isLoading: boolean;

  // Actions
  setCurrentTab: (tab: TabType) => void;
  setPlayerName: (name: string) => void;

  // Game Actions
  tick: () => void;
  clickBuilding: (buildingId: string) => void;
  buildBuilding: (buildingId: string, quantity?: number) => boolean;
  assignWorkers: (buildingId: string, amount: number) => boolean;

  // System Actions
  saveGame: () => void;
  resetGame: (keepPrestige?: boolean) => void;
  prestige: () => boolean;

  // Utility
  formatNumber: (value: bigint) => string;
  canAfford: (cost: Record<string, number>) => boolean;
  calculateBuildingCost: (buildingId: string, quantity?: number) => Record<string, number>;
  canBuildBuilding: (buildingId: string, quantity?: number) => boolean;
  canPrestige: () => boolean;
  calculatePrestigeGain: () => number;
  getAvailablePopulation: () => bigint;
  addLogEntry: (message: string) => void;

  // Helper methods
  getBuildingEfficiency: (buildingId: string) => number;
  checkUnlocks: () => void;
  checkEraAdvancement: () => void;
  meetsRequirements: (requirements: any) => boolean;
}

const createInitialState = (): Omit<GameState, 'version'> => ({
  playerName: 'Vigour',
  eraId: 'stone_age',
  playthrough: 1,
  globalMultiplier: 1.0,
  totalPlaytime: 0,
  lastSave: Date.now(),
  lastTick: Date.now(),
  
  resources: {
    population: { amount: 10n, cap: 50n, perSec: 0n },
    food: { amount: 50n, cap: 1000n, perSec: 0n },
    wood: { amount: 10n, cap: 1000n, perSec: 0n },
    genius_coins: { amount: 0n, cap: 1000000n, perSec: 0n }
  },
  
  buildings: {
    tree: { count: 1n, workers: 0n }
  },
  
  achievements: new Set(),
  unlockedBuildings: new Set(['tree']),
  unlockedResources: new Set(['population', 'food', 'wood', 'genius_coins']),
  
  statistics: {
    totalResourcesProduced: {},
    totalBuildingsBuilt: {},
    totalTimeInEra: {}
  }
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial State
      version: 2,
      ...createInitialState(),
      currentTab: 'buildings',
      isLoading: false,

      // UI Actions
      setCurrentTab: (tab: TabType) => set({ currentTab: tab }),
      setPlayerName: (name: string) => {
        set({ playerName: name || 'Vigour' });
        get().addLogEntry(`👤 玩家名称设置为: ${name || 'Vigour'}`);
      },

      // Game Actions
      tick: () => {
        const state = get();
        const now = Date.now();
        const deltaTime = (now - state.lastTick) / 1000;
        
        // Update production cache
        const newResources = { ...state.resources };
        
        // Reset production rates
        Object.keys(newResources).forEach(resourceId => {
          newResources[resourceId] = { ...newResources[resourceId], perSec: 0n };
        });

        // Calculate production from buildings
        Object.entries(state.buildings).forEach(([buildingId, buildingState]) => {
          const buildingData = gameData.buildings[buildingId];
          if (!buildingData || buildingState.count === 0n) return;

          const efficiency = state.getBuildingEfficiency(buildingId);
          const count = buildingState.count;

          // Add production
          if (buildingData.production) {
            Object.entries(buildingData.production).forEach(([resourceId, amount]) => {
              if (newResources[resourceId]) {
                const production = BigInt(Math.floor(Number(count) * amount * efficiency));
                newResources[resourceId].perSec += production;
              }
            });
          }

          // Subtract consumption
          if (buildingData.consumption) {
            Object.entries(buildingData.consumption).forEach(([resourceId, amount]) => {
              if (newResources[resourceId]) {
                const consumption = BigInt(Math.floor(Number(count) * amount * efficiency));
                newResources[resourceId].perSec -= consumption;
              }
            });
          }
        });

        // Apply global multipliers
        const globalMul = BigInt(Math.floor(state.globalMultiplier * 100));
        Object.keys(newResources).forEach(resourceId => {
          if (resourceId !== 'population') {
            newResources[resourceId].perSec = newResources[resourceId].perSec * globalMul / 100n;
          }
        });

        // Update resource amounts
        Object.entries(newResources).forEach(([resourceId, resource]) => {
          if (resourceId === 'population') return;

          const change = BigInt(Math.floor(Number(resource.perSec) * deltaTime));
          const newAmount = resource.amount + change;
          
          resource.amount = newAmount < 0n ? 0n : (newAmount > resource.cap ? resource.cap : newAmount);
        });

        // Handle population and food
        const populationResource = newResources.population;
        const foodResource = newResources.food;
        
        const totalPopulation = populationResource.amount;
        const foodConsumption = totalPopulation * BigInt(Math.floor(deltaTime * 1));
        
        if (foodResource.amount >= foodConsumption) {
          foodResource.amount -= foodConsumption;
          if (populationResource.amount < populationResource.cap && Math.random() < 0.01 * deltaTime) {
            populationResource.amount += 1n;
          }
        } else {
          const starvationRate = BigInt(Math.floor(deltaTime * 0.1 * Number(totalPopulation)));
          populationResource.amount = populationResource.amount > starvationRate ? 
            populationResource.amount - starvationRate : 0n;
        }

        set({
          resources: newResources,
          lastTick: now,
          totalPlaytime: state.totalPlaytime + deltaTime
        });

        // Check unlocks and era advancement
        get().checkUnlocks();
        get().checkEraAdvancement();
      },

      clickBuilding: (buildingId: string) => {
        const buildingData = gameData.buildings[buildingId];
        if (!buildingData?.clickable || !buildingData.clickProduction) return;

        const state = get();
        const newResources = { ...state.resources };

        Object.entries(buildingData.clickProduction).forEach(([resourceId, amount]) => {
          if (newResources[resourceId]) {
            newResources[resourceId].amount += BigInt(amount);
          }
        });

        set({ resources: newResources });
        get().addLogEntry(`👆 点击 ${buildingData.name} 获得资源`);
      },

      buildBuilding: (buildingId: string, quantity = 1) => {
        const state = get();
        if (!state.canBuildBuilding(buildingId, quantity)) return false;

        const cost = state.calculateBuildingCost(buildingId, quantity);
        const newResources = { ...state.resources };

        // Deduct resources
        Object.entries(cost).forEach(([resourceId, amount]) => {
          newResources[resourceId].amount -= BigInt(amount);
        });

        // Add building
        const newBuildings = { ...state.buildings };
        if (!newBuildings[buildingId]) {
          newBuildings[buildingId] = { count: 0n, workers: 0n };
        }
        newBuildings[buildingId] = {
          ...newBuildings[buildingId],
          count: newBuildings[buildingId].count + BigInt(quantity)
        };

        const buildingData = gameData.buildings[buildingId];

        // Handle special effects
        if (buildingData.specialEffect === 'unlock_resource') {
          // Unlock stone resource when quarry is built
          if (buildingId === 'quarry' && !newResources.stone) {
            newResources.stone = { amount: 0n, cap: 1000n, perSec: 0n };
            const newUnlockedResources = new Set(state.unlockedResources);
            newUnlockedResources.add('stone');
            set({ unlockedResources: newUnlockedResources });
            get().addLogEntry('🔓 解锁新资源: 石头');
          }
        }

        set({ resources: newResources, buildings: newBuildings });
        get().addLogEntry(`🏗️ 建造了 ${quantity} 个 ${buildingData.name}`);

        // Trigger unlock check
        setTimeout(() => {
          get().checkUnlocks();
        }, 100);

        return true;
      },

      assignWorkers: (buildingId: string, amount: number) => {
        const state = get();
        const building = state.buildings[buildingId];
        const buildingData = gameData.buildings[buildingId];
        if (!building || !buildingData.workerCapacity) return false;

        const maxWorkers = BigInt(buildingData.workerCapacity * Number(building.count));
        const availablePopulation = state.getAvailablePopulation();
        
        const newWorkers = building.workers + BigInt(amount);
        const clampedWorkers = newWorkers < 0n ? 0n : (newWorkers > maxWorkers ? maxWorkers : newWorkers);
        
        const workerDiff = clampedWorkers - building.workers;
        if (workerDiff > availablePopulation) return false;

        const newBuildings = { ...state.buildings };
        newBuildings[buildingId] = { ...building, workers: clampedWorkers };
        
        set({ buildings: newBuildings });
        return true;
      },

      // System Actions
      saveGame: () => {
        set({ lastSave: Date.now() });
        get().addLogEntry('💾 游戏已保存');
      },

      resetGame: (keepPrestige = false) => {
        const state = get();
        const newState = createInitialState();
        
        if (keepPrestige) {
          newState.globalMultiplier = state.globalMultiplier;
          newState.playthrough = state.playthrough;
          newState.achievements = state.achievements;
          get().addLogEntry('🔄 游戏已重置（保留重生进度）');
        } else {
          get().addLogEntry('🔄 游戏已完全重置');
        }
        
        set({ ...newState, version: 2, currentTab: 'buildings', isLoading: false });
      },

      prestige: () => {
        const state = get();
        if (!state.canPrestige()) return false;

        const prestigeGain = state.calculatePrestigeGain();
        const newState = createInitialState();
        newState.globalMultiplier = state.globalMultiplier + prestigeGain;
        newState.playthrough = state.playthrough + 1;
        newState.achievements = state.achievements;
        
        set({ ...newState, version: 2, currentTab: 'buildings', isLoading: false });
        get().addLogEntry(`🌟 重生完成！获得 +${prestigeGain.toFixed(2)}x 全局倍率`);
        
        return true;
      },

      // Utility Functions
      formatNumber: (value: bigint) => {
        const num = Number(value);
        
        if (num >= 1e24) return (num / 1e24).toFixed(2) + 'Y';
        if (num >= 1e21) return (num / 1e21).toFixed(2) + 'Z';
        if (num >= 1e18) return (num / 1e18).toFixed(2) + 'E';
        if (num >= 1e15) return (num / 1e15).toFixed(2) + 'P';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        
        return num.toLocaleString();
      },

      canAfford: (cost: Record<string, number>) => {
        const state = get();
        return Object.entries(cost).every(([resourceId, amount]) => {
          const resource = state.resources[resourceId];
          return resource && resource.amount >= BigInt(amount);
        });
      },

      calculateBuildingCost: (buildingId: string, quantity = 1) => {
        const state = get();
        const buildingData = gameData.buildings[buildingId];
        const currentCount = Number(state.buildings[buildingId]?.count || 0n);
        const cost: Record<string, number> = {};

        Object.entries(buildingData.baseCost).forEach(([resourceId, baseAmount]) => {
          let totalCost = 0;
          for (let i = 0; i < quantity; i++) {
            const buildingNumber = currentCount + i;
            const multipliedCost = baseAmount * Math.pow(buildingData.costMultiplier, buildingNumber);
            totalCost += Math.floor(multipliedCost);
          }
          cost[resourceId] = totalCost;
        });

        return cost;
      },

      canBuildBuilding: (buildingId: string, quantity = 1) => {
        const state = get();
        const buildingData = gameData.buildings[buildingId];
        if (!buildingData) return false;
        
        if (!state.unlockedBuildings.has(buildingId)) return false;
        
        const currentCount = state.buildings[buildingId]?.count || 0n;
        if (currentCount + BigInt(quantity) > BigInt(buildingData.maxCount)) return false;

        const cost = state.calculateBuildingCost(buildingId, quantity);
        return state.canAfford(cost);
      },

      canPrestige: () => {
        const state = get();
        return state.buildings.warp_drive_factory && state.buildings.warp_drive_factory.count > 0n;
      },

      calculatePrestigeGain: () => {
        const state = get();
        let totalProduction = 0;
        Object.values(state.statistics.totalResourcesProduced || {}).forEach(amount => {
          totalProduction += Number(amount);
        });
        
        const prestigeGain = Math.floor(Math.pow(totalProduction / 1e6, 0.5) * 0.05 * 100) / 100;
        return Math.max(0, prestigeGain);
      },

      getAvailablePopulation: () => {
        const state = get();
        const totalPopulation = state.resources.population.amount;
        let assignedWorkers = 0n;
        
        Object.values(state.buildings).forEach(building => {
          assignedWorkers += building.workers || 0n;
        });
        
        return totalPopulation - assignedWorkers;
      },

      addLogEntry: (message: string) => {
        // This will be handled by the UI component
        console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
      },

      // Helper methods that need to be defined
      getBuildingEfficiency: (buildingId: string) => {
        const state = get();
        const buildingData = gameData.buildings[buildingId];
        if (!buildingData.workerRequirement) return 1.0;

        const buildingState = state.buildings[buildingId];
        const workersAssigned = Number(buildingState.workers);
        const workersRequired = buildingData.workerRequirement * Number(buildingState.count);
        
        return Math.min(1.0, workersAssigned / workersRequired);
      },

      checkUnlocks: () => {
        const state = get();
        let hasNewUnlocks = false;
        const newUnlockedBuildings = new Set(state.unlockedBuildings);
        const newUnlockedResources = new Set(state.unlockedResources);

        // Check building unlocks
        Object.entries(gameData.buildings).forEach(([buildingId, buildingData]) => {
          if (newUnlockedBuildings.has(buildingId)) return;

          if (state.meetsRequirements(buildingData.unlockRequirements)) {
            newUnlockedBuildings.add(buildingId);
            hasNewUnlocks = true;
            get().addLogEntry(`🔓 解锁新建筑: ${buildingData.name}`);
          }
        });

        // Check resource unlocks
        Object.entries(gameData.resources).forEach(([resourceId, resourceData]) => {
          if (newUnlockedResources.has(resourceId)) return;

          if (!resourceData.unlockEra || resourceData.unlockEra === state.eraId) {
            newUnlockedResources.add(resourceId);
            hasNewUnlocks = true;

            // Add the resource to the game state if it doesn't exist
            if (!state.resources[resourceId]) {
              const newResources = { ...state.resources };
              newResources[resourceId] = {
                amount: BigInt(resourceData.baseValue || 0),
                cap: BigInt(resourceData.maxValue || 1000),
                perSec: 0n
              };
              set({ resources: newResources });
            }
          }
        });

        if (hasNewUnlocks) {
          set({
            unlockedBuildings: newUnlockedBuildings,
            unlockedResources: newUnlockedResources
          });
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
            get().addLogEntry(`🎉 进入新时代: ${newEra.name} ${newEra.icon}`);

            // Trigger unlock check for new era resources and buildings
            setTimeout(() => {
              get().checkUnlocks();
            }, 100);
          }
        }
      },

      meetsRequirements: (requirements: any) => {
        const state = get();
        if (!requirements) return true;

        // Check era requirement
        if (requirements.era && requirements.era !== state.eraId) {
          return false;
        }

        // Check resource requirements
        if (requirements.resources) {
          for (const [resourceId, amount] of Object.entries(requirements.resources)) {
            const resource = state.resources[resourceId];
            if (!resource || resource.amount < BigInt(amount as number)) {
              return false;
            }
          }
        }

        // Check building requirements
        if (requirements.buildings) {
          for (const [buildingId, count] of Object.entries(requirements.buildings)) {
            const building = state.buildings[buildingId];
            if (!building || building.count < BigInt(count as number)) {
              return false;
            }
          }
        }

        // Check population requirement
        if (requirements.population) {
          if (state.resources.population.amount < BigInt(requirements.population)) {
            return false;
          }
        }

        return true;
      }
    }),
    {
      name: 'gotofuture-game-state',
      version: 2,
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
          Object.entries(state.resources).map(([id, res]) => [
            id, {
              amount: res.amount.toString(),
              cap: res.cap.toString(),
              perSec: res.perSec.toString()
            }
          ])
        ),
        buildings: Object.fromEntries(
          Object.entries(state.buildings).map(([id, building]) => [
            id, {
              count: building.count.toString(),
              workers: building.workers.toString()
            }
          ])
        ),
        achievements: Array.from(state.achievements),
        unlockedBuildings: Array.from(state.unlockedBuildings),
        unlockedResources: Array.from(state.unlockedResources),
        statistics: state.statistics
      }),
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;

        // Convert string BigInts back to BigInt
        const resources = Object.fromEntries(
          Object.entries(persistedState.resources || {}).map(([id, res]: [string, any]) => [
            id, {
              amount: BigInt(res.amount || '0'),
              cap: BigInt(res.cap || '1000'),
              perSec: BigInt(res.perSec || '0')
            }
          ])
        );

        const buildings = Object.fromEntries(
          Object.entries(persistedState.buildings || {}).map(([id, building]: [string, any]) => [
            id, {
              count: BigInt(building.count || '0'),
              workers: BigInt(building.workers || '0')
            }
          ])
        );

        return {
          ...currentState,
          ...persistedState,
          resources,
          buildings,
          achievements: new Set(persistedState.achievements || []),
          unlockedBuildings: new Set(persistedState.unlockedBuildings || ['tree']),
          unlockedResources: new Set(persistedState.unlockedResources || ['population', 'food', 'wood', 'genius_coins']),
        };
      }
    }
  )
);
