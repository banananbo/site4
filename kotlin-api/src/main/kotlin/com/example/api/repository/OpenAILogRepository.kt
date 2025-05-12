package com.example.api.repository

import com.example.api.entity.OpenAILogEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OpenAILogRepository : JpaRepository<OpenAILogEntity, String> 