package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

enum class SentenceDifficulty {
    EASY, MEDIUM, HARD
}

/**
 * 例文とその翻訳、関連するイディオムや文法情報を表すモデル
 */
data class Sentence(
    val id: String = UUID.randomUUID().toString(),
    val sentence: String,
    val translation: String,
    val source: String? = null,
    val difficulty: SentenceDifficulty = SentenceDifficulty.MEDIUM,
    val isAnalyzed: Boolean = false,
    val idioms: List<Idiom>? = null,
    val grammars: List<Grammar>? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 