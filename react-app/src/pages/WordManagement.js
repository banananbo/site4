import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import TextInputForm from '../components/TextInputForm';
import LearningStatusSelector from '../components/LearningStatusSelector';
import './WordManagement.css';

const WordManagement = () => {
  const [words, setWords] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allWordsLoading, setAllWordsLoading] = useState(true);
  const [sentencesLoading, setSentencesLoading] = useState(true);
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
  
  const { user, getAccessToken } = useContext(AuthContext);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  // ユーザーの単語一覧を取得
  const fetchUserWords = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/user`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('ユーザー単語リスト取得リクエスト');
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

  // 全単語一覧を取得
  const fetchAllWords = async () => {
    try {
      setAllWordsLoading(true);
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/all`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('全単語リスト取得リクエスト');
      const response = await axios.get(apiUrl, { headers });
      console.log('API response (all words):', response.data);
      
      // レスポンスデータの形式をチェック
      if (response.data && Array.isArray(response.data)) {
        setAllWords(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // オブジェクトの場合は、配列プロパティを探す
        const wordsArray = response.data.items || response.data.words || response.data.content || [];
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
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/${wordId}`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('単語詳細取得リクエスト:', { wordId });
      const response = await axios.get(apiUrl, { headers });
      console.log('API response (word details):', response.data);
      
      // レスポンスデータをステートに設定
      setSelectedWordDetails(response.data);
      
      return response.data;
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
      const token = await getAccessToken();
      
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/user/add`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(apiUrl, { wordId }, { headers });
      console.log('単語追加レスポンス:', response.data);
      
      if (response.data && response.data.success) {
        // 成功したら単語一覧を再取得
        fetchUserWords();
        return true;
      } else {
        console.error('単語追加エラー:', response.data?.message || '不明なエラー');
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
      const token = await getAccessToken();
      
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/user/remove`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(apiUrl, { wordId }, { headers });
      console.log('単語削除レスポンス:', response.data);
      
      if (response.data && response.data.success) {
        // 成功したら単語一覧を再取得
        fetchUserWords();
        return true;
      } else {
        console.error('単語削除エラー:', response.data?.message || '不明なエラー');
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
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('ユーザーセンテンスリスト取得リクエスト');
      const response = await axios.get(apiUrl, { headers });
      console.log('API response (sentences):', response.data);
      
      // レスポンスデータの形式をチェック
      if (response.data && Array.isArray(response.data)) {
        setSentences(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // オブジェクトの場合は、配列プロパティを探す
        const sentencesArray = response.data.items || response.data.sentences || response.data.content || [];
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
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences/${sentenceId}/remove`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('センテンス削除リクエスト:', { sentenceId });
      await axios.delete(apiUrl, { headers });
      
      // 成功したら単語リストを更新
      fetchUserSentences();
    } catch (err) {
      console.error('センテンス削除エラー:', err);
      alert('センテンスの削除に失敗しました。');
    }
  };

  // タブ切り替え関数
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'everyone' && allWords.length === 0) {
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
      const token = await getAccessToken();
      
      // APIエンドポイントのURL（userIdパラメータを削除）
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/${wordId}/learning-status?status=${status}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '学習状態の更新に失敗しました');
      }
      
      const updatedWord = await response.json();
      
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
                <div className="info-row">
                  <span className="info-label">分析状態:</span>
                  <span className="info-value">{selectedSentence.isAnalyzed ? '分析済み' : '分析中'}</span>
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

  // 単語一覧テーブルのレンダリング
  const renderWordTable = (wordList, isMyPage) => {
    return (
      <table>
        <thead>
          <tr>
            <th>単語</th>
            <th>意味</th>
            <th>品詞</th>
            <th>例文</th>
            {isMyPage ? <th>操作</th> : <th>追加</th>}
          </tr>
        </thead>
        <tbody>
          {wordList.map(word => (
            <tr key={word.id}>
              <td className="word-cell" onClick={() => handleWordClick(word)}>
                <span className="clickable-word">{word.word}</span>
              </td>
              <td>{word.meaning || '-'}</td>
              <td>{word.partOfSpeech || '-'}</td>
              <td className="example-sentence">
                {word.sentences && word.sentences.length > 0 ? (
                  <div>
                    <div className="sentence">{word.sentences[0].sentence}</div>
                    <div className="translation">{word.sentences[0].translation}</div>
                  </div>
                ) : '例文なし'}
              </td>
              <td>
                {isMyPage ? (
                  <button 
                    className="action-button remove-button" 
                    onClick={() => removeWordFromUser(word.id)}
                  >
                    削除
                  </button>
                ) : (
                  <button 
                    className="action-button add-button" 
                    onClick={() => addWordToUser(word.id)}
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

  // センテンス一覧テーブルのレンダリング
  const renderSentenceTable = (sentenceList) => {
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
          {sentenceList.map(sentence => (
            <tr key={sentence.id}>
              <td className="sentence-cell" onClick={() => handleSentenceClick(sentence)}>
                <span className="clickable-sentence">{sentence.sentence}</span>
              </td>
              <td>{sentence.translation || '-'}</td>
              <td>{sentence.isAnalyzed ? '分析済み' : '分析中'}</td>
              <td>
                <button 
                  className="action-button remove-button" 
                  onClick={() => removeSentenceFromUser(sentence.id)}
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

  useEffect(() => {
    if (user) {
      fetchUserWords();
      fetchUserSentences();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <h2>{user?.name || 'あなた'}の登録単語リスト</h2>
            
            {loading ? (
              <div className="loading">読み込み中...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : !words || words.length === 0 ? (
              <div className="empty-list">登録された単語はありません</div>
            ) : (
              <div className="word-list">
                {renderWordTable(words, true)}
              </div>
            )}

            <h2>{user?.name || 'あなた'}の登録センテンスリスト</h2>
            
            {sentencesLoading ? (
              <div className="loading">読み込み中...</div>
            ) : sentencesError ? (
              <div className="error-message">{sentencesError}</div>
            ) : !sentences || sentences.length === 0 ? (
              <div className="empty-list">登録されたセンテンスはありません</div>
            ) : (
              <div className="sentence-list">
                {renderSentenceTable(sentences)}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>みんなの登録単語リスト</h2>
            
            {allWordsLoading ? (
              <div className="loading">読み込み中...</div>
            ) : allWordsError ? (
              <div className="error-message">{allWordsError}</div>
            ) : !allWords || allWords.length === 0 ? (
              <div className="empty-list">登録された単語はありません</div>
            ) : (
              <div className="word-list">
                {renderWordTable(allWords, false)}
              </div>
            )}
          </>
        )}
      </div>
      
      {showModal && <WordDetailModal />}
      {showSentenceModal && <SentenceDetailModal />}
    </div>
  );
};

export default WordManagement; 