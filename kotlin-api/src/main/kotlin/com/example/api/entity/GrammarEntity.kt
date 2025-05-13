package com.example.api.entity

import com.example.api.model.Grammar
import com.example.api.model.GrammarLevel
import java.time.LocalDateTime
import javax.persistence.*

enum class GrammarLevelEntity {
    beginner, intermediate, advanced
}

@Entity
@Table(name = "grammars")
data class GrammarEntity(
    @Id
    val id: String,
    
    @Column(nullable = false, unique = true)
    val pattern: String,
    
    @Column(nullable = false)
    val explanation: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val level: GrammarLevelEntity,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): Grammar {
        return Grammar(
            id = id,
            pattern = pattern,
            explanation = explanation,
            level = when(level) {
                GrammarLevelEntity.beginner -> GrammarLevel.BEGINNER
                GrammarLevelEntity.intermediate -> GrammarLevel.INTERMEDIATE
                GrammarLevelEntity.advanced -> GrammarLevel.ADVANCED
            },
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
    
    companion object {
        fun fromDomain(domain: Grammar): GrammarEntity {
            val entityLevel = when(domain.level) {
                GrammarLevel.BEGINNER -> GrammarLevelEntity.beginner
                GrammarLevel.INTERMEDIATE -> GrammarLevelEntity.intermediate
                GrammarLevel.ADVANCED -> GrammarLevelEntity.advanced
            }
            
            return GrammarEntity(
                id = domain.id,
                pattern = domain.pattern,
                explanation = domain.explanation,
                level = entityLevel,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 