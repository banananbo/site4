package com.example.api.repository

import com.example.api.entity.ConversationEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversationEntityRepository : JpaRepository<ConversationEntity, String> 