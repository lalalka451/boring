import React, { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import './MiniGames.css';

interface FishingGameProps {
  onClose: () => void;
}

interface Fish {
  name: string;
  icon: string;
  chance: number;
  reward: number;
}

const fishTypes: Fish[] = [
  { name: '小鱼', icon: '🐟', chance: 0.6, reward: 1 },
  { name: '大鱼', icon: '🐠', chance: 0.25, reward: 3 },
  { name: '稀有鱼', icon: '🐡', chance: 0.1, reward: 10 },
  { name: '传说鱼', icon: '🐋', chance: 0.05, reward: 50 }
];

const FishingGame: React.FC<FishingGameProps> = ({ onClose }) => {
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isCharging, setIsCharging] = useState(false);
  
  const { resources } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setPower(0);
      return;
    }

    // Determine what fish was caught
    const roll = Math.random();
    let caughtFish: Fish | null = null;
    let cumulativeChance = 0;

    for (const fish of fishTypes) {
      cumulativeChance += fish.chance;
      if (roll <= cumulativeChance) {
        caughtFish = fish;
        break;
      }
    }

    if (caughtFish) {
      // Award rewards
      const currentGeniusCoins = resources.genius_coins?.amount || 0n;
      useGameStore.setState({
        resources: {
          ...resources,
          genius_coins: {
            ...resources.genius_coins!,
            amount: currentGeniusCoins + BigInt(caughtFish.reward)
          }
        }
      });

      setResult(`🎉 钓到了 ${caughtFish.icon} ${caughtFish.name}！获得 ${caughtFish.reward} 天才币`);
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
      <div className="minigame-content" onClick={(e) => e.stopPropagation()}>
        <div className="minigame-header">
          <h3>🎣 钓鱼小游戏</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="fishing-area">
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
          
          <div className="fishing-tips">
            <h4>钓鱼技巧：</h4>
            <ul>
              <li>长按按钮蓄力，蓄力越高成功率越高</li>
              <li>绿色区域(70%+)有最高成功率</li>
              <li>不同的鱼有不同的稀有度和奖励</li>
            </ul>
          </div>
          
          <div className="fish-list">
            <h4>鱼类图鉴：</h4>
            {fishTypes.map((fish, index) => (
              <div key={index} className="fish-item">
                <span className="fish-icon">{fish.icon}</span>
                <span className="fish-name">{fish.name}</span>
                <span className="fish-chance">{(fish.chance * 100).toFixed(1)}%</span>
                <span className="fish-reward">+{fish.reward} 天才币</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishingGame;
