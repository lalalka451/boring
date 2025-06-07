/**
 * Building Manager - handles all building-related operations
 * Follows the Manager pattern for centralized building logic
 */

import { Building } from '../entities/Building';
import { ResourceManager } from './ResourceManager';
import { gameData } from '../../data/gameData';
import { BuildingData } from '../../types/game';

export class BuildingManager {
  private readonly _buildings: Map<string, Building> = new Map();
  private readonly _unlockedBuildings: Set<string> = new Set();
  private _resourceManager: ResourceManager | null = null;

  constructor() {
    this.initializeBuildings();
  }

  /**
   * Set reference to resource manager for cross-manager operations
   */
  setResourceManager(resourceManager: ResourceManager): void {
    this._resourceManager = resourceManager;
  }

  /**
   * Initialize all buildings from game data
   */
  private initializeBuildings(): void {
    Object.values(gameData.buildings).forEach(data => {
      const building = new Building(data);
      this._buildings.set(data.id, building);
      
      // Auto-unlock basic buildings
      if (data.category === 'basic' || data.id === 'tree') {
        this.unlockBuilding(data.id);
      }
    });
  }

  /**
   * Get a building by ID
   */
  getBuilding(id: string): Building | null {
    return this._buildings.get(id) || null;
  }

  /**
   * Get all buildings
   */
  getAllBuildings(): Building[] {
    return Array.from(this._buildings.values());
  }

  /**
   * Get all unlocked buildings
   */
  getUnlockedBuildings(): Building[] {
    return this.getAllBuildings().filter(b => b.isUnlocked);
  }

  /**
   * Check if a building is unlocked
   */
  isBuildingUnlocked(id: string): boolean {
    return this._unlockedBuildings.has(id);
  }

  /**
   * Unlock a building
   */
  unlockBuilding(id: string): boolean {
    const building = this._buildings.get(id);
    if (!building) return false;

    this._unlockedBuildings.add(id);
    building.unlock();
    return true;
  }

  /**
   * Lock a building
   */
  lockBuilding(id: string): boolean {
    const building = this._buildings.get(id);
    if (!building) return false;

    this._unlockedBuildings.delete(id);
    building.lock();
    return true;
  }

  /**
   * Build instances of a building
   */
  buildBuilding(id: string, quantity: number = 1): boolean {
    const building = this._buildings.get(id);
    if (!building || !building.isUnlocked) return false;

    // Check if we can afford the cost
    const cost = building.calculateBuildCost(quantity);
    if (!this._resourceManager?.canAfford(cost)) return false;

    // Check if we can build this many
    if (building.amount + BigInt(quantity) > building.maxAmount) return false;

    // Spend resources and build
    if (!this._resourceManager?.spendResources(cost)) return false;
    
    return building.build(BigInt(quantity));
  }

  /**
   * Click a clickable building
   */
  clickBuilding(id: string): Record<string, number> {
    const building = this._buildings.get(id);
    if (!building || !building.isUnlocked || !building.isClickable) {
      return {};
    }

    const rewards = building.click();
    
    // Add rewards to resources
    Object.entries(rewards).forEach(([resourceId, amount]) => {
      this._resourceManager?.addResource(resourceId, BigInt(amount));
    });

    return rewards;
  }

  /**
   * Assign workers to a building
   */
  assignWorkers(buildingId: string, count: number): number {
    const building = this._buildings.get(buildingId);
    if (!building || !building.isUnlocked) return 0;

    // Check available workers
    const availableWorkers = this._resourceManager?.getAvailableWorkers() || 0n;
    const requestedWorkers = BigInt(count);
    const workersToAssign = requestedWorkers > availableWorkers ? availableWorkers : requestedWorkers;

    const actualAssigned = building.assignWorkers(workersToAssign);
    this.updateProductionRates();
    
    return Number(actualAssigned);
  }

  /**
   * Unassign workers from a building
   */
  unassignWorkers(buildingId: string, count: number): number {
    const building = this._buildings.get(buildingId);
    if (!building) return 0;

    const actualUnassigned = building.unassignWorkers(BigInt(count));
    this.updateProductionRates();
    
    return Number(actualUnassigned);
  }

  /**
   * Get total assigned workers across all buildings
   */
  getTotalAssignedWorkers(): bigint {
    return this.getAllBuildings().reduce((total, building) => {
      return total + building.workers;
    }, 0n);
  }

