package com.example.api.service

import com.example.api.entity.IdiomEntity
import com.example.api.entity.UserIdiomEntity
import com.example.api.entity.LearningStatusEntity
import com.example.api.model.Idiom
import com.example.api.model.UserIdiom
import com.example.api.model.LearningStatus
import com.example.api.repository.IdiomRepository
import com.example.api.repository.UserIdiomRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.NoSuchElementException
import java.util.UUID

@Service
class IdiomService(
    private val idiomRepository: IdiomRepository,
    private val userIdiomRepository: UserIdiomRepository
) {
    /**
     * イディオムをDBから検索する
     */
    fun findById(id: String): Idiom {
        val entity = idiomRepository.findById(id)
            .orElseThrow { NoSuchElementException("Idiom not found with id: $id") }
        return entity.toDomain()
    }
    
    /**
     * イディオムをユーザーの学習リストに追加する
     */
    @Transactional
    fun addToUserLearning(userId: Long, idiomId: String): UserIdiom {
        // 既に登録されているか確認
        val existing = userIdiomRepository.findByUserIdAndIdiomId(userId, idiomId)
        if (existing != null) {
            // 既に登録されている場合はステータスを更新
            existing.learningStatus = LearningStatusEntity.learning
            existing.updatedAt = LocalDateTime.now()
            val updated = userIdiomRepository.save(existing)
            return updated.toDomain()
        }
        
        // 新規に登録
        val now = LocalDateTime.now()
        val userIdiom = UserIdiomEntity(
            id = UUID.randomUUID().toString(),
            userId = userId,
            idiomId = idiomId,
            learningStatus = LearningStatusEntity.learning,
            isFavorite = false,
            lastReviewedAt = null,
            createdAt = now,
            updatedAt = now
        )
        val saved = userIdiomRepository.save(userIdiom)
        return saved.toDomain()
    }
    
    /**
     * ユーザーの学習中イディオムリストを取得する
     */
    fun getUserLearningIdioms(userId: Long, pageable: Pageable): Page<Map<String, Any>> {
        val userIdioms = userIdiomRepository.findByUserId(userId, pageable)
        
        return userIdioms.map { userIdiomEntity ->
            val idiom = idiomRepository.findById(userIdiomEntity.idiomId)
                .orElseThrow { NoSuchElementException("Idiom not found with id: ${userIdiomEntity.idiomId}") }
            
            mapOf(
                "userIdiom" to userIdiomEntity.toDomain(),
                "idiom" to idiom.toDomain()
            )
        }
    }
    
    /**
     * ユーザーのイディオム学習状態を更新する
     */
    @Transactional
    fun updateLearningStatus(userId: Long, idiomId: String, status: LearningStatus): UserIdiom {
        val userIdiom = userIdiomRepository.findByUserIdAndIdiomId(userId, idiomId)
            ?: throw NoSuchElementException("User idiom not found for user: $userId, idiom: $idiomId")
        
        userIdiom.learningStatus = when (status) {
            LearningStatus.NEW -> LearningStatusEntity.new
            LearningStatus.LEARNING -> LearningStatusEntity.learning
            LearningStatus.MASTERED -> LearningStatusEntity.mastered
        }
        userIdiom.updatedAt = LocalDateTime.now()
        
        val updated = userIdiomRepository.save(userIdiom)
        return updated.toDomain()
    }

    /**
     * ユーザーのイディオムのお気に入り状態を更新する
     */
    @Transactional
    fun updateFavoriteStatus(userId: Long, idiomId: String, isFavorite: Boolean): UserIdiom {
        val userIdiom = userIdiomRepository.findByUserIdAndIdiomId(userId, idiomId)
            ?: throw NoSuchElementException("User idiom not found for user: $userId, idiom: $idiomId")
        
        userIdiom.isFavorite = isFavorite
        userIdiom.updatedAt = LocalDateTime.now()
        
        val updated = userIdiomRepository.save(userIdiom)
        return updated.toDomain()
    }
} 