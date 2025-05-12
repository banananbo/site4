package com.example.api.repository

import com.example.api.entity.SentenceEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SentenceRepository : JpaRepository<SentenceEntity, String> {
    fun findBySentence(sentence: String): SentenceEntity?
} 