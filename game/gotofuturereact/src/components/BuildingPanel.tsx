/**
 * Building Panel Component - displays and manages individual buildings
 * Uses the OOP game engine architecture for clean separation of concerns
 */

import React from 'react';
import { useBuilding, useResource, useGameActions, useFormatters } from '../hooks/useGameEngine';
import { gameData } from '../data/gameData';
import './BuildingPanel.css';

interface BuildingPanelProps {
  buildingId: string;
}

const BuildingPanel: React.FC<BuildingPanelProps> = React.memo(({ buildingId }) => {
  const building = useBuilding(buildingId);
  const populationResource = useResource('population');
  const { formatNumber, formatPercentage } = useFormatters();
  const {
    buildBuilding,
    clickBuilding,
    assignWorkers,
    unassignWorkers,
    canBuildBuilding,
    calculateBuildingCost,
    canAfford
  } = useGameActions();

  if (!building) return null;

  const buildingData = building.data;
  const count = formatNumber(building.amount);
  const maxCount = building.maxAmount === BigInt(1000000) ? '∞' : formatNumber(building.maxAmount);

  const cost = calculateBuildingCost(buildingId, 1);
  const affordable = canAfford(cost);
  const canBuild = canBuildBuilding(buildingId, 1);

  const handleClick = React.useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey && canBuild) {
      buildBuilding(buildingId, 1);
    } else if (building.isClickable) {
      clickBuilding(buildingId);
    }
  }, [buildingId, canBuild, building.isClickable, buildBuilding, clickBuilding]);

  const handleBuild = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    buildBuilding(buildingId, 1);
  }, [buildingId, buildBuilding]);

  const handleAssignWorker = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    assignWorkers(buildingId, 1);
  }, [buildingId, assignWorkers]);

  const handleUnassignWorker = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    unassignWorkers(buildingId, 1);
  }, [buildingId, unassignWorkers]);

  const costEntries = React.useMemo(() => Object.entries(cost), [cost]);
  const hasProduction = buildingData.production && Object.keys(buildingData.production).length > 0;
  const hasConsumption = buildingData.consumption && Object.keys(buildingData.consumption).length > 0;
  
  const availableWorkers = populationResource ? populationResource.amount : 0n;
  const hasWorkerCapacity = buildingData.workerCapacity && buildingData.workerCapacity > 0;

  return (
    <div
      className={`building-panel ${building.isClickable ? 'clickable' : ''} ${canBuild ? 'buildable' : ''}`}
      onClick={handleClick}
      title={buildingData.description}
    >
      <div className="building-header">
        <div className="building-icon">{buildingData.icon}</div>
        <div className="building-info">
          <div className="building-name">{buildingData.name}</div>
          <div className="building-count">{count} / {maxCount}</div>
        </div>
      </div>

      {/* Building Cost */}
      <div className="building-cost">
        <div className="cost-label">建造成本:</div>
        <div className="cost-items">
          {costEntries.map(([resourceId, amount]) => {
            const resourceData = gameData.resources[resourceId];
            if (!resourceData) return null;
            
            return (
              <div key={resourceId} className="cost-item">
                {resourceData.icon} {formatNumber(BigInt(amount))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Information */}
      {hasProduction && (
        <div className="building-production">
          <div className="production-label">生产:</div>
          <div className="production-items">
            {Object.entries(buildingData.production!).map(([resourceId, amount]) => {
              const resourceData = gameData.resources[resourceId];
              if (!resourceData) return null;
              
              const actualProduction = building.getResourceProduction(resourceId);
              
              return (
                <div key={resourceId} className="production-item">
                  {resourceData.icon} +{formatNumber(actualProduction)}/s
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Consumption Information */}
      {hasConsumption && (
        <div className="building-consumption">
          <div className="consumption-label">消耗:</div>
          <div className="consumption-items">
            {Object.entries(buildingData.consumption!).map(([resourceId, amount]) => {
              const resourceData = gameData.resources[resourceId];
              if (!resourceData) return null;
              
              const actualConsumption = building.getResourceConsumption(resourceId);
              
              return (
                <div key={resourceId} className="consumption-item">
                  {resourceData.icon} -{formatNumber(actualConsumption)}/s
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Worker Management */}
      {hasWorkerCapacity && building.amount > 0n && (
        <div className="building-workers">
          <div className="worker-info">
            <div className="worker-status">
              {building.getWorkerStatusDisplay()}
            </div>
            <div className="worker-efficiency">
              效率: {building.getEfficiencyDisplay()}
            </div>
          </div>
          <div className="worker-controls">
            <button
              className="worker-btn"
              onClick={handleUnassignWorker}
              disabled={building.workers === 0n}
              title="撤回1个工人"
            >
              ➖
            </button>
            <button
              className="worker-btn"
              onClick={handleAssignWorker}
              disabled={
                building.workers >= BigInt(building.totalWorkerCapacity) ||
                availableWorkers <= 0n
              }
              title="分配1个工人"
            >
              ➕
            </button>
          </div>
        </div>
      )}

      {/* Build Button */}
      <div className="building-actions">
        <button
          className={`build-btn ${canBuild ? 'enabled' : 'disabled'}`}
          onClick={handleBuild}
          disabled={!canBuild}
          title={canBuild ? '建造一个' : affordable ? '已达到最大数量' : '资源不足'}
        >
          {canBuild ? '建造' : affordable ? '已满' : '缺少资源'}
        </button>
      </div>

      {/* Era and Category Info */}
      <div className="building-meta">
        <div className="building-era">{gameData.eras[buildingData.era]?.name || buildingData.era}</div>
        <div className="building-category">{buildingData.category}</div>
      </div>
    </div>
  );
});

BuildingPanel.displayName = 'BuildingPanel';

export default BuildingPanel;
