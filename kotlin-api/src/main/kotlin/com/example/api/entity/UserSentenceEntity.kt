package com.example.api.entity

import com.example.api.model.LearningStatus
import com.example.api.model.UserSentence
import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "user_sentences")
data class UserSentenceEntity(
    @Id
    val id: String,
    
    @Column(name = "user_id", nullable = false)
    val userId: Long,
    
    @Column(name = "sentence_id", nullable = false)
    val sentenceId: String,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "learning_status", nullable = false)
    val learningStatus: LearningStatusEntity,
    
    @Column(name = "is_favorite", nullable = false)
    val isFavorite: Boolean,
    
    @Column(name = "last_reviewed_at")
    val lastReviewedAt: LocalDateTime?,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): UserSentence {
        return UserSentence(
            userId = userId,
            sentenceId = sentenceId,
            learningStatus = when(learningStatus) {
                LearningStatusEntity.new -> LearningStatus.NEW
                LearningStatusEntity.learning -> LearningStatus.LEARNING
                LearningStatusEntity.mastered -> LearningStatus.MASTERED
            },
            isFavorite = isFavorite,
            lastReviewedAt = lastReviewedAt,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
    
    companion object {
        fun fromDomain(domain: UserSentence): UserSentenceEntity {
            val entityLearningStatus = when(domain.learningStatus) {
                LearningStatus.NEW -> LearningStatusEntity.new
                LearningStatus.LEARNING -> LearningStatusEntity.learning
                LearningStatus.MASTERED -> LearningStatusEntity.mastered
            }
            
            return UserSentenceEntity(
                id = domain.id,
                userId = domain.userId,
                sentenceId = domain.sentenceId,
                learningStatus = entityLearningStatus,
                isFavorite = domain.isFavorite,
                lastReviewedAt = domain.lastReviewedAt,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 