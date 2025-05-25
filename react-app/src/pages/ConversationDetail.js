import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';

const ConversationDetail = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTranslations, setShowTranslations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiClient.conversations.getDetails(id);
        setConversation(data);
      } catch (e) {
        console.error('会話詳細の取得エラー:', e);
        setError('会話詳細の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, authLoading, user]);

  const handleCopyText = (text) => {
    // モダンブラウザのClipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('テキストをコピーしました');
        })
        .catch(err => {
          console.error('コピーに失敗しました:', err);
          fallbackCopyText(text);
        });
    } else {
      // フォールバックメソッド
      fallbackCopyText(text);
    }
  };

  // フォールバックとしてのコピー機能
  const fallbackCopyText = (text) => {
    try {
      // 一時的なテキストエリアを作成
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // テキストエリアをビューポートの外に配置
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      // テキストを選択してコピー
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      
      // テキストエリアを削除
      textArea.remove();
      
      console.log('テキストをコピーしました（フォールバック）');
    } catch (err) {
      console.error('コピーに失敗しました（フォールバック）:', err);
    }
  };

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

  // スピーカー紹介セクション
  const renderSpeakers = () => (
    <div className="speakers-section" style={{marginBottom: '32px'}}>
      <h3>登場人物</h3>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
        {conversation.speakers.map(speaker => (
          <div key={speaker.id} style={{
            flex: '1',
            minWidth: '250px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
              <div style={{marginRight: '12px'}}>
                {speaker.image ? (
                  <img src={speaker.image} alt={speaker.name} style={{width: '48px', height: '48px', borderRadius: '50%'}} />
                ) : (
                  <DefaultAvatar />
                )}
              </div>
              <div>
                <h4 style={{margin: '0', fontSize: '1.2em'}}>{speaker.name}</h4>
                <div style={{color: '#666', fontSize: '0.9em'}}>
                  {speaker.age}歳 • {speaker.nationality}
                </div>
              </div>
            </div>
            <div style={{fontSize: '0.9em', color: '#444'}}>
              <div>性格: {speaker.personality}</div>
              <div>設定: {speaker.setting}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
                  <div style={{display:'flex', flexDirection:'column', alignItems: isLeft ? 'flex-start' : 'flex-end', flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%'}}>
                      <div className="bubble" style={{
                        background: '#f5f5f5',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        fontSize: '1.1em',
                        maxWidth: '60vw',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        margin: isLeft ? '0 0 0 0' : '0 0 0 auto',
                        flex: 1
                      }}>{line.sentence || '-'}</div>
                      <button
                        onClick={() => handleCopyText(line.sentence)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.8em',
                          background: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#666'
                        }}
                      >
                        コピー
                      </button>
                    </div>
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

      {/* スピーカー紹介 */}
      {renderSpeakers()}

      {/* 会話内容 */}
      {renderMessages()}

      {/* 下部: 関連情報 */}
      <div style={{marginTop: '40px'}}>
        {/* 関連単語 */}
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

        {/* 関連イディオム */}
        {Array.isArray(conversation.idioms) && conversation.idioms.length > 0 && (
          <div style={{marginBottom:'24px'}}>
            <h3>関連イディオム</h3>
            <div style={{display:'flex', flexWrap:'wrap', gap:'12px'}}>
              {conversation.idioms.map((idiom, i) => (
                <div key={idiom.id || i} style={{
                  border:'1px solid #ddd',
                  borderRadius:'8px',
                  padding:'10px 16px',
                  background:'#f5f5f5',
                  minWidth:'120px'
                }}>
                  <div style={{fontWeight:'bold', fontSize:'1.05em'}}>{idiom.idiom}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 関連文法 */}
        {Array.isArray(conversation.grammars) && conversation.grammars.length > 0 && (
          <div style={{marginBottom:'24px'}}>
            <h3>関連文法</h3>
            <div style={{display:'flex', flexWrap:'wrap', gap:'12px'}}>
              {conversation.grammars.map((grammar, i) => (
                <div key={grammar.id || i} style={{
                  border:'1px solid #ddd',
                  borderRadius:'8px',
                  padding:'10px 16px',
                  background:'#f5f5f5',
                  minWidth:'120px'
                }}>
                  <div style={{fontWeight:'bold', fontSize:'1.05em'}}>{grammar.pattern}</div>
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