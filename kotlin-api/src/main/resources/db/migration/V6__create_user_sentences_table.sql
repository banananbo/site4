-- ユーザーとセンテンスの関連付けテーブル
CREATE TABLE user_sentences (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  sentence_id VARCHAR(36) NOT NULL,
  learning_status ENUM('new', 'learning', 'mastered') NOT NULL DEFAULT 'new',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  last_reviewed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (user_id, sentence_id),
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 