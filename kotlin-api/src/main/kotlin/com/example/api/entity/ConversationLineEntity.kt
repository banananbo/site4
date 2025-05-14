package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "conversation_lines")
data class ConversationLineEntity(
    @Id
    val id: String,
    @Column(name = "conversation_id", nullable = false)
    val conversationId: String,
    @Column(name = "line_order", nullable = false)
    val lineOrder: Int,
    val speaker: String?,
    val sentence: String,
    val translation: String,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime
) 