import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveToken } = useAuth();
  const [error, setError] = useState(null);
  // リクエストが既に送信されたかどうかを追跡
  const requestSentRef = useRef(false);

  useEffect(() => {
    // 既にリクエストが送信されていたら実行しない
    if (requestSentRef.current) return;

    // URLからcodeパラメータを取得
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      // リクエスト送信済みフラグを立てる
      requestSentRef.current = true;

      // Auth0から返された認証コードをAPIに送信
      axios.post('http://api.lvh.me/api/auth/code', { code, state })
        .then(response => {
          const { accessToken } = response.data;
          // トークンを保存
          saveToken(accessToken);
          // ダッシュボードにリダイレクト
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('認証エラー:', err);
          setError('認証処理中にエラーが発生しました。もう一度お試しください。');
          // エラー時にフラグをリセット（必要に応じて）
          requestSentRef.current = false;
        });
    } else {
      setError('認証コードが見つかりません。もう一度ログインしてください。');
    }
  }, [location, navigate, saveToken]);

  return (
    <div className="callback-container">
      {error ? (
        <div className="error-message">
          <h2>エラー</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>ログインに戻る</button>
        </div>
      ) : (
        <div className="loading-message">
          <h2>ログイン処理中...</h2>
          <p>しばらくお待ちください...</p>
        </div>
      )}
    </div>
  );
};

export default Callback; 