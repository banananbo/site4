import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/conversations`;

const ConversationDetail = () => {
  const { id } = useParams();
  const { getAccessToken, loading: authLoading } = useContext(AuthContext);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTranslations, setShowTranslations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetch(`${apiUrl}/${id}`, { headers });
        if (!res.ok) throw new Error('取得に失敗しました');
        const data = await res.json();
        setConversation(data);
      } catch (e) {
        setError('会話詳細の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, getAccessToken, authLoading]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!conversation) return <div>データがありません</div>;

  // デフォルトアイコン（SVG）
  const DefaultAvatar = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#f5f5f5" />
      <circle cx="24" cy="20" r="10" fill="#bbb" />
      <ellipse cx="24" cy="38" rx="14" ry="8" fill="#bbb" />
    </svg>
  );

  // speakerIdから話者名を取得
  const getSpeakerName = (speakerId) => {
    if (!Array.isArray(conversation.speakers)) return speakerId;
    const found = conversation.speakers.find(s => s.id === speakerId);
    return found ? found.name : speakerId;
  };

  const handleToggleTranslation = (idx) => {
    setShowTranslations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // 吹き出しUI（lines対応）
  const renderMessages = () => {
    if (Array.isArray(conversation.lines) && conversation.lines.length > 0) {
      return (
        <div className="conversation-messages">
          <h3>会話</h3>
          {conversation.lines
            .sort((a, b) => (a.lineOrder || 0) - (b.lineOrder || 0))
            .map((line, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div
                  key={line.id || idx}
                  className={`bubble-row ${isLeft ? 'left' : 'right'}`}
                  style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'flex-end', marginBottom: 32 }}
                >
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <div className="avatar" style={{ width:48, height:48, margin: '0 12px' }}><DefaultAvatar /></div>
                    <div className="speaker-name" style={{ fontStyle:'italic', fontSize:'0.95em', color:'#888', marginTop:4 }}>{getSpeakerName(line.speaker)}</div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems: isLeft ? 'flex-start' : 'flex-end'}}>
                    <div className="bubble" style={{
                      background: '#f5f5f5',
                      borderRadius: '16px',
                      padding: '12px 18px',
                      fontSize: '1.1em',
                      maxWidth: '60vw',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      margin: isLeft ? '0 0 0 0' : '0 0 0 auto',
                    }}>{line.sentence || '-'}</div>
                    <button
                      style={{ fontSize: '0.85em', marginTop: 4, padding: '2px 10px', borderRadius: '8px', border: '1px solid #bbb', background: '#fff', color: '#666', cursor: 'pointer' }}
                      onClick={() => handleToggleTranslation(idx)}
                    >
                      {showTranslations[idx] ? '非表示' : '翻訳'}
                    </button>
                    {showTranslations[idx] && line.translation && (
                      <div style={{ fontSize: '0.95em', color: '#444', marginTop: 2, background:'#f0f0f0', borderRadius:'6px', padding:'6px 10px' }}>{line.translation}</div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      );
    }
    if (conversation.content) {
      return (
        <div className="conversation-content">
          <h3>内容</h3>
          <div style={{whiteSpace:'pre-line', background:'#f5f5f5', padding:'12px', borderRadius:'8px'}}>{conversation.content}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="conversation-detail card">
      {/* 戻るボタン */}
      <button
        style={{ marginBottom: 20, padding: '6px 18px', borderRadius: '8px', border: '1px solid #bbb', background: '#fff', color: '#333', cursor: 'pointer', fontSize: '1em' }}
        onClick={() => navigate('/conversation')}
      >
        会話一覧へ戻る
      </button>
      {/* 上部: タイトルと説明 */}
      <div style={{marginBottom: '32px'}}>
        <h2 style={{marginBottom: '8px'}}>{conversation.title || 'タイトルなし'}</h2>
        {conversation.description && <div style={{color:'#555', marginBottom:'8px'}}>{conversation.description}</div>}
      </div>
      {renderMessages()}
      {/* 下部: 関連Wordとセンテンス */}
      <div style={{marginTop: '40px'}}>
        {Array.isArray(conversation.words) && conversation.words.length > 0 && (
          <div style={{marginBottom:'24px'}}>
            <h3>関連単語</h3>
            <div style={{display:'flex', flexWrap:'wrap', gap:'12px'}}>
              {conversation.words.map((w, i) => (
                <div key={w.id || w.word || i} style={{border:'1px solid #ddd', borderRadius:'8px', padding:'10px 16px', background:'#fafafa', minWidth:'100px'}}>
                  <div style={{fontWeight:'bold', fontSize:'1.1em'}}>{w.word}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {Array.isArray(conversation.sentences) && conversation.sentences.length > 0 && (
          <div>
            <h3>関連センテンス</h3>
            <div style={{display:'flex', flexWrap:'wrap', gap:'12px'}}>
              {conversation.sentences.map((s, i) => (
                <div key={s.id || s.sentence || i} style={{border:'1px solid #ddd', borderRadius:'8px', padding:'10px 16px', background:'#f5f5f5', minWidth:'120px'}}>
                  <div style={{fontWeight:'bold', fontSize:'1.05em', marginBottom:'4px'}}>{s.sentence}</div>
                  {s.translation && <div style={{color:'#888', fontSize:'0.95em'}}>{s.translation}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationDetail; 