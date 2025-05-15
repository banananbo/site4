-- conversation_idioms（会話とIdiomの関連）
CREATE TABLE conversation_idioms (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  idiom_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (idiom_id) REFERENCES idioms(id) ON DELETE CASCADE
); 