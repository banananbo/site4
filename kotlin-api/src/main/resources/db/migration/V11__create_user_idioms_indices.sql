-- user_idiomsテーブルの検索を高速化するためのインデックス
CREATE INDEX idx_user_idioms_user_id ON user_idioms (user_id);
CREATE INDEX idx_user_idioms_idiom_id ON user_idioms (idiom_id);
CREATE INDEX idx_user_idioms_learning_status ON user_idioms (learning_status);
CREATE UNIQUE INDEX idx_user_idioms_user_id_idiom_id ON user_idioms (user_id, idiom_id); 