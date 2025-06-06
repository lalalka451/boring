import React, { useState } from 'react';
import FishingGame from '../minigames/FishingGame';
import ParkingGame from '../minigames/ParkingGame';
import SlotMachine from '../minigames/SlotMachine';
import './MinigamesTab.css';

type MiniGameType = 'fishing' | 'parking' | 'slots' | null;

const MinigamesTab: React.FC = () => {
  const [activeGame, setActiveGame] = useState<MiniGameType>(null);

  const openGame = (gameType: MiniGameType) => {
    setActiveGame(gameType);
  };

  const closeGame = () => {
    setActiveGame(null);
  };

  const renderActiveGame = () => {
    switch (activeGame) {
      case 'fishing':
        return <FishingGame onClose={closeGame} />;
      case 'parking':
        return <ParkingGame onClose={closeGame} />;
      case 'slots':
        return <SlotMachine onClose={closeGame} />;
      default:
        return null;
    }
  };

  return (
    <div className="minigames-tab">
      <div className="minigames-grid">
        <div className="minigame-card" onClick={() => openGame('fishing')}>
          <div className="minigame-icon">🎣</div>
          <div className="minigame-name">钓鱼</div>
          <div className="minigame-description">长按蓄力钓鱼，获得天才币</div>
        </div>
        
        <div className="minigame-card" onClick={() => openGame('parking')}>
          <div className="minigame-icon">🚗</div>
          <div className="minigame-name">车位</div>
          <div className="minigame-description">购买汽车，收取停车费</div>
        </div>
        
        <div className="minigame-card" onClick={() => openGame('slots')}>
          <div className="minigame-icon">🎰</div>
          <div className="minigame-name">老虎机</div>
          <div className="minigame-description">花费天才币，赢取大奖</div>
        </div>
      </div>

      {renderActiveGame()}
    </div>
  );
};

export default MinigamesTab;
