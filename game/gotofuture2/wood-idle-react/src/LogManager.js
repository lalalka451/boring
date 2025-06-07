import { createSlice } from '@reduxjs/toolkit'

// Initial state for logs
const initialState = {
  logs: []
}

// Maximum number of logs to keep
const MAX_LOGS = 20

// Create slice with reducers and actions
const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: (state, action) => {
      state.logs.unshift(action.payload)
      if (state.logs.length > MAX_LOGS) state.logs.length = MAX_LOGS
    },
    clearLogs: (state) => {
      state.logs = []
    }
  }
})

// Export actions
export const { addLog, clearLogs } = logSlice.actions

// Export reducer
export const logReducer = logSlice.reducer

// Utility functions for logging
export const LogManager = {
  // Log types
  TYPE: {
    RESOURCE: 'resource',
    BUILDING: 'building',
    SYSTEM: 'system',
    ERROR: 'error'
  },
  
  // Format log message with timestamp
  formatLog: (message, type = 'system') => {
    return {
      message,
      type,
      timestamp: Date.now()
    }
  },
  
  // Helper methods for different log types
  resourceLog: (message) => LogManager.formatLog(message, LogManager.TYPE.RESOURCE),
  buildingLog: (message) => LogManager.formatLog(message, LogManager.TYPE.BUILDING),
  systemLog: (message) => LogManager.formatLog(message, LogManager.TYPE.SYSTEM),
  errorLog: (message) => LogManager.formatLog(message, LogManager.TYPE.ERROR)
}
