import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { isAuthenticated, login } = useAuth();

  // 既に認証済みの場合はダッシュボードにリダイレクト
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-container">
      <h1>ログイン</h1>
      <p>サービスを利用するにはログインが必要です。</p>
      <button onClick={login} className="login-button">
        ログイン
      </button>
    </div>
  );
};

export default Login; 