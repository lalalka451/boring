/**
 * Resource entity - represents a single resource type (wood, stone, etc.)
 */

import { ProductiveEntity } from '../core/GameEntity';
import { ResourceData } from '../../types/game';

export class Resource extends ProductiveEntity {
  private readonly _data: ResourceData;
  private _isUnlocked: boolean = false;

  constructor(data: ResourceData, initialAmount: bigint = 0n) {
    super(data.id, initialAmount);
    this._data = data;
    this.setMaxAmount(BigInt(data.maxValue || 1000000));
  }

  get data(): ResourceData {
    return this._data;
  }

  get name(): string {
    return this._data.name;
  }

  get icon(): string {
    return this._data.icon;
  }

  get isUnlocked(): boolean {
    return this._isUnlocked;
  }

  get category(): string {
    return this._data.category || 'basic';
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
   * Calculate storage efficiency based on current amount vs capacity
   */
  get storageEfficiency(): number {
    if (this._maxAmount === 0n) return 0;
    return Number(this._amount) / Number(this._maxAmount);
  }

  /**
   * Check if resource is at capacity
   */
  get isFull(): boolean {
    return this._amount >= this._maxAmount;
  }

  /**
   * Check if resource is empty
   */
  get isEmpty(): boolean {
    return this._amount <= 0n;
  }

  /**
   * Get formatted display string
   */
  getDisplayString(): string {
    return `${this._data.icon} ${this.formatAmount()} ${this._data.name}`;
  }

  /**
   * Format amount for display
   */
  formatAmount(): string {
    const num = Number(this._amount);
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
  }

  /**
   * Get production rate display string
   */
  getProductionDisplay(): string {
    const net = this.netProduction;
    const sign = net >= 0n ? '+' : '';
    return `${sign}${this.formatAmount()}${net.toString()}/s`;
  }

  serialize(): Record<string, any> {
    return {
      ...super.serialize(),
      isUnlocked: this._isUnlocked,
      dataId: this._data.id
    };
  }

  deserialize(data: Record<string, any>): void {
    super.deserialize(data);
    this._isUnlocked = data.isUnlocked || false;
  }
}

/**
 * Special resource types with additional behavior
 */
export class PopulationResource extends Resource {
  private _capacity: bigint = 50n;
  private _growthRate: number = 0.1; // 10% per minute base growth

  constructor(data: ResourceData) {
    super(data, 10n); // Start with 10 population
    this._capacity = 50n;
  }

  get capacity(): bigint {
    return this._capacity;
  }

  get growthRate(): number {
    return this._growthRate;
  }

  setCapacity(capacity: bigint): void {
    this._capacity = capacity;
    this.setMaxAmount(capacity);
    this.markUpdated();
  }

  setGrowthRate(rate: number): void {
    this._growthRate = Math.max(0, rate);
    this.markUpdated();
  }

  /**
   * Calculate natural population growth
   */
  update(deltaTime: number): void {
    super.update(deltaTime);

    if (!this._isActive || this._amount >= this._capacity) return;

    // Natural growth based on current population and available space
    const deltaSeconds = deltaTime / 1000;
    const availableSpace = Number(this._capacity - this._amount);
    const currentPop = Number(this._amount);
    
    // Logistic growth model
    const growthFactor = this._growthRate * (availableSpace / Number(this._capacity));
    const growth = Math.floor(currentPop * growthFactor * deltaSeconds / 60); // per minute to per second
    
    if (growth > 0) {
      this.addAmount(BigInt(growth));
    }
  }

  /**
   * Get available workers (population not assigned to buildings)
   */
  getAvailableWorkers(assignedWorkers: bigint): bigint {
    return this._amount - assignedWorkers;
  }

  serialize(): Record<string, any> {
    return {
      ...super.serialize(),
      capacity: this._capacity.toString(),
      growthRate: this._growthRate
    };
  }

  deserialize(data: Record<string, any>): void {
    super.deserialize(data);
    this._capacity = BigInt(data.capacity || '50');
    this._growthRate = data.growthRate || 0.1;
  }
}
