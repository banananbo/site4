package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "word_sentences")
data class WordSentenceEntity(
    @Id
    val id: String,
    
    @Column(name = "word_id", nullable = false)
    val wordId: String,
    
    @Column(name = "sentence_id", nullable = false)
    val sentenceId: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 