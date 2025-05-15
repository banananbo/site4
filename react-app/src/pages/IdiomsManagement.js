import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import TextInputForm from '../components/TextInputForm';
import LearningStatusSelector from '../components/LearningStatusSelector';
import './WordManagement.css'; // 同じスタイルを使用

const IdiomsManagement = () => {
  const [idioms, setIdioms] = useState([]);
  const [allIdioms, setAllIdioms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allIdiomsLoading, setAllIdiomsLoading] = useState(true);
  const [error, setError] = useState('');
  const [allIdiomsError, setAllIdiomsError] = useState('');
  const [activeTab, setActiveTab] = useState('mypage'); // デフォルトは「マイページ」タブ
  const [selectedIdiom, setSelectedIdiom] = useState(null); // 選択されたイディオム
  const [selectedIdiomDetails, setSelectedIdiomDetails] = useState(null); // 選択されたイディオムの詳細情報
  const [showModal, setShowModal] = useState(false); // モーダル表示の状態
  const [detailsLoading, setDetailsLoading] = useState(false); // 詳細情報の読み込み状態
  
  const { user, getAccessToken } = useContext(AuthContext);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  // ユーザーのイディオム一覧を取得
  const fetchUserIdioms = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms/learning`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('ユーザーイディオムリスト取得リクエスト');
      const response = await axios.get(apiUrl, { headers });
      console.log('API response:', response.data);
      
      // レスポンスデータの形式をチェック
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // 新しいレスポンス形式の処理
        const transformedIdioms = response.data.content.map(item => {
          if (item.idiom && item.userIdiom) {
            // 新しいレスポンス形式: { idiom: {...}, userIdiom: {...} }
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
            // 古いレスポンス形式または未対応の形式
            return item;
          }
        });
        setIdioms(transformedIdioms);
      } else if (response.data && Array.isArray(response.data)) {
        setIdioms(response.data);
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
    try {
      setAllIdiomsLoading(true);
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('全イディオムリスト取得リクエスト');
      const response = await axios.get(apiUrl, { headers });
      console.log('API response (all idioms):', response.data);
      
      // レスポンスデータの形式をチェック
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setAllIdioms(response.data.content);
      } else if (response.data && Array.isArray(response.data)) {
        setAllIdioms(response.data);
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
      const token = await getAccessToken();
      
      // APIエンドポイントのURL
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms/${idiomId}`;
      
      // 認証トークンをヘッダーに設定
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      console.log('イディオム詳細取得リクエスト:', { idiomId });
      const response = await axios.get(apiUrl, { headers });
      console.log('API response (idiom details):', response.data);
      
      // レスポンスデータをステートに設定
      setSelectedIdiomDetails(response.data);
      
      return response.data;
    } catch (err) {
      console.error('イディオム詳細取得エラー:', err);
      // エラーが発生した場合は、基本情報のみの表示用にnullを設定せず、選択されたイディオムをそのまま使用
      setSelectedIdiomDetails(selectedIdiom);
      return selectedIdiom;
    } finally {
      setDetailsLoading(false);
    }
  };

  // イディオムをユーザーに関連付ける（学習リストに追加）
  const addIdiomToUser = async (idiomId) => {
    try {
      const token = await getAccessToken();
      
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms/${idiomId}/learn`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(apiUrl, {}, { headers });
      console.log('イディオム追加レスポンス:', response.data);
      
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
      const token = await getAccessToken();
      
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms/${idiomId}/status`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '学習状態の更新に失敗しました');
      }
      
      const updatedIdiom = await response.json();
      
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
  const updateFavoriteStatus = async (idiomId, isFavorite) => {
    if (!user) return;
    
    try {
      const token = await getAccessToken();
      
      const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms/${idiomId}/favorite`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFavorite })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'お気に入り状態の更新に失敗しました');
      }
      
      const updatedIdiom = await response.json();
      
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
                          onChange={(e) => updateFavoriteStatus(selectedIdiom.id, e.target.checked)}
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

  // イディオム一覧テーブルのレンダリング
  const renderIdiomTable = (idiomList, isMyPage) => {
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
          {idiomList.map(idiom => (
            <tr key={idiom.id}>
              <td className="word-cell" onClick={() => handleIdiomClick(idiom)}>
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
                    onClick={() => addIdiomToUser(idiom.id)}
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
          <>
            <h2>{user?.name || 'あなた'}の学習中イディオムリスト</h2>
            
            {loading ? (
              <div className="loading">読み込み中...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : !idioms || idioms.length === 0 ? (
              <div className="empty-list">学習中のイディオムはありません</div>
            ) : (
              <div className="word-list">
                {renderIdiomTable(idioms, true)}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>イディオム一覧</h2>
            
            {allIdiomsLoading ? (
              <div className="loading">読み込み中...</div>
            ) : allIdiomsError ? (
              <div className="error-message">{allIdiomsError}</div>
            ) : !allIdioms || allIdioms.length === 0 ? (
              <div className="empty-list">イディオムデータがありません</div>
            ) : (
              <div className="word-list">
                {renderIdiomTable(allIdioms, false)}
              </div>
            )}
          </>
        )}
      </div>
      
      {showModal && <IdiomDetailModal />}
    </div>
  );
};

export default IdiomsManagement; 