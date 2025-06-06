/**
 * Resource Manager - handles all resource-related operations
 * Follows the Manager pattern for centralized resource logic
 */

import { Resource, PopulationResource } from '../entities/Resource';
import { gameData } from '../../data/gameData';
import { ResourceData } from '../../types/game';

export class ResourceManager {
  private readonly _resources: Map<string, Resource> = new Map();
  private readonly _unlockedResources: Set<string> = new Set();

  constructor() {
    this.initializeResources();
  }

  /**
   * Initialize all resources from game data
   */
  private initializeResources(): void {
    Object.values(gameData.resources).forEach(data => {
      const resource = this.createResource(data);
      this._resources.set(data.id, resource);
      
      // Auto-unlock basic resources
      if (data.category === 'basic' || data.id === 'population') {
        this.unlockResource(data.id);
      }
    });
  }

  /**
   * Factory method to create appropriate resource type
   */
  private createResource(data: ResourceData): Resource {
    switch (data.id) {
      case 'population':
        return new PopulationResource(data);
      default:
        return new Resource(data);
    }
  }

  /**
   * Get a resource by ID
   */
  getResource(id: string): Resource | null {
    return this._resources.get(id) || null;
  }

  /**
   * Get all resources
   */
  getAllResources(): Resource[] {
    return Array.from(this._resources.values());
  }

  /**
   * Get all unlocked resources
   */
  getUnlockedResources(): Resource[] {
    return this.getAllResources().filter(r => r.isUnlocked);
  }

  /**
   * Check if a resource is unlocked
   */
  isResourceUnlocked(id: string): boolean {
    return this._unlockedResources.has(id);
  }

  /**
   * Unlock a resource
   */
  unlockResource(id: string): boolean {
    const resource = this._resources.get(id);
    if (!resource) return false;

    this._unlockedResources.add(id);
    resource.unlock();
    return true;
  }

  /**
   * Lock a resource
   */
  lockResource(id: string): boolean {
    const resource = this._resources.get(id);
    if (!resource) return false;

    this._unlockedResources.delete(id);
    resource.lock();
    return true;
  }

  /**
   * Add amount to a resource
   */
  addResource(id: string, amount: bigint): boolean {
    const resource = this._resources.get(id);
    if (!resource || !resource.isUnlocked) return false;

    resource.addAmount(amount);
    return true;
  }

  /**
   * Subtract amount from a resource
   */
  subtractResource(id: string, amount: bigint): boolean {
    const resource = this._resources.get(id);
    if (!resource || !resource.isUnlocked) return false;

    if (!resource.canAfford(amount)) return false;

    resource.subtractAmount(amount);
    return true;
  }

  /**
   * Set resource amount directly
   */
  setResource(id: string, amount: bigint): boolean {
    const resource = this._resources.get(id);
    if (!resource || !resource.isUnlocked) return false;

    resource.setAmount(amount);
    return true;
  }

  /**
   * Set resource capacity
   */
  setResourceCapacity(id: string, capacity: bigint): boolean {
    const resource = this._resources.get(id);
    if (!resource) return false;

    resource.setMaxAmount(capacity);
    return true;
  }

  /**
   * Check if player can afford a cost
   */
  canAfford(cost: Record<string, number>): boolean {
    return Object.entries(cost).every(([id, amount]) => {
      const resource = this._resources.get(id);
      return resource && resource.canAfford(BigInt(amount));
    });
  }

  /**
   * Spend resources for a cost
   */
  spendResources(cost: Record<string, number>): boolean {
    if (!this.canAfford(cost)) return false;

    Object.entries(cost).forEach(([id, amount]) => {
      this.subtractResource(id, BigInt(amount));
    });

    return true;
  }

  /**
   * Set production rate for a resource
   */
  setProductionRate(id: string, rate: bigint): boolean {
    const resource = this._resources.get(id);
    if (!resource) return false;

    resource.setProductionRate(rate);
    return true;
  }

  /**
   * Set consumption rate for a resource
   */
  setConsumptionRate(id: string, rate: bigint): boolean {
    const resource = this._resources.get(id);
    if (!resource) return false;

    resource.setConsumptionRate(rate);
    return true;
  }

  /**
   * Reset all production rates to zero
   */
  resetProductionRates(): void {
    this._resources.forEach(resource => {
      resource.setProductionRate(0n);
      resource.setConsumptionRate(0n);
    });
  }

  /**
   * Update all resources (called each game tick)
   */
  update(deltaTime: number): void {
    this._resources.forEach(resource => {
      if (resource.isUnlocked) {
        resource.update(deltaTime);
      }
    });
  }

  /**
   * Get total assigned workers across all buildings
   */
  getTotalAssignedWorkers(): bigint {
    // This would be calculated by the BuildingManager
    // For now, return 0 as placeholder
    return 0n;
  }

  /**
   * Get available workers (population - assigned)
   */
  getAvailableWorkers(): bigint {
    const population = this._resources.get('population') as PopulationResource;
    if (!population) return 0n;

    return population.getAvailableWorkers(this.getTotalAssignedWorkers());
  }

  /**
   * Serialize all resources for saving
   */
  serialize(): Record<string, any> {
    const resourceData: Record<string, any> = {};
    
    this._resources.forEach((resource, id) => {
      resourceData[id] = resource.serialize();
    });

    return {
      resources: resourceData,
      unlockedResources: Array.from(this._unlockedResources)
    };
  }

  /**
   * Deserialize resources from save data
   */
  deserialize(data: Record<string, any>): void {
    if (data.unlockedResources) {
      this._unlockedResources.clear();
      data.unlockedResources.forEach((id: string) => {
        this._unlockedResources.add(id);
      });
    }

    if (data.resources) {
      Object.entries(data.resources).forEach(([id, resourceData]: [string, any]) => {
        const resource = this._resources.get(id);
        if (resource) {
          resource.deserialize(resourceData);
          if (this._unlockedResources.has(id)) {
            resource.unlock();
          }
        }
      });
    }
  }
}
