import React from 'react';
import { useGameState } from '../hooks/useGameEngine';

const Header: React.FC = () => {
  const gameState = useGameState();
  const playerName = '文明建造者'; // Default player name

  return (
    <header className="header">
      <nav className="nav-tabs">
        <a href="#" className="nav-tab">公告</a>
        <a href="#" className="nav-tab">手动存档</a>
        <a href="#" className="nav-tab">存档列表</a>
        <a href="#" className="nav-tab">排行榜</a>
        <a href="#" className="nav-tab">交流群</a>
        <a href="#" className="nav-tab">站点</a>
        <a href="#" className="nav-tab active">太空市 D</a>
      </nav>
      <div className="header-right">
        <span className="ping">ping: 42ms</span>
        <div className="search-box">
          <input type="text" placeholder="搜索..." />
        </div>
        <div className="user-avatar">
          {playerName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
