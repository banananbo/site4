package com.example.api.model

import com.example.api.entity.GrammarEntity
import com.example.api.model.Grammar

data class GrammarResponse(
    val id: String,
    val pattern: String,
    val explanation: String,
    val level: String,
    val createdAt: String,
    val updatedAt: String
) {
    companion object {
        fun from(entity: GrammarEntity): GrammarResponse {
            return GrammarResponse(
                id = entity.id,
                pattern = entity.pattern,
                explanation = entity.explanation,
                level = entity.level.name,
                createdAt = entity.createdAt.toString(),
                updatedAt = entity.updatedAt.toString()
            )
        }

        fun from(domain: Grammar): GrammarResponse {
            return GrammarResponse(
                id = domain.id,
                pattern = domain.pattern,
                explanation = domain.explanation,
                level = domain.level.name,
                createdAt = domain.createdAt.toString(),
                updatedAt = domain.updatedAt.toString()
            )
        }
    }
} 