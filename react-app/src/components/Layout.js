import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 画面幅がPCなら常時Sidebar表示、モバイルならドロワー
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleMenuClick = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <div className="layout">
      <Toolbar onMenuClick={handleMenuClick} />
      {isAuthenticated && (
        isMobile ? (
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        ) : (
          <div className="sidebar">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
        )
      )}
      <main className={`main-content ${isAuthenticated && !isMobile ? 'with-sidebar' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 