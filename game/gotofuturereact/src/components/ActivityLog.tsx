import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  time: string;
  message: string;
}

const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      message: '🎮 欢迎来到 GoToFuture！'
    },
    {
      id: 2,
      time: new Date().toLocaleTimeString(),
      message: '🌳 点击人树开始你的文明之旅'
    }
  ]);

  // Listen for log events from the game store
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[') && message.includes(']')) {
        // Extract time and message from console log
        const timeMatch = message.match(/\[(.*?)\]/);
        const messageText = message.replace(/\[.*?\]\s*/, '');
        
        if (timeMatch && messageText) {
          setLogs(prev => {
            const newLog: LogEntry = {
              id: Date.now(),
              time: timeMatch[1],
              message: messageText
            };
            
            // Keep only last 10 entries
            const newLogs = [newLog, ...prev.slice(0, 9)];
            return newLogs;
          });
        }
      }
      originalConsoleLog(...args);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Add random events occasionally
  useEffect(() => {
    const events = [
      '🌟 发现了新的资源点',
      '🏗️ 完成了一个建筑项目',
      '🔬 研究取得突破',
      '🚚 贸易商到访',
      '🌤️ 天气变化影响生产'
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setLogs(prev => {
          const newLog: LogEntry = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            message: randomEvent
          };
          return [newLog, ...prev.slice(0, 9)];
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="activity-log">
      <h4>活动日志</h4>
      {logs.map(log => (
        <div key={log.id} className="log-entry">
          <div className="log-time">{log.time}</div>
          <div className="log-content">{log.message}</div>
        </div>
      ))}
    </aside>
  );
};

export default ActivityLog;
