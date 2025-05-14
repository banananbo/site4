package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "conversation_words")
data class ConversationWordEntity(
    @Id
    val id: String,
    @Column(name = "conversation_id", nullable = false)
    val conversationId: String,
    @Column(name = "word_id", nullable = false)
    val wordId: String,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 