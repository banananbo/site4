-- conversation_idiomsテーブルにインデックスを追加
CREATE INDEX idx_conversation_idioms_conversation_id ON conversation_idioms (conversation_id);
CREATE INDEX idx_conversation_idioms_idiom_id ON conversation_idioms (idiom_id); 