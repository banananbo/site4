import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WordForm from '../components/WordForm';
import './WordManagement.css';

const WordManagement = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words`;
      const response = await axios.get(apiUrl);
      console.log('API response:', response.data);
      
      // レスポンスデータの形式をチェック
      if (response.data && Array.isArray(response.data)) {
        setWords(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // オブジェクトの場合は、配列プロパティを探す
        const wordsArray = response.data.items || response.data.words || response.data.content || [];
        setWords(Array.isArray(wordsArray) ? wordsArray : []);
      } else {
        setWords([]);
      }
      
      setError('');
    } catch (err) {
      console.error('単語リスト取得エラー:', err);
      setError('単語リストの取得に失敗しました。');
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="word-management-container">
      <h1>英単語管理</h1>
      
      <div className="word-form-section">
        <WordForm onWordAdded={fetchWords} />
      </div>
      
      <div className="word-list-section">
        <h2>登録済み単語リスト</h2>
        
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !words || words.length === 0 ? (
          <div className="empty-list">登録された単語はありません</div>
        ) : (
          <div className="word-list">
            <table>
              <thead>
                <tr>
                  <th>単語</th>
                  <th>意味</th>
                  <th>品詞</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {words.map(word => (
                  <tr key={word.id}>
                    <td>{word.word}</td>
                    <td>{word.meaning || '-'}</td>
                    <td>{word.partOfSpeech || '-'}</td>
                    <td>
                      <span className={`status status-${word.status?.toLowerCase() || 'pending'}`}>
                        {word.status === 'PENDING' && '処理待ち'}
                        {word.status === 'PROCESSING' && '処理中'}
                        {word.status === 'COMPLETED' && '完了'}
                        {word.status === 'ERROR' && 'エラー'}
                        {(!word.status || 
                          (word.status !== 'PENDING' && 
                           word.status !== 'PROCESSING' && 
                           word.status !== 'COMPLETED' && 
                           word.status !== 'ERROR')) && '処理待ち'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordManagement; 