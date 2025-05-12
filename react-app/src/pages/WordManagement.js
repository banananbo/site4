import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import WordForm from '../components/WordForm';
import './WordManagement.css';

const WordManagement = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, getAccessToken } = useContext(AuthContext);

  const fetchUserWords = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('ユーザー単語リスト取得リクエスト:', { userId: user?.id });
      const response = await axios.get(apiUrl, { headers });
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

  useEffect(() => {
    if (user) {
      fetchUserWords();
    }
  }, [user, getAccessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="word-management-container">
      <h1>英単語管理</h1>
      
      <div className="word-form-section">
        <WordForm onWordAdded={fetchUserWords} />
      </div>
      
      <div className="word-list-section">
        <h2>{user?.name || 'あなた'}の登録単語リスト</h2>
        
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
                  <th>学習状況</th>
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
                    <td>
                      <span className={`learning-status learning-status-${word.learningStatus?.toLowerCase() || 'new'}`}>
                        {word.learningStatus === 'NEW' && '未学習'}
                        {word.learningStatus === 'LEARNING' && '学習中'}
                        {word.learningStatus === 'MASTERED' && '習得済み'}
                        {(!word.learningStatus || 
                          (word.learningStatus !== 'NEW' && 
                           word.learningStatus !== 'LEARNING' && 
                           word.learningStatus !== 'MASTERED')) && '未学習'}
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