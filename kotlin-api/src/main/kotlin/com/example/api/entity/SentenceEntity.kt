package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "sentences")
data class SentenceEntity(
    @Id
    val id: String,
    
    @Column(nullable = false)
    val sentence: String,
    
    @Column(nullable = false)
    val translation: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) 