package com.example.api.repository

import com.example.api.entity.WordEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WordRepository : JpaRepository<WordEntity, String> {
    fun findByWord(word: String): WordEntity?
    fun findByCreatedBy(userId: String, pageable: Pageable): Page<WordEntity>
} 