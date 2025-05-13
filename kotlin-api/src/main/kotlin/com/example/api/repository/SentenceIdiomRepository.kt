package com.example.api.repository

import com.example.api.entity.SentenceIdiomEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SentenceIdiomRepository : JpaRepository<SentenceIdiomEntity, String> {
    fun findBySentenceId(sentenceId: String): List<SentenceIdiomEntity>
    fun findByIdiomId(idiomId: String): List<SentenceIdiomEntity>
    fun findBySentenceIdAndIdiomId(sentenceId: String, idiomId: String): SentenceIdiomEntity?
} 