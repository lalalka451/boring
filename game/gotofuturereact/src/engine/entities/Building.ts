/**
 * Building entity - represents a single building type with worker management
 */

import { CountableEntity } from '../core/GameEntity';
import { BuildingData } from '../../types/game';

export class Building extends CountableEntity {
  private readonly _data: BuildingData;
  private _workers: bigint = 0n;
  private _isUnlocked: boolean = false;
  private _efficiency: number = 0;

  constructor(data: BuildingData, initialCount: bigint = 0n) {
    super(data.id, initialCount);
    this._data = data;
    this.setMaxAmount(BigInt(data.maxCount || 1000000));
  }

  get data(): BuildingData {
    return this._data;
  }

  get name(): string {
    return this._data.name;
  }

  get icon(): string {
    return this._data.icon;
  }

  get workers(): bigint {
    return this._workers;
  }

  get isUnlocked(): boolean {
    return this._isUnlocked;
  }

  get efficiency(): number {
    return this._efficiency;
  }

  get category(): string {
    return this._data.category;
  }

  get era(): string {
    return this._data.era;
  }

  get isClickable(): boolean {
    return this._data.clickable || false;
  }

  /**
   * Get total worker capacity for all instances of this building
   */
  get totalWorkerCapacity(): number {
    return (this._data.workerCapacity || 0) * Number(this._amount);
  }

  /**
   * Get optimal worker count for all instances
   */
  get optimalWorkerCount(): number {
    return (this._data.workerRequirement || this._data.workerCapacity || 0) * Number(this._amount);
  }

  unlock(): void {
    this._isUnlocked = true;
    this.activate();
    this.markUpdated();
  }

  lock(): void {
    this._isUnlocked = false;
    this.deactivate();
    this.markUpdated();
  }

  /**
   * Build additional instances of this building
   */
  build(quantity: bigint): boolean {
    if (!this._isUnlocked || !this._isActive) return false;
    
    const newAmount = this._amount + quantity;
    if (newAmount > this._maxAmount) return false;

    this.setAmount(newAmount);
    this.recalculateEfficiency();
    return true;
  }

  /**
   * Assign workers to this building
   */
  assignWorkers(count: bigint): bigint {
    const maxWorkers = BigInt(this.totalWorkerCapacity);
    const availableSlots = maxWorkers - this._workers;
    const actualAssigned = count > availableSlots ? availableSlots : count;
    
    this._workers += actualAssigned;
    this.recalculateEfficiency();
    this.markUpdated();
    
    return actualAssigned;
  }

  /**
   * Unassign workers from this building
   */
  unassignWorkers(count: bigint): bigint {
    const actualUnassigned = count > this._workers ? this._workers : count;
    this._workers -= actualUnassigned;
    this.recalculateEfficiency();
    this.markUpdated();
    
    return actualUnassigned;
  }

  /**
   * Calculate current efficiency based on worker assignment
   */
  private recalculateEfficiency(): void {
    if (!this._data.workerCapacity || this._amount === 0n) {
      this._efficiency = 1.0; // Buildings without workers work at full efficiency
      return;
    }

    if (this._workers === 0n) {
      this._efficiency = 0.0; // No workers = no production
      return;
    }

    const workersPerBuilding = Number(this._workers) / Number(this._amount);
    const optimalWorkers = this._data.workerRequirement || this._data.workerCapacity;
    
    this._efficiency = Math.min(1.0, workersPerBuilding / optimalWorkers);
  }

  /**
   * Get production output for a specific resource
   */
  getResourceProduction(resourceId: string): bigint {
    if (!this._data.production || !this._isActive) return 0n;
    
    const baseProduction = this._data.production[resourceId] || 0;
    const totalProduction = baseProduction * Number(this._amount) * this._efficiency;
    
    return BigInt(Math.floor(totalProduction));
  }

  /**
   * Get consumption for a specific resource
   */
  getResourceConsumption(resourceId: string): bigint {
    if (!this._data.consumption || !this._isActive) return 0n;
    
    const baseConsumption = this._data.consumption[resourceId] || 0;
    const totalConsumption = baseConsumption * Number(this._amount) * this._efficiency;
    
    return BigInt(Math.floor(totalConsumption));
  }

  /**
   * Get net resource change (production - consumption)
   */
  getNetResourceChange(resourceId: string): bigint {
    return this.getResourceProduction(resourceId) - this.getResourceConsumption(resourceId);
  }

  /**
   * Calculate cost to build additional instances
   */
  calculateBuildCost(quantity: number): Record<string, number> {
    const cost: Record<string, number> = {};
    const currentCount = Number(this._amount);
    
    Object.entries(this._data.baseCost).forEach(([resourceId, baseCost]) => {
      let totalCost = 0;
      for (let i = 0; i < quantity; i++) {
        const buildingIndex = currentCount + i;
        const scaledCost = baseCost * Math.pow(this._data.costMultiplier, buildingIndex);
        totalCost += Math.floor(scaledCost);
      }
      cost[resourceId] = totalCost;
    });
    
    return cost;
  }

  /**
   * Handle click interaction for clickable buildings
   */
  click(): Record<string, number> {
    if (!this.isClickable || !this._data.clickProduction) {
      return {};
    }
    
    return { ...this._data.clickProduction };
  }

  /**
   * Get worker assignment status display
   */
  getWorkerStatusDisplay(): string {
    if (!this._data.workerCapacity) return '';

    const current = Number(this._workers);
    const capacity = this.totalWorkerCapacity;
    const optimal = this.optimalWorkerCount;

    return `👷 ${current}/${capacity} (建议: ${optimal})`;
  }

  /**
   * Get efficiency display as percentage
   */
  getEfficiencyDisplay(): string {
    return `${Math.round(this._efficiency * 100)}%`;
  }

  update(deltaTime: number): void {
    if (!this._isActive) return;
    
    // Buildings don't need per-frame updates, but this could be used for
    // special effects, animations, or time-based bonuses
    this.markUpdated();
  }

  serialize(): Record<string, any> {
    return {
      ...super.serialize(),
      workers: this._workers.toString(),
      isUnlocked: this._isUnlocked,
      efficiency: this._efficiency,
      dataId: this._data.id
    };
  }

  deserialize(data: Record<string, any>): void {
    super.deserialize(data);
    this._workers = BigInt(data.workers || '0');
    this._isUnlocked = data.isUnlocked || false;
    this._efficiency = data.efficiency || 0;
    this.recalculateEfficiency();
  }
}
