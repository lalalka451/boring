/**
 * Main Game Engine - orchestrates all game systems
 * Follows the Engine pattern with centralized game loop and manager coordination
 */

import { ResourceManager } from './managers/ResourceManager';
import { BuildingManager } from './managers/BuildingManager';
import { gameData } from '../data/gameData';

export interface GameEngineConfig {
  tickRate: number; // FPS
  autoSave: boolean;
  autoSaveInterval: number; // milliseconds
}

export class GameEngine {
  // Core managers
  private readonly _resourceManager: ResourceManager;
  private readonly _buildingManager: BuildingManager;
  
  // Game state
  private _isRunning: boolean = false;
  private _lastTick: number = Date.now();
  private _totalPlaytime: number = 0;
  private _currentEra: string = 'stone_age';
  private _playthrough: number = 1;
  private _globalMultiplier: number = 1.0;
  
  // Game loop
  private _gameLoopId: number = 0;
  private _autoSaveId: number = 0;
  private readonly _config: GameEngineConfig;
  
  // Events and logging
  private _eventLog: string[] = [];
  private readonly _maxLogEntries: number = 50;
  
  // Statistics
  private _statistics = {
    totalClicks: 0,
    totalBuildings: 0,
    totalResources: 0,
    totalPlaytime: 0
  };

  constructor(config: Partial<GameEngineConfig> = {}) {
    this._config = {
      tickRate: 4, // 4 FPS
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
      ...config
    };

    // Initialize managers
    this._resourceManager = new ResourceManager();
    this._buildingManager = new BuildingManager();
    
    // Set up cross-manager references
    this._buildingManager.setResourceManager(this._resourceManager);
    
    this.addLogEntry('🌟 欢迎来到GoToFuture！点击人树开始你的文明之旅。');
  }

  // Getters for managers
  get resources(): ResourceManager {
    return this._resourceManager;
  }

  get buildings(): BuildingManager {
    return this._buildingManager;
  }

  // Game state getters
  get isRunning(): boolean {
    return this._isRunning;
  }

  get currentEra(): string {
    return this._currentEra;
  }

  get playthrough(): number {
    return this._playthrough;
  }

  get globalMultiplier(): number {
    return this._globalMultiplier;
  }

  get totalPlaytime(): number {
    return this._totalPlaytime;
  }

  get statistics(): typeof this._statistics {
    return { ...this._statistics };
  }

  get eventLog(): string[] {
    return [...this._eventLog];
  }

  /**
   * Start the game engine
   */
  start(): void {
    if (this._isRunning) return;

    this._isRunning = true;
    this._lastTick = Date.now();
    
    // Start game loop
    const tickInterval = 1000 / this._config.tickRate;
    this._gameLoopId = window.setInterval(() => {
      this.tick();
    }, tickInterval);

    // Start auto-save
    if (this._config.autoSave) {
      this._autoSaveId = window.setInterval(() => {
        this.save();
      }, this._config.autoSaveInterval);
    }

    this.addLogEntry('🚀 游戏引擎已启动');
  }

  /**
   * Stop the game engine
   */
  stop(): void {
    if (!this._isRunning) return;

    this._isRunning = false;
    
    if (this._gameLoopId) {
      clearInterval(this._gameLoopId);
      this._gameLoopId = 0;
    }

    if (this._autoSaveId) {
      clearInterval(this._autoSaveId);
      this._autoSaveId = 0;
    }

    this.addLogEntry('⏹️ 游戏引擎已停止');
  }

  /**
   * Main game tick - called every frame
   */
  private tick(): void {
    const now = Date.now();
    const deltaTime = Math.min(now - this._lastTick, 1000); // Cap at 1 second
    
    if (deltaTime <= 0) return;

    // Update playtime
    this._totalPlaytime += deltaTime;
    this._statistics.totalPlaytime = this._totalPlaytime;

    // Update managers
    this._buildingManager.updateProductionRates();
    this._resourceManager.update(deltaTime);
    this._buildingManager.update(deltaTime);

    // Update statistics
    this.updateStatistics();

    // Check for progression
    this.checkUnlocks();
    this.checkEraAdvancement();

    this._lastTick = now;
  }

  /**
   * Update game statistics
   */
  private updateStatistics(): void {
    this._statistics.totalBuildings = this._buildingManager.getAllBuildings()
      .reduce((sum, building) => sum + Number(building.amount), 0);
    
    this._statistics.totalResources = this._resourceManager.getAllResources()
      .reduce((sum, resource) => sum + Number(resource.amount), 0);
  }

  /**
   * Check for new unlocks
   */
  private checkUnlocks(): void {
    // Check building unlocks
    const newBuildings = this._buildingManager.checkUnlocks(this._currentEra, this._resourceManager);
    newBuildings.forEach(buildingId => {
      const building = this._buildingManager.getBuilding(buildingId);
      if (building) {
        this.addLogEntry(`🔓 解锁新建筑: ${building.name}`);
      }
    });

    // Check resource unlocks based on era
    this.checkResourceUnlocks();
  }

