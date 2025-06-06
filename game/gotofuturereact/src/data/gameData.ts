import { GameData } from '../types/game';
import { validateGameData } from './schema';
import erasData from './eras.json';
import resourcesData from './resources.json';
import buildingsData from './buildings.json';
import achievementsData from './achievements.json';

// Raw data from JSON files with proper typing
const rawGameData = {
  eras: erasData as any,
  resources: resourcesData as any,
  buildings: buildingsData as any,
  achievements: achievementsData as any
};

// Validate and export game data
export const gameData: GameData = validateGameData(rawGameData) as GameData;
