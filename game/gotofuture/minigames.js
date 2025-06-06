// Mini-games for GoToFuture
// Simple implementations of fishing, parking, and slot machine games

class MiniGameManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.activeGame = null;
        this.fishingGame = new FishingGame(this);
        this.parkingGame = new ParkingGame(this);
        this.slotMachine = new SlotMachine(this);
    }

    openGame(gameType) {
        switch(gameType) {
            case 'fishing':
                this.activeGame = this.fishingGame;
                break;
            case 'parking':
                this.activeGame = this.parkingGame;
                break;
            case 'slots':
                this.activeGame = this.slotMachine;
                break;
        }
        
        if (this.activeGame) {
            this.activeGame.show();
        }
    }

    closeGame() {
        if (this.activeGame) {
            this.activeGame.hide();
            this.activeGame = null;
        }
    }
}

class FishingGame {
    constructor(manager) {
        this.manager = manager;
        this.isActive = false;
        this.power = 0;
        this.charging = false;
        this.fishTypes = [
            { name: '小鱼', icon: '🐟', chance: 0.6, reward: { genius_coins: 1 } },
            { name: '大鱼', icon: '🐠', chance: 0.25, reward: { genius_coins: 3 } },
            { name: '稀有鱼', icon: '🐡', chance: 0.1, reward: { genius_coins: 10 } },
            { name: '传说鱼', icon: '🐋', chance: 0.05, reward: { genius_coins: 50 } }
        ];
    }

    show() {
        this.isActive = true;
        this.createFishingUI();
    }

    hide() {
        this.isActive = false;
        const fishingModal = document.getElementById('fishing-modal');
        if (fishingModal) {
            fishingModal.remove();
        }
    }

