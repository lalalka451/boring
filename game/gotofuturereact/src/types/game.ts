// Game Types and Interfaces

export interface ResourceSnapshot {
  amount: bigint;
  cap: bigint;
  perSec: bigint;
}

export interface BuildingInstance {
  count: bigint;
  workers: bigint;
}

export interface GameState {
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
  
  statistics: {
    totalResourcesProduced: Record<string, bigint>;
    totalBuildingsBuilt: Record<string, bigint>;
    totalTimeInEra: Record<string, number>;
  };
}

export interface ResourceData {
  id: string;
  name: string;
  icon: string;
  category: string;
  baseValue: number;
  maxValue: number;
  growthRate: number;
  consumptionRate?: number;
  isWorker?: boolean;
  unlockEra?: string;
  recipe?: Record<string, number>;
  description: string;
}

export interface BuildingData {
  id: string;
  name: string;
  icon: string;
  category: string;
  era: string;
  description: string;
  baseCost: Record<string, number>;
  costMultiplier: number;
  maxCount: number;
  unlockRequirements: {
    era?: string;
    resources?: Record<string, number>;
    buildings?: Record<string, number>;
    population?: number;
  };
  production?: Record<string, number>;
  consumption?: Record<string, number>;
  workerCapacity?: number;
  workerRequirement?: number;
  populationCapacity?: number;
  clickable?: boolean;
  clickProduction?: Record<string, number>;
  specialEffect?: string;
  effectValue?: number;
}

export interface EraData {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockRequirements: {
    era?: string;
    resources?: Record<string, number>;
    buildings?: Record<string, number>;
    population?: number;
  };
  advanceRequirements: {
    population?: number;
    resources?: Record<string, number>;
    buildings?: Record<string, number>;
  };
  maxBuildings?: Record<string, number>;
  techMultipliers: {
    population_cap?: number;
    food_production?: number;
    wood_production?: number;
    metal_production?: number;
    energy_production?: number;
    research_speed?: number;
    automation?: number;
    ai_production?: number;
    space_production?: number;
    all_production?: number;
    dimensional_power?: number;
  };
}

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    era?: string;
    resources?: Record<string, number>;
    buildings?: Record<string, number>;
    population?: number;
    playthrough?: number;
    total_produced?: Record<string, number>;
    total_buildings?: number;
    playtime?: number;
    buildings_built?: number;
  };
  reward: {
    type: 'none' | 'resource' | 'multiplier';
    resource?: string;
    amount?: number;
    value?: number;
  };
}

export interface GameData {
  eras: Record<string, EraData>;
  resources: Record<string, ResourceData>;
  buildings: Record<string, BuildingData>;
  achievements: Record<string, AchievementData>;
}

export type TabType = 'buildings' | 'minigames' | 'achievements' | 'statistics';

export interface MiniGameResult {
  success: boolean;
  rewards?: Record<string, number>;
  message: string;
}
