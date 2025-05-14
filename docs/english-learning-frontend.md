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

## 会話タブ UI設計

### 概要
- 新しいタブ「会話」を追加
- 上部：会話作成フォーム（シチュエーション・レベル入力→/api/jobs/conversation-generation呼び出し）
- 下部：ユーザーと関連する会話一覧（進捗・タイトル・詳細リンク等）

### 画面ワイヤーフレーム案

```
┌──────────────────────────────────────────────┐
│ [タブ] 単語 | センテンス | 会話                │
├──────────────────────────────────────────────┤
│ [会話作成フォーム]                           │
│ ┌─────────────┬─────────────┐               │
│ │ シチュエーション入力 │ レベル選択      │ [作成] │
│ └─────────────┴─────────────┘               │
│ [作成結果メッセージ/エラー表示]              │
├──────────────────────────────────────────────┤
│ [ユーザーの会話一覧]                         │
│ ┌───────────────┬──────┬──────┬──────┐ │
│ │ タイトル         │ レベル │ 進捗 │ 詳細 │ │
│ ├───────────────┼──────┼──────┼──────┤ │
│ │ At the Restaurant │ 2    │ 学習中 │ [詳細]│ │
│ │ ...               │ ...  │ ...  │ ...  │ │
│ └───────────────┴──────┴──────┴──────┘ │
└──────────────────────────────────────────────┘
```

### 会話作成フォーム
- シチュエーション（テキスト入力, 必須）
- レベル（セレクトボックス, 任意）
- [作成]ボタン押下で `/api/jobs/conversation-generation` にPOST
- 成功時はメッセージ表示、失敗時はエラー表示

### 会話一覧
- ユーザーと関連する会話（user_conversations）を一覧表示
- タイトル、レベル、進捗（new/learning/completed）、詳細ボタン
- 詳細ボタンで会話詳細画面へ遷移

### 実装コンポーネント例
- `ConversationTab.js`（タブ全体）
- `ConversationCreateForm.js`（会話作成フォーム）
- `ConversationList.js`（会話一覧）
- `ConversationDetail.js`（詳細画面）

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