    createFishingUI() {
        const modal = document.createElement('div');
        modal.id = 'fishing-modal';
        modal.className = 'minigame-modal';
        modal.innerHTML = `
            <div class="minigame-content">
                <div class="minigame-header">
                    <h3>🎣 钓鱼小游戏</h3>
                    <button class="close-btn" onclick="window.gameEngine.ui.miniGames.closeGame()">×</button>
                </div>
                <div class="fishing-area">
                    <div class="power-meter">
                        <div class="power-bar" id="power-bar"></div>
                        <div class="power-text">蓄力: <span id="power-value">0</span>%</div>
                    </div>
                    <button id="fish-btn" class="fish-button">🎣 开始钓鱼</button>
                    <div id="fishing-result" class="fishing-result"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupFishingEvents();
    }

    setupFishingEvents() {
        const fishBtn = document.getElementById('fish-btn');
        const powerBar = document.getElementById('power-bar');
        const powerValue = document.getElementById('power-value');
        
        let mouseDown = false;
        let powerInterval;

        const startCharging = () => {
            if (this.charging) return;
            
            this.charging = true;
            this.power = 0;
            fishBtn.textContent = '🎣 蓄力中...';
            
            powerInterval = setInterval(() => {
                this.power += 2;
                if (this.power > 100) this.power = 100;
                
                powerBar.style.width = this.power + '%';
                powerValue.textContent = this.power;
                
                // Change color based on power
                if (this.power < 30) {
                    powerBar.style.backgroundColor = '#ff4444';
                } else if (this.power < 70) {
                    powerBar.style.backgroundColor = '#ffaa00';
                } else {
                    powerBar.style.backgroundColor = '#44ff44';
                }
            }, 50);
        };

        const stopCharging = () => {
            if (!this.charging) return;
            
            this.charging = false;
            clearInterval(powerInterval);
            fishBtn.textContent = '🎣 开始钓鱼';
            
            this.attemptCatch();
        };

        fishBtn.addEventListener('mousedown', startCharging);
        fishBtn.addEventListener('mouseup', stopCharging);
        fishBtn.addEventListener('mouseleave', stopCharging);
        
        // Touch events for mobile
        fishBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startCharging();
        });
        fishBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopCharging();
        });
    }

    attemptCatch() {
        const resultDiv = document.getElementById('fishing-result');
        
        // Calculate success chance based on power
        let successChance = this.power / 100;
        if (Math.random() > successChance) {
            resultDiv.innerHTML = '<div class="catch-fail">🌊 鱼跑了！再试一次吧</div>';
            return;
        }

        // Determine what fish was caught
        const roll = Math.random();
        let caughtFish = null;
        let cumulativeChance = 0;

        for (const fish of this.fishTypes) {
            cumulativeChance += fish.chance;
            if (roll <= cumulativeChance) {
                caughtFish = fish;
                break;
            }
        }

        if (caughtFish) {
            // Award rewards
            Object.entries(caughtFish.reward).forEach(([resourceId, amount]) => {
                if (this.manager.game.gameState.resources[resourceId]) {
                    this.manager.game.gameState.resources[resourceId].amount += BigInt(amount);
                }
            });

            resultDiv.innerHTML = `
                <div class="catch-success">
                    <div class="caught-fish">${caughtFish.icon} ${caughtFish.name}</div>
                    <div class="reward">获得 ${Object.entries(caughtFish.reward).map(([r, a]) => `${a} 天才币`).join(', ')}</div>
                </div>
            `;

            this.manager.game.addLogEntry(`🎣 钓到了 ${caughtFish.icon} ${caughtFish.name}！`);
        }

        // Reset power
        this.power = 0;
        document.getElementById('power-bar').style.width = '0%';
        document.getElementById('power-value').textContent = '0';
    }
}

class ParkingGame {
    constructor(manager) {
        this.manager = manager;
        this.isActive = false;
        this.cars = [];
        this.money = 0;
    }

    show() {
        this.isActive = true;
        this.createParkingUI();
    }

    hide() {
        this.isActive = false;
        const parkingModal = document.getElementById('parking-modal');
        if (parkingModal) {
            parkingModal.remove();
        }
    }

    createParkingUI() {
        const modal = document.createElement('div');
        modal.id = 'parking-modal';
        modal.className = 'minigame-modal';
        modal.innerHTML = `
            <div class="minigame-content">
                <div class="minigame-header">
                    <h3>🚗 车位小游戏</h3>
                    <button class="close-btn" onclick="window.gameEngine.ui.miniGames.closeGame()">×</button>
                </div>
                <div class="parking-area">
                    <div class="parking-info">
                        <div>收入: <span id="parking-money">0</span> 天才币</div>
                        <button id="collect-parking" class="collect-btn">💰 收取</button>
                    </div>
                    <div class="parking-grid" id="parking-grid">
                        <!-- Parking spots will be generated here -->
                    </div>
                    <button id="buy-car" class="buy-car-btn">🚗 购买汽车 (10 天才币)</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupParkingEvents();
        this.generateParkingGrid();
    }

    setupParkingEvents() {
        document.getElementById('collect-parking').addEventListener('click', () => {
            if (this.money > 0) {
                this.manager.game.gameState.resources.genius_coins.amount += BigInt(this.money);
                this.manager.game.addLogEntry(`🚗 收取停车费 ${this.money} 天才币`);
                this.money = 0;
                document.getElementById('parking-money').textContent = '0';
            }
        });

        document.getElementById('buy-car').addEventListener('click', () => {
            const cost = 10;
            if (this.manager.game.gameState.resources.genius_coins.amount >= BigInt(cost)) {
                this.manager.game.gameState.resources.genius_coins.amount -= BigInt(cost);
                this.addRandomCar();
            }
        });
    }

    generateParkingGrid() {
        const grid = document.getElementById('parking-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const spot = document.createElement('div');
            spot.className = 'parking-spot';
            spot.dataset.spotId = i;
            grid.appendChild(spot);
        }
    }

    addRandomCar() {
        const emptySpots = Array.from(document.querySelectorAll('.parking-spot:not(.occupied)'));
        if (emptySpots.length === 0) return;

        const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        const carTypes = ['🚗', '🚙', '🚕', '🚐'];
        const randomCar = carTypes[Math.floor(Math.random() * carTypes.length)];
        
        randomSpot.textContent = randomCar;
        randomSpot.classList.add('occupied');
        
        // Start earning money from this car
        const carId = Date.now();
        this.cars.push({
            id: carId,
            spot: randomSpot,
            earnings: 0,
            interval: setInterval(() => {
                this.money += 1;
                document.getElementById('parking-money').textContent = this.money;
            }, 2000)
        });
    }
}

