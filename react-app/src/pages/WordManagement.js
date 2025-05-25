import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import TextInputForm from '../components/TextInputForm';
import WordList from '../components/Word/WordList';
import SentenceList from '../components/Sentence/SentenceList';
import IdiomList from '../components/Idiom/IdiomList';
import './WordManagement.css';
import { apiClient } from '../api/apiClient';

const WordManagement = () => {
  const [activeTab, setActiveTab] = useState('mypage');
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedWordDetails, setSelectedWordDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  const { user } = useContext(AuthContext);

  // 単語詳細を取得
  const fetchWordDetails = async (wordId) => {
    try {
      setDetailsLoading(true);
      const response = await apiClient.words.getWordDetails(wordId);
      setSelectedWordDetails(response);
      return response;
    } catch (err) {
      console.error('単語詳細取得エラー:', err);
      setSelectedWordDetails(selectedWord);
      return selectedWord;
    } finally {
      setDetailsLoading(false);
    }
  };

  // タブ切り替え
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 単語クリック時の処理
  const handleWordClick = async (word) => {
    setSelectedWord(word);
    setShowModal(true);
    await fetchWordDetails(word.id);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
    setSelectedWordDetails(null);
  };

  // 単語詳細モーダル
  const WordDetailModal = () => {
    if (!selectedWord) return null;

    return (
      <div className="modal-overlay" onClick={(e) => {
        if (e.target.className === 'modal-overlay') closeModal();
      }}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal}>×</button>
          
          {detailsLoading ? (
            <div className="loading">詳細情報を読み込み中...</div>
          ) : (
            <div className="word-detail-card">
              <h3 className="word-title">{selectedWord.word}</h3>
              <div className="word-info">
                <div className="info-row">
                  <span className="info-label">意味:</span>
                  <span className="info-value">{selectedWord.meaning || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">品詞:</span>
                  <span className="info-value">{selectedWord.partOfSpeech || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">処理状況:</span>
                  <span className={`status status-${selectedWord.status?.toLowerCase() || 'pending'}`}>
                    {selectedWord.status === 'PENDING' && '処理待ち'}
                    {selectedWord.status === 'PROCESSING' && '処理中'}
                    {selectedWord.status === 'COMPLETED' && '完了'}
                    {selectedWord.status === 'ERROR' && 'エラー'}
                    {(!selectedWord.status || 
                      (selectedWord.status !== 'PENDING' && 
                       selectedWord.status !== 'PROCESSING' && 
                       selectedWord.status !== 'COMPLETED' && 
                       selectedWord.status !== 'ERROR')) && '処理待ち'}
                  </span>
                </div>
              </div>

              <div className="examples-section">
                <h4>例文</h4>
                {selectedWord.sentences && selectedWord.sentences.length > 0 ? (
                  <ul className="examples-list">
                    {selectedWord.sentences.map((sentence, index) => (
                      <li key={index} className="example-item">
                        <div className="sentence">{sentence.sentence}</div>
                        <div className="translation">{sentence.translation}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-examples">例文はありません</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="word-management-container">
      <h1>英単語管理</h1>
      
      <div className="word-form-section">
        <TextInputForm onInputProcessed={() => {
          // 各リストコンポーネントが自身でデータを再取得するため、
          // ここでは特に何もする必要はありません
        }} />
      </div>
      
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'mypage' ? 'active' : ''}`} 
            onClick={() => handleTabChange('mypage')}
          >
            マイページ
          </button>
          <button 
            className={`tab-button ${activeTab === 'everyone' ? 'active' : ''}`} 
            onClick={() => handleTabChange('everyone')}
          >
            みんなのページ
          </button>
        </div>
      </div>
      
      <div className="word-list-section">
        {activeTab === 'mypage' ? (
          <>
            <WordList
              isMyPage={true}
              onWordClick={handleWordClick}
              title={`${user?.name || 'あなた'}の登録単語リスト`}
              user={user}
            />

            <IdiomList
              isMyPage={true}
              title={`${user?.name || 'あなた'}の学習中イディオムリスト`}
              user={user}
            />

            <SentenceList
              isMyPage={true}
              title={`${user?.name || 'あなた'}の登録センテンスリスト`}
              user={user}
            />
          </>
        ) : (
          <>
            <WordList
              isMyPage={false}
              onWordClick={handleWordClick}
              title="みんなの登録単語リスト"
              user={user}
            />

            <IdiomList
              isMyPage={false}
              title="みんなの登録イディオムリスト"
              user={user}
            />
          </>
        )}
      </div>
      
      {showModal && <WordDetailModal />}
    </div>
  );
};

export default WordManagement; 