import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { gameData } from '../../data/gameData';
import BuildingCard from '../BuildingCard';
import './BuildingsTab.css';

const BuildingsTab: React.FC = () => {
  const { unlockedBuildings } = useGameStore();

  const unlockedBuildingsList = Array.from(unlockedBuildings)
    .map(buildingId => gameData.buildings[buildingId])
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by era, then by category
      const eraOrder = ['stone_age', 'bronze_age', 'iron_age', 'industrial_age', 'information_age', 'space_age', 'multidimensional_age'];
      const eraComparison = eraOrder.indexOf(a.era) - eraOrder.indexOf(b.era);
      if (eraComparison !== 0) return eraComparison;
      
      return a.category.localeCompare(b.category);
    });

  if (unlockedBuildingsList.length === 0) {
    return (
      <div className="buildings-tab">
        <div className="loading-message">
          <p>🔄 加载建筑数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="buildings-tab">
      <div className="buildings-grid">
        {unlockedBuildingsList.map(building => (
          <BuildingCard key={building.id} building={building} />
        ))}
      </div>
    </div>
  );
};

export default BuildingsTab;
