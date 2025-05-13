package com.example.api.repository

import com.example.api.entity.GrammarEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GrammarRepository : JpaRepository<GrammarEntity, String> {
    fun findByPattern(pattern: String): GrammarEntity?
} 