  /**
   * Check for resource unlocks based on current era
   */
  private checkResourceUnlocks(): void {
    const eraIds = Object.keys(gameData.eras);
    const currentEraIndex = eraIds.indexOf(this._currentEra);

    Object.values(gameData.resources).forEach(resourceData => {
      if (this._resourceManager.isResourceUnlocked(resourceData.id)) return;

      const resourceEraIndex = resourceData.unlockEra ? eraIds.indexOf(resourceData.unlockEra) : 0;
      
      if (currentEraIndex >= resourceEraIndex) {
        this._resourceManager.unlockResource(resourceData.id);
        this.addLogEntry(`🔓 解锁新资源: ${resourceData.name}`);
      }
    });
  }

  /**
   * Check for era advancement
   */
  private checkEraAdvancement(): void {
    const currentEraData = gameData.eras[this._currentEra];
    if (!currentEraData?.advanceRequirements) return;

    if (this.meetsRequirements(currentEraData.advanceRequirements)) {
      const eraIds = Object.keys(gameData.eras);
      const currentIndex = eraIds.indexOf(this._currentEra);
      
      if (currentIndex < eraIds.length - 1) {
        const newEraId = eraIds[currentIndex + 1];
        const newEra = gameData.eras[newEraId];
        
        this._currentEra = newEraId;
        this.addLogEntry(`🎉 进入新时代: ${newEra.name} ${newEra.icon}`);
        
        // Trigger unlock check for new era
        setTimeout(() => this.checkUnlocks(), 100);
      }
    }
  }

  /**
   * Check if requirements are met
   */
  private meetsRequirements(requirements: any): boolean {
    if (!requirements) return true;

    // Check population requirement
    if (requirements.population) {
      const population = this._resourceManager.getResource('population');
      if (!population || population.amount < BigInt(requirements.population)) {
        return false;
      }
    }

    // Check resource requirements
    if (requirements.resources) {
      if (!this._resourceManager.canAfford(requirements.resources)) {
        return false;
      }
    }

    // Check building requirements
    if (requirements.buildings) {
      for (const [buildingId, count] of Object.entries(requirements.buildings)) {
        const building = this._buildingManager.getBuilding(buildingId);
        if (!building || building.amount < BigInt(count as number)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Add entry to event log
   */
  addLogEntry(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    
    this._eventLog.unshift(entry);
    
    if (this._eventLog.length > this._maxLogEntries) {
      this._eventLog.splice(this._maxLogEntries);
    }
  }

  /**
   * Increment click statistics
   */
  incrementClicks(): void {
    this._statistics.totalClicks++;
  }

  /**
   * Save game state
   */
  save(): Record<string, any> {
    const saveData = {
      version: 2,
      timestamp: Date.now(),
      currentEra: this._currentEra,
      playthrough: this._playthrough,
      globalMultiplier: this._globalMultiplier,
      totalPlaytime: this._totalPlaytime,
      statistics: this._statistics,
      eventLog: this._eventLog,
      resources: this._resourceManager.serialize(),
      buildings: this._buildingManager.serialize()
    };

    // Save to localStorage
    localStorage.setItem('gotofuture-save', JSON.stringify(saveData));
    this.addLogEntry('💾 游戏已保存');
    
    return saveData;
  }

  /**
   * Load game state
   */
  load(saveData?: Record<string, any>): boolean {
    try {
      const data = saveData || JSON.parse(localStorage.getItem('gotofuture-save') || '{}');
      
      if (!data.version) return false;

      this._currentEra = data.currentEra || 'stone_age';
      this._playthrough = data.playthrough || 1;
      this._globalMultiplier = data.globalMultiplier || 1.0;
      this._totalPlaytime = data.totalPlaytime || 0;
      this._statistics = { ...this._statistics, ...data.statistics };
      this._eventLog = data.eventLog || [];

      this._resourceManager.deserialize(data.resources || {});
      this._buildingManager.deserialize(data.buildings || {});

      this.addLogEntry('📁 游戏已加载');
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this.stop();
    
    // Clear save data
    localStorage.removeItem('gotofuture-save');
    
    // Reset state
    this._currentEra = 'stone_age';
    this._playthrough = 1;
    this._globalMultiplier = 1.0;
    this._totalPlaytime = 0;
    this._statistics = {
      totalClicks: 0,
      totalBuildings: 0,
      totalResources: 0,
      totalPlaytime: 0
    };
    this._eventLog = [];

    // Reinitialize managers
    this._resourceManager.deserialize({});
    this._buildingManager.deserialize({});

    this.addLogEntry('🔄 游戏已重置');
    this.start();
  }
}
