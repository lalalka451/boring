/**
 * UI State Slice
 * Manages user interface state including tabs, loading states, and UI preferences
 */

import { StateCreator } from 'zustand';
import { TabType } from '../../types/game';

export interface UiSlice {
  // Current UI state
  currentTab: TabType;
  isLoading: boolean;
  
  // Activity log
  activityLog: string[];
  maxLogEntries: number;
  
  // UI preferences
  showTooltips: boolean;
  compactMode: boolean;
  
  // Modal states
  showResetModal: boolean;
  showPrestigeModal: boolean;
  activeMinigame: string | null;
  
  // Actions
  setCurrentTab: (tab: TabType) => void;
  setLoading: (loading: boolean) => void;
  addLogEntry: (message: string) => void;
  clearLog: () => void;
  setShowTooltips: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setShowResetModal: (show: boolean) => void;
  setShowPrestigeModal: (show: boolean) => void;
  setActiveMinigame: (game: string | null) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  // Initial state
  currentTab: 'buildings',
  isLoading: false,
  
  // Activity log
  activityLog: ['🌟 欢迎来到GoToFuture！点击人树开始你的文明之旅。'],
  maxLogEntries: 50,
  
  // UI preferences
  showTooltips: true,
  compactMode: false,
  
  // Modal states
  showResetModal: false,
  showPrestigeModal: false,
  activeMinigame: null,
  
  // Actions
  setCurrentTab: (tab: TabType) => {
    set({ currentTab: tab });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  addLogEntry: (message: string) => {
    const state = get();
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    
    const newLog = [entry, ...state.activityLog];
    
    // Keep only the most recent entries
    if (newLog.length > state.maxLogEntries) {
      newLog.splice(state.maxLogEntries);
    }
    
    set({ activityLog: newLog });
  },
  
  clearLog: () => {
    set({ 
      activityLog: ['🌟 欢迎来到GoToFuture！点击人树开始你的文明之旅。'] 
    });
  },
  
  setShowTooltips: (show: boolean) => {
    set({ showTooltips: show });
  },
  
  setCompactMode: (compact: boolean) => {
    set({ compactMode: compact });
  },
  
  setShowResetModal: (show: boolean) => {
    set({ showResetModal: show });
  },
  
  setShowPrestigeModal: (show: boolean) => {
    set({ showPrestigeModal: show });
  },
  
  setActiveMinigame: (game: string | null) => {
    set({ activeMinigame: game });
  }
});
