package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "conversations")
data class ConversationEntity(
    @Id
    val id: String,
    val title: String,
    val description: String?,
    val level: Int,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    @Column(name = "updated_at", nullable = false)
    val updatedAt: LocalDateTime
) 