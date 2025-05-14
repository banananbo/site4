package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "conversation_sentences")
data class ConversationSentenceEntity(
    @Id
    val id: String,
    @Column(name = "conversation_id", nullable = false)
    val conversationId: String,
    @Column(name = "sentence_id", nullable = false)
    val sentenceId: String,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 