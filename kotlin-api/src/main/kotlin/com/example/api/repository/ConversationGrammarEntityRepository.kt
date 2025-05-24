package com.example.api.repository

import com.example.api.entity.ConversationGrammarEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversationGrammarEntityRepository : JpaRepository<ConversationGrammarEntity, String> {
    fun findByConversationId(conversationId: String): List<ConversationGrammarEntity>
    fun findByGrammarId(grammarId: String): List<ConversationGrammarEntity>
} 