import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameData } from '../data/gameData';

const Sidebar: React.FC = () => {
  const {
    playerName,
    setPlayerName,
    eraId,
    playthrough,
    globalMultiplier,
    totalPlaytime,
    resources,
    unlockedResources,
    formatNumber,
    getTotalAssignedWorkers
  } = useGameStore();

  const [nameInput, setNameInput] = useState(playerName);

  const handleNameUpdate = () => {
    setPlayerName(nameInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameUpdate();
    }
  };

  const currentEra = gameData.eras[eraId];
  const hours = Math.floor(totalPlaytime / 3600);
  const minutes = Math.floor((totalPlaytime % 3600) / 60);

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="avatar-large">
          {playerName.charAt(0).toUpperCase()}
        </div>
        <div className="player-name-section">
          <input
            type="text"
            className="player-name-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={20}
            placeholder="输入玩家名称"
          />
          <button 
            className="update-name-btn"
            onClick={handleNameUpdate}
            title="更新名称"
          >
            ✓
          </button>
        </div>
        <p className="user-info">
          {currentEra.icon} {currentEra.name} - 第{playthrough}周目
        </p>
        <p className="user-info">
          游戏时间: {hours}h {minutes}m
        </p>
        <p className="user-info">
          全局倍率: {globalMultiplier.toFixed(2)}x
        </p>
        <p className="user-info">
          总人口: {formatNumber(resources.population?.amount || 0n)}
        </p>
        <p className="user-info">
          空闲工人: {formatNumber(BigInt(Number(resources.population?.amount || 0n) - getTotalAssignedWorkers()))}
        </p>
      </div>

      <div className="resources">
        <h4>资源</h4>
        {Array.from(unlockedResources).map(resourceId => {
          const resource = resources[resourceId];
          const resourceData = gameData.resources[resourceId];
          
          if (!resource || !resourceData) return null;

          const perSecText = resource.perSec !== 0n ? 
            ` ${resource.perSec > 0n ? '+' : ''}${formatNumber(resource.perSec)} 每秒` : '';

          return (
            <div key={resourceId} className="resource-item">
              <span className="resource-name">
                {resourceData.icon} {resourceData.name}
              </span>
              <span className="resource-value">
                {formatNumber(resource.amount)}/{formatNumber(resource.cap)}
                {perSecText}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
