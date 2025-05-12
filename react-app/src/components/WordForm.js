import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './WordForm.css';

const WordForm = ({ onWordAdded }) => {
  const [wordInput, setWordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredWord, setRegisteredWord] = useState(null);

  const { getAccessToken } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setWordInput(e.target.value);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wordInput.trim()) {
      setError('単語を入力してください');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // アクセストークンを取得
      const token = await getAccessToken();
      
      // APIリクエストのヘッダーに認証トークンを設定
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words`;
      
      console.log('単語登録リクエスト:', { word: wordInput });
      const response = await axios.post(apiUrl, { word: wordInput }, { headers });
      console.log('API response:', response.data);
      
      setSuccess(true);
      setRegisteredWord(response.data);
      setWordInput('');
      
      // 親コンポーネントに通知（単語リストの再読み込み）
      if (onWordAdded && typeof onWordAdded === 'function') {
        onWordAdded();
      }
      
    } catch (err) {
      console.error('単語登録エラー:', err);
      setError(err.response?.data?.message || 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="word-form">
      <h3>新しい単語を登録</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={wordInput}
            onChange={handleInputChange}
            placeholder="英単語を入力..."
            disabled={loading}
            className="word-input"
          />
          <button 
            type="submit" 
            disabled={loading || !wordInput.trim()} 
            className="submit-button"
          >
            {loading ? '処理中...' : '登録'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {success && (
          <div className="success-message">
            「{registeredWord?.word || wordInput}」が正常に登録されました。
          </div>
        )}
      </form>
    </div>
  );
};

export default WordForm; 