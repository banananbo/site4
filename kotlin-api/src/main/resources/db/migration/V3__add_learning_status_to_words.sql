-- wordsテーブルにlearning_statusカラムを追加
ALTER TABLE words
ADD COLUMN learning_status ENUM('new', 'learning', 'mastered') NOT NULL DEFAULT 'new'
AFTER status;

-- インデックスを作成
CREATE INDEX idx_words_learning_status ON words(learning_status); 