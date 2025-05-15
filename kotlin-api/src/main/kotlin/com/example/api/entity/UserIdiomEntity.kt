package com.example.api.entity

import com.example.api.model.UserIdiom
import com.example.api.model.LearningStatus
import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "user_idioms")
data class UserIdiomEntity(
    @Id
    val id: String,
    
    @Column(name = "user_id", nullable = false)
    val userId: Long,
    
    @Column(name = "idiom_id", nullable = false)
    val idiomId: String,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "learning_status", nullable = false)
    var learningStatus: LearningStatusEntity = LearningStatusEntity.new,
    
    @Column(name = "is_favorite", nullable = false)
    var isFavorite: Boolean = false,
    
    @Column(name = "last_reviewed_at")
    var lastReviewedAt: LocalDateTime? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): UserIdiom {
        return UserIdiom(
            id = id,
            userId = userId,
            idiomId = idiomId,
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
        fun fromDomain(domain: UserIdiom): UserIdiomEntity {
            val entityLearningStatus = when(domain.learningStatus) {
                LearningStatus.NEW -> LearningStatusEntity.new
                LearningStatus.LEARNING -> LearningStatusEntity.learning
                LearningStatus.MASTERED -> LearningStatusEntity.mastered
            }
            
            return UserIdiomEntity(
                id = domain.id,
                userId = domain.userId,
                idiomId = domain.idiomId,
                learningStatus = entityLearningStatus,
                isFavorite = domain.isFavorite,
                lastReviewedAt = domain.lastReviewedAt,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 