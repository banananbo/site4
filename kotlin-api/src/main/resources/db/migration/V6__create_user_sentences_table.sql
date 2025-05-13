-- ユーザーとセンテンスの関連テーブル
CREATE TABLE user_sentences (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  sentence_id VARCHAR(36) NOT NULL,
  learning_status ENUM('new', 'learning', 'mastered') DEFAULT 'new',
  is_favorite BOOLEAN DEFAULT FALSE,
  last_reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE,
  UNIQUE INDEX (user_id, sentence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- インデックスを追加
CREATE INDEX idx_user_sentences_user_id ON user_sentences(user_id);
CREATE INDEX idx_user_sentences_sentence_id ON user_sentences(sentence_id);
CREATE INDEX idx_user_sentences_learning_status ON user_sentences(learning_status); 