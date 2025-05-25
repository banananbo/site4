import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import TextInputForm from '../components/TextInputForm';
import LearningStatusSelector from '../components/LearningStatusSelector';
import WordList from '../components/Word/WordList';
import SentenceList from '../components/Sentence/SentenceList';
import IdiomList from '../components/Idiom/IdiomList';
import './WordManagement.css';
import { apiClient } from '../api/apiClient';

// 更新アイコンのSVGコンポーネント
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 009-9m-9 0a9 9 0 00-9 9" />
  </svg>
);

const WordManagement = () => {
  const [activeTab, setActiveTab] = useState('mypage');
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedWordDetails, setSelectedWordDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // センテンス関連の状態
  const [sentences, setSentences] = useState([]);
  const [sentencesLoading, setSentencesLoading] = useState(false);
  const [sentencesError, setSentencesError] = useState('');
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [showSentenceModal, setShowSentenceModal] = useState(false);
  const [sentenceDetailsLoading, setSentenceDetailsLoading] = useState(false);
  
  // イディオム関連の状態
  const [idioms, setIdioms] = useState([]);
  const [idiomsLoading, setIdiomsLoading] = useState(false);
  const [idiomsError, setIdiomsError] = useState('');
  const [selectedIdiom, setSelectedIdiom] = useState(null);
  const [showIdiomModal, setShowIdiomModal] = useState(false);
  
  const { user, loading: authLoading } = useContext(AuthContext);

  // データ取得用のuseEffect
  useEffect(() => {
    if (user && activeTab === 'mypage') {
      fetchUserSentences();
      fetchUserIdioms();
    }
  }, [user, activeTab]);

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

  // ユーザーのセンテンス一覧を取得
  const fetchUserSentences = async () => {
    try {
      setSentencesLoading(true);
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
      
      setSentencesError('');
    } catch (err) {
      console.error('センテンスリスト取得エラー:', err);
      setSentencesError('センテンスリストの取得に失敗しました。');
      setSentences([]);
    } finally {
      setSentencesLoading(false);
    }
  };

  // センテンスをユーザーから削除
  const removeSentenceFromUser = async (sentenceId) => {
    try {
      console.log('センテンス削除リクエスト:', { sentenceId });
      await apiClient.sentences.remove(sentenceId);
      
      // 成功したらセンテンスリストを更新
      fetchUserSentences();
    } catch (err) {
      console.error('センテンス削除エラー:', err);
      alert('センテンスの削除に失敗しました。');
    }
  };

  // ユーザーのイディオム一覧を取得
  const fetchUserIdioms = async () => {
    try {
      setIdiomsLoading(true);
      const response = await apiClient.idioms.getLearningList();
      
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
      
      setIdiomsError('');
    } catch (err) {
      console.error('イディオムリスト取得エラー:', err);
      setIdiomsError('イディオムリストの取得に失敗しました。');
      setIdioms([]);
    } finally {
      setIdiomsLoading(false);
    }
  };

  // イディオムクリック時の処理
  const handleIdiomClick = async (idiom) => {
    setSelectedIdiom(idiom);
    setShowIdiomModal(true);
  };

  // イディオムモーダルを閉じる
  const closeIdiomModal = () => {
    setShowIdiomModal(false);
    setSelectedIdiom(null);
  };

  // イディオムモーダル
  const IdiomDetailModal = () => {
    if (!selectedIdiom) return null;

    return (
      <div className="modal-overlay" onClick={(e) => {
        if (e.target.className === 'modal-overlay') closeIdiomModal();
      }}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeIdiomModal}>×</button>
          <div className="word-detail-card">
            <h3 className="word-title">{selectedIdiom.idiom}</h3>
            <div className="word-info">
              <div className="info-row">
                <span className="info-label">意味:</span>
                <span className="info-value">{selectedIdiom.meaning || '-'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">例文:</span>
                <span className="info-value">{selectedIdiom.example || '-'}</span>
              </div>
              
              {activeTab === 'mypage' && (
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

  // センテンスをクリックしたときに詳細を表示
  const handleSentenceClick = (sentence) => {
    setSelectedSentence(sentence);
    setShowSentenceModal(true);
  };

  // センテンスモーダルを閉じる
  const closeSentenceModal = () => {
    setShowSentenceModal(false);
    setSelectedSentence(null);
  };

  // センテンスモーダルの外側をクリックしたときにモーダルを閉じる
  const handleSentenceOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeSentenceModal();
    }
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

  // センテンス詳細モーダル
  const SentenceDetailModal = () => {
    if (!selectedSentence) return null;

    return (
      <div className="modal-overlay" onClick={handleSentenceOutsideClick}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeSentenceModal}>×</button>
          
          {sentenceDetailsLoading ? (
            <div className="loading">詳細情報を読み込み中...</div>
          ) : (
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
              
              <div className="actions">
                <button 
                  className="action-button remove-button" 
                  onClick={() => {
                    removeSentenceFromUser(selectedSentence.id);
                    closeSentenceModal();
                  }}
                >
                  センテンスを削除する
                </button>
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
              idioms={idioms}
              isLoading={idiomsLoading}
              error={idiomsError}
              isMyPage={true}
              onIdiomClick={handleIdiomClick}
              title={`${user?.name || 'あなた'}の学習中イディオムリスト`}
              onRefresh={fetchUserIdioms}
            />

            <SentenceList
              sentences={sentences}
              isLoading={sentencesLoading}
              error={sentencesError}
              onSentenceClick={handleSentenceClick}
              onRemoveSentence={removeSentenceFromUser}
              title={`${user?.name || 'あなた'}の登録センテンスリスト`}
              onRefresh={fetchUserSentences}
            />
          </>
        ) : (
          <WordList
            isMyPage={false}
            onWordClick={handleWordClick}
            title="みんなの登録単語リスト"
            user={user}
          />
        )}
      </div>
      
      {showModal && <WordDetailModal />}
      {showSentenceModal && <SentenceDetailModal />}
      {showIdiomModal && <IdiomDetailModal />}
    </div>
  );
};

export default WordManagement; 