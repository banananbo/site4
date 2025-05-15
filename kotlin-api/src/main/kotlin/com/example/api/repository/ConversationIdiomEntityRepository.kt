package com.example.api.repository

import com.example.api.entity.ConversationIdiomEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversationIdiomEntityRepository : JpaRepository<ConversationIdiomEntity, String> {
    fun findByConversationId(conversationId: String): List<ConversationIdiomEntity>
    fun findByIdiomId(idiomId: String): List<ConversationIdiomEntity>
} 