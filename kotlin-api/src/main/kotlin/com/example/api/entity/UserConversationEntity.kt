package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "user_conversations")
data class UserConversationEntity(
    @Id
    val id: String,
    @Column(name = "user_id", nullable = false)
    val userId: Long,
    @Column(name = "conversation_id", nullable = false)
    val conversationId: String,
    @Column(name = "status", nullable = false)
    val status: String,
    @Column(name = "last_accessed_at")
    val lastAccessedAt: LocalDateTime?,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 