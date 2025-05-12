-- 単語テーブル
CREATE TABLE words (
  id VARCHAR(36) PRIMARY KEY,
  word VARCHAR(255) NOT NULL UNIQUE,
  meaning VARCHAR(255) NOT NULL,
  part_of_speech VARCHAR(50) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'error') DEFAULT 'pending',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ユーザーと単語の関連テーブル
CREATE TABLE user_words (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  word_id VARCHAR(36) NOT NULL,
  learning_status ENUM('new', 'learning', 'mastered') DEFAULT 'new',
  is_favorite BOOLEAN DEFAULT FALSE,
  last_reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  UNIQUE INDEX (user_id, word_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 例文テーブル
CREATE TABLE sentences (
  id VARCHAR(36) PRIMARY KEY,
  sentence TEXT NOT NULL,
  translation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 単語と例文の関連テーブル
CREATE TABLE word_sentences (
  id VARCHAR(36) PRIMARY KEY,
  word_id VARCHAR(36) NOT NULL,
  sentence_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE,
  UNIQUE INDEX (word_id, sentence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 処理ジョブテーブル
CREATE TABLE processing_jobs (
  id VARCHAR(36) PRIMARY KEY,
  job_type VARCHAR(50) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'error') DEFAULT 'pending',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (job_type, status),
  INDEX (next_retry_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OpenAI APIログテーブル
CREATE TABLE openai_logs (
  id VARCHAR(36) PRIMARY KEY,
  word_id VARCHAR(36) NOT NULL,
  request_prompt TEXT NOT NULL,
  response_content TEXT NOT NULL,
  tokens_used INT,
  request_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- インデックス
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_created_by ON words(created_by);
CREATE INDEX idx_user_words_user_id ON user_words(user_id);
CREATE INDEX idx_user_words_word_id ON user_words(word_id);
CREATE INDEX idx_word_sentences_word_id ON word_sentences(word_id);
CREATE INDEX idx_word_sentences_sentence_id ON word_sentences(sentence_id); 