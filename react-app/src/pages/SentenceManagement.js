import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import LearningStatusSelector from '../components/LearningStatusSelector';
import TextInputForm from '../components/TextInputForm';
import './SentenceManagement.css';

const SentenceManagement = () => {
  const [userSentences, setUserSentences] = useState([]);
  const [allSentences, setAllSentences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mypage'); // 'mypage' または 'all'
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const { user, getAccessToken } = useContext(AuthContext);

  // 初期データの読み込み
  useEffect(() => {
    if (user) {
      fetchUserSentences();
    }
  }, [user]);
  
  // タブ切り替え時のデータ読み込み
  useEffect(() => {
    if (activeTab === 'all' && allSentences.length === 0 && user) {
      fetchAllSentences();
    }
  }, [activeTab, user]);

  // ユーザーのセンテンス一覧を取得
  const fetchUserSentences = async (pageToFetch = 0) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL（ユーザーIDの参照を削除）
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences/user?page=${pageToFetch}&size=20`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('センテンスの取得に失敗しました');
      }
      
      const data = await response.json();
      
      if (pageToFetch === 0) {
        setUserSentences(data);
      } else {
        setUserSentences([...userSentences, ...data]);
      }
      
      setHasMore(data.length === 20);
      setPage(pageToFetch);
    } catch (error) {
      console.error('センテンス取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 全センテンス一覧を取得
  const fetchAllSentences = async (pageToFetch = 0) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences?page=${pageToFetch}&size=20`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('センテンスの取得に失敗しました');
      }
      
      const data = await response.json();
      
      if (pageToFetch === 0) {
        setAllSentences(data);
      } else {
        setAllSentences([...allSentences, ...data]);
      }
      
      setHasMore(data.length === 20);
      setPage(pageToFetch);
    } catch (error) {
      console.error('センテンス取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // センテンス詳細情報を取得
  const fetchSentenceDetails = async (sentenceId) => {
    if (!user) return;
    
    setDetailsLoading(true);
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences/${sentenceId}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('センテンス詳細の取得に失敗しました');
      }
      
      const data = await response.json();
      setSelectedSentence(data);
    } catch (error) {
      console.error('センテンス詳細取得エラー:', error);
    } finally {
      setDetailsLoading(false);
    }
  };
  
  // センテンスをユーザーに追加
  const addSentenceToUser = async (sentenceId) => {
    if (!user) return;
    
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL（ユーザーIDの参照を削除）
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences/${sentenceId}/add`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'センテンスの追加に失敗しました');
      }
      
      // ユーザーのセンテンス一覧を再取得
      fetchUserSentences();
      
      // 成功メッセージ
      alert('センテンスをマイページに追加しました');
    } catch (error) {
      console.error('センテンス追加エラー:', error);
      alert(error.message);
    }
  };
  
  // センテンスをユーザーから削除
  const removeSentenceFromUser = async (sentenceId) => {
    if (!user) return;
    
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL（ユーザーIDの参照を削除）
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences/${sentenceId}/remove`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'センテンスの削除に失敗しました');
      }
      
      // ユーザーのセンテンス一覧から削除
      setUserSentences(userSentences.filter(s => s.id !== sentenceId));
      
      // 成功メッセージ
      alert('センテンスをマイページから削除しました');
    } catch (error) {
      console.error('センテンス削除エラー:', error);
      alert(error.message);
    }
  };
  
  // 学習状態を更新する関数
  const updateLearningStatus = async (sentenceId, status) => {
    if (!user) return;
    
    setUpdateStatusLoading(true);
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL（userIdパラメータを削除）
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences/${sentenceId}/learning-status?status=${status}`;
      
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
      
      const updatedSentence = await response.json();
      
      // センテンスリストを更新（アクティブなタブに応じて更新する変数を選択）
      if (activeTab === 'mypage') {
        const updatedUserSentences = userSentences.map(sentence => 
          sentence.id === sentenceId ? { ...sentence, learningStatus: updatedSentence.learningStatus } : sentence
        );
        setUserSentences(updatedUserSentences);
      } else {
        const updatedAllSentences = allSentences.map(sentence => 
          sentence.id === sentenceId ? { ...sentence, learningStatus: updatedSentence.learningStatus } : sentence
        );
        setAllSentences(updatedAllSentences);
      }
      
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
  
  // タブ切り替え
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };
  
  // センテンスクリック時の処理
  const handleSentenceClick = async (sentence) => {
    setSelectedSentence(sentence);
    setShowModal(true);
    await fetchSentenceDetails(sentence.id);
  };
  
  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
    setSelectedSentence(null);
  };
  
  // モーダル外クリック
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
  };
  
  // 新しいセンテンスを登録
  const handleRegisterSentence = async (text) => {
    if (!text.trim() || !user) return;
    
    try {
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/sentences`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sentence: text,
          translation: ''
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'センテンスの登録に失敗しました');
      }
      
      // ユーザーのセンテンス一覧を再取得
      fetchUserSentences();
      
      // 成功メッセージ
      alert('センテンスを登録しました');
    } catch (error) {
      console.error('センテンス登録エラー:', error);
      alert(error.message);
    }
  };
  
  // もっと読み込むボタンの処理
  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (activeTab === 'mypage') {
      fetchUserSentences(nextPage);
    } else {
      fetchAllSentences(nextPage);
    }
  };
  
  // センテンス詳細モーダル
  const SentenceDetailModal = () => {
    if (!showModal || !selectedSentence) return null;
    
    return (
      <div className="modal-overlay" onClick={handleOutsideClick}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal}>×</button>
          
          {detailsLoading ? (
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
                
                {activeTab === 'mypage' && (
                  <LearningStatusSelector 
                    currentStatus={selectedSentence.learningStatus}
                    onStatusChange={(status) => updateLearningStatus(selectedSentence.id, status)}
                    itemType="sentence"
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
                {activeTab === 'mypage' ? (
                  <button 
                    className="action-button remove-button" 
                    onClick={() => {
                      removeSentenceFromUser(selectedSentence.id);
                      closeModal();
                    }}
                  >
                    センテンスを削除する
                  </button>
                ) : (
                  <button 
                    className="action-button add-button" 
                    onClick={() => {
                      addSentenceToUser(selectedSentence.id);
                      closeModal();
                    }}
                  >
                    センテンスを追加する
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // センテンス一覧テーブル
  const renderSentenceTable = (sentenceList, isMyPage) => {
    return (
      <div className="sentence-table">
        {sentenceList.map(sentence => (
          <div 
            key={sentence.id} 
            className="sentence-card"
            onClick={() => handleSentenceClick(sentence)}
          >
            <div className="sentence-text">{sentence.sentence}</div>
            <div className="sentence-translation">{sentence.translation || '-'}</div>
            
            <div className="sentence-footer">
              <div className="sentence-status">
                <span className="status-label">分析:</span>
                <span className={`status-value ${sentence.isAnalyzed ? 'analyzed' : 'pending'}`}>
                  {sentence.isAnalyzed ? '完了' : '処理中'}
                </span>
              </div>
              
              {isMyPage && (
                <div className="sentence-learning-status">
                  <span className={`learning-status learning-status-${sentence.learningStatus?.toLowerCase() || 'new'}`}>
                    {sentence.learningStatus === 'NEW' && '未学習'}
                    {sentence.learningStatus === 'LEARNING' && '学習中'}
                    {sentence.learningStatus === 'MASTERED' && '習得済み'}
                    {(!sentence.learningStatus || 
                      (sentence.learningStatus !== 'NEW' && 
                       sentence.learningStatus !== 'LEARNING' && 
                       sentence.learningStatus !== 'MASTERED')) && '未学習'}
                  </span>
                </div>
              )}
              
              {!isMyPage && (
                <button 
                  className="action-button small add-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    addSentenceToUser(sentence.id);
                  }}
                >
                  追加
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="sentence-management">
      <h1>センテンス管理</h1>
      
      <div className="sentence-input-container">
        <TextInputForm 
          onSubmit={handleRegisterSentence}
          placeholder="新しい英語のセンテンスを入力してください"
          buttonText="センテンスを登録"
          multiline={true}
          submitOnEnter={false}
        />
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'mypage' ? 'active' : ''}`}
          onClick={() => handleTabChange('mypage')}
        >
          マイページ
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          すべてのセンテンス
        </button>
      </div>
      
      <div className="content">
        {loading && <div className="loading">読み込み中...</div>}
        
        {!loading && activeTab === 'mypage' && (
          <>
            {userSentences.length > 0 ? (
              renderSentenceTable(userSentences, true)
            ) : (
              <div className="no-content">
                センテンスがありません。センテンスを追加するか、新しいセンテンスを登録してください。
              </div>
            )}
          </>
        )}
        
        {!loading && activeTab === 'all' && (
          <>
            {allSentences.length > 0 ? (
              renderSentenceTable(allSentences, false)
            ) : (
              <div className="no-content">
                センテンスがありません。新しいセンテンスを登録してください。
              </div>
            )}
          </>
        )}
        
        {hasMore && !loading && (
          <div className="load-more-container">
            <button className="load-more-button" onClick={handleLoadMore}>
              もっと読み込む
            </button>
          </div>
        )}
      </div>
      
      <SentenceDetailModal />
    </div>
  );
};

export default SentenceManagement; 