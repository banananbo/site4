package com.example.api.repository

import com.example.api.entity.ConversationWordEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ConversationWordEntityRepository : JpaRepository<ConversationWordEntity, String> 