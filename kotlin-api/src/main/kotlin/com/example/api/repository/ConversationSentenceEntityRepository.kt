package com.example.api.repository

import com.example.api.entity.ConversationSentenceEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversationSentenceEntityRepository : JpaRepository<ConversationSentenceEntity, String> 