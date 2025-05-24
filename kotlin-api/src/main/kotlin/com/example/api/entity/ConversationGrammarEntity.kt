package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "conversation_grammars")
data class ConversationGrammarEntity(
    @Id
    val id: String,
    
    @Column(name = "conversation_id", nullable = false)
    val conversationId: String,
    
    @Column(name = "grammar_id", nullable = false)
    val grammarId: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 