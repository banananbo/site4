package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

enum class WordStatus {
    PENDING, PROCESSING, COMPLETED, ERROR
}

data class Word(
    val id: String = UUID.randomUUID().toString(),
    val word: String,
    val meaning: String = "",
    val partOfSpeech: String = "",
    val status: WordStatus = WordStatus.PENDING,
    val createdBy: Long? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)