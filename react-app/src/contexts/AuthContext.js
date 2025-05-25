import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

// 認証コンテキストの作成
export const AuthContext = createContext();

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // コンポーネントマウント時にローカルストレージからトークンを取得
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      apiClient.setAuthToken(storedToken);
      
      // トークンからユーザー情報を抽出してセット
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setUser({
          id: payload.userId || payload.sub,
          name: payload.name || payload.nickname || 'ユーザー',
          email: payload.email
        });
      } catch (error) {
        console.error('トークンデコードエラー:', error);
      }
    }
    setLoading(false);
  }, []);

  // トークンの変更を監視してapiClientに設定
  useEffect(() => {
    apiClient.setAuthToken(token);
  }, [token]);

  // ログイン処理
  const login = () => {
    // Auth0ログイン画面へ直接リダイレクト
    fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`)
      .then(response => response.json())
      .then(data => {
        window.location.href = data.authorizationUrl;
      });

  };

  // ログアウト処理
  const logout = async () => {
    try {
      // ログアウトAPIを呼び出し
      const currentToken = token;
      await apiClient.auth.logout();
      
      // ローカルストレージからトークンを削除
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      
      // Auth0のログアウトURLにリダイレクト
      window.location.href = "/";
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーが発生した場合もホームにリダイレクト
      window.location.href = "/";
    }
  };
  
  // トークンからユーザーIDを取得
  const getUserId = () => {
    if (!token) return null;
    
    try {
      // トークンをデコードしてユーザーIDを取得
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub;
    } catch (error) {
      console.error('トークンデコードエラー:', error);
      return null;
    }
  };

  // アクセストークンを取得
  const getAccessToken = async () => {
    // 現在のトークンを返す（必要に応じてリフレッシュロジックを追加できます）
    return token;
  };

  // トークンの保存処理
  const saveToken = (accessToken) => {
    setToken(accessToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', accessToken);
    
    // トークンからユーザー情報を抽出してセット
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      setUser({
        id: payload.userId || payload.sub,
        name: payload.name || payload.nickname || 'ユーザー',
        email: payload.email
      });
    } catch (error) {
      console.error('トークンデコードエラー:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        loading,
        login,
        logout,
        saveToken,
        getUserId,
        getAccessToken
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