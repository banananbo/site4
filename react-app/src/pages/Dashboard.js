import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { isAuthenticated, logout } = useAuth();

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard-container">
      <h1>ダッシュボード</h1>
      <p>ログインに成功しました！</p>
      <button onClick={logout} className="logout-button">
        ログアウト
      </button>
    </div>
  );
};

export default Dashboard; 