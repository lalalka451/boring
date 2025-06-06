import { GameData } from '../types/game';
import { validateGameData } from './schema';
import erasData from './eras.json';
import resourcesData from './resources.json';
import buildingsData from './buildings.json';
import achievementsData from './achievements.json';

// Raw data from JSON files
const rawGameData = {
  eras: erasData,
  resources: resourcesData,
  buildings: buildingsData,
  achievements: achievementsData
};

// Validate and export game data
export const gameData: GameData = validateGameData(rawGameData) as GameData;
