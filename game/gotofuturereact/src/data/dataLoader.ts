import { GameData } from '../types/game';
import { validateGameData } from './schema';
import { gameData as fallbackData } from './gameData';

// Configuration for remote data sources
const DATA_CONFIG = {
  baseUrl: import.meta.env.VITE_DATA_URL || '',
  version: import.meta.env.VITE_DATA_VERSION || 'v1',
  timeout: 5000, // 5 seconds timeout
  retryAttempts: 2
};

// Cache for loaded data
let cachedGameData: GameData | null = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch data from a remote URL with timeout and retry logic
 */
async function fetchWithRetry(url: string, attempts = DATA_CONFIG.retryAttempts): Promise<any> {
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DATA_CONFIG.timeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      if (i === attempts - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

/**
 * Load data from remote source with fallback to local data
 */
async function loadRemoteData(): Promise<GameData> {
  if (!DATA_CONFIG.baseUrl) {
    console.info('No remote data URL configured, using local data');
    return fallbackData;
  }

  try {
    console.info('Loading game data from remote source...');
    
    // Try to load each data type separately for better error handling
    const [eras, resources, buildings, achievements] = await Promise.allSettled([
      fetchWithRetry(`${DATA_CONFIG.baseUrl}/${DATA_CONFIG.version}/eras.json`),
      fetchWithRetry(`${DATA_CONFIG.baseUrl}/${DATA_CONFIG.version}/resources.json`),
      fetchWithRetry(`${DATA_CONFIG.baseUrl}/${DATA_CONFIG.version}/buildings.json`),
      fetchWithRetry(`${DATA_CONFIG.baseUrl}/${DATA_CONFIG.version}/achievements.json`)
    ]);

    // Build remote data object, falling back to local data for failed requests
    const remoteData = {
      eras: eras.status === 'fulfilled' ? eras.value : fallbackData.eras,
      resources: resources.status === 'fulfilled' ? resources.value : fallbackData.resources,
      buildings: buildings.status === 'fulfilled' ? buildings.value : fallbackData.buildings,
      achievements: achievements.status === 'fulfilled' ? achievements.value : fallbackData.achievements
    };

    // Validate the combined data
    const validatedData = validateGameData(remoteData) as GameData;
    
    console.info('Successfully loaded and validated remote game data');
    return validatedData;
    
  } catch (error) {
    console.warn('Failed to load remote data, falling back to local:', error);
    return fallbackData;
  }
}

/**
 * Get game data with caching and remote loading support
 */
export async function getGameData(forceRefresh = false): Promise<GameData> {
  const now = Date.now();
  
  // Return cached data if still valid and not forcing refresh
  if (!forceRefresh && cachedGameData && (now - lastLoadTime) < CACHE_DURATION) {
    return cachedGameData;
  }

  try {
    // Load data (remote with fallback to local)
    const data = await loadRemoteData();
    
    // Cache the result
    cachedGameData = data;
    lastLoadTime = now;
    
    return data;
  } catch (error) {
    console.error('Critical error loading game data:', error);
    
    // Return cached data if available, otherwise fallback data
    return cachedGameData || fallbackData;
  }
}

/**
 * Preload game data for faster startup
 */
export function preloadGameData(): Promise<GameData> {
  return getGameData();
}

/**
 * Clear cached data (useful for development/testing)
 */
export function clearDataCache(): void {
  cachedGameData = null;
  lastLoadTime = 0;
}

/**
 * Get data loading status
 */
export function getDataStatus() {
  return {
    hasCachedData: !!cachedGameData,
    lastLoadTime,
    cacheAge: cachedGameData ? Date.now() - lastLoadTime : 0,
    isStale: cachedGameData ? (Date.now() - lastLoadTime) > CACHE_DURATION : true
  };
}

// Export the synchronous fallback for immediate use
export { gameData as fallbackGameData } from './gameData';
