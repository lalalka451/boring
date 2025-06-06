/**
 * Base class for all game entities
 * Provides common functionality like ID management, state tracking, and events
 */

export abstract class GameEntity {
  protected readonly _id: string;
  protected _isActive: boolean = true;
  protected _lastUpdate: number = Date.now();
  
  constructor(id: string) {
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastUpdate(): number {
    return this._lastUpdate;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  protected markUpdated(): void {
    this._lastUpdate = Date.now();
  }

  abstract update(deltaTime: number): void;
  abstract serialize(): Record<string, any>;
  abstract deserialize(data: Record<string, any>): void;
}

/**
 * Base class for entities that can be counted (buildings, resources, etc.)
 */
export abstract class CountableEntity extends GameEntity {
  protected _amount: bigint = 0n;
  protected _maxAmount: bigint = BigInt(Number.MAX_SAFE_INTEGER);

  constructor(id: string, initialAmount: bigint = 0n) {
    super(id);
    this._amount = initialAmount;
  }

  get amount(): bigint {
    return this._amount;
  }

  get maxAmount(): bigint {
    return this._maxAmount;
  }

  setAmount(amount: bigint): void {
    this._amount = this.clamp(amount);
    this.markUpdated();
  }

  addAmount(delta: bigint): void {
    this.setAmount(this._amount + delta);
  }

  subtractAmount(delta: bigint): void {
    this.setAmount(this._amount - delta);
  }

  setMaxAmount(max: bigint): void {
    this._maxAmount = max;
    this._amount = this.clamp(this._amount);
    this.markUpdated();
  }

  protected clamp(value: bigint): bigint {
    return value < 0n ? 0n : value > this._maxAmount ? this._maxAmount : value;
  }

  canAfford(cost: bigint): boolean {
    return this._amount >= cost;
  }

  serialize(): Record<string, any> {
    return {
      id: this._id,
      amount: this._amount.toString(),
      maxAmount: this._maxAmount.toString(),
      isActive: this._isActive,
      lastUpdate: this._lastUpdate
    };
  }

  deserialize(data: Record<string, any>): void {
    this._amount = BigInt(data.amount || '0');
    this._maxAmount = BigInt(data.maxAmount || '0');
    this._isActive = data.isActive ?? true;
    this._lastUpdate = data.lastUpdate || Date.now();
  }
}

/**
 * Base class for entities that produce/consume resources over time
 */
export abstract class ProductiveEntity extends CountableEntity {
  protected _productionRate: bigint = 0n;
  protected _consumptionRate: bigint = 0n;
  protected _efficiency: number = 1.0;

  constructor(id: string, initialAmount: bigint = 0n) {
    super(id, initialAmount);
  }

  get productionRate(): bigint {
    return this._productionRate;
  }

  get consumptionRate(): bigint {
    return this._consumptionRate;
  }

  get efficiency(): number {
    return this._efficiency;
  }

  get netProduction(): bigint {
    const effectiveProduction = BigInt(Math.floor(Number(this._productionRate) * this._efficiency));
    const effectiveConsumption = BigInt(Math.floor(Number(this._consumptionRate) * this._efficiency));
    return effectiveProduction - effectiveConsumption;
  }

  setProductionRate(rate: bigint): void {
    this._productionRate = rate;
    this.markUpdated();
  }

  setConsumptionRate(rate: bigint): void {
    this._consumptionRate = rate;
    this.markUpdated();
  }

  setEfficiency(efficiency: number): void {
    this._efficiency = Math.max(0, Math.min(1, efficiency));
    this.markUpdated();
  }

  update(deltaTime: number): void {
    if (!this._isActive) return;

    const deltaSeconds = deltaTime / 1000;
    const production = BigInt(Math.floor(Number(this.netProduction) * deltaSeconds));
    
    if (production !== 0n) {
      this.addAmount(production);
    }
  }

  serialize(): Record<string, any> {
    return {
      ...super.serialize(),
      productionRate: this._productionRate.toString(),
      consumptionRate: this._consumptionRate.toString(),
      efficiency: this._efficiency
    };
  }

  deserialize(data: Record<string, any>): void {
    super.deserialize(data);
    this._productionRate = BigInt(data.productionRate || '0');
    this._consumptionRate = BigInt(data.consumptionRate || '0');
    this._efficiency = data.efficiency || 1.0;
  }
}
