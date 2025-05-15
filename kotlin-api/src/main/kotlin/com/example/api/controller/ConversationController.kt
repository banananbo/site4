package com.example.api.controller

import com.example.api.model.Conversation
import com.example.api.model.Speaker
import com.example.api.model.ConversationLine
import com.example.api.model.WordRef
import com.example.api.model.SentenceRef
import com.example.api.model.IdiomRef
import com.example.api.repository.ConversationEntityRepository
import com.example.api.repository.ConversationLineEntityRepository
import com.example.api.repository.ConversationWordEntityRepository
import com.example.api.repository.ConversationSentenceEntityRepository
import com.example.api.repository.ConversationIdiomEntityRepository
import com.example.api.repository.SpeakerEntityRepository
import com.example.api.repository.WordRepository
import com.example.api.repository.SentenceRepository
import com.example.api.repository.IdiomRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
class ConversationController(
    private val conversationEntityRepository: ConversationEntityRepository,
    private val conversationLineEntityRepository: ConversationLineEntityRepository,
    private val conversationWordEntityRepository: ConversationWordEntityRepository,
    private val conversationSentenceEntityRepository: ConversationSentenceEntityRepository,
    private val conversationIdiomEntityRepository: ConversationIdiomEntityRepository,
    private val speakerEntityRepository: SpeakerEntityRepository,
    private val wordRepository: WordRepository,
    private val sentenceRepository: SentenceRepository,
    private val idiomRepository: IdiomRepository
) {
    @GetMapping("/api/conversations")
    fun getConversations(): List<ConversationSummary> {
        return conversationEntityRepository.findAll().map {
            ConversationSummary(
                id = it.id,
                title = it.title,
                description = it.description,
                level = it.level,
                createdAt = it.createdAt,
                updatedAt = it.updatedAt
            )
        }
    }

    @GetMapping("/api/conversations/{id}")
    fun getConversation(@PathVariable id: String): Conversation? {
        val entity = conversationEntityRepository.findById(id).orElse(null) ?: return null
        val speakers = speakerEntityRepository.findAll().filter { true } // 必要に応じて絞り込み
        val lines = conversationLineEntityRepository.findAll().filter { it.conversationId == id }
        val words = conversationWordEntityRepository.findAll().filter { it.conversationId == id }
        val sentences = conversationSentenceEntityRepository.findAll().filter { it.conversationId == id }
        val idioms = conversationIdiomEntityRepository.findAll().filter { it.conversationId == id }
        return Conversation(
            id = entity.id,
            title = entity.title,
            description = entity.description,
            level = entity.level,
            speakers = speakers.map {
                Speaker(
                    id = it.id,
                    name = it.name,
                    age = it.age,
                    gender = it.gender,
                    nationality = it.nationality,
                    setting = it.setting,
                    personality = it.personality,
                    image = it.image,
                    createdAt = it.createdAt
                )
            },
            lines = lines.map {
                ConversationLine(
                    id = it.id,
                    lineOrder = it.lineOrder,
                    speaker = it.speaker,
                    sentence = it.sentence,
                    translation = it.translation,
                    createdAt = it.createdAt,
                    updatedAt = it.updatedAt
                )
            },
            words = words.map {
                val word = wordRepository.findById(it.wordId).orElse(null)
                WordRef(it.wordId, word?.word ?: "")
            },
            sentences = sentences.map {
                val sentence = sentenceRepository.findById(it.sentenceId).orElse(null)
                SentenceRef(it.sentenceId, sentence?.sentence ?: "")
            },
            idioms = idioms.map {
                val idiom = idiomRepository.findById(it.idiomId).orElse(null)
                IdiomRef(it.idiomId, idiom?.idiom ?: "")
            },
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }
}

data class ConversationSummary(
    val id: String,
    val title: String,
    val description: String?,
    val level: Int,
    val createdAt: java.time.LocalDateTime,
    val updatedAt: java.time.LocalDateTime
) 