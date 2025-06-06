import React, { useEffect } from 'react';
import { useGameStore, startGameLoop, stopGameLoop } from './store';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import ActivityLog from './components/ActivityLog';
import './App.css';

const App: React.FC = () => {
  const isLoading = useGameStore(state => state.isLoading);
  const saveGame = useGameStore(state => state.saveGame);

  useEffect(() => {
    startGameLoop(); // Start game loop from the store

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      saveGame(); // Call saveGame from the store
    }, 30000);

    return () => {
      stopGameLoop(); // Stop game loop from the store
      clearInterval(autoSaveInterval);
    };
  }, [saveGame]); // Add saveGame to dependency array

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h2>🚀 GoToFuture</h2>
          <p>正在加载游戏...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <MainContent />
        <ActivityLog />
      </div>
    </div>
  );
};

export default App;
