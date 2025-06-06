import React from 'react';
import { useGameStore } from '../store';
import { gameData } from '../data/gameData';
import { BuildingData } from '../types/game';
import { shallow } from 'zustand/shallow';
import './BuildingCard.css';

interface BuildingCardProps {
  buildingId: string;
}

const BuildingCard: React.FC<BuildingCardProps> = React.memo(({ buildingId }) => {
  const {
    getBuildingState,
    clickBuilding,
    buildBuilding,
    canBuildBuilding,
    calculateBuildingCost,
    canAfford,
    formatNumber,
    assignWorker,
    unassignWorker,
    getResource
  } = useGameStore(state => ({
    getBuildingState: (id: string) => state.buildings[id],
    clickBuilding: state.clickBuilding,
    buildBuilding: state.buildBuilding,
    canBuildBuilding: state.canBuildBuilding,
    calculateBuildingCost: state.calculateBuildingCost,
    canAfford: state.canAfford,
    formatNumber: state.formatNumber,
    assignWorker: state.assignWorker,
    unassignWorker: state.unassignWorker,
    getResource: (id: string) => state.resources[id]
  }), shallow);

  const building = gameData.buildings[buildingId];
  const buildingState = getBuildingState(buildingId);

  if (!building) return null;

  const count = buildingState ? formatNumber(buildingState.count) : '0';
  const maxCount = building.maxCount === 1000000 ? '∞' : formatNumber(BigInt(building.maxCount));

  const cost = React.useMemo(() => calculateBuildingCost(buildingId, 1), [calculateBuildingCost, buildingId]);
  const affordable = canAfford(cost);
  const canBuild = canBuildBuilding(buildingId, 1);

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey && canBuild) {
      buildBuilding(buildingId, 1);
    } else if (building.clickable) {
      clickBuilding(buildingId);
    }
  }, [buildingId, canBuild, building?.clickable, buildBuilding, clickBuilding]);

  const handleBuild = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    buildBuilding(buildingId, 1);
  }, [buildingId, buildBuilding]);

  const costEntries = React.useMemo(() => Object.entries(cost), [cost]);
  const hasProduction = building.production && Object.keys(building.production).length > 0;
  const hasConsumption = building.consumption && Object.keys(building.consumption).length > 0;

  const populationResource = getResource('population');
  const populationAmount = populationResource ? populationResource.amount : 0n;

  const handleUnassignWorker = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    unassignWorker(buildingId, 1);
  }, [buildingId, unassignWorker]);

  const handleAssignWorker = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    assignWorker(buildingId, 1);
  }, [buildingId, assignWorker]);

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

      {building.workerCapacity && building.workerCapacity > 0 && buildingState && Number(buildingState.count) > 0 && (
        <div className="building-workers">
          <div className="worker-info">
            👷 工人: {formatNumber(buildingState.workers)}/{building.workerCapacity * Number(buildingState.count)}
          </div>
          <div className="worker-controls">
            <button
              className="worker-btn"
              onClick={handleUnassignWorker}
              disabled={Number(buildingState.workers) === 0}
              title="撤回1个工人"
            >
              ➖
            </button>
            <button
              className="worker-btn"
              onClick={handleAssignWorker}
              disabled={
                Number(buildingState.workers) >= building.workerCapacity * Number(buildingState.count) ||
                populationAmount <= 0n
              }
              title="分配1个工人"
            >
              ➕
            </button>
          </div>
          {building.workerRequirement && (
            <div className="worker-requirement">
              (建议 {building.workerRequirement}/建筑)
            </div>
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
});

export default BuildingCard;
