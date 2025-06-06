import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './MiniGames.css';

interface SlotMachineProps {
  onClose: () => void;
}

const symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '💎', '⭐', '🔔'];

const SlotMachine: React.FC<SlotMachineProps> = ({ onClose }) => {
  const [reels, setReels] = useState(['🍎', '🍊', '🍋']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState('');
  
  const { resources, formatNumber } = useGameStore();
  const geniusCoins = resources.genius_coins?.amount || 0n;

  const spin = async () => {
    const cost = 5;
    if (Number(geniusCoins) < cost || spinning) return;

    // Deduct cost
    useGameStore.setState({
      resources: {
        ...resources,
        genius_coins: {
          ...resources.genius_coins!,
          amount: geniusCoins - BigInt(cost)
        }
      }
    });

    setSpinning(true);
    setResult('');

    // Animate reels
    const spinDuration = 2000;
    const spinInterval = 100;
    let elapsed = 0;

    const spinAnimation = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
      
      elapsed += spinInterval;
      
      if (elapsed >= spinDuration) {
        clearInterval(spinAnimation);
        
        // Final result
        const finalReels = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)]
        ];
        
        setReels(finalReels);
        checkWin(finalReels);
        setSpinning(false);
      }
    }, spinInterval);
  };

  const checkWin = (results: string[]) => {
    const currentGeniusCoins = useGameStore.getState().resources.genius_coins?.amount || 0n;
    
    if (results[0] === results[1] && results[1] === results[2]) {
      // Three of a kind
      let multiplier = 10;
      if (results[0] === '💎') multiplier = 100;
      else if (results[0] === '⭐') multiplier = 50;
      else if (results[0] === '🔔') multiplier = 25;
      
      const winAmount = 5 * multiplier;
      
      useGameStore.setState({
        resources: {
          ...useGameStore.getState().resources,
          genius_coins: {
            ...useGameStore.getState().resources.genius_coins!,
            amount: currentGeniusCoins + BigInt(winAmount)
          }
        }
      });
      
      setResult(`🎉 大奖！获得 ${winAmount} 天才币！`);
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      // Two of a kind
      const winAmount = 10;
      
      useGameStore.setState({
        resources: {
          ...useGameStore.getState().resources,
          genius_coins: {
            ...useGameStore.getState().resources.genius_coins!,
            amount: currentGeniusCoins + BigInt(winAmount)
          }
        }
      });
      
      setResult(`✨ 小奖！获得 ${winAmount} 天才币`);
    } else {
      setResult('😔 没中奖，再试一次吧！');
    }
  };

  return (
    <div className="minigame-modal" onClick={onClose}>
      <div className="minigame-content" onClick={(e) => e.stopPropagation()}>
        <div className="minigame-header">
          <h3>🎰 老虎机</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="slot-area">
          <div className="slot-machine">
            <div className="slot-reels">
              {reels.map((symbol, index) => (
                <div 
                  key={index} 
                  className={`slot-reel ${spinning ? 'spinning' : ''}`}
                >
                  {symbol}
                </div>
              ))}
            </div>
            
            <button 
              className="spin-btn" 
              onClick={spin}
              disabled={spinning || Number(geniusCoins) < 5}
            >
              {spinning ? '旋转中...' : '🎰 旋转 (5 天才币)'}
            </button>
            
            {result && (
              <div className={`slot-result ${result.includes('🎉') ? 'win' : result.includes('✨') ? 'small-win' : 'no-win'}`}>
                {result}
              </div>
            )}
          </div>
          
          <div className="slot-info">
            <div className="info-item">
              <span>你的天才币: {formatNumber(geniusCoins)}</span>
            </div>
          </div>
          
          <div className="slot-paytable">
            <h4>奖励表：</h4>
            <div className="paytable-item">
              <span>💎💎💎</span>
              <span>500 天才币</span>
            </div>
            <div className="paytable-item">
              <span>⭐⭐⭐</span>
              <span>250 天才币</span>
            </div>
            <div className="paytable-item">
              <span>🔔🔔🔔</span>
              <span>125 天才币</span>
            </div>
            <div className="paytable-item">
              <span>其他三连</span>
              <span>50 天才币</span>
            </div>
            <div className="paytable-item">
              <span>任意两连</span>
              <span>10 天才币</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
