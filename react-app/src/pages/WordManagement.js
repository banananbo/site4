import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import TextInputForm from '../components/TextInputForm';
import LearningStatusSelector from '../components/LearningStatusSelector';
import WordList from '../components/Word/WordList';
import SentenceList from '../components/Sentence/SentenceList';
import './WordManagement.css';
import { apiClient } from '../api/apiClient';

// 更新アイコンのSVGコンポーネント
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c-4.97 0-9-4.03-9-9m9 9a9 9 0 009-9m-9 0a9 9 0 00-9 9" />
  </svg>
);

const WordManagement = () => {
  const [words, setWords] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allWordsLoading, setAllWordsLoading] = useState(false);
  const [sentencesLoading, setSentencesLoading] = useState(false);
  const [error, setError] = useState('');
  const [allWordsError, setAllWordsError] = useState('');
  const [sentencesError, setSentencesError] = useState('');
  const [activeTab, setActiveTab] = useState('mypage'); // デフォルトは「マイページ」タブ
  const [selectedWord, setSelectedWord] = useState(null); // 選択された単語
  const [selectedWordDetails, setSelectedWordDetails] = useState(null); // 選択された単語の詳細情報
  const [showModal, setShowModal] = useState(false); // モーダル表示の状態
  const [detailsLoading, setDetailsLoading] = useState(false); // 詳細情報の読み込み状態
  
  // センテンス詳細表示用の状態
  const [selectedSentence, setSelectedSentence] = useState(null); // 選択されたセンテンス
  const [showSentenceModal, setShowSentenceModal] = useState(false); // センテンスモーダル表示状態
  const [sentenceDetailsLoading, setSentenceDetailsLoading] = useState(false); // センテンス詳細読み込み状態
  
  const { user, loading: authLoading } = useContext(AuthContext);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    // 認証の準備が完了してからデータを取得
    if (!authLoading && user) {
      if (activeTab === 'mypage') {
        fetchUserWords();
        fetchUserSentences();
      } else if (activeTab === 'everyone' && allWords.length === 0) {
        fetchAllWords();
      }
    }
  }, [authLoading, user, activeTab]); // authLoading, user, activeTabの変更を監視

  // ユーザーの単語一覧を取得
  const fetchUserWords = async () => {
    try {
      setLoading(true);
      console.log('ユーザー単語リスト取得リクエスト');
      const response = await apiClient.words.getUserWords();
      console.log('API response new:', response);
      
      // レスポンスデータの形式をチェック
      if (response && Array.isArray(response)) {
        setWords(response);
      } else if (response && typeof response === 'object') {
        // オブジェクトの場合は、配列プロパティを探す
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
      setLoading(false);
    }
  };

  // 全単語一覧を取得
  const fetchAllWords = async () => {
    try {
      setAllWordsLoading(true);
      console.log('全単語リスト取得リクエスト');
      const response = await apiClient.words.getAllWords();
      console.log('API response (all words):', response);
      
      // レスポンスデータの形式をチェック
      if (response && Array.isArray(response)) {
        setAllWords(response);
      } else if (response && typeof response === 'object') {
        // オブジェクトの場合は、配列プロパティを探す
        const wordsArray = response.items || response.words || response.content || [];
        setAllWords(Array.isArray(wordsArray) ? wordsArray : []);
      } else {
        setAllWords([]);
      }
      
      setAllWordsError('');
    } catch (err) {
      console.error('全単語リスト取得エラー:', err);
      setAllWordsError('全単語リストの取得に失敗しました。');
      setAllWords([]);
    } finally {
      setAllWordsLoading(false);
    }
  };

  // 単語詳細を取得
  const fetchWordDetails = async (wordId) => {
    try {
      setDetailsLoading(true);
      console.log('単語詳細取得リクエスト:', { wordId });
      const response = await apiClient.words.getWordDetails(wordId);
      console.log('API response (word details):', response);
      
      // レスポンスデータをステートに設定
      setSelectedWordDetails(response);
      return response;
    } catch (err) {
      console.error('単語詳細取得エラー:', err);
      // エラーが発生した場合は、基本情報のみの表示用にnullを設定せず、選択された単語をそのまま使用
      setSelectedWordDetails(selectedWord);
      return selectedWord;
    } finally {
      setDetailsLoading(false);
    }
  };

  // 単語をユーザーに関連付ける
  const addWordToUser = async (wordId) => {
    try {
      console.log('単語追加リクエスト:', { wordId });
      const response = await apiClient.words.addWord(wordId);
      console.log('単語追加レスポンス:', response);
      
      if (response && response.success) {
        // 成功したら単語一覧を再取得
        fetchUserWords();
        return true;
      } else {
        console.error('単語追加エラー:', response?.message || '不明なエラー');
        return false;
      }
    } catch (err) {
      console.error('単語追加APIエラー:', err);
      return false;
    }
  };

  // 単語の関連付けを削除
  const removeWordFromUser = async (wordId) => {
    try {
      console.log('単語削除リクエスト:', { wordId });
      const response = await apiClient.words.removeWord(wordId);
      console.log('単語削除レスポンス:', response);
      
      if (response && response.success) {
        // 成功したら単語一覧を再取得
        fetchUserWords();
        return true;
      } else {
        console.error('単語削除エラー:', response?.message || '不明なエラー');
        return false;
      }
    } catch (err) {
      console.error('単語削除APIエラー:', err);
      return false;
    }
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

  // タブ切り替え関数
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'everyone' && allWords.length === 0 && !authLoading) {
      fetchAllWords();
    }
  };

  // 単語をクリックしたときに詳細を表示
  const handleWordClick = async (word) => {
    setSelectedWord(word);
    setShowModal(true);
    
    // 詳細情報を取得
    await fetchWordDetails(word.id);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
    setSelectedWordDetails(null);
  };

  // モーダルの外側をクリックしたときにモーダルを閉じる
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
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

  // 学習状態を更新する関数
  const updateLearningStatus = async (wordId, status) => {
    if (!user) return;
    
    setUpdateStatusLoading(true);
    try {
      console.log('学習状態更新リクエスト:', { wordId, status });
      const updatedWord = await apiClient.words.updateLearningStatus(wordId, status);
      
      // 単語リストを更新（アクティブなタブに応じて更新する変数を選択）
      if (activeTab === 'mypage') {
        const updatedUserWords = words.map(word => 
          word.id === wordId ? { ...word, learningStatus: updatedWord.learningStatus } : word
        );
        setWords(updatedUserWords);
      } else {
        const updatedAllWords = allWords.map(word => 
          word.id === wordId ? { ...word, learningStatus: updatedWord.learningStatus } : word
        );
        setAllWords(updatedAllWords);
      }
      
      // モーダル内の単語データを更新
      if (selectedWord && selectedWord.id === wordId) {
        setSelectedWord({ ...selectedWord, learningStatus: updatedWord.learningStatus });
      }
      
      // 詳細情報が読み込まれている場合はそちらも更新
      if (selectedWordDetails && selectedWordDetails.id === wordId) {
        setSelectedWordDetails({ ...selectedWordDetails, learningStatus: updatedWord.learningStatus });
      }
      
    } catch (error) {
      console.error('学習状態の更新エラー:', error);
      alert(error.message);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // センテンスの学習状態を更新する関数
  const updateSentenceLearningStatus = async (sentenceId, status) => {
    if (!user) return;
    
    setUpdateStatusLoading(true);
    try {
      console.log('センテンス学習状態更新リクエスト:', { sentenceId, status });
      const updatedSentence = await apiClient.sentences.updateLearningStatus(sentenceId, status);
      
      // センテンスリストを更新
      const updatedSentences = sentences.map(sentence => 
        sentence.id === sentenceId ? { ...sentence, learningStatus: updatedSentence.learningStatus } : sentence
      );
      setSentences(updatedSentences);

      console.log('センテンスリスト更新 updatedSentence:', updatedSentence);
      console.log('センテンスリスト更新 selectedSentence:', selectedSentence);
      console.log('センテンスリスト更新 sentenceId:', sentenceId);
      
      // モーダル内のセンテンスデータを更新
      if (selectedSentence && selectedSentence.id === sentenceId) {
        setSelectedSentence({ ...selectedSentence, learningStatus: updatedSentence.learningStatus });
      }
      
    } catch (error) {
      console.error('学習状態の更新エラー:', error);
      alert(error.message);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // 単語詳細モーダル
  const WordDetailModal = () => {
    if (!selectedWord) return null;

    return (
      <div className="modal-overlay" onClick={handleOutsideClick}>
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
                
                {activeTab === 'mypage' && (
                  <LearningStatusSelector 
                    currentStatus={selectedWord.learningStatus}
                    onStatusChange={(status) => updateLearningStatus(selectedWord.id, status)}
                    itemType="word"
                  />
                )}
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
              
              <div className="actions">
                {activeTab === 'mypage' ? (
                  <button 
                    className="action-button remove-button" 
                    onClick={() => {
                      removeWordFromUser(selectedWord.id);
                      closeModal();
                    }}
                  >
                    単語を削除する
                  </button>
                ) : (
                  <button 
                    className="action-button add-button" 
                    onClick={() => {
                      addWordToUser(selectedWord.id);
                      closeModal();
                    }}
                  >
                    単語を追加する
                  </button>
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
                {activeTab === 'mypage' && (
                  <LearningStatusSelector 
                    currentStatus={selectedSentence.learningStatus}
                    onStatusChange={(status) => updateSentenceLearningStatus(selectedSentence.id, status)}
                    itemType="word"
                  />
                )}
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

  return (
    <div className="word-management-container">
      <h1>英単語管理</h1>
      
      <div className="word-form-section">
        <TextInputForm onInputProcessed={() => {
          fetchUserWords();
          fetchUserSentences();
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
              words={words}
              isLoading={loading}
              error={error}
              isMyPage={true}
              onWordClick={handleWordClick}
              onRemoveWord={removeWordFromUser}
              expandedRows={expandedRows}
              onToggleRow={toggleRowExpand}
              title={`${user?.name || 'あなた'}の登録単語リスト`}
              onRefresh={fetchUserWords}
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
            words={allWords}
            isLoading={allWordsLoading}
            error={allWordsError}
            isMyPage={false}
            onWordClick={handleWordClick}
            onAddWord={addWordToUser}
            expandedRows={expandedRows}
            onToggleRow={toggleRowExpand}
            title="みんなの登録単語リスト"
            onRefresh={fetchAllWords}
          />
        )}
      </div>
      
      {showModal && <WordDetailModal />}
      {showSentenceModal && <SentenceDetailModal />}
    </div>
  );
};

export default WordManagement; 