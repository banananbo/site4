import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Toolbar.css';
import { Link } from 'react-router-dom';
import { FaHome, FaBook, FaComments, FaSignOutAlt } from 'react-icons/fa';

const Toolbar = ({ onMenuClick }) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="toolbar-modern">
      <div className="toolbar-left">
        {/* ハンバーガーメニュー（モバイルのみ表示） */}
        {isAuthenticated && (
          <button className="hamburger-menu" onClick={onMenuClick} aria-label="メニューを開く">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        )}
        <h1 className="toolbar-title">BananaEng</h1>
      </div>
      <nav className="toolbar-nav-modern">
        <Link to="/dashboard" className="toolbar-link"><FaHome className="toolbar-icon" />ダッシュボード</Link>
        <Link to="/words" className="toolbar-link"><FaBook className="toolbar-icon" />単語</Link>
        <Link to="/conversation" className="toolbar-link"><FaComments className="toolbar-icon" />会話</Link>
      </nav>
      <div className="toolbar-actions-modern">
        {isAuthenticated && (
          <button className="logout-button-modern" onClick={logout} title="ログアウト">
            <FaSignOutAlt style={{marginRight:6}} /> ログアウト
          </button>
        )}
      </div>
    </header>
  );
};

export default Toolbar; 