import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Toolbar.css';
import { Link } from 'react-router-dom';

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
      <nav className="toolbar-nav">
        <Link to="/dashboard">ダッシュボード</Link>
        <Link to="/words">単語</Link>
        <Link to="/conversation">会話</Link>
      </nav>
    </div>
  );
};

export default Toolbar; 