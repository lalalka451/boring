import React from 'react';
import { useGameStore } from '../../store/gameStore';
import './ResetModal.css';

interface ResetModalProps {
  onClose: () => void;
}

const ResetModal: React.FC<ResetModalProps> = ({ onClose }) => {
  const { resetGame } = useGameStore();

  const handleSoftReset = () => {
    if (window.confirm('确定要进行软重置吗？这将重置当前进度但保留重生倍率。')) {
      resetGame(true);
      onClose();
    }
  };

  const handleHardReset = () => {
    if (window.confirm('确定要进行硬重置吗？这将完全清除所有进度！')) {
      resetGame(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔄 重置游戏</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="reset-options">
          <p>选择重置类型：</p>
          <button className="reset-option-btn" onClick={handleSoftReset}>
            <div className="reset-title">🔄 软重置</div>
            <div className="reset-desc">重置进度但保留重生倍率和成就</div>
          </button>
          <button className="reset-option-btn danger" onClick={handleHardReset}>
            <div className="reset-title">💥 硬重置</div>
            <div className="reset-desc">完全重置所有进度，回到初始状态</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
