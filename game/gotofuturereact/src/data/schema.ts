import { z } from 'zod';

// Schema for requirements
const RequirementsSchema = z.object({
  era: z.string().optional(),
  population: z.number().optional(),
  resources: z.record(z.number()).optional(),
  buildings: z.record(z.number()).optional()
});

// Schema for era data
const EraSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockRequirements: RequirementsSchema,
  advanceRequirements: RequirementsSchema,
  techMultipliers: z.record(z.number())
});

// Schema for resource data
const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  category: z.string(),
  baseValue: z.number(),
  maxValue: z.number(),
  growthRate: z.number(),
  unlockEra: z.string().optional(),
  isWorker: z.boolean().optional(),
  consumptionRate: z.number().optional(),
  recipe: z.record(z.number()).optional(),
  description: z.string()
});

// Schema for building data
const BuildingSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  category: z.string(),
  era: z.string(),
  description: z.string(),
  baseCost: z.record(z.number()),
  costMultiplier: z.number(),
  maxCount: z.number(),
  unlockRequirements: RequirementsSchema,
  production: z.record(z.number()),
  consumption: z.record(z.number()),
  workerCapacity: z.number(),
  workerRequirement: z.number().optional(),
  populationCapacity: z.number().optional(),
  clickable: z.boolean().optional(),
  clickProduction: z.record(z.number()).optional(),
  specialEffect: z.string().optional(),
  effectValue: z.number().optional()
});

// Schema for achievement data
const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.string(),
  requirements: z.object({
    era: z.string().optional(),
    population: z.number().optional(),
    resources: z.record(z.number()).optional(),
    buildings: z.record(z.number()).optional(),
    buildings_built: z.number().optional(),
    total_buildings: z.number().optional(),
    playthrough: z.number().optional()
  }),
  reward: z.object({
    type: z.enum(['none', 'resource', 'multiplier']),
    resource: z.string().optional(),
    amount: z.number().optional(),
    value: z.number().optional()
  })
});

// Main game data schema
export const GameDataSchema = z.object({
  eras: z.record(EraSchema),
  resources: z.record(ResourceSchema),
  buildings: z.record(BuildingSchema),
  achievements: z.record(AchievementSchema)
});

// Validation function
export function validateGameData(data: unknown) {
  try {
    return GameDataSchema.parse(data);
  } catch (error) {
    console.error('Game data validation failed:', error);
    throw new Error('Invalid game data format');
  }
}
