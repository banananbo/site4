package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "sentence_grammars")
data class SentenceGrammarEntity(
    @Id
    val id: String,
    
    @Column(name = "sentence_id", nullable = false)
    val sentenceId: String,
    
    @Column(name = "grammar_id", nullable = false)
    val grammarId: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 