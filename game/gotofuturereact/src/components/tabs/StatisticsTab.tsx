import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { gameData } from '../../data/gameData';
import './StatisticsTab.css';

const StatisticsTab: React.FC = () => {
  const { 
    eraId, 
    playthrough, 
    globalMultiplier, 
    totalPlaytime, 
    buildings, 
    resources, 
    formatNumber 
  } = useGameStore();

  const currentEra = gameData.eras[eraId];
  const hours = Math.floor(totalPlaytime / 3600);
  const minutes = Math.floor((totalPlaytime % 3600) / 60);
  const seconds = Math.floor(totalPlaytime % 60);

  const totalBuildings = Object.values(buildings)
    .reduce((sum, building) => sum + Number(building.count), 0);

  const totalResources = Object.values(resources)
    .reduce((sum, resource) => sum + Number(resource.amount), 0);

  const totalProduction = Object.values(resources)
    .reduce((sum, resource) => sum + Number(resource.perSec), 0);

  const statistics = [
    {
      category: '游戏进度',
      stats: [
        { name: '当前时代', value: `${currentEra.icon} ${currentEra.name}` },
        { name: '周目数', value: playthrough.toString() },
        { name: '全局倍率', value: `${globalMultiplier.toFixed(2)}x` },
        { name: '游戏时间', value: `${hours}h ${minutes}m ${seconds}s` }
      ]
    },
    {
      category: '建筑统计',
      stats: [
        { name: '总建筑数', value: totalBuildings.toString() },
        { name: '已解锁建筑', value: Object.keys(buildings).length.toString() },
        { name: '最高建筑数量', value: formatNumber(Math.max(...Object.values(buildings).map(b => Number(b.count)))) }
      ]
    },
    {
      category: '资源统计',
      stats: [
        { name: '总资源量', value: formatNumber(BigInt(totalResources)) },
        { name: '总生产速度', value: `${formatNumber(BigInt(Math.abs(totalProduction)))}/s` },
        { name: '人口数量', value: formatNumber(resources.population?.amount || 0n) },
        { name: '天才币', value: formatNumber(resources.genius_coins?.amount || 0n) }
      ]
    }
  ];

  return (
    <div className="statistics-tab">
      <div className="statistics-header">
        <h3>📊 游戏统计</h3>
        <p>查看你的文明发展数据</p>
      </div>

      <div className="statistics-grid">
        {statistics.map((category, index) => (
          <div key={index} className="statistics-category">
            <h4 className="category-title">{category.category}</h4>
            <div className="stats-list">
              {category.stats.map((stat, statIndex) => (
                <div key={statIndex} className="stat-item">
                  <span className="stat-name">{stat.name}</span>
                  <span className="stat-value">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="era-progress">
        <h4>时代进度</h4>
        <div className="era-timeline">
          {Object.values(gameData.eras).map((era, index) => (
            <div 
              key={era.id} 
              className={`era-step ${era.id === eraId ? 'current' : ''} ${
                Object.keys(gameData.eras).indexOf(eraId) > index ? 'completed' : ''
              }`}
            >
              <div className="era-icon">{era.icon}</div>
              <div className="era-name">{era.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="resource-breakdown">
        <h4>资源详情</h4>
        <div className="resource-grid">
          {Object.entries(resources).map(([resourceId, resource]) => {
            const resourceData = gameData.resources[resourceId];
            if (!resourceData) return null;

            const percentage = Number(resource.amount) / Number(resource.cap) * 100;

            return (
              <div key={resourceId} className="resource-stat">
                <div className="resource-header">
                  <span className="resource-icon">{resourceData.icon}</span>
                  <span className="resource-name">{resourceData.name}</span>
                </div>
                <div className="resource-amount">
                  {formatNumber(resource.amount)} / {formatNumber(resource.cap)}
                </div>
                <div className="resource-bar">
                  <div 
                    className="resource-fill" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {resource.perSec !== 0n && (
                  <div className="resource-rate">
                    {resource.perSec > 0n ? '+' : ''}{formatNumber(resource.perSec)}/s
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;
