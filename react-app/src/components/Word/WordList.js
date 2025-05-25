import React, { useState, useMemo } from 'react';
import LearningStatusSelector from '../LearningStatusSelector';

const WordList = ({
  words,
  isLoading,
  error,
  isMyPage,
  onWordClick,
  onAddWord,
  onRemoveWord,
  expandedRows,
  onToggleRow,
  title,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 検索フィルター機能
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words;
    
    const query = searchQuery.toLowerCase();
    return words.filter(word => 
      word.word.toLowerCase().includes(query) ||
      (word.meaning && word.meaning.toLowerCase().includes(query)) ||
      (word.partOfSpeech && word.partOfSpeech.toLowerCase().includes(query))
    );
  }, [words, searchQuery]);

  const renderSearchBox = () => {
    return (
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="単語、意味、品詞で検索..."
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

  const renderWordTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>単語</th>
            <th className="desktop-only">品詞</th>
            <th className="desktop-only">例文</th>
            <th>意味</th>
            {isMyPage ? <th>操作</th> : <th>追加</th>}
          </tr>
        </thead>
        <tbody>
          {filteredWords.map(word => (
            <tr key={word.id}>
              <td className="word-cell" onClick={() => onWordClick(word)} data-label="単語">
                <span className="clickable-word">{word.word}</span>
                <button 
                  className="toggle-details-button mobile-only"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRow(word.id);
                  }}
                >
                  {expandedRows.has(word.id) ? '詳細を隠す' : '詳細を表示'}
                </button>
              </td>
              <td data-label="意味">{word.meaning || '-'}</td>
              <td className={`details-cell ${expandedRows.has(word.id) ? 'expanded' : ''}`} data-label="品詞">
                {word.partOfSpeech || '-'}
              </td>
              <td className={`details-cell example-sentence ${expandedRows.has(word.id) ? 'expanded' : ''}`} data-label="例文">
                {word.sentences && word.sentences.length > 0 ? (
                  <div>
                    <div className="sentence">{word.sentences[0].sentence}</div>
                    <div className="translation">{word.sentences[0].translation}</div>
                  </div>
                ) : '例文なし'}
              </td>
              <td data-label={isMyPage ? "操作" : "追加"} className={`${expandedRows.has(word.id) ? 'expanded' : ''}`}>
                {isMyPage ? (
                  <button 
                    className="action-button remove-button" 
                    onClick={() => onRemoveWord(word.id)}
                  >
                    削除
                  </button>
                ) : (
                  <button 
                    className="action-button add-button" 
                    onClick={() => onAddWord(word.id)}
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
      ) : !words || words.length === 0 ? (
        <div className="empty-list">登録された単語はありません</div>
      ) : (
        <div className="word-list">
          {renderWordTable()}
          {filteredWords.length === 0 && (
            <div className="empty-list">検索条件に一致する単語はありません</div>
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

export default WordList; 