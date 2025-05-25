import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import FavoriteButton from '../FavoriteButton';
import './SentenceList.css';

const SentenceList = ({
  isMyPage,
  title,
  user,
}) => {
  const [sentences, setSentences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 検索フィルター機能
  const filteredSentences = useMemo(() => {
    if (!searchQuery.trim()) return sentences;
    
    const query = searchQuery.toLowerCase();
    return sentences.filter(sentence => 
      sentence.sentence.toLowerCase().includes(query) ||
      (sentence.translation && sentence.translation.toLowerCase().includes(query))
    );
  }, [sentences, searchQuery]);

  // データ取得
  const fetchSentences = async () => {
    try {
      setIsLoading(true);
      console.log('ユーザーセンテンスリスト取得リクエスト');
      const response = await apiClient.sentences.getList();
      console.log('API response (sentences):', response);
      
      // レスポンスデータの形式をチェック
      if (response && Array.isArray(response)) {
        setSentences(response);
      } else if (response && typeof response === 'object') {
        // オブジェクトの場合は、配列プロパティを探す
        const sentencesArray = response.items || response.sentences || response.content || [];
        setSentences(Array.isArray(sentencesArray) ? sentencesArray : []);
      } else {
        setSentences([]);
      }
      
      setError('');
    } catch (err) {
      console.error('センテンスリスト取得エラー:', err);
      setError('センテンスリストの取得に失敗しました。');
      setSentences([]);
    } finally {
      setIsLoading(false);
    }
  };

  // お気に入りの更新（センテンスの追加/削除を兼ねる）
  const handleFavoriteToggle = async (sentenceId, currentIsFavorite) => {
    if (!user) return;
    
    try {
      if (currentIsFavorite) {
        // センテンスを削除
        await apiClient.sentences.remove(sentenceId);
      } else {
        // センテンスを追加
        await apiClient.sentences.add(sentenceId);
      }
      fetchSentences();
    } catch (error) {
      console.error('センテンスの追加/削除エラー:', error);
      alert(error.message);
    }
  };

  // センテンスクリック時の処理
  const handleSentenceClick = (sentence) => {
    setSelectedSentence(sentence);
    setShowModal(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
    setSelectedSentence(null);
  };

  // 初回マウント時とisMyPageの変更時にデータを取得
  useEffect(() => {
    if (user) {
      fetchSentences();
    }
  }, [user, isMyPage]);

  const renderSearchBox = () => {
    return (
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="センテンス、日本語訳で検索..."
          className="search-input"
        />
        {searchQuery && (
          <button
            className="search-clear-button"
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // センテンスモーダル
  const SentenceDetailModal = () => {
    if (!selectedSentence) return null;

    return (
      <div className="modal-overlay" onClick={(e) => {
        if (e.target.className === 'modal-overlay') closeModal();
      }}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal}>×</button>
          <div className="sentence-detail-card">
            <h3 className="sentence-title">{selectedSentence.sentence}</h3>
            
            <div className="sentence-info">
              <div className="info-row">
                <span className="info-label">日本語訳:</span>
                <span className="info-value">{selectedSentence.translation || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">難易度:</span>
                <span className="info-value">{selectedSentence.difficulty || 'MEDIUM'}</span>
              </div>
            </div>
            
            {selectedSentence.idioms && selectedSentence.idioms.length > 0 && (
              <div className="idioms-section">
                <h4>イディオム</h4>
                <ul className="idioms-list">
                  {selectedSentence.idioms.map((idiom, index) => (
                    <li key={index} className="idiom-item">
                      <div className="idiom-expression">{idiom.idiom}</div>
                      <div className="idiom-meaning">{idiom.meaning}</div>
                      {idiom.example && <div className="idiom-example">例: {idiom.example}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedSentence.grammars && selectedSentence.grammars.length > 0 && (
              <div className="grammars-section">
                <h4>文法</h4>
                <ul className="grammars-list">
                  {selectedSentence.grammars.map((grammar, index) => (
                    <li key={index} className="grammar-item">
                      <div className="grammar-pattern">{grammar.pattern}</div>
                      <div className="grammar-explanation">{grammar.explanation}</div>
                      <div className="grammar-level">レベル: {grammar.level}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sentence-list-section">
      <h2>
        {title}
        <button 
          className="refresh-button" 
          onClick={fetchSentences} 
          disabled={isLoading}
        >
          <RefreshIcon />
          更新
        </button>
      </h2>

      {renderSearchBox()}
      
      {isLoading ? (
        <div className="loading">読み込み中...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : !sentences || sentences.length === 0 ? (
        <div className="empty-list">登録されたセンテンスはありません</div>
      ) : (
        <div className="sentence-list">
          <table>
            <thead>
              <tr>
                <th>センテンス</th>
                <th>日本語訳</th>
                <th>難易度</th>
                <th>追加/削除</th>
              </tr>
            </thead>
            <tbody>
              {filteredSentences.map(sentence => (
                <tr key={sentence.id}>
                  <td 
                    className="sentence-cell" 
                    onClick={() => handleSentenceClick(sentence)}
                    data-label="センテンス"
                  >
                    <span className="clickable-sentence">{sentence.sentence}</span>
                  </td>
                  <td data-label="日本語訳">{sentence.translation || '-'}</td>
                  <td data-label="難易度" className="desktop-only">{sentence.difficulty || 'MEDIUM'}</td>
                  <td data-label="追加/削除">
                    <FavoriteButton
                      isFavorite={isMyPage}
                      onClick={() => handleFavoriteToggle(sentence.id, isMyPage)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSentences.length === 0 && (
            <div className="empty-list">検索条件に一致するセンテンスはありません</div>
          )}
        </div>
      )}
      
      {showModal && <SentenceDetailModal />}
    </div>
  );
};

// 更新アイコンのSVGコンポーネント
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 009-9m-9 0a9 9 0 00-9 9" />
  </svg>
);

export default SentenceList; 