package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

// 会話集約ルート

data class Conversation(
    val id: String,
    val title: String,
    val description: String?,
    val level: Int,
    val speakers: List<Speaker>,
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
            generated: com.example.api.service.OpenAIService.GeneratedConversation?,
            wordEntities: List<com.example.api.entity.WordEntity>,
            sentenceEntities: List<com.example.api.entity.SentenceEntity>,
            now: LocalDateTime
        ): Conversation {
            val wordRefs = wordEntities.map { WordRef(it.id, it.word) }
            val sentenceRefs = sentenceEntities.map { SentenceRef(it.id, it.sentence) }
            // 仮ID→新IDのマッピングを作成
            val speakerIdMap = mutableMapOf<String, String>()
            val speakers = generated?.speakers?.map { genSpeaker ->
                val newId = UUID.randomUUID().toString()
                speakerIdMap[genSpeaker.id] = newId
                Speaker(
                    id = newId,
                    name = genSpeaker.name,
                    age = genSpeaker.age,
                    gender = genSpeaker.gender,
                    nationality = genSpeaker.nationality,
                    setting = genSpeaker.setting,
                    personality = genSpeaker.personality,
                    image = genSpeaker.image,
                    createdAt = now
                )
            } ?: emptyList()
            val lines = generated?.lines?.mapIndexed { idx, line ->
                ConversationLine(
                    id = UUID.randomUUID().toString(),
                    lineOrder = idx + 1,
                    speaker = line.speaker?.let { speakerIdMap[it] },
                    sentence = line.english,
                    translation = line.japanese,
                    createdAt = now,
                    updatedAt = now
                )
            } ?: emptyList()
            return Conversation(
                id = id,
                title = title ?: "Generated Conversation",
                description = generated?.description,
                level = level ?: 1,
                speakers = speakers,
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

data class Speaker(
    val id: String,
    val name: String,
    val age: Int?,
    val gender: String?,
    val nationality: String?,
    val setting: String?,
    val personality: String?,
    val image: String?,
    val createdAt: LocalDateTime
) 