package com.example.api.entity

import com.example.api.model.Sentence
import com.example.api.model.SentenceDifficulty
import java.time.LocalDateTime
import javax.persistence.*

enum class SentenceDifficultyEntity {
    easy, medium, hard
}

@Entity
@Table(name = "sentences")
data class SentenceEntity(
    @Id
    val id: String,
    
    @Column(nullable = false)
    val sentence: String,
    
    @Column(nullable = false)
    val translation: String,
    
    @Column
    val source: String?,
    
    @Enumerated(EnumType.STRING)
    @Column
    val difficulty: SentenceDifficultyEntity = SentenceDifficultyEntity.medium,
    
    @Column(name = "is_analyzed")
    val isAnalyzed: Boolean = false,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): Sentence {
        return Sentence(
            id = id,
            sentence = sentence,
            translation = translation,
            source = source,
            difficulty = when(difficulty) {
                SentenceDifficultyEntity.easy -> SentenceDifficulty.EASY
                SentenceDifficultyEntity.medium -> SentenceDifficulty.MEDIUM
                SentenceDifficultyEntity.hard -> SentenceDifficulty.HARD
            },
            isAnalyzed = isAnalyzed,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
    
    companion object {
        fun fromDomain(domain: Sentence): SentenceEntity {
            val entityDifficulty = when(domain.difficulty) {
                SentenceDifficulty.EASY -> SentenceDifficultyEntity.easy
                SentenceDifficulty.MEDIUM -> SentenceDifficultyEntity.medium
                SentenceDifficulty.HARD -> SentenceDifficultyEntity.hard
            }
            
            return SentenceEntity(
                id = domain.id,
                sentence = domain.sentence,
                translation = domain.translation,
                source = domain.source,
                difficulty = entityDifficulty,
                isAnalyzed = domain.isAnalyzed,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 