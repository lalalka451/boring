import { z } from 'zod';

// Fish rarity enum
export const FishRarity = z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']);
export type FishRarity = z.infer<typeof FishRarity>;

// Fish biome enum
export const FishBiome = z.enum(['river', 'lake', 'sea', 'swamp', 'garden', 'abyss', 'volcano', 'void']);
export type FishBiome = z.infer<typeof FishBiome>;

// Fish schema for validation
export const FishSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  rarity: FishRarity,
  minCoins: z.number().int().positive(),
  maxCoins: z.number().int().positive(),
  biome: FishBiome,
  chance: z.number().min(0).max(1),
  special: z.string().optional()
});

export type Fish = z.infer<typeof FishSchema>;

// Rarity colors for UI
export const RARITY_COLORS: Record<FishRarity, string> = {
  common: '#9CA3AF',    // Gray
  rare: '#3B82F6',      // Blue
  epic: '#8B5CF6',      // Purple
  legendary: '#F59E0B', // Orange
  mythic: '#EF4444'     // Red
};

// Rarity display names
export const RARITY_NAMES: Record<FishRarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
  mythic: '神话'
};

// Biome display names
export const BIOME_NAMES: Record<FishBiome, string> = {
  river: '河流',
  lake: '湖泊',
  sea: '海洋',
  swamp: '沼泽',
  garden: '花园',
  abyss: '深渊',
  volcano: '火山',
  void: '虚空'
};

// Biome icons
export const BIOME_ICONS: Record<FishBiome, string> = {
  river: '🏞️',
  lake: '🏔️',
  sea: '🌊',
  swamp: '🌿',
  garden: '🌸',
  abyss: '🕳️',
  volcano: '🌋',
  void: '🌌'
};
