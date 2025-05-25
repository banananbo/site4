import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import FavoriteButton from '../FavoriteButton';
import './IdiomList.css';

const IdiomList = ({
  isMyPage,
  title,
  user,
}) => {
  const [idioms, setIdioms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdiom, setSelectedIdiom] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 検索フィルター機能
  const filteredIdioms = useMemo(() => {
    if (!searchQuery.trim()) return idioms;
    
    const query = searchQuery.toLowerCase();
    return idioms.filter(idiom => 
      idiom.idiom.toLowerCase().includes(query) ||
      (idiom.meaning && idiom.meaning.toLowerCase().includes(query))
    );
  }, [idioms, searchQuery]);

  // データ取得
  const fetchIdioms = async () => {
    try {
      setIsLoading(true);
      const response = isMyPage
        ? await apiClient.idioms.getLearningList()
        : await apiClient.idioms.getList();
      
      if (response && response.content && Array.isArray(response.content)) {
        const transformedIdioms = response.content.map(item => {
          if (item.idiom && item.userIdiom) {
            return {
              ...item.idiom,
              id: item.idiom.id,
              idiom: item.idiom.idiom,
              meaning: item.idiom.meaning,
              example: item.idiom.example,
              learningStatus: item.userIdiom.learningStatus,
              isFavorite: item.userIdiom.isFavorite
            };
          } else {
            return item;
          }
        });
        setIdioms(transformedIdioms);
      } else if (Array.isArray(response)) {
        setIdioms(response);
      } else {
        setIdioms([]);
      }
      
      setError('');
    } catch (err) {
      console.error('イディオムリスト取得エラー:', err);
      setError('イディオムリストの取得に失敗しました。');
      setIdioms([]);
    } finally {
      setIsLoading(false);
    }
  };

  // お気に入りの更新（学習開始/終了を兼ねる）
  const handleFavoriteToggle = async (idiomId, currentIsFavorite) => {
    if (!user) return;
    
    try {
      if (currentIsFavorite) {
        // お気に入り解除
        await apiClient.idioms.toggleFavorite(idiomId);
      } else {
        // お気に入り登録
        await apiClient.idioms.learn(idiomId);
      }
      fetchIdioms();
    } catch (error) {
      console.error('イディオムの学習状態更新エラー:', error);
      alert(error.message);
    }
  };

  // イディオムクリック時の処理
  const handleIdiomClick = (idiom) => {
    setSelectedIdiom(idiom);
    setShowModal(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
    setSelectedIdiom(null);
  };

  // 初回マウント時とisMyPageの変更時にデータを取得
  useEffect(() => {
    if (user) {
      fetchIdioms();
    }
  }, [user, isMyPage]);

  const renderSearchBox = () => {
    return (
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="イディオム、意味で検索..."
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

  // イディオムモーダル
  const IdiomDetailModal = () => {
    if (!selectedIdiom) return null;

    return (
      <div className="modal-overlay" onClick={(e) => {
        if (e.target.className === 'modal-overlay') closeModal();
      }}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal}>×</button>
          <div className="idiom-detail-card">
            <h3 className="idiom-title">{selectedIdiom.idiom}</h3>
            <div className="idiom-info">
              <div className="info-row">
                <span className="info-label">意味:</span>
                <span className="info-value">{selectedIdiom.meaning || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">例文:</span>
                <span className="info-value">{selectedIdiom.example || '-'}</span>
              </div>
              
              {isMyPage && (
                <div className="status-container">
                  <span className={`status status-${selectedIdiom.learningStatus?.toLowerCase() || 'new'}`}>
                    {selectedIdiom.learningStatus === 'NEW' && '新規'}
                    {selectedIdiom.learningStatus === 'LEARNING' && '学習中'}
                    {selectedIdiom.learningStatus === 'MASTERED' && '習得済み'}
                    {!selectedIdiom.learningStatus && '新規'}
                  </span>
                  {selectedIdiom.isFavorite && <span className="favorite-badge">★</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="idiom-list-section">
      <h2>
        {title}
        <button 
          className="refresh-button" 
          onClick={fetchIdioms} 
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
      ) : !idioms || idioms.length === 0 ? (
        <div className="empty-list">登録されたイディオムはありません</div>
      ) : (
        <div className="idiom-list">
          <table>
            <thead>
              <tr>
                <th>イディオム</th>
                <th>意味</th>
                <th>例文</th>
                <th>学習</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdioms.map(idiom => (
                <tr key={idiom.id}>
                  <td 
                    className="idiom-cell" 
                    onClick={() => handleIdiomClick(idiom)}
                    data-label="イディオム"
                  >
                    <span className="clickable-idiom">{idiom.idiom}</span>
                  </td>
                  <td data-label="意味">{idiom.meaning || '-'}</td>
                  <td data-label="例文" className="desktop-only">{idiom.example || '-'}</td>
                  <td data-label="学習">
                    <FavoriteButton
                      isFavorite={isMyPage ? idiom.isFavorite : false}
                      onClick={() => handleFavoriteToggle(idiom.id, isMyPage ? idiom.isFavorite : false)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredIdioms.length === 0 && (
            <div className="empty-list">検索条件に一致するイディオムはありません</div>
          )}
        </div>
      )}
      
      {showModal && <IdiomDetailModal />}
    </div>
  );
};

// 更新アイコンのSVGコンポーネント
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 009-9m-9 0a9 9 0 00-9 9" />
  </svg>
);

export default IdiomList; 