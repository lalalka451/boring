import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import ActivityLog from './components/ActivityLog';
import './App.css';

const App: React.FC = () => {
  const { tick, isLoading } = useGameStore();

  useEffect(() => {
    // Start game loop
    const gameLoop = setInterval(() => {
      tick();
    }, 250); // 4 ticks per second

    // Auto-save every 30 seconds
    const autoSave = setInterval(() => {
      useGameStore.getState().saveGame();
    }, 30000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(autoSave);
    };
  }, [tick]);

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
