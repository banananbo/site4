import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import IdiomList from '../components/Idiom/IdiomList';
import LearningStatusSelector from '../components/LearningStatusSelector';
import './WordManagement.css'; // 同じスタイルを使用

const IdiomsManagement = () => {
  const [idioms, setIdioms] = useState([]);
  const [allIdioms, setAllIdioms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allIdiomsLoading, setAllIdiomsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allIdiomsError, setAllIdiomsError] = useState('');
  const [activeTab, setActiveTab] = useState('mypage'); // デフォルトは「マイページ」タブ
  const [selectedIdiom, setSelectedIdiom] = useState(null); // 選択されたイディオム
  const [selectedIdiomDetails, setSelectedIdiomDetails] = useState(null); // 選択されたイディオムの詳細情報
  const [showModal, setShowModal] = useState(false); // モーダル表示の状態
  const [detailsLoading, setDetailsLoading] = useState(false); // 詳細情報の読み込み状態
  
  const { user, loading: authLoading } = useContext(AuthContext);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  // ユーザーのイディオム一覧を取得
  const fetchUserIdioms = async () => {
    if (authLoading || !user) return;

    try {
      setLoading(true);
      console.log('ユーザーイディオムリスト取得リクエスト');
      const response = await apiClient.idioms.getLearningList();
      console.log('API response:', response);
      
      // レスポンスデータの形式をチェック
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
      setLoading(false);
    }
  };

  // 全イディオム一覧を取得
  const fetchAllIdioms = async () => {
    if (authLoading || !user) return;

    try {
      setAllIdiomsLoading(true);
      console.log('全イディオムリスト取得リクエスト');
      const response = await apiClient.idioms.getList();
      console.log('API response (all idioms):', response);
      
      if (response && response.content && Array.isArray(response.content)) {
        setAllIdioms(response.content);
      } else if (Array.isArray(response)) {
        setAllIdioms(response);
      } else {
        setAllIdioms([]);
      }
      
      setAllIdiomsError('');
    } catch (err) {
      console.error('全イディオムリスト取得エラー:', err);
      setAllIdiomsError('全イディオムリストの取得に失敗しました。');
      setAllIdioms([]);
    } finally {
      setAllIdiomsLoading(false);
    }
  };

  // イディオム詳細を取得
  const fetchIdiomDetails = async (idiomId) => {
    try {
      setDetailsLoading(true);
      console.log('イディオム詳細取得リクエスト:', { idiomId });
      const response = await apiClient.idioms.getDetails(idiomId);
      console.log('API response (idiom details):', response);
      
      setSelectedIdiomDetails(response);
      return response;
    } catch (err) {
      console.error('イディオム詳細取得エラー:', err);
      setSelectedIdiomDetails(selectedIdiom);
      return selectedIdiom;
    } finally {
      setDetailsLoading(false);
    }
  };

  // イディオムをユーザーに関連付ける（学習リストに追加）
  const addIdiomToUser = async (idiomId) => {
    try {
      console.log('イディオム追加リクエスト:', { idiomId });
      await apiClient.idioms.learn(idiomId);
      
      // 成功したらイディオム一覧を再取得
      fetchUserIdioms();
      return true;
    } catch (err) {
      console.error('イディオム追加APIエラー:', err);
      return false;
    }
  };

  // 学習状態を更新する関数
  const updateLearningStatus = async (idiomId, status) => {
    if (!user) return;
    
    setUpdateStatusLoading(true);
    try {
      const updatedIdiom = await apiClient.idioms.updateStatus(idiomId, status);
      
      // イディオムリストを更新（アクティブなタブに応じて更新する変数を選択）
      if (activeTab === 'mypage') {
        const updatedUserIdioms = idioms.map(idiom => 
          idiom.id === idiomId ? { ...idiom, learningStatus: updatedIdiom.learningStatus } : idiom
        );
        setIdioms(updatedUserIdioms);
      }
      
      // モーダル内のイディオムデータを更新
      if (selectedIdiom && selectedIdiom.id === idiomId) {
        setSelectedIdiom({ ...selectedIdiom, learningStatus: updatedIdiom.learningStatus });
      }
      
      // 詳細情報が読み込まれている場合はそちらも更新
      if (selectedIdiomDetails && selectedIdiomDetails.id === idiomId) {
        setSelectedIdiomDetails({ ...selectedIdiomDetails, learningStatus: updatedIdiom.learningStatus });
      }
      
    } catch (error) {
      console.error('学習状態の更新エラー:', error);
      alert(error.message);
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  // お気に入り状態を更新する関数
  const updateFavoriteStatus = async (idiomId) => {
    if (!user) return;
    
    try {
      const updatedIdiom = await apiClient.idioms.toggleFavorite(idiomId);
      
      // イディオムリストを更新
      if (activeTab === 'mypage') {
        const updatedUserIdioms = idioms.map(idiom => 
          idiom.id === idiomId ? { ...idiom, isFavorite: updatedIdiom.isFavorite } : idiom
        );
        setIdioms(updatedUserIdioms);
      }
      
      // モーダル内のイディオムデータを更新
      if (selectedIdiom && selectedIdiom.id === idiomId) {
        setSelectedIdiom({ ...selectedIdiom, isFavorite: updatedIdiom.isFavorite });
      }
      
      // 詳細情報が読み込まれている場合はそちらも更新
      if (selectedIdiomDetails && selectedIdiomDetails.id === idiomId) {
        setSelectedIdiomDetails({ ...selectedIdiomDetails, isFavorite: updatedIdiom.isFavorite });
      }
      
    } catch (error) {
      console.error('お気に入り状態の更新エラー:', error);
      alert(error.message);
    }
  };

  // タブ切り替え
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // タブが「みんなのページ」に切り替わったらデータを読み込む
    if (tab === 'everyone' && allIdioms.length === 0) {
      fetchAllIdioms();
    }
  };

  // イディオムクリック処理
  const handleIdiomClick = async (idiom) => {
    setSelectedIdiom(idiom);
    setShowModal(true);
    
    // 詳細情報を取得
    await fetchIdiomDetails(idiom.id);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
    setSelectedIdiomDetails(null);
  };

  // モーダルの外側をクリックしたときにモーダルを閉じる
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
  };

  // イディオム詳細モーダル
  const IdiomDetailModal = () => {
    if (!selectedIdiom) return null;

    return (
      <div className="modal-overlay" onClick={handleOutsideClick}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeModal}>×</button>
          
          {detailsLoading ? (
            <div className="loading">詳細情報を読み込み中...</div>
          ) : (
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
                  <>
                    <LearningStatusSelector 
                      currentStatus={selectedIdiom.learningStatus}
                      onStatusChange={(status) => updateLearningStatus(selectedIdiom.id, status)}
                      itemType="idiom"
                    />
                    <div className="favorite-toggle">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedIdiom.isFavorite} 
                          onChange={(e) => updateFavoriteStatus(selectedIdiom.id)}
                        />
                        お気に入り
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (user) {
      fetchUserIdioms();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="word-management-container">
      <h1>イディオム管理</h1>
      
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
          <IdiomList
            idioms={idioms}
            isLoading={loading}
            error={error}
            isMyPage={true}
            onIdiomClick={handleIdiomClick}
            title={`${user?.name || 'あなた'}の学習中イディオムリスト`}
            onRefresh={fetchUserIdioms}
          />
        ) : (
          <IdiomList
            idioms={allIdioms}
            isLoading={allIdiomsLoading}
            error={allIdiomsError}
            isMyPage={false}
            onIdiomClick={handleIdiomClick}
            onAddIdiom={addIdiomToUser}
            title="イディオム一覧"
            onRefresh={fetchAllIdioms}
          />
        )}
      </div>
      
      {showModal && <IdiomDetailModal />}
    </div>
  );
};

export default IdiomsManagement; 