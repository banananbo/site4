import React, { useState, useMemo } from 'react';
import LearningStatusSelector from '../LearningStatusSelector';

const IdiomList = ({
  idioms,
  isLoading,
  error,
  isMyPage,
  onIdiomClick,
  onAddIdiom,
  title,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 検索フィルター機能
  const filteredIdioms = useMemo(() => {
    if (!searchQuery.trim()) return idioms;
    
    const query = searchQuery.toLowerCase();
    return idioms.filter(idiom => 
      idiom.idiom.toLowerCase().includes(query) ||
      (idiom.meaning && idiom.meaning.toLowerCase().includes(query)) ||
      (idiom.example && idiom.example.toLowerCase().includes(query))
    );
  }, [idioms, searchQuery]);

  const renderSearchBox = () => {
    return (
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="イディオム、意味、例文で検索..."
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

  const renderIdiomTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>イディオム</th>
            <th>意味</th>
            <th>例文</th>
            {isMyPage ? <th>状態</th> : <th>追加</th>}
          </tr>
        </thead>
        <tbody>
          {filteredIdioms.map(idiom => (
            <tr key={idiom.id}>
              <td className="word-cell" onClick={() => onIdiomClick(idiom)}>
                <span className="clickable-word">{idiom.idiom}</span>
              </td>
              <td>{idiom.meaning || '-'}</td>
              <td className="example-sentence">{idiom.example || '-'}</td>
              <td>
                {isMyPage ? (
                  <div className="status-container">
                    <span className={`status status-${idiom.learningStatus?.toLowerCase() || 'new'}`}>
                      {idiom.learningStatus === 'NEW' && '新規'}
                      {idiom.learningStatus === 'LEARNING' && '学習中'}
                      {idiom.learningStatus === 'MASTERED' && '習得済み'}
                      {!idiom.learningStatus && '新規'}
                    </span>
                    {idiom.isFavorite && <span className="favorite-badge">★</span>}
                  </div>
                ) : (
                  <button 
                    className="action-button add-button" 
                    onClick={() => onAddIdiom(idiom.id)}
                  >
                    追加
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="word-list-section">
      <h2>
        {title}
        <button 
          className="refresh-button" 
          onClick={onRefresh} 
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
        <div className="empty-list">イディオムはありません</div>
      ) : (
        <div className="word-list">
          {renderIdiomTable()}
          {filteredIdioms.length === 0 && (
            <div className="empty-list">検索条件に一致するイディオムはありません</div>
          )}
        </div>
      )}
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