import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: '📊' },
    { path: '/words', label: '英単語管理', icon: '📚' },
    { path: '/profile', label: 'プロフィール', icon: '👤' },
    { path: '/settings', label: '設定', icon: '⚙️' },
    { path: '/help', label: 'ヘルプ', icon: '❓' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar-drawer${isOpen ? ' open' : ''}`}> 
        <div className="sidebar-content">
          <button className="sidebar-close" onClick={onClose}>&times;</button>
          <nav className="sidebar-menu">
            <ul>
              {menuItems.map((item) => (
                <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
                  <Link to={item.path} onClick={onClose}>
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 