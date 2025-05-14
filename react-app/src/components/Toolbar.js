import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Toolbar.css';

const Toolbar = ({ onMenuClick }) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="toolbar">
      <div className="toolbar-brand">
        {/* ハンバーガーメニュー（モバイルのみ表示） */}
        {isAuthenticated && (
          <button className="hamburger-menu" onClick={onMenuClick} aria-label="メニューを開く">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        )}
        <h1>サイト4B</h1>
      </div>
      <div className="toolbar-actions">
        {isAuthenticated && (
          <button className="logout-button" onClick={logout}>
            ログアウト
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar; 