import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const ConversationCreateForm = () => {
  const { getAccessToken } = useContext(AuthContext);
  const [situation, setSituation] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [words, setWords] = useState([]);
  const [idioms, setIdioms] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [grammars, setGrammars] = useState([]);
  const [selectedWordIds, setSelectedWordIds] = useState([]);
  const [selectedIdiomIds, setSelectedIdiomIds] = useState([]);
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState([]);
  const [selectedGrammarIds, setSelectedGrammarIds] = useState([]);

  const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/jobs/conversation-generation`;
  const wordsApiUrl = `${process.env.REACT_APP_API_URL || ''}/api/words/user`;
  const idiomsApiUrl = `${process.env.REACT_APP_API_URL || ''}/api/idioms/learning`;
  const speakersApiUrl = `${process.env.REACT_APP_API_URL || ''}/api/speakers`;
  const grammarsApiUrl = `${process.env.REACT_APP_API_URL || ''}/api/grammars`;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await getAccessToken();
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [wordsRes, idiomsRes, speakersRes, grammarsRes] = await Promise.all([
          fetch(wordsApiUrl, { headers }),
          fetch(idiomsApiUrl, { headers }),
          fetch(speakersApiUrl, { headers }),
          fetch(grammarsApiUrl, { headers })
        ]);

        if (wordsRes.ok) {
          const wordsData = await wordsRes.json();
          console.log('Words API Response:', wordsData);
          setWords(wordsData);
        }

        if (idiomsRes.ok) {
          const idiomsData = await idiomsRes.json();
          console.log('API response:', idiomsData);
          
          if (idiomsData && idiomsData.content && Array.isArray(idiomsData.content)) {
            const transformedIdioms = idiomsData.content.map(item => {
              if (item.idiom && item.userIdiom) {
                return {
                  ...item.idiom,
                  id: item.idiom.id,
                  idiom: item.idiom.idiom
                };
              } else {
                return item;
              }
            });
            setIdioms(transformedIdioms);
          } else if (idiomsData && Array.isArray(idiomsData)) {
            setIdioms(idiomsData);
          } else {
            setIdioms([]);
          }
        }

        if (speakersRes.ok) {
          const speakersData = await speakersRes.json();
          if (speakersData && speakersData.content) {
            setSpeakers(speakersData.content);
          } else if (Array.isArray(speakersData)) {
            setSpeakers(speakersData);
          }
        }

        if (grammarsRes.ok) {
          const grammarsData = await grammarsRes.json();
          if (grammarsData && grammarsData.content) {
            setGrammars(grammarsData.content);
          } else if (Array.isArray(grammarsData)) {
            setGrammars(grammarsData);
          }
        }
      } catch (e) {
        console.error('データ取得エラー:', e);
        setError('アイテムの取得に失敗しました');
      }
    };

    fetchItems();
  }, [getAccessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!situation.trim()) {
      setError('シチュエーションを入力してください');
      return;
    }

    const requestBody = {
      situation: situation.trim(),
      level: level ? parseInt(level, 10) : 1,
      wordIds: selectedWordIds,
      idiomIds: selectedIdiomIds,
      speakerIds: selectedSpeakerIds,
      grammarIds: selectedGrammarIds
    };

    console.log('リクエストボディ:', requestBody);

    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('APIエラーレスポンス:', errorData);
        throw new Error(errorData.message || 'APIエラーが発生しました');
      }

      const data = await res.json();
      console.log('APIレスポンス:', data);

      setMessage('会話生成ジョブを登録しました');
      setSituation('');
      setLevel('');
      setSelectedWordIds([]);
      setSelectedIdiomIds([]);
      setSelectedSpeakerIds([]);
      setSelectedGrammarIds([]);
    } catch (e) {
      console.error('送信エラー:', e);
      setError(e.message || '通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelect = (wordId) => {
    setSelectedWordIds(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleIdiomSelect = (idiomId) => {
    setSelectedIdiomIds(prev => 
      prev.includes(idiomId)
        ? prev.filter(id => id !== idiomId)
        : [...prev, idiomId]
    );
  };

  const handleSpeakerSelect = (speakerId) => {
    setSelectedSpeakerIds(prev => 
      prev.includes(speakerId) ? prev.filter(id => id !== speakerId) : [...prev, speakerId]
    );
  };

  const handleGrammarSelect = (grammarId) => {
    setSelectedGrammarIds(prev => 
      prev.includes(grammarId) ? prev.filter(id => id !== grammarId) : [...prev, grammarId]
    );
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
        </div>

        <div className="form-group">
          <h3>使用する単語を選択（任意）</h3>
          <div className="selection-container">
            {words.length > 0 ? (
              <div className="selection-grid">
                {words.map(word => (
                  <div
                    key={`word-${word.id}`}
                    className={`selection-item ${selectedWordIds.includes(word.id) ? 'selected' : ''}`}
                    onClick={() => handleWordSelect(word.id)}
                  >
                    {word.word}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">単語が見つかりません</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <h3>使用するイディオムを選択（任意）</h3>
          <div className="selection-container">
            {idioms.length > 0 ? (
              <div className="selection-grid">
                {idioms.map(idiom => (
                  <div
                    key={`idiom-${idiom.id}`}
                    className={`selection-item ${selectedIdiomIds.includes(idiom.id) ? 'selected' : ''}`}
                    onClick={() => handleIdiomSelect(idiom.id)}
                  >
                    {idiom.idiom}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">イディオムが見つかりません</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <h3>使用する文法を選択（任意）</h3>
          <div className="selection-container">
            {grammars.length > 0 ? (
              <div className="selection-grid">
                {grammars.map(grammar => (
                  <div
                    key={`grammar-${grammar.id}`}
                    className={`selection-item ${selectedGrammarIds.includes(grammar.id) ? 'selected' : ''}`}
                    onClick={() => handleGrammarSelect(grammar.id)}
                    title={grammar.explanation}
                  >
                    {grammar.pattern}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">文法が見つかりません</p>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <h3>スピーカーを選択（任意）</h3>
          <div className="selection-container">
            {speakers.length > 0 ? (
              <div className="selection-grid">
                {speakers.map(speaker => (
                  <div
                    key={`speaker-${speaker.id}`}
                    className={`selection-item ${selectedSpeakerIds.includes(speaker.id) ? 'selected' : ''}`}
                    onClick={() => handleSpeakerSelect(speaker.id)}
                    title={`性格: ${speaker.personality || '未設定'}
年齢: ${speaker.age || '未設定'}
性別: ${speaker.gender || '未設定'}
国籍: ${speaker.nationality || '未設定'}
設定: ${speaker.setting || '未設定'}`}
                  >
                    <div className="speaker-name">{speaker.name}</div>
                    <div className="speaker-details">
                      <div className="speaker-personality">{speaker.personality}</div>
                      <div className="speaker-attributes">
                        <small>
                          {[
                            speaker.age && `${speaker.age}歳`,
                            speaker.gender,
                            speaker.nationality,
                            speaker.setting
                          ].filter(Boolean).join(' | ')}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">スピーカーが見つかりません</p>
            )}
          </div>
        </div>


        <div className="form-group">
          <button type="submit" disabled={loading || !situation.trim()}>
            {loading ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .selection-container {
          margin: 10px 0;
          max-height: 300px;
          overflow-y: auto;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
        }

        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          padding: 5px;
        }

        .selection-item {
          padding: 8px 12px;
          background: #f5f5f5;
          border: 2px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          font-size: 14px;
          overflow: hidden;
        }

        .selection-item:hover {
          background: #e9e9e9;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .selection-item.selected {
          background: #e3f2fd;
          border-color: #2196f3;
          color: #1976d2;
          font-weight: 500;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        h3 {
          font-size: 16px;
          margin-bottom: 10px;
        }

        .no-items {
          color: #666;
          font-style: italic;
          margin: 10px 0;
          text-align: center;
        }

        input[type="text"] {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }

        button {
          padding: 8px 16px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        button:hover:not(:disabled) {
          background-color: #357abd;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .success-message {
          color: #4caf50;
          margin-top: 10px;
          text-align: center;
        }

        .error-message {
          color: #f44336;
          margin-top: 10px;
          text-align: center;
        }

        .speaker-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .speaker-details {
          font-size: 12px;
          color: #666;
        }

        .speaker-personality {
          margin: 2px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .speaker-attributes {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .speaker-details small {
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default ConversationCreateForm; 