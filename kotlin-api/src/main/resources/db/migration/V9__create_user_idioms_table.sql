-- user_idioms（ユーザーとイディオムの学習状況の関連）
CREATE TABLE user_idioms (
  id VARCHAR(36) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  idiom_id VARCHAR(36) NOT NULL,
  learning_status ENUM('new','learning','mastered') DEFAULT 'new',
  is_favorite BOOLEAN DEFAULT false,
  last_reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (idiom_id) REFERENCES idioms(id) ON DELETE CASCADE
); 