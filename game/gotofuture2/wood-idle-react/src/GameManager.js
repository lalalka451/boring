import { createSlice, configureStore } from '@reduxjs/toolkit'
import * as buildingsConfig from './config/buildings.yaml'
import { logReducer } from './LogManager'

// Initial state with buildings loaded from YAML
const initialState = {
  resources: {
    wood: 0,
    population: {
      total: 0,
      available: 0
    }
  },
  buildings: buildingsConfig
}

// Create slice with reducers and actions
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gatherWood: (state) => {
      state.resources.wood += 1
    },
    buySawmill: (state) => {
      state.resources.wood -= state.buildings.sawmill.cost.wood
      state.buildings.sawmill.count += 1
    },
    buyShelter: (state) => {
      state.resources.wood -= state.buildings.shelter.cost.wood
      state.buildings.shelter.count += 1
      
      // Add population when building shelter
      const populationGain = state.buildings.shelter.population
      state.resources.population.total += populationGain
      state.resources.population.available += populationGain
    },
    produceWood: (state, action) => {
      state.resources.wood += action.payload
    },
    loadGame: (state, action) => {
      if (action.payload.resources) {
        state.resources = action.payload.resources
      }
      if (action.payload.buildings) {
        state.buildings = action.payload.buildings
      }
    },
    resetGame: () => {
      // 确保返回完整的初始状态，包括从 YAML 加载的建筑配置
      return {
        resources: {
          wood: 0,
          population: {
            total: 0,
            available: 0
          }
        },
        buildings: buildingsConfig
      };
    }
  }
})

// Export actions
export const { 
  gatherWood, 
  buySawmill, 
  buyShelter,
  produceWood, 
  loadGame, 
  resetGame 
} = gameSlice.actions

// Create store with combined reducers
export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
    logs: logReducer
  }
})

// Game utility functions
export const GameActions = {
  saveGame: (resources, buildings) => {
    const saveData = { resources, buildings }
    localStorage.setItem('woodIdleGame', JSON.stringify(saveData))
  },
  
  loadGameData: () => {
    const saveData = localStorage.getItem('woodIdleGame')
    if (saveData) {
      try {
        return JSON.parse(saveData)
      } catch (error) {
        console.error('Failed to load game data:', error)
        return null
      }
    }
    return null
  },
  
  // Calculate available workers and production
  calculateProduction: (buildings, population) => {
    // Calculate total workers needed for all sawmills
    const workersNeeded = buildings.sawmill.count * buildings.sawmill.workers
    
    // Calculate how many sawmills can operate based on available workers
    const operatingSawmills = Math.min(
      buildings.sawmill.count,
      Math.floor(population.available / buildings.sawmill.workers)
    )
    
    // Calculate wood production
    const woodProduction = operatingSawmills * buildings.sawmill.rate
    
    return {
      workersNeeded,
      operatingSawmills,
      woodProduction
    }
  }
}





