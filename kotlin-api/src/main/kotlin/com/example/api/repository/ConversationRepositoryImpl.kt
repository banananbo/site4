package com.example.api.repository

import com.example.api.model.Conversation
import com.example.api.entity.ConversationEntity
import com.example.api.entity.ConversationLineEntity
import com.example.api.entity.ConversationWordEntity
import com.example.api.entity.ConversationSentenceEntity
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Repository
class ConversationRepositoryImpl(
    private val conversationEntityRepository: ConversationEntityRepository,
    private val conversationLineEntityRepository: ConversationLineEntityRepository,
    private val conversationWordEntityRepository: ConversationWordEntityRepository,
    private val conversationSentenceEntityRepository: ConversationSentenceEntityRepository
) : ConversationRepository {

    @Transactional
    override fun saveAggregate(conversation: Conversation) {
        // Conversation本体
        val conversationEntity = ConversationEntity(
            id = conversation.id,
            title = conversation.title,
            description = conversation.description,
            level = conversation.level,
            createdAt = conversation.createdAt,
            updatedAt = conversation.updatedAt
        )
        conversationEntityRepository.save(conversationEntity)

        // セリフ
        val lineEntities = conversation.lines.map { line ->
            ConversationLineEntity(
                id = line.id,
                conversationId = conversation.id,
                lineOrder = line.lineOrder,
                speaker = line.speaker,
                sentence = line.sentence,
                translation = line.translation,
                createdAt = line.createdAt,
                updatedAt = line.updatedAt
            )
        }
        conversationLineEntityRepository.saveAll(lineEntities)

        // 会話全体で使われるWord
        val wordEntities = conversation.words.map { wordRef ->
            ConversationWordEntity(
                id = UUID.randomUUID().toString(),
                conversationId = conversation.id,
                wordId = wordRef.id,
                createdAt = conversation.createdAt
            )
        }
        conversationWordEntityRepository.saveAll(wordEntities)

        // 会話全体で使われるSentence
        val sentenceEntities = conversation.sentences.map { sentenceRef ->
            ConversationSentenceEntity(
                id = UUID.randomUUID().toString(),
                conversationId = conversation.id,
                sentenceId = sentenceRef.id,
                createdAt = conversation.createdAt
            )
        }
        conversationSentenceEntityRepository.saveAll(sentenceEntities)
    }
} 