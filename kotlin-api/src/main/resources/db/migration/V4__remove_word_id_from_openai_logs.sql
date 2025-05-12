-- openai_logsテーブルからword_idカラムの外部キー制約を削除
ALTER TABLE openai_logs
DROP FOREIGN KEY openai_logs_ibfk_1;

-- word_idカラムを削除
ALTER TABLE openai_logs
DROP COLUMN word_id; 