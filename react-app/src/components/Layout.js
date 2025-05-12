import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="layout">
      <Toolbar />
      {isAuthenticated && <Sidebar />}
      <main className={`main-content ${isAuthenticated ? 'with-sidebar' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 