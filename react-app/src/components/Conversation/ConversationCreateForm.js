import React, { useState } from 'react';

const ConversationCreateForm = () => {
  const [situation, setSituation] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/jobs/conversation-generation`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!situation.trim()) {
      setError('シチュエーションを入力してください');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ situation, level: level ? Number(level) : undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('会話生成ジョブを登録しました');
        setSituation('');
        setLevel('');
      } else {
        setError(data.error || data.message || '作成に失敗しました');
      }
    } catch (e) {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conversation-create-form card">
      <h2>会話作成</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder="シチュエーションを入力"
            disabled={loading}
          />
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            disabled={loading}
          >
            <option value="">レベル選択（任意）</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <button type="submit" disabled={loading || !situation.trim()}>
            {loading ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ConversationCreateForm; 