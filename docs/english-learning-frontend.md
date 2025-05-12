# 英語学習システム フロントエンド設計

## コンポーネント構成

```
react-app/
  ├── src/
  │   ├── components/
  │   │   ├── Layout/
  │   │   │   ├── Toolbar.js         # 上部ツールバー
  │   │   │   ├── Sidebar.js         # サイドバー
  │   │   │   └── Layout.js          # レイアウト統合コンポーネント
  │   │   ├── EnglishLearning/
  │   │   │   ├── WordForm.js        # 単語登録フォーム
  │   │   │   ├── WordList.js        # 単語一覧表示
  │   │   │   ├── WordCard.js        # 単語カード
  │   │   │   ├── WordDetail.js      # 単語詳細表示
  │   │   │   └── index.js           # エクスポート用
  │   │   └── common/
  │   │       ├── LoadingIndicator.js # ローディング表示
  │   │       ├── ErrorMessage.js     # エラーメッセージ
  │   │       └── StatusBadge.js      # ステータスバッジ
  │   ├── pages/
  │   │   ├── Dashboard.js           # ダッシュボード
  │   │   ├── WordsPage.js           # 単語管理ページ
  │   │   └── WordDetailPage.js      # 単語詳細ページ
  │   ├── contexts/
  │   │   ├── AuthContext.js         # 認証コンテキスト
  │   │   └── WordContext.js         # 単語管理コンテキスト
  │   ├── api/
  │   │   └── wordApi.js             # 単語関連API呼び出し
  │   └── utils/
  │       └── statusUtils.js         # ステータス関連ユーティリティ
```

## 画面設計

### 1. 単語登録画面

単語登録フォームと登録した単語の一覧を表示します。

```
┌──────────────────────────────────────────────────────────┐
│ [ツールバー]                                              │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│          │  ┌─────────────────────────────────────────┐  │
│          │  │  英単語登録                              │  │
│          │  │                                         │  │
│  [サイド  │  │  ┌─────────────────────────┐ ┌────────┐ │  │
│   バー]   │  │  │ 単語を入力              │ │ 登録   │ │  │
│          │  │  └─────────────────────────┘ └────────┘ │  │
│          │  │                                         │  │
│          │  └─────────────────────────────────────────┘  │
│          │                                               │
│          │  ┌─────────────────────────────────────────┐  │
│          │  │  登録単語一覧                            │  │
│          │  │                                         │  │
│          │  │  ┌───────┬────────┬──────────┬────────┐ │  │
│          │  │  │ 単語  │ ステータス│ 翻訳    │ 操作   │ │  │
│          │  │  ├───────┼────────┼──────────┼────────┤ │  │
│          │  │  │ apple │ 完了    │ りんご   │ 詳細   │ │  │
│          │  │  ├───────┼────────┼──────────┼────────┤ │  │
│          │  │  │ book  │ 処理中  │ -        │ 詳細   │ │  │
│          │  │  ├───────┼────────┼──────────┼────────┤ │  │
│          │  │  │ car   │ 未処理  │ -        │ 詳細   │ │  │
│          │  │  └───────┴────────┴──────────┴────────┘ │  │
│          │  │                                         │  │
│          │  │  [ページネーション]                       │  │
│          │  │                                         │  │
│          │  └─────────────────────────────────────────┘  │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### 2. 単語詳細画面

登録された単語の詳細情報を表示します。

```
┌──────────────────────────────────────────────────────────┐
│ [ツールバー]                                              │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│          │  ┌─────────────────────────────────────────┐  │
│          │  │  単語詳細: [単語]                         │  │
│          │  │                                         │  │
│  [サイド  │  │  ステータス: [ステータス]                  │  │
│   バー]   │  │                                         │  │
│          │  │  登録日時: [yyyy-mm-dd hh:mm:ss]         │  │
│          │  │                                         │  │
│          │  │  ┌─────────────────────────────────────┐│  │
│          │  │  │ 翻訳: [翻訳]                        ││  │
│          │  │  │                                     ││  │
│          │  │  │ 品詞: [品詞]                        ││  │
│          │  │  │                                     ││  │
│          │  │  │ 例文:                               ││  │
│          │  │  │ [例文]                              ││  │
│          │  │  │                                     ││  │
│          │  │  └─────────────────────────────────────┘│  │
│          │  │                                         │  │
│          │  │  ┌────────┐                             │  │
│          │  │  │ 戻る   │                             │  │
│          │  │  └────────┘                             │  │
│          │  │                                         │  │
│          │  └─────────────────────────────────────────┘  │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

