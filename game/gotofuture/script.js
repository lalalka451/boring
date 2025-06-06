// GoToFuture - 飞向未来 Game Engine
// Core game logic with BigInt support for large numbers

class GameEngine {
    constructor() {
        this.gameData = {
            eras: null,
            resources: null,
            buildings: null
        };
        this.gameState = this.createInitialState();
        this.ui = null;
        this.tickInterval = null;
        this.saveInterval = null;
        this.init();
    }

    async init() {
        try {
            await this.loadGameData();
            this.loadGameState();
            this.ui = new GameUI(this);
            this.startGameLoop();
            this.startAutoSave();
            console.log('GoToFuture game engine initialized');
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }

    async loadGameData() {
        try {
            // Embed game data directly to avoid fetch issues when running locally
            this.gameData.eras = {
                "stone_age": {
                    "id": "stone_age",
                    "name": "石器时代",
                    "description": "人类文明的起点，学会使用简单工具",
                    "icon": "🗿",
                    "unlockRequirements": {},
                    "advanceRequirements": {
                        "population": 1000,
                        "buildings": {
                            "simple_hut": 10
                        }
                    },
                    "techMultipliers": {
                        "population_cap": 1.0,
                        "food_production": 1.0,
                        "wood_production": 1.0
                    }
                },
                "bronze_age": {
                    "id": "bronze_age",
                    "name": "青铜时代",
                    "description": "掌握金属冶炼，文明开始腾飞",
                    "icon": "🔥",
                    "unlockRequirements": {
                        "era": "stone_age",
                        "population": 1000,
                        "buildings": {
                            "simple_hut": 10
                        }
                    },
                    "advanceRequirements": {
                        "population": 10000,
                        "resources": {
                            "bronze": 5000
                        }
                    },
                    "techMultipliers": {
                        "population_cap": 2.0,
                        "food_production": 1.5,
                        "wood_production": 1.2,
                        "metal_production": 1.0
                    }
                }
            };

            this.gameData.resources = {
                "population": {
                    "id": "population",
                    "name": "人口",
                    "icon": "👥",
                    "category": "basic",
                    "baseValue": 10,
                    "maxValue": 1000000000000,
                    "growthRate": 0,
                    "isWorker": true,
                    "description": "可分配的工人数量"
                },
                "food": {
                    "id": "food",
                    "name": "食物",
                    "icon": "🍞",
                    "category": "basic",
                    "baseValue": 100,
                    "maxValue": 1000000000000,
                    "growthRate": 0,
                    "consumptionRate": 1,
                    "description": "维持人口生存的基本资源"
                },
                "wood": {
                    "id": "wood",
                    "name": "木材",
                    "icon": "🪵",
                    "category": "basic",
                    "baseValue": 50,
                    "maxValue": 1000000000000,
                    "growthRate": 0,
                    "description": "建造和燃料的基础材料"
                },
                "stone": {
                    "id": "stone",
                    "name": "石头",
                    "icon": "🪨",
                    "category": "basic",
                    "baseValue": 20,
                    "maxValue": 1000000000000,
                    "growthRate": 0,
                    "description": "坚固建筑的必需材料"
                },
                "genius_coins": {
                    "id": "genius_coins",
                    "name": "天才币",
                    "icon": "🪙",
                    "category": "special",
                    "baseValue": 0,
                    "maxValue": 1000000000000,
                    "growthRate": 0,
                    "description": "通过迷你游戏获得的特殊货币"
                }
            };

            this.gameData.buildings = {
                "tree": {
                    "id": "tree",
                    "name": "一棵人树",
                    "icon": "🌳",
                    "category": "basic",
                    "era": "stone_age",
                    "description": "最原始的资源点，可以手动采集木材",
                    "baseCost": {},
                    "costMultiplier": 1.0,
                    "maxCount": 1,
                    "unlockRequirements": {},
                    "production": {},
                    "consumption": {},
                    "workerCapacity": 0,
                    "clickable": true,
                    "clickProduction": {
                        "wood": 1
                    }
                },
                "gathering_hut": {
                    "id": "gathering_hut",
                    "name": "采集小屋",
                    "icon": "🏠",
                    "category": "basic",
                    "era": "stone_age",
                    "description": "派遣工人采集木材和食物",
                    "baseCost": {
                        "wood": 10,
                        "stone": 5
                    },
                    "costMultiplier": 1.15,
                    "maxCount": 1000000,
                    "unlockRequirements": {
                        "resources": {
                            "wood": 10
                        }
                    },
                    "production": {
                        "wood": 2,
                        "food": 1
                    },
                    "consumption": {},
                    "workerCapacity": 2,
                    "workerRequirement": 1
                },
                "simple_hut": {
                    "id": "simple_hut",
                    "name": "简陋居所",
                    "icon": "🏘️",
                    "category": "housing",
                    "era": "stone_age",
                    "description": "提供人口容量上限",
                    "baseCost": {
                        "wood": 20,
                        "stone": 10
                    },
                    "costMultiplier": 1.1,
                    "maxCount": 1000000,
                    "unlockRequirements": {
                        "buildings": {
                            "gathering_hut": 3
                        }
                    },
                    "production": {},
                    "consumption": {},
                    "populationCapacity": 5,
                    "workerCapacity": 0
                },
                "hunting_lodge": {
                    "id": "hunting_lodge",
                    "name": "打猎小屋",
                    "icon": "🏹",
                    "category": "food",
                    "era": "stone_age",
                    "description": "专门生产食物的建筑",
                    "baseCost": {
                        "wood": 30,
                        "stone": 15
                    },
                    "costMultiplier": 1.2,
                    "maxCount": 1000000,
                    "unlockRequirements": {
                        "buildings": {
                            "simple_hut": 5
                        }
                    },
                    "production": {
                        "food": 5
                    },
                    "consumption": {},
                    "workerCapacity": 3,
                    "workerRequirement": 2
                }
            };
        } catch (error) {
            console.error('Failed to load game data:', error);
            throw error;
        }
    }

    createInitialState() {
        return {
            version: 2,
            playerName: 'Vigour',
            eraId: 'stone_age',
            playthrough: 1,
            globalMultiplier: 1.0,
            totalPlaytime: 0,
            lastSave: Date.now(),
            lastTick: Date.now(),

            resources: {
                population: { amount: 10n, cap: 50n, perSec: 0n },
                food: { amount: 100n, cap: 1000n, perSec: 0n },
                wood: { amount: 50n, cap: 1000n, perSec: 0n },
                stone: { amount: 20n, cap: 1000n, perSec: 0n },
                genius_coins: { amount: 0n, cap: 1000000n, perSec: 0n }
            },

            buildings: {
                tree: { count: 1n, workers: 0n }
            },

            achievements: new Set(),
            unlockedBuildings: new Set(['tree']),
            unlockedResources: new Set(['population', 'food', 'wood', 'stone', 'genius_coins']),

            statistics: {
                totalResourcesProduced: {},
                totalBuildingsBuilt: {},
                totalTimeInEra: {}
            }
        };
    }

    // BigInt-safe number formatting
    formatNumber(bigintValue) {
        const num = Number(bigintValue);

        if (num >= 1e24) return (num / 1e24).toFixed(2) + 'Y';
        if (num >= 1e21) return (num / 1e21).toFixed(2) + 'Z';
        if (num >= 1e18) return (num / 1e18).toFixed(2) + 'E';
        if (num >= 1e15) return (num / 1e15).toFixed(2) + 'P';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';

        return num.toLocaleString();
    }

    // Game tick - main game loop
    tick() {
        const now = Date.now();
        const deltaTime = (now - this.gameState.lastTick) / 1000; // seconds
        this.gameState.lastTick = now;
        this.gameState.totalPlaytime += deltaTime;

        this.updateProductionCache();
        this.updateResources(deltaTime);
        this.updatePopulation(deltaTime);
        this.checkUnlocks();
        this.checkEraAdvancement();

        if (this.ui) {
            this.ui.updateDisplay();
        }
    }

    updateProductionCache() {
        // Reset all production rates
        Object.keys(this.gameState.resources).forEach(resourceId => {
            this.gameState.resources[resourceId].perSec = 0n;
        });

        // Calculate production from buildings
        Object.entries(this.gameState.buildings).forEach(([buildingId, buildingState]) => {
            const buildingData = this.gameData.buildings[buildingId];
            if (!buildingData || buildingState.count === 0n) return;

            const efficiency = this.getBuildingEfficiency(buildingId);
            const count = buildingState.count;

            // Add production
            if (buildingData.production) {
                Object.entries(buildingData.production).forEach(([resourceId, amount]) => {
                    if (this.gameState.resources[resourceId]) {
                        const production = BigInt(Math.floor(Number(count) * amount * efficiency));
                        this.gameState.resources[resourceId].perSec += production;
                    }
                });
            }

            // Subtract consumption
            if (buildingData.consumption) {
                Object.entries(buildingData.consumption).forEach(([resourceId, amount]) => {
                    if (this.gameState.resources[resourceId]) {
                        const consumption = BigInt(Math.floor(Number(count) * amount * efficiency));
                        this.gameState.resources[resourceId].perSec -= consumption;
                    }
                });
            }
        });

        // Apply global multipliers
        const globalMul = BigInt(Math.floor(this.gameState.globalMultiplier * 100)) / 100n;
        Object.keys(this.gameState.resources).forEach(resourceId => {
            if (resourceId !== 'population') {
                this.gameState.resources[resourceId].perSec =
                    this.gameState.resources[resourceId].perSec * globalMul / 100n;
            }
        });
    }

    getBuildingEfficiency(buildingId) {
        const buildingData = this.gameData.buildings[buildingId];
        if (!buildingData.workerRequirement) return 1.0;

        const buildingState = this.gameState.buildings[buildingId];
        const workersAssigned = Number(buildingState.workers);
        const workersRequired = buildingData.workerRequirement * Number(buildingState.count);

        return Math.min(1.0, workersAssigned / workersRequired);
    }

    updateResources(deltaTime) {
        Object.entries(this.gameState.resources).forEach(([resourceId, resource]) => {
            if (resourceId === 'population') return; // Handle population separately

            const change = BigInt(Math.floor(Number(resource.perSec) * deltaTime));
            const newAmount = resource.amount + change;

            // Clamp between 0 and cap
            resource.amount = newAmount < 0n ? 0n : (newAmount > resource.cap ? resource.cap : newAmount);
        });
    }

    updatePopulation(deltaTime) {
        const populationResource = this.gameState.resources.population;
        const foodResource = this.gameState.resources.food;

        // Calculate food consumption
        const totalPopulation = populationResource.amount;
        const foodConsumption = totalPopulation * BigInt(Math.floor(deltaTime * 1)); // 1 food per person per second

        // Check if we have enough food
        if (foodResource.amount >= foodConsumption) {
            foodResource.amount -= foodConsumption;
            // Population can grow if we have excess food and housing
            if (populationResource.amount < populationResource.cap && Math.random() < 0.01 * deltaTime) {
                populationResource.amount += 1n;
            }
        } else {
            // Starvation - population decreases
            const starvationRate = BigInt(Math.floor(deltaTime * 0.1 * Number(totalPopulation)));
            populationResource.amount = populationResource.amount > starvationRate ?
                populationResource.amount - starvationRate : 0n;
        }
    }

    checkUnlocks() {
        // Check building unlocks
        Object.entries(this.gameData.buildings).forEach(([buildingId, buildingData]) => {
            if (this.gameState.unlockedBuildings.has(buildingId)) return;

            if (this.meetsRequirements(buildingData.unlockRequirements)) {
                this.gameState.unlockedBuildings.add(buildingId);
                this.addLogEntry(`🔓 解锁新建筑: ${buildingData.name}`);
            }
        });

        // Check resource unlocks
        Object.entries(this.gameData.resources).forEach(([resourceId, resourceData]) => {
            if (this.gameState.unlockedResources.has(resourceId)) return;

            if (!resourceData.unlockEra || resourceData.unlockEra === this.gameState.eraId) {
                this.gameState.unlockedResources.add(resourceId);
                if (!this.gameState.resources[resourceId]) {
                    this.gameState.resources[resourceId] = {
                        amount: BigInt(resourceData.baseValue || 0),
                        cap: BigInt(resourceData.maxValue || 1000000),
                        perSec: 0n
                    };
                }
            }
        });
    }

    checkEraAdvancement() {
        const currentEra = this.gameData.eras[this.gameState.eraId];
        if (!currentEra.advanceRequirements) return;

        if (this.meetsRequirements(currentEra.advanceRequirements)) {
            this.advanceEra();
        }
    }

    advanceEra() {
        const eraIds = Object.keys(this.gameData.eras);
        const currentIndex = eraIds.indexOf(this.gameState.eraId);

        if (currentIndex < eraIds.length - 1) {
            const newEraId = eraIds[currentIndex + 1];
            const newEra = this.gameData.eras[newEraId];

            this.gameState.eraId = newEraId;
            this.addLogEntry(`🎉 进入新时代: ${newEra.name} ${newEra.icon}`);

            // Apply era bonuses
            this.applyEraMultipliers();
        }
    }

    applyEraMultipliers() {
        const era = this.gameData.eras[this.gameState.eraId];
        if (!era.techMultipliers) return;

        // Apply population cap multiplier
        if (era.techMultipliers.population_cap) {
            const basePopCap = this.calculateBasePopulationCap();
            this.gameState.resources.population.cap = BigInt(Math.floor(basePopCap * era.techMultipliers.population_cap));
        }
    }

    calculateBasePopulationCap() {
        let totalCap = 50; // Base cap

        Object.entries(this.gameState.buildings).forEach(([buildingId, buildingState]) => {
            const buildingData = this.gameData.buildings[buildingId];
            if (buildingData.populationCapacity) {
                totalCap += buildingData.populationCapacity * Number(buildingState.count);
            }
        });

        return totalCap;
    }

    meetsRequirements(requirements) {
        if (!requirements) return true;

        // Check era requirement
        if (requirements.era && requirements.era !== this.gameState.eraId) {
            return false;
        }

        // Check resource requirements
        if (requirements.resources) {
            for (const [resourceId, amount] of Object.entries(requirements.resources)) {
                const resource = this.gameState.resources[resourceId];
                if (!resource || resource.amount < BigInt(amount)) {
                    return false;
                }
            }
        }

        // Check building requirements
        if (requirements.buildings) {
            for (const [buildingId, count] of Object.entries(requirements.buildings)) {
                const building = this.gameState.buildings[buildingId];
                if (!building || building.count < BigInt(count)) {
                    return false;
                }
            }
        }

        // Check population requirement
        if (requirements.population) {
            if (this.gameState.resources.population.amount < BigInt(requirements.population)) {
                return false;
            }
        }

        return true;
    }

    // Building actions
    canBuildBuilding(buildingId, quantity = 1) {
        const buildingData = this.gameData.buildings[buildingId];
        if (!buildingData) return false;

        if (!this.gameState.unlockedBuildings.has(buildingId)) return false;

        const currentCount = this.gameState.buildings[buildingId]?.count || 0n;
        if (currentCount + BigInt(quantity) > BigInt(buildingData.maxCount)) return false;

        const cost = this.calculateBuildingCost(buildingId, quantity);
        return this.canAfford(cost);
    }

    calculateBuildingCost(buildingId, quantity = 1) {
        const buildingData = this.gameData.buildings[buildingId];
        const currentCount = Number(this.gameState.buildings[buildingId]?.count || 0n);
        const cost = {};

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
    }

    canAfford(cost) {
        return Object.entries(cost).every(([resourceId, amount]) => {
            const resource = this.gameState.resources[resourceId];
            return resource && resource.amount >= BigInt(amount);
        });
    }

    buildBuilding(buildingId, quantity = 1) {
        if (!this.canBuildBuilding(buildingId, quantity)) return false;

        const cost = this.calculateBuildingCost(buildingId, quantity);

        // Deduct resources
        Object.entries(cost).forEach(([resourceId, amount]) => {
            this.gameState.resources[resourceId].amount -= BigInt(amount);
        });

        // Add building
        if (!this.gameState.buildings[buildingId]) {
            this.gameState.buildings[buildingId] = { count: 0n, workers: 0n };
        }
        this.gameState.buildings[buildingId].count += BigInt(quantity);

        const buildingData = this.gameData.buildings[buildingId];
        this.addLogEntry(`🏗️ 建造了 ${quantity} 个 ${buildingData.name}`);

        return true;
    }

    // Worker management
    assignWorkers(buildingId, amount) {
        const building = this.gameState.buildings[buildingId];
        const buildingData = this.gameData.buildings[buildingId];
        if (!building || !buildingData.workerCapacity) return false;

        const maxWorkers = BigInt(buildingData.workerCapacity * Number(building.count));
        const availablePopulation = this.getAvailablePopulation();

        const newWorkers = building.workers + BigInt(amount);
        const clampedWorkers = newWorkers < 0n ? 0n : (newWorkers > maxWorkers ? maxWorkers : newWorkers);

        const workerDiff = clampedWorkers - building.workers;
        if (workerDiff > availablePopulation) return false;

        building.workers = clampedWorkers;
        return true;
    }

    getAvailablePopulation() {
        const totalPopulation = this.gameState.resources.population.amount;
        let assignedWorkers = 0n;

        Object.values(this.gameState.buildings).forEach(building => {
            assignedWorkers += building.workers || 0n;
        });

        return totalPopulation - assignedWorkers;
    }

    // Click actions
    clickBuilding(buildingId) {
        const buildingData = this.gameData.buildings[buildingId];
        if (!buildingData.clickable || !buildingData.clickProduction) return;

        Object.entries(buildingData.clickProduction).forEach(([resourceId, amount]) => {
            if (this.gameState.resources[resourceId]) {
                this.gameState.resources[resourceId].amount += BigInt(amount);
            }
        });

        this.addLogEntry(`👆 点击 ${buildingData.name} 获得资源`);
    }

    // Save/Load system
    saveGame() {
        const saveData = {
            version: this.gameState.version,
            timestamp: Date.now(),
            gameState: {
                ...this.gameState,
                achievements: Array.from(this.gameState.achievements),
                unlockedBuildings: Array.from(this.gameState.unlockedBuildings),
                unlockedResources: Array.from(this.gameState.unlockedResources),
                resources: Object.fromEntries(
                    Object.entries(this.gameState.resources).map(([id, res]) => [
                        id, { ...res, amount: res.amount.toString(), cap: res.cap.toString(), perSec: res.perSec.toString() }
                    ])
                ),
                buildings: Object.fromEntries(
                    Object.entries(this.gameState.buildings).map(([id, building]) => [
                        id, { ...building, count: building.count.toString(), workers: building.workers.toString() }
                    ])
                )
            }
        };

        localStorage.setItem('gotofuture_save', JSON.stringify(saveData));
        this.addLogEntry('💾 游戏已保存');
    }

    loadGameState() {
        const saveData = localStorage.getItem('gotofuture_save');
        if (!saveData) return;

        try {
            const parsed = JSON.parse(saveData);
            if (parsed.version !== this.gameState.version) {
                console.log('Save version mismatch, starting fresh');
                return;
            }

            const loadedState = parsed.gameState;

            // Convert string BigInts back to BigInt
            loadedState.resources = Object.fromEntries(
                Object.entries(loadedState.resources).map(([id, res]) => [
                    id, { ...res, amount: BigInt(res.amount), cap: BigInt(res.cap), perSec: BigInt(res.perSec) }
                ])
            );

            loadedState.buildings = Object.fromEntries(
                Object.entries(loadedState.buildings).map(([id, building]) => [
                    id, { ...building, count: BigInt(building.count), workers: BigInt(building.workers) }
                ])
            );

            // Convert arrays back to Sets
            loadedState.achievements = new Set(loadedState.achievements);
            loadedState.unlockedBuildings = new Set(loadedState.unlockedBuildings);
            loadedState.unlockedResources = new Set(loadedState.unlockedResources);

            this.gameState = { ...this.gameState, ...loadedState };

            // Calculate offline progress
            this.calculateOfflineProgress(parsed.timestamp);

            this.addLogEntry('📁 游戏已加载');
        } catch (error) {
            console.error('Failed to load save:', error);
        }
    }

    calculateOfflineProgress(lastSaveTime) {
        const offlineTime = (Date.now() - lastSaveTime) / 1000; // seconds
        if (offlineTime < 60) return; // Less than 1 minute, ignore

        const maxOfflineHours = 3; // Maximum 3 hours of offline progress
        const cappedOfflineTime = Math.min(offlineTime, maxOfflineHours * 3600);

        // Simplified offline calculation - just add resources based on current production
        this.updateProductionCache();

        Object.entries(this.gameState.resources).forEach(([resourceId, resource]) => {
            if (resourceId === 'population') return;

            const offlineProduction = BigInt(Math.floor(Number(resource.perSec) * cappedOfflineTime));
            const newAmount = resource.amount + offlineProduction;
            resource.amount = newAmount > resource.cap ? resource.cap : newAmount;
        });

        const offlineHours = Math.floor(cappedOfflineTime / 3600);
        const offlineMinutes = Math.floor((cappedOfflineTime % 3600) / 60);
        this.addLogEntry(`⏰ 离线 ${offlineHours}h ${offlineMinutes}m，获得离线收益`);
    }

    // Game loop
    startGameLoop() {
        this.tickInterval = setInterval(() => {
            this.tick();
        }, 250); // 4 ticks per second
    }

    startAutoSave() {
        this.saveInterval = setInterval(() => {
            this.saveGame();
        }, 30000); // Auto-save every 30 seconds
    }

    // Logging
    addLogEntry(message) {
        if (this.ui) {
            this.ui.addLogEntry(message);
        }
    }

    // Prestige system
    canPrestige() {
        // Check if player has built the required prestige building
        return this.gameState.buildings.warp_drive_factory &&
               this.gameState.buildings.warp_drive_factory.count > 0n;
    }

    calculatePrestigeGain() {
        // Calculate prestige multiplier based on total resources produced
        let totalProduction = 0;
        Object.values(this.gameState.statistics.totalResourcesProduced || {}).forEach(amount => {
            totalProduction += Number(amount);
        });

        const prestigeGain = Math.floor(Math.pow(totalProduction / 1e6, 0.5) * 0.05 * 100) / 100;
        return Math.max(0, prestigeGain);
    }

    prestige() {
        if (!this.canPrestige()) return false;

        const prestigeGain = this.calculatePrestigeGain();
        this.gameState.globalMultiplier += prestigeGain;
        this.gameState.playthrough += 1;

        // Reset most progress but keep achievements and prestige bonuses
        const newState = this.createInitialState();
        newState.globalMultiplier = this.gameState.globalMultiplier;
        newState.playthrough = this.gameState.playthrough;
        newState.achievements = this.gameState.achievements;

        this.gameState = newState;
        this.addLogEntry(`🌟 重生完成！获得 +${prestigeGain.toFixed(2)}x 全局倍率`);

        return true;
    }

    // Reset system
    resetGame(keepPrestige = false) {
        if (keepPrestige) {
            // Soft reset - keep prestige bonuses and achievements
            const newState = this.createInitialState();
            newState.globalMultiplier = this.gameState.globalMultiplier;
            newState.playthrough = this.gameState.playthrough;
            newState.achievements = this.gameState.achievements;
            this.gameState = newState;
            this.addLogEntry('🔄 游戏已重置（保留重生进度）');
        } else {
            // Hard reset - completely fresh start
            this.gameState = this.createInitialState();
            this.addLogEntry('🔄 游戏已完全重置');
        }

        // Clear save data
        localStorage.removeItem('gotofuture_save');

        // Update UI
        if (this.ui) {
            this.ui.updateDisplay();
        }

        return true;
    }

    // Account system
    setPlayerName(name) {
        this.gameState.playerName = name || 'Vigour';
        this.addLogEntry(`👤 玩家名称设置为: ${this.gameState.playerName}`);
    }

    getPlayerName() {
        return this.gameState.playerName || 'Vigour';
    }
}

// UI Management Class
class GameUI {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.currentTab = 'buildings';
        this.miniGames = new MiniGameManager(gameEngine);
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                tabButtons.forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');