  /**
   * Calculate if a building can be built
   */
  canBuildBuilding(id: string, quantity: number = 1): boolean {
    const building = this._buildings.get(id);
    if (!building || !building.isUnlocked) return false;

    // Check quantity limits
    if (building.amount + BigInt(quantity) > building.maxAmount) return false;

    // Check cost
    const cost = building.calculateBuildCost(quantity);
    return this._resourceManager?.canAfford(cost) || false;
  }

  /**
   * Calculate building cost
   */
  calculateBuildingCost(id: string, quantity: number = 1): Record<string, number> {
    const building = this._buildings.get(id);
    if (!building) return {};

    return building.calculateBuildCost(quantity);
  }

  /**
   * Get building efficiency
   */
  getBuildingEfficiency(id: string): number {
    const building = this._buildings.get(id);
    return building?.efficiency || 0;
  }

  /**
   * Update production rates for all resources based on buildings
   */
  updateProductionRates(): void {
    if (!this._resourceManager) return;

    // Reset all production rates
    this._resourceManager.resetProductionRates();

    // Calculate production from all buildings
    this._buildings.forEach(building => {
      if (!building.isUnlocked || building.amount === 0n) return;

      // Get all resources this building affects
      const allResourceIds = new Set([
        ...Object.keys(building.data.production || {}),
        ...Object.keys(building.data.consumption || {})
      ]);

      allResourceIds.forEach(resourceId => {
        const production = building.getResourceProduction(resourceId);
        const consumption = building.getResourceConsumption(resourceId);
        const netChange = production - consumption;

        if (netChange !== 0n) {
          const currentResource = this._resourceManager!.getResource(resourceId);
          if (currentResource) {
            const currentProduction = currentResource.productionRate;
            const currentConsumption = currentResource.consumptionRate;
            
            if (netChange > 0n) {
              this._resourceManager!.setProductionRate(resourceId, currentProduction + netChange);
            } else {
              this._resourceManager!.setConsumptionRate(resourceId, currentConsumption + (-netChange));
            }
          }
        }
      });
    });
  }

  /**
   * Check for building unlocks based on current game state
   */
  checkUnlocks(currentEra: string, resourceManager: ResourceManager): string[] {
    const newUnlocks: string[] = [];

    this._buildings.forEach((building, id) => {
      if (building.isUnlocked) return;

      const data = building.data;
      let canUnlock = true;

      // Check era requirement
      if (data.unlockRequirements?.era && data.unlockRequirements.era !== currentEra) {
        canUnlock = false;
      }

      // Check resource requirements
      if (data.unlockRequirements?.resources) {
        const hasResources = resourceManager.canAfford(data.unlockRequirements.resources);
        if (!hasResources) canUnlock = false;
      }

      // Check building requirements
      if (data.unlockRequirements?.buildings) {
        Object.entries(data.unlockRequirements.buildings).forEach(([buildingId, count]) => {
          const requiredBuilding = this._buildings.get(buildingId);
          if (!requiredBuilding || requiredBuilding.amount < BigInt(count as number)) {
            canUnlock = false;
          }
        });
      }

      if (canUnlock) {
        this.unlockBuilding(id);
        newUnlocks.push(id);
      }
    });

    return newUnlocks;
  }

  /**
   * Update all buildings (called each game tick)
   */
  update(deltaTime: number): void {
    this._buildings.forEach(building => {
      if (building.isUnlocked) {
        building.update(deltaTime);
      }
    });
  }

  /**
   * Serialize all buildings for saving
   */
  serialize(): Record<string, any> {
    const buildingData: Record<string, any> = {};
    
    this._buildings.forEach((building, id) => {
      buildingData[id] = building.serialize();
    });

    return {
      buildings: buildingData,
      unlockedBuildings: Array.from(this._unlockedBuildings)
    };
  }

  /**
   * Deserialize buildings from save data
   */
  deserialize(data: Record<string, any>): void {
    if (data.unlockedBuildings) {
      this._unlockedBuildings.clear();
      data.unlockedBuildings.forEach((id: string) => {
        this._unlockedBuildings.add(id);
      });
    }

    if (data.buildings) {
      Object.entries(data.buildings).forEach(([id, buildingData]: [string, any]) => {
        const building = this._buildings.get(id);
        if (building) {
          building.deserialize(buildingData);
          if (this._unlockedBuildings.has(id)) {
            building.unlock();
          }
        }
      });
    }

    // Update production rates after loading
    this.updateProductionRates();
  }
}
