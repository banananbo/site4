package com.example.api.model

import java.time.LocalDateTime

data class UserIdiom(
    val id: String,
    val userId: Long,
    val idiomId: String,
    var learningStatus: LearningStatus,
    var isFavorite: Boolean,
    var lastReviewedAt: LocalDateTime?,
    val createdAt: LocalDateTime,
    var updatedAt: LocalDateTime
) 