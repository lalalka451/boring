import { Fish, FishSchema, FishRarity, FishBiome } from '../types/fish';
import fishData from '../../data/fish.json';

// Validate and load fish data
export const loadFishData = (): Fish[] => {
  try {
    const validatedFish = fishData.map((fish, index) => {
      try {
        return FishSchema.parse(fish);
      } catch (error) {
        console.error(`Invalid fish data at index ${index}:`, error);
        throw new Error(`Fish validation failed at index ${index}`);
      }
    });
    
    console.log(`Successfully loaded ${validatedFish.length} fish species`);
    return validatedFish;
  } catch (error) {
    console.error('Failed to load fish data:', error);
    // Return fallback data if validation fails
    return getFallbackFishData();
  }
};

// Fallback fish data in case JSON loading fails
const getFallbackFishData = (): Fish[] => [
  {
    id: 'fallback_fish',
    name: '小鱼',
    icon: '🐟',
    rarity: 'common' as FishRarity,
    minCoins: 3,
    maxCoins: 8,
    biome: 'river' as FishBiome,
    chance: 1.0
  }
];

// Fish utility functions
export class FishManager {
  private fishData: Fish[];
  
  constructor() {
    this.fishData = loadFishData();
  }
  
  // Get all fish
  getAllFish(): Fish[] {
    return this.fishData;
  }
  
  // Get fish by biome
  getFishByBiome(biome: FishBiome): Fish[] {
    return this.fishData.filter(fish => fish.biome === biome);
  }
  
  // Get fish by rarity
  getFishByRarity(rarity: FishRarity): Fish[] {
    return this.fishData.filter(fish => fish.rarity === rarity);
  }
  
  // Get random fish based on power and biome
  getRandomFish(power: number, biome: FishBiome = 'river'): Fish | null {
    const availableFish = this.getFishByBiome(biome);
    
    if (availableFish.length === 0) {
      return null;
    }
    
    // Adjust chances based on power (higher power = better fish)
    const adjustedFish = availableFish.map(fish => ({
      ...fish,
      adjustedChance: this.calculateAdjustedChance(fish, power)
    }));
    
    // Weighted random selection
    const totalWeight = adjustedFish.reduce((sum, fish) => sum + fish.adjustedChance, 0);
    let random = Math.random() * totalWeight;
    
    for (const fish of adjustedFish) {
      random -= fish.adjustedChance;
      if (random <= 0) {
        return fish;
      }
    }
    
    // Fallback to first fish
    return availableFish[0];
  }
  
  // Calculate adjusted chance based on power
  private calculateAdjustedChance(fish: Fish, power: number): number {
    const powerMultiplier = power / 100;
    
    // Higher power increases chance for rare fish
    switch (fish.rarity) {
      case 'common':
        return fish.chance * (1.5 - powerMultiplier * 0.5); // Decreases with power
      case 'rare':
        return fish.chance * (0.5 + powerMultiplier * 1.5); // Increases with power
      case 'epic':
        return fish.chance * (0.1 + powerMultiplier * 2.0); // Greatly increases with power
      case 'legendary':
        return fish.chance * (0.05 + powerMultiplier * 3.0); // Dramatically increases with power
      case 'mythic':
        return fish.chance * (powerMultiplier * 5.0); // Only available at high power
      default:
        return fish.chance;
    }
  }
  
  // Calculate random reward within fish's range
  getRandomReward(fish: Fish): number {
    return Math.floor(Math.random() * (fish.maxCoins - fish.minCoins + 1)) + fish.minCoins;
  }
  
  // Get fish by ID
  getFishById(id: string): Fish | undefined {
    return this.fishData.find(fish => fish.id === id);
  }
}

// Export singleton instance
export const fishManager = new FishManager();
