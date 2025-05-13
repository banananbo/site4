package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

data class Idiom(
    val id: String = UUID.randomUUID().toString(),
    val idiom: String,
    val meaning: String,
    val example: String? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 