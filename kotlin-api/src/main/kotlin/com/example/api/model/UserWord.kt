package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

data class UserWord(
    val id: String = UUID.randomUUID().toString(),
    val userId: Long,
    val wordId: String,
    val learningStatus: LearningStatus = LearningStatus.NEW,
    val isFavorite: Boolean = false,
    val lastReviewedAt: LocalDateTime? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 