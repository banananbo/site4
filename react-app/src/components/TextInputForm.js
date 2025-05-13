import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './TextInputForm.css';

const TextInputForm = ({ onInputProcessed }) => {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);

  const { getAccessToken } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setTextInput(e.target.value);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      setError('テキストを入力してください');
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
      
      // リクエストデータを準備
      const requestData = {
        text: textInput,
        translation: null // 翻訳は常にnull
      };
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/input`;
      
      console.log('テキスト処理リクエスト:', requestData);
      const response = await axios.post(apiUrl, requestData, { headers });
      console.log('API response:', response.data);
      
      setSuccess(true);
      setProcessedResult(response.data);
      setTextInput('');
      
      // 親コンポーネントに通知
      if (onInputProcessed && typeof onInputProcessed === 'function') {
        onInputProcessed(response.data);
      }
      
    } catch (err) {
      console.error('テキスト処理エラー:', err);
      setError(err.response?.data?.message || 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="word-form text-input-form">
      <h3>英語テキスト登録</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={textInput}
            onChange={handleInputChange}
            placeholder="英語テキストを入力..."
            disabled={loading}
            className="text-input"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <button 
            type="submit" 
            disabled={loading || !textInput.trim()} 
            className="submit-button"
          >
            {loading ? '処理中...' : '登録'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {success && (
          <div className="success-message">
            「{processedResult?.text || textInput}」が正常に登録されました。
            {processedResult?.type === 'word' ? '（単語として処理）' : '（文章として処理）'}
          </div>
        )}
      </form>
    </div>
  );
};

export default TextInputForm; 