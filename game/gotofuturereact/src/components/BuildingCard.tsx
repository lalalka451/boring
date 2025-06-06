import React from 'react';
import { useGameStore } from '../store/gameStore';
import { gameData } from '../data/gameData';
import { BuildingData } from '../types/game';
import './BuildingCard.css';

interface BuildingCardProps {
  building: BuildingData;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building }) => {
  const { 
    buildings, 
    clickBuilding, 
    buildBuilding, 
    canBuildBuilding, 
    calculateBuildingCost, 
    canAfford, 
    formatNumber 
  } = useGameStore();

  const buildingState = buildings[building.id];
  const count = buildingState ? formatNumber(buildingState.count) : '0';
  const maxCount = building.maxCount === 1000000 ? '∞' : formatNumber(BigInt(building.maxCount));

  const cost = calculateBuildingCost(building.id, 1);
  const affordable = canAfford(cost);
  const canBuild = canBuildBuilding(building.id, 1);

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey && canBuild) {
      // Ctrl+click to build
      buildBuilding(building.id, 1);
    } else if (building.clickable) {
      // Regular click for clickable buildings
      clickBuilding(building.id);
    }
  };

  const handleBuild = (e: React.MouseEvent) => {
    e.stopPropagation();
    buildBuilding(building.id, 1);
  };

  const costEntries = Object.entries(cost);
  const hasProduction = building.production && Object.keys(building.production).length > 0;
  const hasConsumption = building.consumption && Object.keys(building.consumption).length > 0;

  return (
    <div 
      className={`building-card ${building.clickable ? 'clickable' : ''} ${canBuild ? 'buildable' : ''}`}
      onClick={handleClick}
      title={building.description}
    >
      <div className="building-header">
        <div className="building-icon">{building.icon}</div>
        <div className="building-info">
          <div className="building-name">{building.name}</div>
          <div className="building-count">{count}/{maxCount}</div>
        </div>
      </div>

      {costEntries.length > 0 && (
        <div className={`building-cost ${affordable ? 'affordable' : 'expensive'}`}>
          <div className="cost-label">建造成本:</div>
          <div className="cost-items">
            {costEntries.map(([resourceId, amount]) => {
              const resourceData = gameData.resources[resourceId];
              return (
                <span key={resourceId} className="cost-item">
                  {resourceData?.icon || ''} {formatNumber(BigInt(amount))}
                </span>
              );
            })}
          </div>
          <button
            className={`build-btn ${canBuild ? 'enabled' : 'disabled'}`}
            onClick={handleBuild}
            disabled={!canBuild}
            title={canBuild ? "点击建造" : affordable ? "需要满足解锁条件" : "资源不足"}
          >
            {canBuild ? '🏗️ 建造' : affordable ? '🔒 未解锁' : '💰 资源不足'}
          </button>
        </div>
      )}

      {hasProduction && (
        <div className="building-production">
          <div className="production-label">生产:</div>
          <div className="production-items">
            {Object.entries(building.production!).map(([resourceId, amount]) => {
              const resourceData = gameData.resources[resourceId];
              return (
                <span key={resourceId} className="production-item">
                  {resourceData?.icon || ''} +{amount}/s
                </span>
              );
            })}
          </div>
        </div>
      )}

      {hasConsumption && (
        <div className="building-consumption">
          <div className="consumption-label">消耗:</div>
          <div className="consumption-items">
            {Object.entries(building.consumption!).map(([resourceId, amount]) => {
              const resourceData = gameData.resources[resourceId];
              return (
                <span key={resourceId} className="consumption-item">
                  {resourceData?.icon || ''} -{amount}/s
                </span>
              );
            })}
          </div>
        </div>
      )}

      {building.populationCapacity && (
        <div className="building-capacity">
          <span className="capacity-item">
            👥 +{building.populationCapacity} 人口容量
          </span>
        </div>
      )}

      {building.workerCapacity && building.workerCapacity > 0 && (
        <div className="building-workers">
          <span className="worker-info">
            👷 工人容量: {building.workerCapacity * Number(buildingState?.count || 0n)}
          </span>
          {building.workerRequirement && (
            <span className="worker-requirement">
              (需要 {building.workerRequirement}/建筑)
            </span>
          )}
        </div>
      )}

      <div className="building-description">
        {building.description}
      </div>

      {building.clickable && (
        <div className="click-hint">
          💡 点击获得资源
        </div>
      )}
    </div>
  );
};

export default BuildingCard;
