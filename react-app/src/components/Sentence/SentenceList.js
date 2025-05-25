import React from 'react';

const SentenceList = ({
  sentences,
  isLoading,
  error,
  onSentenceClick,
  onRemoveSentence,
  title,
  onRefresh,
}) => {
  const renderSentenceTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>センテンス</th>
            <th>日本語訳</th>
            <th>分析状態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {sentences.map(sentence => (
            <tr key={sentence.id}>
              <td className="sentence-cell" onClick={() => onSentenceClick(sentence)} data-label="センテンス">
                <span className="clickable-sentence">{sentence.sentence}</span>
              </td>
              <td data-label="日本語訳">{sentence.translation || '-'}</td>
              <td data-label="分析状態">{sentence.isAnalyzed ? '分析済み' : '分析中'}</td>
              <td data-label="操作">
                <button 
                  className="action-button remove-button" 
                  onClick={() => onRemoveSentence(sentence.id)}
                >
                  削除
                </button>
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
      
      {isLoading ? (
        <div className="loading">読み込み中...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : !sentences || sentences.length === 0 ? (
        <div className="empty-list">登録されたセンテンスはありません</div>
      ) : (
        <div className="sentence-list">
          {renderSentenceTable()}
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

export default SentenceList; 