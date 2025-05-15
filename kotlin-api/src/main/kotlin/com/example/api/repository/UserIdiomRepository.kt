package com.example.api.repository

import com.example.api.entity.UserIdiomEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserIdiomRepository : JpaRepository<UserIdiomEntity, String> {
    fun findByUserId(userId: Long, pageable: Pageable): Page<UserIdiomEntity>
    
    fun findByUserIdAndIdiomId(userId: Long, idiomId: String): UserIdiomEntity?
} 