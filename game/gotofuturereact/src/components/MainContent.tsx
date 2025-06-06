import React from 'react';
import { useGameStore } from '../store/gameStore';
import { gameData } from '../data/gameData';
import BuildingsTab from './tabs/BuildingsTab';
import MinigamesTab from './tabs/MinigamesTab';
import AchievementsTab from './tabs/AchievementsTab';
import StatisticsTab from './tabs/StatisticsTab';
import ResetModal from './modals/ResetModal';

const MainContent: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    eraId, 
    playthrough, 
    saveGame, 
    canPrestige, 
    calculatePrestigeGain, 
    prestige 
  } = useGameStore();

  const [showResetModal, setShowResetModal] = React.useState(false);

  const currentEra = gameData.eras[eraId];
  const prestigeGain = calculatePrestigeGain();
  const canDoPrestige = canPrestige();

  const handlePrestige = () => {
    if (window.confirm('确定要重生吗？这将重置大部分进度，但会获得永久倍率加成。')) {
      prestige();
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'buildings':
        return <BuildingsTab />;
      case 'minigames':
        return <MinigamesTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'statistics':
        return <StatisticsTab />;
      default:
        return <BuildingsTab />;
    }
  };

  return (
    <main className="main-content">
      <div className="content-tabs">
        <button 
          className={`tab-btn ${currentTab === 'buildings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('buildings')}
        >
          建筑
        </button>
        <button 
          className={`tab-btn ${currentTab === 'minigames' ? 'active' : ''}`}
          onClick={() => setCurrentTab('minigames')}
        >
          迷你游戏
        </button>
        <button 
          className={`tab-btn ${currentTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setCurrentTab('achievements')}
        >
          成就
        </button>
        <button 
          className={`tab-btn ${currentTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setCurrentTab('statistics')}
        >
          统计
        </button>
      </div>

      <div className="game-info">
        <div className="era-info">
          <span>{currentEra.icon} {currentEra.name}</span>
          <span>第{playthrough}周目</span>
        </div>
        <div className="controls">
          <button className="control-btn" onClick={saveGame}>
            💾 保存
          </button>
          <button 
            className="control-btn" 
            onClick={handlePrestige}
            disabled={!canDoPrestige}
            title={canDoPrestige ? `重生获得 +${prestigeGain.toFixed(2)}x 倍率` : '需要曲率引擎工厂'}
          >
            {canDoPrestige ? `🌟 重生 (+${prestigeGain.toFixed(2)}x)` : '🌟 重生'}
          </button>
          <button 
            className="control-btn reset-btn" 
            onClick={() => setShowResetModal(true)}
          >
            🔄 重置
          </button>
        </div>
      </div>

      <div className="instructions">
        <p>
          💡 <strong>操作提示:</strong> 点击建筑卡片进行交互，Ctrl+点击建造建筑，Ctrl+S保存游戏
        </p>
      </div>

      {renderTabContent()}

      {showResetModal && (
        <ResetModal onClose={() => setShowResetModal(false)} />
      )}
    </main>
  );
};

export default MainContent;
