import React, { useEffect, useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple timer to show loading then switch to game
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h2>🚀 GoToFuture</h2>
          <p>正在启动游戏引擎...</p>
          <div className="loading-spinner">⚙️</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🚀 GoToFuture - OOP Version</h1>
        <p>Object-Oriented Game Engine Running!</p>
      </div>
      <div className="main-container">
        <div className="sidebar">
          <h3>Resources</h3>
          <p>Wood: 100</p>
          <p>Stone: 50</p>
          <p>Population: 10</p>
        </div>
        <div className="main-content">
          <h3>Buildings</h3>
          <div className="building-card">
            <h4>🌳 Human Tree</h4>
            <p>Click to gather wood!</p>
            <button>Click Me!</button>
          </div>
        </div>
        <div className="activity-log">
          <h4>Activity Log</h4>
          <p>🌟 Game engine started successfully!</p>
          <p>🎮 OOP architecture is working!</p>
        </div>
      </div>
    </div>
  );
};

export default App;
