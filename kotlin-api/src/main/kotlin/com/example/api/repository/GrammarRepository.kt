package com.example.api.repository

import com.example.api.entity.GrammarEntity
import com.example.api.entity.GrammarLevelEntity
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GrammarRepository : JpaRepository<GrammarEntity, String> {
    fun findByLevel(level: GrammarLevelEntity, pageable: Pageable): Page<GrammarEntity>
    fun findByPattern(pattern: String): GrammarEntity?
} 