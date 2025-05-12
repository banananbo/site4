package com.example.api.repository

import com.example.api.entity.UserWordEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserWordRepository : JpaRepository<UserWordEntity, String> {
    fun findByUserId(userId: Long, pageable: Pageable): Page<UserWordEntity>
} 