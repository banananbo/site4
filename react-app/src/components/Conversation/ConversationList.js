import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchConversations = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiClient.conversations.getList();
        setConversations(data);
      } catch (e) {
        console.error('会話一覧の取得エラー:', e);
        setError('会話一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [authLoading, user]);

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
                    <button onClick={() => navigate(`/conversations/${conv.id}`)}>詳細</button>
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