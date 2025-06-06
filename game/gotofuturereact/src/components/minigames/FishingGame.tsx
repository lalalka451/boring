import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { fishManager } from '../../data/fishLoader';
import { Fish, FishBiome, RARITY_COLORS, RARITY_NAMES, BIOME_NAMES, BIOME_ICONS } from '../../types/fish';
import './MiniGames.css';

interface FishingGameProps {
  onClose: () => void;
}

const FishingGame: React.FC<FishingGameProps> = ({ onClose }) => {
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isCharging, setIsCharging] = useState(false);
  const [currentBiome, setCurrentBiome] = useState<FishBiome>('river');
  const [combo, setCombo] = useState(0);
  const [caughtFish, setCaughtFish] = useState<Set<string>>(new Set());
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);

  const { resources } = useGameStore();
  const intervalRef = useRef<number | null>(null);

  // Load caught fish from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fishing_caught_fish');
    if (saved) {
      setCaughtFish(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save caught fish to localStorage
  const saveCaughtFish = (fishId: string) => {
    const newCaught = new Set([...caughtFish, fishId]);
    setCaughtFish(newCaught);
    localStorage.setItem('fishing_caught_fish', JSON.stringify([...newCaught]));
  };

  const startCharging = useCallback(() => {
    if (charging) return;
    
    setCharging(true);
    setIsCharging(true);
    setPower(0);
    setResult('');
    
    intervalRef.current = setInterval(() => {
      setPower(prev => {
        const newPower = prev + 2;
        return newPower > 100 ? 100 : newPower;
      });
    }, 50);
  }, [charging]);

  const stopCharging = useCallback(() => {
    if (!charging) return;
    
    setCharging(false);
    setIsCharging(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    attemptCatch();
  }, [charging, power]);

  const attemptCatch = () => {
    const successChance = power / 100;

    if (Math.random() > successChance) {
      setResult('🌊 鱼跑了！再试一次吧');
      setCombo(0); // Reset combo on failure
      setPower(0);
      return;
    }

    // Get random fish from current biome
    const fish = fishManager.getRandomFish(power, currentBiome);

    if (fish) {
      // Calculate reward with combo bonus
      const baseReward = fishManager.getRandomReward(fish);
      const comboMultiplier = 1 + (combo * 0.1); // 10% bonus per combo
      const finalReward = Math.floor(baseReward * comboMultiplier);

      // Award rewards
      const currentGeniusCoins = resources.genius_coins?.amount || 0n;
      useGameStore.setState({
        resources: {
          ...resources,
          genius_coins: {
            ...resources.genius_coins!,
            amount: currentGeniusCoins + BigInt(finalReward)
          }
        }
      });

      // Update combo and caught fish
      setCombo(prev => prev + 1);
      saveCaughtFish(fish.id);

      // Check if it's a new discovery
      const isNewFish = !caughtFish.has(fish.id);
      const comboText = combo > 0 ? ` (连击 x${combo + 1}!)` : '';
      const newFishText = isNewFish ? ' 🆕新发现!' : '';

      setResult(`🎉 钓到了 ${fish.icon} ${fish.name}！获得 ${finalReward} 天才币${comboText}${newFishText}`);
    }

    setPower(0);
  };

  const getPowerColor = () => {
    if (power < 30) return '#ff4444';
    if (power < 70) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <div className="minigame-modal" onClick={onClose}>
      <div className="minigame-content fishing-content" onClick={(e) => e.stopPropagation()}>
        <div className="minigame-header">
          <h3>🎣 钓鱼小游戏</h3>
          <div className="header-controls">
            <button
              className="encyclopedia-btn"
              onClick={() => setShowEncyclopedia(!showEncyclopedia)}
            >
              📖 图鉴
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {showEncyclopedia ? (
          <div className="fish-encyclopedia">
            <h4>🐟 鱼类图鉴 ({caughtFish.size}/{fishManager.getAllFish().length})</h4>
            <div className="biome-tabs">
              {(['river', 'lake', 'sea', 'swamp', 'garden', 'abyss', 'volcano', 'void'] as FishBiome[]).map(biome => (
                <button
                  key={biome}
                  className={`biome-tab ${currentBiome === biome ? 'active' : ''}`}
                  onClick={() => setCurrentBiome(biome)}
                >
                  {BIOME_ICONS[biome]} {BIOME_NAMES[biome]}
                </button>
              ))}
            </div>
            <div className="fish-grid">
              {fishManager.getFishByBiome(currentBiome).map((fish: Fish) => {
                const isCaught = caughtFish.has(fish.id);
                return (
                  <div
                    key={fish.id}
                    className={`fish-card ${isCaught ? 'caught' : 'unknown'}`}
                    style={{ borderColor: RARITY_COLORS[fish.rarity] }}
                  >
                    <div className="fish-icon">{isCaught ? fish.icon : '❓'}</div>
                    <div className="fish-name">{isCaught ? fish.name : '???'}</div>
                    <div className="fish-rarity" style={{ color: RARITY_COLORS[fish.rarity] }}>
                      {RARITY_NAMES[fish.rarity]}
                    </div>
                    {isCaught && (
                      <div className="fish-reward">{fish.minCoins}-{fish.maxCoins} 天才币</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="fishing-area">
            <div className="fishing-stats">
              <div className="stat">
                <span>当前区域: {BIOME_ICONS[currentBiome]} {BIOME_NAMES[currentBiome]}</span>
              </div>
              <div className="stat">
                <span>连击: {combo}</span>
              </div>
              <div className="stat">
                <span>图鉴: {caughtFish.size}/{fishManager.getAllFish().length}</span>
              </div>
            </div>

            <div className="power-meter">
              <div
                className="power-bar"
                style={{
                  width: `${power}%`,
                  backgroundColor: getPowerColor()
                }}
              />
              <div className="power-text">蓄力: {power}%</div>
            </div>

            <button
              className={`fish-button ${isCharging ? 'charging' : ''}`}
              onMouseDown={startCharging}
              onMouseUp={stopCharging}
              onMouseLeave={stopCharging}
              onTouchStart={(e) => {
                e.preventDefault();
                startCharging();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopCharging();
              }}
            >
              {isCharging ? '🎣 蓄力中...' : '🎣 开始钓鱼'}
            </button>

            {result && (
              <div className={`fishing-result ${result.includes('🎉') ? 'success' : 'fail'}`}>
                {result}
              </div>
            )}

            <div className="biome-selector">
              <h4>选择钓鱼区域：</h4>
              <div className="biome-buttons">
                {(['river', 'lake', 'sea'] as FishBiome[]).map(biome => (
                  <button
                    key={biome}
                    className={`biome-btn ${currentBiome === biome ? 'active' : ''}`}
                    onClick={() => setCurrentBiome(biome)}
                  >
                    {BIOME_ICONS[biome]} {BIOME_NAMES[biome]}
                  </button>
                ))}
              </div>
            </div>

            <div className="fishing-tips">
              <h4>钓鱼技巧：</h4>
              <ul>
                <li>长按按钮蓄力，蓄力越高成功率和稀有鱼概率越高</li>
                <li>连续成功钓鱼可获得连击奖励(+10%/次)</li>
                <li>不同区域有不同的鱼类，探索收集完整图鉴</li>
                <li>绿色区域(70%+)有最高成功率和稀有鱼概率</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FishingGame;
