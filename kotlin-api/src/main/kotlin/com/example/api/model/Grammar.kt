package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

enum class GrammarLevel {
    BEGINNER, INTERMEDIATE, ADVANCED
}

data class Grammar(
    val id: String = UUID.randomUUID().toString(),
    val pattern: String,
    val explanation: String,
    val level: GrammarLevel = GrammarLevel.INTERMEDIATE,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 