import React, { useState, useMemo, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';
import FavoriteButton from '../FavoriteButton';
import './WordList.css';

const WordList = ({
  isMyPage,
  onWordClick,
  title,
  user,
}) => {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

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

  // データ取得
  const fetchWords = async () => {
    try {
      setIsLoading(true);
      const response = isMyPage 
        ? await apiClient.words.getUserWords()
        : await apiClient.words.getAllWords();

      if (response && Array.isArray(response)) {
        setWords(response);
      } else if (response && typeof response === 'object') {
        const wordsArray = response.items || response.words || response.content || [];
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
      setIsLoading(false);
    }
  };

  // お気に入りの更新（単語の追加/削除を兼ねる）
  const handleFavoriteToggle = async (wordId, currentIsFavorite) => {
    if (!user) return;
    
    try {
      if (currentIsFavorite) {
        // 単語を削除
        await apiClient.words.removeWord(wordId);
      } else {
        // 単語を追加
        await apiClient.words.addWord(wordId);
      }
      fetchWords();
    } catch (error) {
      console.error('単語の追加/削除エラー:', error);
      alert(error.message);
    }
  };

  // 行の展開/折りたたみ
  const toggleRowExpand = (wordId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  };

  // 初回マウント時とisMyPageの変更時にデータを取得
  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [user, isMyPage]);

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
            <th className="desktop-only">例文</th>
            <th>意味</th>
            <th>追加/削除</th>
          </tr>
        </thead>
        <tbody>
          {filteredWords.map(word => (
            <React.Fragment key={word.id}>
              <tr className={expandedRows.has(word.id) ? 'expanded' : ''}>
                <td className="word-cell" onClick={() => onWordClick(word)} data-label="単語">
                  <div className="word-info-container">
                    <span className="clickable-word">{word.word}</span>
                    {word.partOfSpeech && (
                      <span className="part-of-speech">{word.partOfSpeech}</span>
                    )}
                    <button 
                      className="expand-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpand(word.id);
                      }}
                    >
                      {expandedRows.has(word.id) ? '▼' : '▶'}
                    </button>
                  </div>
                </td>
                <td className="details-cell example-sentence" data-label="例文">
                  {word.sentences && word.sentences.length > 0 ? (
                    <div>
                      <div className="sentence">{word.sentences[0].sentence}</div>
                      <div className="translation">{word.sentences[0].translation}</div>
                    </div>
                  ) : '例文なし'}
                </td>
                <td data-label="意味">{word.meaning || '-'}</td>
                <td data-label="追加/削除">
                  <FavoriteButton
                    isFavorite={isMyPage}
                    onClick={() => handleFavoriteToggle(word.id, isMyPage)}
                  />
                </td>
              </tr>
              {expandedRows.has(word.id) && (
                <tr className="expanded-content">
                  <td colSpan={4}>
                    <div className="expanded-details">
                      <h4>例文一覧</h4>
                      {word.sentences && word.sentences.length > 0 ? (
                        <ul>
                          {word.sentences.map((sentence, index) => (
                            <li key={index}>
                              <div className="sentence">{sentence.sentence}</div>
                              <div className="translation">{sentence.translation}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>例文はありません</p>
                      )}
                      {word.note && (
                        <>
                          <h4>メモ</h4>
                          <p>{word.note}</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
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
          onClick={fetchWords} 
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