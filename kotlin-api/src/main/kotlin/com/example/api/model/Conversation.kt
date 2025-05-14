package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

// 会話集約ルート

data class Conversation(
    val id: String,
    val title: String,
    val description: String?,
    val level: Int,
    val lines: List<ConversationLine>,
    val words: List<WordRef>,        // 会話全体で使われる単語リスト
    val sentences: List<SentenceRef>,// 会話全体で使われる例文リスト
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun fromGenerated(
            id: String,
            title: String?,
            level: Int?,
            conversationPairs: List<Pair<String, String>>,
            wordEntities: List<com.example.api.entity.WordEntity>,
            sentenceEntities: List<com.example.api.entity.SentenceEntity>,
            now: LocalDateTime
        ): Conversation {
            val wordRefs = wordEntities.map { WordRef(it.id, it.word) }
            val sentenceRefs = sentenceEntities.map { SentenceRef(it.id, it.sentence) }
            val lines = conversationPairs.mapIndexed { idx, (english, japanese) ->
                ConversationLine(
                    id = UUID.randomUUID().toString(),
                    lineOrder = idx + 1,
                    speaker = null,
                    sentence = english,
                    translation = japanese,
                    createdAt = now,
                    updatedAt = now
                )
            }
            return Conversation(
                id = id,
                title = title ?: "Generated Conversation",
                description = null,
                level = level ?: 1,
                lines = lines,
                words = wordRefs,
                sentences = sentenceRefs,
                createdAt = now,
                updatedAt = now
            )
        }
    }
}

data class ConversationLine(
    val id: String,
    var lineOrder: Int,
    val speaker: String?,
    var sentence: String,
    var translation: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class WordRef(
    val id: String,
    val word: String
)

data class SentenceRef(
    val id: String,
    val sentence: String
)

data class UserConversationProgress(
    val userId: String,
    val conversationId: String,
    var status: ConversationLearningStatus,
    var lastAccessedAt: LocalDateTime?,
    val createdAt: LocalDateTime
)

enum class ConversationLearningStatus { NEW, LEARNING, COMPLETED } 