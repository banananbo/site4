package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "openai_logs")
data class OpenAILogEntity(
    @Id
    val id: String,
    
    @Column(name = "request_prompt", nullable = false, columnDefinition = "TEXT")
    val requestPrompt: String,
    
    @Column(name = "response_content", nullable = false, columnDefinition = "TEXT")
    val responseContent: String,
    
    @Column(name = "tokens_used")
    val tokensUsed: Int?,
    
    @Column(name = "request_time_ms")
    val requestTimeMs: Int,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 