## コンポーネント詳細

### WordForm.js

```jsx
import React, { useState } from 'react';
import { useWordContext } from '../../contexts/WordContext';

const WordForm = () => {
  const [word, setWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addWord } = useWordContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setIsSubmitting(true);
    try {
      await addWord(word.trim());
      setWord('');
    } catch (error) {
      console.error('Error adding word:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>英単語登録</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="英単語を入力"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting || !word.trim()}>
            {isSubmitting ? '登録中...' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WordForm;
```

### WordList.js

```jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWordContext } from '../../contexts/WordContext';
import StatusBadge from '../common/StatusBadge';
import LoadingIndicator from '../common/LoadingIndicator';
import ErrorMessage from '../common/ErrorMessage';

const WordList = () => {
  const { words, loading, error, fetchWords } = useWordContext();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchWords({ page, limit });
  }, [fetchWords, page, limit]);

  if (loading && !words.length) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="card">
      <h2>登録単語一覧</h2>
      {words.length === 0 ? (
        <p>登録された単語はありません</p>
      ) : (
        <>
          <table className="word-table">
            <thead>
              <tr>
                <th>単語</th>
                <th>ステータス</th>
                <th>翻訳</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id}>
                  <td>{word.word}</td>
                  <td>
                    <StatusBadge status={word.status} />
                  </td>
                  <td>{word.translation || '-'}</td>
                  <td>
                    <Link to={`/words/${word.id}`}>詳細</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              前へ
            </button>
            <span>ページ {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={words.length < limit}
            >
              次へ
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WordList;
```

### WordContext.js

```jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { addNewWord, fetchWordsList, fetchWordDetails } from '../api/wordApi';

const WordContext = createContext();

export const WordProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalWords, setTotalWords] = useState(0);

  const fetchWords = useCallback(async ({ page = 1, limit = 10, status = null }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWordsList({ page, limit, status });
      setWords(response.words);
      setTotalWords(response.total);
    } catch (err) {
      setError('単語一覧の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWord = useCallback(async (word) => {
    setLoading(true);
    setError(null);
    try {
      const newWord = await addNewWord(word);
      setWords(prevWords => [newWord, ...prevWords]);
      return newWord;
    } catch (err) {
      setError('単語の登録に失敗しました');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    words,
    loading,
    error,
    totalWords,
    fetchWords,
    addWord,
  };

  return <WordContext.Provider value={value}>{children}</WordContext.Provider>;
};

export const useWordContext = () => {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWordContext must be used within a WordProvider');
  }
  return context;
};
```

## RESTful API インターフェース

```javascript
// src/api/wordApi.js

import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

export const addNewWord = async (word) => {
  const { token } = useAuth();
  
  const response = await fetch(`${API_URL}/api/words`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ word })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '単語の登録に失敗しました');
  }
  
  return await response.json();
};

export const fetchWordsList = async ({ page = 1, limit = 10, status = null }) => {
  const { token } = useAuth();
  
  let url = `${API_URL}/api/words?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '単語一覧の取得に失敗しました');
  }
  
  return await response.json();
};

export const fetchWordDetails = async (wordId) => {
  const { token } = useAuth();
  
  const response = await fetch(`${API_URL}/api/words/${wordId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '単語詳細の取得に失敗しました');
  }
  
  return await response.json();
};
``` 