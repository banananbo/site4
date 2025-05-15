package com.example.api.model

import java.time.LocalDateTime

data class Idiom(
    val id: String,
    val idiom: String,
    val meaning: String,
    val example: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) 