import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/dashboard', label: 'ダッシュボード', icon: '📊' },
    { path: '/profile', label: 'プロフィール', icon: '👤' },
    { path: '/settings', label: '設定', icon: '⚙️' },
    { path: '/help', label: 'ヘルプ', icon: '❓' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-menu">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className={isActive(item.path) ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 