package com.example.api.repository

import com.example.api.entity.ConversationLineEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversationLineEntityRepository : JpaRepository<ConversationLineEntity, String> 