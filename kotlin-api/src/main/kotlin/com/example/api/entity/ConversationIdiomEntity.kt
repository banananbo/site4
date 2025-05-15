package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "conversation_idioms")
data class ConversationIdiomEntity(
    @Id
    val id: String,
    
    @Column(name = "conversation_id", nullable = false)
    val conversationId: String,
    
    @Column(name = "idiom_id", nullable = false)
    val idiomId: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 