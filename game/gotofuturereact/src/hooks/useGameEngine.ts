/**
 * React hook for accessing the game engine
 * Provides reactive updates and clean integration with React components
 */

import { useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';

// Global game engine instance
let gameEngineInstance: GameEngine | null = null;

/**
 * Get or create the global game engine instance
 */
function getGameEngine(): GameEngine {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
    
    // Auto-load save data
    gameEngineInstance.load();
    
    // Start the engine
    gameEngineInstance.start();
  }
  return gameEngineInstance;
}

/**
 * Hook for accessing the game engine with reactive updates
 */
export function useGameEngine() {
  const [engine] = useState(() => getGameEngine());
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Force re-render every 250ms to sync with game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return engine;
}

/**
 * Hook for accessing specific resource data with reactive updates
 */
export function useResource(resourceId: string) {
  const engine = useGameEngine();
  const resource = engine.resources.getResource(resourceId);
  
  return resource;
}

/**
 * Hook for accessing specific building data with reactive updates
 */
export function useBuilding(buildingId: string) {
  const engine = useGameEngine();
  const building = engine.buildings.getBuilding(buildingId);
  
  return building;
}

/**
 * Hook for accessing all unlocked resources
 */
export function useUnlockedResources() {
  const engine = useGameEngine();
  return engine.resources.getUnlockedResources();
}

/**
 * Hook for accessing all unlocked buildings
 */
export function useUnlockedBuildings() {
  const engine = useGameEngine();
  return engine.buildings.getUnlockedBuildings();
}

/**
 * Hook for game actions with optimistic updates
 */
export function useGameActions() {
  const engine = useGameEngine();

  const buildBuilding = useCallback((buildingId: string, quantity: number = 1) => {
    return engine.buildings.buildBuilding(buildingId, quantity);
  }, [engine]);

  const clickBuilding = useCallback((buildingId: string) => {
    engine.incrementClicks();
    return engine.buildings.clickBuilding(buildingId);
  }, [engine]);

  const assignWorkers = useCallback((buildingId: string, count: number) => {
    return engine.buildings.assignWorkers(buildingId, count);
  }, [engine]);

  const unassignWorkers = useCallback((buildingId: string, count: number) => {
    return engine.buildings.unassignWorkers(buildingId, count);
  }, [engine]);

  const canAfford = useCallback((cost: Record<string, number>) => {
    return engine.resources.canAfford(cost);
  }, [engine]);

  const calculateBuildingCost = useCallback((buildingId: string, quantity: number = 1) => {
    return engine.buildings.calculateBuildingCost(buildingId, quantity);
  }, [engine]);

  const canBuildBuilding = useCallback((buildingId: string, quantity: number = 1) => {
    return engine.buildings.canBuildBuilding(buildingId, quantity);
  }, [engine]);

  const saveGame = useCallback(() => {
    return engine.save();
  }, [engine]);

  const resetGame = useCallback(() => {
    engine.reset();
  }, [engine]);

  return {
    buildBuilding,
    clickBuilding,
    assignWorkers,
    unassignWorkers,
    canAfford,
    calculateBuildingCost,
    canBuildBuilding,
    saveGame,
    resetGame
  };
}

/**
 * Hook for game state information
 */
export function useGameState() {
  const engine = useGameEngine();

  return {
    currentEra: engine.currentEra,
    playthrough: engine.playthrough,
    globalMultiplier: engine.globalMultiplier,
    totalPlaytime: engine.totalPlaytime,
    statistics: engine.statistics,
    eventLog: engine.eventLog,
    isRunning: engine.isRunning
  };
}

/**
 * Hook for formatting utilities
 */
export function useFormatters() {
  const formatNumber = useCallback((num: bigint): string => {
    const value = Number(num);
    if (value < 1000) return value.toString();
    if (value < 1000000) return (value / 1000).toFixed(1) + 'K';
    if (value < 1000000000) return (value / 1000000).toFixed(1) + 'M';
    return (value / 1000000000).toFixed(1) + 'B';
  }, []);

  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }, []);

  const formatPercentage = useCallback((value: number): string => {
    return `${Math.round(value * 100)}%`;
  }, []);

  return {
    formatNumber,
    formatTime,
    formatPercentage
  };
}

/**
 * Cleanup function for when the app unmounts
 */
export function cleanupGameEngine() {
  if (gameEngineInstance) {
    gameEngineInstance.stop();
    gameEngineInstance.save();
    gameEngineInstance = null;
  }
}
