package com.example.api.repository

import com.example.api.entity.UserSentenceEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserSentenceRepository : JpaRepository<UserSentenceEntity, String> {
    fun findByUserId(userId: Long, pageable: Pageable): Page<UserSentenceEntity>
    fun findByUserIdAndSentenceId(userId: Long, sentenceId: String): UserSentenceEntity?
    fun findBySentenceId(sentenceId: String, pageable: Pageable): Page<UserSentenceEntity>
} 