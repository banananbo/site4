import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/conversations`;

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getAccessToken, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    if (authLoading) return; // 初期化中は何もしない

    const fetchConversations = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetch(apiUrl, { headers });
        if (!res.ok) throw new Error('取得に失敗しました');
        const data = await res.json();
        setConversations(data);
      } catch (e) {
        setError('会話一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [getAccessToken, authLoading]);

  return (
    <div className="conversation-list card">
      <h2>会話一覧</h2>
      {loading && <div>読み込み中...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && (
        <table className="conversation-table">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>レベル</th>
              <th>詳細</th>
            </tr>
          </thead>
          <tbody>
            {conversations.length === 0 ? (
              <tr><td colSpan={3}>会話がありません</td></tr>
            ) : (
              conversations.map(conv => (
                <tr key={conv.id}>
                  <td>{conv.title || '-'}</td>
                  <td>{conv.level || '-'}</td>
                  <td>
                    <button onClick={() => alert('詳細画面へ（未実装）')}>詳細</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ConversationList; 