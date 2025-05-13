-- イディオムテーブル
CREATE TABLE idioms (
  id VARCHAR(36) PRIMARY KEY,
  idiom VARCHAR(255) NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (idiom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文法テーブル
CREATE TABLE grammars (
  id VARCHAR(36) PRIMARY KEY,
  pattern VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (pattern)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- センテンスとイディオムの関連テーブル
CREATE TABLE sentence_idioms (
  id VARCHAR(36) PRIMARY KEY,
  sentence_id VARCHAR(36) NOT NULL,
  idiom_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE,
  FOREIGN KEY (idiom_id) REFERENCES idioms(id) ON DELETE CASCADE,
  UNIQUE INDEX (sentence_id, idiom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- センテンスと文法の関連テーブル
CREATE TABLE sentence_grammars (
  id VARCHAR(36) PRIMARY KEY,
  sentence_id VARCHAR(36) NOT NULL,
  grammar_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE,
  FOREIGN KEY (grammar_id) REFERENCES grammars(id) ON DELETE CASCADE,
  UNIQUE INDEX (sentence_id, grammar_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sentencesテーブルに追加カラム
ALTER TABLE sentences
ADD COLUMN source VARCHAR(255),
ADD COLUMN difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
ADD COLUMN is_analyzed BOOLEAN DEFAULT FALSE; 