                this.currentTab = e.target.textContent.toLowerCase();
                this.updateMainContent();
            });
        });
    }

    setupEventListeners() {
        // Add click listeners for building cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.stat-card')) {
                const card = e.target.closest('.stat-card');
                const buildingId = card.dataset.buildingId;

                if (buildingId && e.ctrlKey) {
                    // Ctrl+click to build
                    this.game.buildBuilding(buildingId, 1);
                } else if (buildingId) {
                    // Regular click for clickable buildings
                    this.game.clickBuilding(buildingId);
                }

                // Visual feedback
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }

            // Control button handlers
            if (e.target.id === 'save-btn') {
                this.game.saveGame();
            }

            if (e.target.id === 'prestige-btn' && !e.target.disabled) {
                if (confirm('确定要重生吗？这将重置大部分进度，但会获得永久倍率加成。')) {
                    this.game.prestige();
                }
            }

            if (e.target.id === 'reset-btn') {
                this.showResetModal();
            }

            if (e.target.id === 'update-name-btn') {
                this.updatePlayerName();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        document.querySelectorAll('.tab-btn')[0]?.click();
                        break;
                    case '2':
                        e.preventDefault();
                        document.querySelectorAll('.tab-btn')[1]?.click();
                        break;
                    case '3':
                        e.preventDefault();
                        document.querySelectorAll('.tab-btn')[2]?.click();
                        break;
                    case 's':
                        e.preventDefault();
                        this.game.saveGame();
                        break;
                }
            }

            // Enter key for player name input
            if (e.key === 'Enter' && e.target.id === 'player-name-input') {
                this.updatePlayerName();
            }
        });
    }

    updateDisplay() {
        this.updateResources();
        this.updateEraDisplay();
        this.updateMainContent();
    }

    updateResources() {
        const resourcesContainer = document.querySelector('.resources');
        if (!resourcesContainer) return;

        // Clear existing resources except header
        const header = resourcesContainer.querySelector('h4');
        resourcesContainer.innerHTML = '';
        resourcesContainer.appendChild(header);

        // Add current resources
        Object.entries(this.game.gameState.resources).forEach(([resourceId, resource]) => {
            if (!this.game.gameState.unlockedResources.has(resourceId)) return;

            const resourceData = this.game.gameData.resources[resourceId];
            if (!resourceData) return;

            const resourceItem = document.createElement('div');
            resourceItem.className = 'resource-item';

            const perSecText = resource.perSec !== 0n ?
                ` ${resource.perSec > 0n ? '+' : ''}${this.game.formatNumber(resource.perSec)} 每秒` : '';

            resourceItem.innerHTML = `
                <span class="resource-name">${resourceData.icon} ${resourceData.name}</span>
                <span class="resource-value">${this.game.formatNumber(resource.amount)}/${this.game.formatNumber(resource.cap)}${perSecText}</span>
            `;

            resourcesContainer.appendChild(resourceItem);
        });
    }

    updateEraDisplay() {
        const currentEra = this.game.gameData.eras[this.game.gameState.eraId];

        // Update user profile sections
        const eraInfo = document.getElementById('era-info');
        if (eraInfo) {
            eraInfo.textContent = `${currentEra.icon} ${currentEra.name} - 第${this.game.gameState.playthrough}周目`;
        }

        const multiplierInfo = document.getElementById('multiplier-info');
        if (multiplierInfo) {
            multiplierInfo.textContent = `全局倍率: ${this.game.gameState.globalMultiplier.toFixed(2)}x`;
        }

        const playtimeInfo = document.getElementById('playtime-info');
        if (playtimeInfo) {
            const hours = Math.floor(this.game.gameState.totalPlaytime / 3600);
            const minutes = Math.floor((this.game.gameState.totalPlaytime % 3600) / 60);
            playtimeInfo.textContent = `游戏时间: ${hours}h ${minutes}m`;
        }

        const populationInfo = document.getElementById('population-info');
        if (populationInfo) {
            populationInfo.textContent = `总人口: ${this.game.formatNumber(this.game.gameState.resources.population.amount)}`;
        }

        // Update player name display
        const playerNameInput = document.getElementById('player-name-input');
        if (playerNameInput && playerNameInput.value !== this.game.getPlayerName()) {
            playerNameInput.value = this.game.getPlayerName();
        }

        // Update avatar
        const playerAvatar = document.getElementById('player-avatar');
        if (playerAvatar) {
            playerAvatar.textContent = this.game.getPlayerName().charAt(0).toUpperCase();
        }

        // Update era info in main content
        const currentEraElement = document.getElementById('current-era');
        if (currentEraElement) {
            currentEraElement.textContent = `${currentEra.icon} ${currentEra.name}`;
        }

        const playthroughElement = document.getElementById('playthrough');
        if (playthroughElement) {
            playthroughElement.textContent = `第${this.game.gameState.playthrough}周目`;
        }

        // Update prestige button
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn) {
            const canPrestige = this.game.canPrestige();
            prestigeBtn.disabled = !canPrestige;

            if (canPrestige) {
                const gain = this.game.calculatePrestigeGain();
                prestigeBtn.textContent = `🌟 重生 (+${gain.toFixed(2)}x)`;
            } else {
                prestigeBtn.textContent = '🌟 重生 (需要曲率引擎工厂)';
            }
        }
    }

    showResetModal() {
        const modal = document.createElement('div');
        modal.id = 'reset-modal';
        modal.className = 'minigame-modal';
        modal.innerHTML = `
            <div class="minigame-content">
                <div class="minigame-header">
                    <h3>🔄 重置游戏</h3>
                    <button class="close-btn" onclick="this.closest('.minigame-modal').remove()">×</button>
                </div>
                <div class="reset-options">
                    <p>选择重置类型：</p>
                    <button id="soft-reset-btn" class="reset-option-btn">
                        <div class="reset-title">🔄 软重置</div>
                        <div class="reset-desc">重置进度但保留重生倍率和成就</div>
                    </button>
                    <button id="hard-reset-btn" class="reset-option-btn danger">
                        <div class="reset-title">💥 硬重置</div>
                        <div class="reset-desc">完全重置所有进度，回到初始状态</div>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('soft-reset-btn').addEventListener('click', () => {
            if (confirm('确定要进行软重置吗？这将重置当前进度但保留重生倍率。')) {
                this.game.resetGame(true);
                modal.remove();
            }
        });

        document.getElementById('hard-reset-btn').addEventListener('click', () => {
            if (confirm('确定要进行硬重置吗？这将完全清除所有进度！')) {
                this.game.resetGame(false);
                modal.remove();
            }
        });
    }

    updatePlayerName() {
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) {
            const newName = nameInput.value.trim() || 'Vigour';
            this.game.setPlayerName(newName);
            this.updateEraDisplay();
        }
    }

    updateMainContent() {
        if (this.currentTab === '建筑' || this.currentTab === 'buildings') {
            this.updateBuildingsTab();
        } else if (this.currentTab === '迷你游戏' || this.currentTab === 'minigames') {
            this.updateMinigamesTab();
        } else if (this.currentTab === '成就' || this.currentTab === 'achievements') {
            this.updateAchievementsTab();
        } else if (this.currentTab === '统计' || this.currentTab === 'statistics') {
            this.updateStatisticsTab();
        }
    }

    updateBuildingsTab() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = '';

        // Show unlocked buildings
        this.game.gameState.unlockedBuildings.forEach(buildingId => {
            const buildingData = this.game.gameData.buildings[buildingId];
            const buildingState = this.game.gameState.buildings[buildingId];

            if (!buildingData) return;

            const card = document.createElement('div');
            card.className = 'stat-card';
            card.dataset.buildingId = buildingId;

            const count = buildingState ? this.game.formatNumber(buildingState.count) : '0';
            const maxCount = buildingData.maxCount === 1000000 ? '∞' : this.game.formatNumber(BigInt(buildingData.maxCount));

            let costText = '';
            if (buildingData.baseCost && Object.keys(buildingData.baseCost).length > 0) {
                const cost = this.game.calculateBuildingCost(buildingId, 1);
                const canAfford = this.game.canAfford(cost);
                const costEntries = Object.entries(cost).map(([resourceId, amount]) => {
                    const resourceData = this.game.gameData.resources[resourceId];
                    return `${resourceData?.icon || ''} ${this.game.formatNumber(BigInt(amount))}`;
                });
                costText = `<div class="building-cost ${canAfford ? 'affordable' : 'expensive'}">${costEntries.join(' ')}</div>`;
            }

            let productionText = '';
            if (buildingData.production && Object.keys(buildingData.production).length > 0) {
                const prodEntries = Object.entries(buildingData.production).map(([resourceId, amount]) => {
                    const resourceData = this.game.gameData.resources[resourceId];
                    return `${resourceData?.icon || ''} +${amount}/s`;
                });
                productionText = `<div class="building-production">${prodEntries.join(' ')}</div>`;
            }

            card.innerHTML = `
                <div class="stat-label">${buildingData.icon} ${buildingData.name}</div>
                <div class="stat-value">${count}/${maxCount}</div>
                ${costText}
                ${productionText}
                <div class="building-description">${buildingData.description}</div>
            `;

            statsGrid.appendChild(card);
        });
    }

    updateMinigamesTab() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="minigame-card" onclick="window.gameEngine.ui.miniGames.openGame('fishing')">
                <div class="minigame-icon">🎣</div>
                <div class="minigame-name">钓鱼</div>
                <div class="minigame-description">长按蓄力钓鱼，获得天才币</div>
            </div>
            <div class="minigame-card" onclick="window.gameEngine.ui.miniGames.openGame('parking')">
                <div class="minigame-icon">🚗</div>
                <div class="minigame-name">车位</div>
                <div class="minigame-description">购买汽车，收取停车费</div>
            </div>
            <div class="minigame-card" onclick="window.gameEngine.ui.miniGames.openGame('slots')">
                <div class="minigame-icon">🎰</div>
                <div class="minigame-name">老虎机</div>
                <div class="minigame-description">花费天才币，赢取大奖</div>
            </div>
        `;
    }

    updateAchievementsTab() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="achievement-placeholder">
                <h3>🏆 成就系统</h3>
                <p>成就系统正在开发中...</p>
                <p>已解锁成就: ${this.game.gameState.achievements.size}</p>
            </div>
        `;
    }

    updateStatisticsTab() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        const totalBuildings = Object.values(this.game.gameState.buildings)
            .reduce((sum, building) => sum + Number(building.count), 0);

        const totalResources = Object.values(this.game.gameState.resources)
            .reduce((sum, resource) => sum + Number(resource.amount), 0);

        statsGrid.innerHTML = `
            <div class="statistics-grid">
                <div class="stat-item">
                    <div class="stat-name">游戏时间</div>
                    <div class="stat-value">${Math.floor(this.game.gameState.totalPlaytime / 3600)}h ${Math.floor((this.game.gameState.totalPlaytime % 3600) / 60)}m</div>
                </div>
                <div class="stat-item">
                    <div class="stat-name">当前时代</div>
                    <div class="stat-value">${this.game.gameData.eras[this.game.gameState.eraId].name}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-name">周目数</div>
                    <div class="stat-value">${this.game.gameState.playthrough}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-name">全局倍率</div>
                    <div class="stat-value">${this.game.gameState.globalMultiplier.toFixed(2)}x</div>
                </div>
                <div class="stat-item">
                    <div class="stat-name">总建筑数</div>
                    <div class="stat-value">${totalBuildings}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-name">总资源量</div>
                    <div class="stat-value">${this.game.formatNumber(BigInt(totalResources))}</div>
                </div>
            </div>
        `;
    }

    addLogEntry(message) {
        const logContainer = document.querySelector('.activity-log');
        if (!logContainer) return;

        const newEntry = document.createElement('div');
        newEntry.className = 'log-entry';

        const time = new Date().toLocaleTimeString();
        newEntry.innerHTML = `
            <div class="log-time">${time}</div>
            <div class="log-content">${message}</div>
        `;

        logContainer.appendChild(newEntry);

        // Keep only last 10 entries (plus header)
        const entries = logContainer.querySelectorAll('.log-entry');
        if (entries.length > 10) {
            entries[0].remove();
        }

        // Scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
    console.log('GoToFuture game initialized');
});
