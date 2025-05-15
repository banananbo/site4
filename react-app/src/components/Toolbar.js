import React from 'react';
import './Toolbar.css';

const Toolbar = ({ onMenuClick }) => {
  return (
    <header className="toolbar-modern">
      <div className="toolbar-left">
        <button className="hamburger-menu" onClick={onMenuClick} aria-label="メニューを開く">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <div className="toolbar-logo" style={{marginLeft:12}}>
          <svg width="200" height="48" viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* BananaEngの文字のみ */}
            <text x="30" y="32" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" fontSize="28" fill="#f4b400" fontWeight="bold">Banana</text>
            <text x="120" y="32" fontFamily="Arial Rounded MT Bold, Arial, sans-serif" fontSize="28" fill="#333" fontWeight="bold">Eng</text>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Toolbar; 