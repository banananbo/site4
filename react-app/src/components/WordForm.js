import React, { useState } from 'react';
import axios from 'axios';
import './WordForm.css';

const WordForm = ({ onWordAdded }) => {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredWord, setRegisteredWord] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) {
      setError('単語を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setRegisteredWord(null);

    try {
      console.log('単語登録リクエスト:', { word: word.trim() });
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words`;
      const response = await axios.post(apiUrl, { word: word.trim() });
      console.log('単語登録レスポンス:', response.data);
      
      const responseData = response.data;
      setRegisteredWord(responseData);
      setSuccess(true);
      setWord('');
      
      // 親コンポーネントに単語が追加されたことを通知
      if (onWordAdded) {
        onWordAdded();
      }
    } catch (err) {
      console.error('単語登録エラー:', err);
      
      let errorMessage = 'エラーが発生しました。後でもう一度お試しください。';
      if (err.response) {
        console.error('エラーレスポンス:', err.response);
        errorMessage = err.response.data?.message || 
                       err.response.data?.error || 
                       `サーバーエラー (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'サーバーに接続できませんでした。ネットワーク接続を確認してください。';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="word-form-container">
      <h2>英単語登録</h2>
      <form onSubmit={handleSubmit} className="word-form">
        <div className="form-group">
          <label htmlFor="word">英単語:</label>
          <input
            type="text"
            id="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="登録したい英単語を入力してください"
            disabled={loading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '登録中...' : '登録する'}
        </button>

        {error && <div className="error-message">{error}</div>}
        
        {success && registeredWord && (
          <div className="success-message">
            <p>「{registeredWord.word}」が登録されました！</p>
            <div className="word-details">
              <p><strong>ID:</strong> {registeredWord.id}</p>
              <p><strong>ステータス:</strong> {registeredWord.status}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default WordForm; 