import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './TextInputForm.css';

const TextInputForm = ({ onInputProcessed }) => {
  const [textInput, setTextInput] = useState('');
  const [translationInput, setTranslationInput] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [inputType, setInputType] = useState('auto'); // 'auto', 'word', 'sentence'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);

  const { getAccessToken } = useContext(AuthContext);

  // 入力の内容に基づいて翻訳入力フィールドの表示を自動制御
  useEffect(() => {
    // 自動判定モードの場合
    if (inputType === 'auto') {
      // スペースを含む場合はセンテンスと判断し、翻訳フィールドを表示
      if (textInput.includes(' ') || textInput.length > 30) {
        setShowTranslation(true);
      }
    }
  }, [textInput, inputType]);

  const handleInputChange = (e) => {
    setTextInput(e.target.value);
    setError('');
    setSuccess(false);
  };

  const handleTranslationChange = (e) => {
    setTranslationInput(e.target.value);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setInputType(newType);
    
    // 自動判定またはセンテンスの場合は翻訳フィールドを表示
    if (newType === 'sentence') {
      setShowTranslation(true);
    } else if (newType === 'word') {
      setShowTranslation(false);
    } else if (newType === 'auto') {
      // 自動判定の場合は現在のテキスト内容に基づいて決定
      setShowTranslation(textInput.includes(' ') || textInput.length > 30);
    }
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
        translation: showTranslation ? translationInput : null
      };
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/input`;
      
      console.log('テキスト処理リクエスト:', requestData);
      const response = await axios.post(apiUrl, requestData, { headers });
      console.log('API response:', response.data);
      
      setSuccess(true);
      setProcessedResult(response.data);
      setTextInput('');
      setTranslationInput('');
      
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
        <div className="form-group input-type-selection">
          <label>
            <input
              type="radio"
              name="inputType"
              value="auto"
              checked={inputType === 'auto'}
              onChange={handleTypeChange}
            />
            自動判定
          </label>
          <label>
            <input
              type="radio"
              name="inputType"
              value="word"
              checked={inputType === 'word'}
              onChange={handleTypeChange}
            />
            単語
          </label>
          <label>
            <input
              type="radio"
              name="inputType"
              value="sentence"
              checked={inputType === 'sentence'}
              onChange={handleTypeChange}
            />
            文章
          </label>
        </div>
        
        <div className="form-group">
          <textarea
            value={textInput}
            onChange={handleInputChange}
            placeholder={inputType === 'word' ? '英単語を入力...' : '英語テキストを入力...'}
            disabled={loading}
            className="text-input"
            rows={inputType === 'word' ? 1 : 3}
          />
        </div>
        
        {showTranslation && (
          <div className="form-group">
            <textarea
              value={translationInput}
              onChange={handleTranslationChange}
              placeholder="日本語訳を入力（任意）..."
              disabled={loading}
              className="translation-input"
              rows={2}
            />
          </div>
        )}
        
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