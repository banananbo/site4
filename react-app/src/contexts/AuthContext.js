import React, { createContext, useState, useContext, useEffect } from 'react';

// 認証コンテキストの作成
const AuthContext = createContext();

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // コンポーネントマウント時にローカルストレージからトークンを取得
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // ログイン処理
  const login = () => {
    // Auth0ログイン画面へ直接リダイレクト
    window.location.href = 'http://api.lvh.me/api/login';
  };

  // ログアウト処理
  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  // トークンの保存処理
  const saveToken = (accessToken) => {
    setToken(accessToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        loading,
        login,
        logout,
        saveToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 