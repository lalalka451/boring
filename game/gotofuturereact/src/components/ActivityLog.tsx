import React from 'react';
import { useGameStore } from '../store';
import { shallow } from 'zustand/shallow';

const ActivityLog: React.FC = () => {
  // Subscribe only to the activityLog for optimization
  const logs = useGameStore(state => state.activityLog, shallow);

  return (
    <aside className="activity-log">
      <h4>活动日志</h4>
      {logs.map((logMessage, index) => (
        <div key={index} className="log-entry">
          <div className="log-content">{logMessage}</div>
        </div>
      ))}
    </aside>
  );
};

export default ActivityLog;
