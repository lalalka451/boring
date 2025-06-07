import React from 'react';
import { useUnlockedBuildings } from '../../hooks/useGameEngine';
import BuildingPanel from '../BuildingPanel';
import './BuildingsTab.css';

const BuildingsTab: React.FC = () => {
  const unlockedBuildings = useUnlockedBuildings();

  const unlockedBuildingsList = React.useMemo(() => {
    return unlockedBuildings
      .map(building => building.data)
      .sort((a, b) => {
        // Sort by era, then by category
        const eraOrder = ['stone_age', 'bronze_age', 'iron_age', 'industrial_age', 'information_age', 'space_age', 'multidimensional_age'];
        const eraComparison = eraOrder.indexOf(a.era) - eraOrder.indexOf(b.era);
        if (eraComparison !== 0) return eraComparison;

        return a.category.localeCompare(b.category);
      });
  }, [unlockedBuildings]);

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
          <BuildingPanel key={building.id} buildingId={building.id} />
        ))}
      </div>
    </div>
  );
};

export default BuildingsTab;
