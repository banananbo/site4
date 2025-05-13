import React from 'react';
import './LearningStatusSelector.css';

/**
 * 学習状態を選択するためのコンポーネント
 * @param {string} currentStatus - 現在の学習状態 ('NEW', 'LEARNING', 'MASTERED')
 * @param {function} onStatusChange - 状態変更時のコールバック関数
 * @param {string} itemType - アイテムの種類 ('word' または 'sentence')
 */
const LearningStatusSelector = ({ currentStatus, onStatusChange, itemType }) => {
  // 現在のステータスがない場合は 'NEW' をデフォルトとする
  const status = currentStatus || 'NEW';
  
  // ステータスに応じたラベルとクラス名を取得
  const getStatusLabel = (statusKey) => {
    switch (statusKey) {
      case 'NEW': return '未学習';
      case 'LEARNING': return '学習中';
      case 'MASTERED': return '習得済み';
      default: return '未学習';
    }
  };
  
  return (
    <div className="learning-status-selector">
      <div className="status-label">学習状況:</div>
      <div className="status-buttons">
        <button
          className={`status-button ${status === 'NEW' ? 'active' : ''} status-new`}
          onClick={() => onStatusChange('NEW')}
          title="未学習"
        >
          未学習
        </button>
        <button
          className={`status-button ${status === 'LEARNING' ? 'active' : ''} status-learning`}
          onClick={() => onStatusChange('LEARNING')}
          title="学習中"
        >
          学習中
        </button>
        <button
          className={`status-button ${status === 'MASTERED' ? 'active' : ''} status-mastered`}
          onClick={() => onStatusChange('MASTERED')}
          title="習得済み"
        >
          習得済み
        </button>
      </div>
      <div className="current-status">
        現在: <span className={`status-badge status-${status.toLowerCase()}`}>{getStatusLabel(status)}</span>
      </div>
    </div>
  );
};

export default LearningStatusSelector; 