class SlotMachine {
    constructor(manager) {
        this.manager = manager;
        this.isActive = false;
        this.symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '💎', '⭐', '🔔'];
        this.spinning = false;
    }

    show() {
        this.isActive = true;
        this.createSlotUI();
    }

    hide() {
        this.isActive = false;
        const slotModal = document.getElementById('slot-modal');
        if (slotModal) {
            slotModal.remove();
        }
    }

    createSlotUI() {
        const modal = document.createElement('div');
        modal.id = 'slot-modal';
        modal.className = 'minigame-modal';
        modal.innerHTML = `
            <div class="minigame-content">
                <div class="minigame-header">
                    <h3>🎰 老虎机</h3>
                    <button class="close-btn" onclick="window.gameEngine.ui.miniGames.closeGame()">×</button>
                </div>
                <div class="slot-area">
                    <div class="slot-machine">
                        <div class="slot-reels">
                            <div class="slot-reel" id="reel1">🍎</div>
                            <div class="slot-reel" id="reel2">🍊</div>
                            <div class="slot-reel" id="reel3">🍋</div>
                        </div>
                        <button id="spin-btn" class="spin-btn">🎰 旋转 (5 天才币)</button>
                        <div id="slot-result" class="slot-result"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupSlotEvents();
    }

    setupSlotEvents() {
        document.getElementById('spin-btn').addEventListener('click', () => {
            if (this.spinning) return;
            
            const cost = 5;
            if (this.manager.game.gameState.resources.genius_coins.amount < BigInt(cost)) {
                document.getElementById('slot-result').textContent = '天才币不足！';
                return;
            }

            this.manager.game.gameState.resources.genius_coins.amount -= BigInt(cost);
            this.spin();
        });
    }

    spin() {
        this.spinning = true;
        const spinBtn = document.getElementById('spin-btn');
        const resultDiv = document.getElementById('slot-result');
        
        spinBtn.disabled = true;
        spinBtn.textContent = '旋转中...';
        resultDiv.textContent = '';

        // Animate reels
        const reels = ['reel1', 'reel2', 'reel3'];
        const results = [];
        
        reels.forEach((reelId, index) => {
            const reel = document.getElementById(reelId);
            let spinCount = 0;
            const maxSpins = 20 + index * 10;
            
            const spinInterval = setInterval(() => {
                reel.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                spinCount++;
                
                if (spinCount >= maxSpins) {
                    clearInterval(spinInterval);
                    const finalSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                    reel.textContent = finalSymbol;
                    results.push(finalSymbol);
                    
                    if (results.length === 3) {
                        this.checkWin(results);
                        this.spinning = false;
                        spinBtn.disabled = false;
                        spinBtn.textContent = '🎰 旋转 (5 天才币)';
                    }
                }
            }, 100);
        });
    }

    checkWin(results) {
        const resultDiv = document.getElementById('slot-result');
        
        // Check for wins
        if (results[0] === results[1] && results[1] === results[2]) {
            // Three of a kind
            let multiplier = 10;
            if (results[0] === '💎') multiplier = 100;
            else if (results[0] === '⭐') multiplier = 50;
            else if (results[0] === '🔔') multiplier = 25;
            
            const winAmount = 5 * multiplier;
            this.manager.game.gameState.resources.genius_coins.amount += BigInt(winAmount);
            resultDiv.innerHTML = `<div class="win">🎉 大奖！获得 ${winAmount} 天才币！</div>`;
            this.manager.game.addLogEntry(`🎰 老虎机大奖！获得 ${winAmount} 天才币`);
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            // Two of a kind
            const winAmount = 10;
            this.manager.game.gameState.resources.genius_coins.amount += BigInt(winAmount);
            resultDiv.innerHTML = `<div class="small-win">✨ 小奖！获得 ${winAmount} 天才币</div>`;
        } else {
            resultDiv.innerHTML = `<div class="no-win">😔 没中奖，再试一次吧！</div>`;
        }
    }
}
