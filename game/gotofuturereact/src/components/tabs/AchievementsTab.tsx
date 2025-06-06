import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { gameData } from '../../data/gameData';
import './AchievementsTab.css';

const AchievementsTab: React.FC = () => {
  const { achievements } = useGameStore();

  const allAchievements = Object.values(gameData.achievements);
  const unlockedCount = achievements.size;
  const totalCount = allAchievements.length;

  return (
    <div className="achievements-tab">
      <div className="achievements-header">
        <h3>🏆 成就系统</h3>
        <div className="achievement-progress">
          <span>已解锁: {unlockedCount}/{totalCount}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="achievements-grid">
        {allAchievements.map(achievement => {
          const isUnlocked = achievements.has(achievement.id);
          
          return (
            <div 
              key={achievement.id} 
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {isUnlocked ? achievement.icon : '🔒'}
              </div>
              <div className="achievement-info">
                <div className="achievement-name">
                  {isUnlocked ? achievement.name : '???'}
                </div>
                <div className="achievement-description">
                  {isUnlocked ? achievement.description : '未解锁的成就'}
                </div>
                <div className="achievement-category">
                  {achievement.category}
                </div>
              </div>
              {isUnlocked && achievement.reward.type !== 'none' && (
                <div className="achievement-reward">
                  <span className="reward-label">奖励:</span>
                  {achievement.reward.type === 'resource' && (
                    <span className="reward-value">
                      {achievement.reward.resource} +{achievement.reward.amount}
                    </span>
                  )}
                  {achievement.reward.type === 'multiplier' && (
                    <span className="reward-value">
                      +{achievement.reward.value}x 倍率
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unlockedCount === 0 && (
        <div className="no-achievements">
          <p>🎯 开始游戏来解锁你的第一个成就吧！</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsTab;
