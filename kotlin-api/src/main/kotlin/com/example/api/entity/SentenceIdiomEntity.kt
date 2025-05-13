package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "sentence_idioms")
data class SentenceIdiomEntity(
    @Id
    val id: String,
    
    @Column(name = "sentence_id", nullable = false)
    val sentenceId: String,
    
    @Column(name = "idiom_id", nullable = false)
    val idiomId: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 