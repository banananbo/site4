package com.example.api.repository

import com.example.api.entity.SentenceGrammarEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SentenceGrammarRepository : JpaRepository<SentenceGrammarEntity, String> {
    fun findBySentenceId(sentenceId: String): List<SentenceGrammarEntity>
    fun findByGrammarId(grammarId: String): List<SentenceGrammarEntity>
} 