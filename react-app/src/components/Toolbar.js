import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Toolbar.css';

const Toolbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="toolbar">
      <div className="toolbar-brand">
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