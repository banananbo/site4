package com.example.api.repository

import com.example.api.entity.WordSentenceEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WordSentenceRepository : JpaRepository<WordSentenceEntity, String> {
    fun findByWordId(wordId: String): List<WordSentenceEntity>
} 