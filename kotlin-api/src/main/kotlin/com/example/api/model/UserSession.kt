package com.example.api.model

import javax.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "user_sessions")
data class UserSession(
    @Id
    @Column(name = "id")
    val id: String = java.util.UUID.randomUUID().toString(),
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(name = "token", nullable = false, columnDefinition = "TEXT")
    val token: String,
    
    @Column(name = "expires_at", nullable = false)
    val expiresAt: LocalDateTime,
    
    @Column(name = "created_at", nullable = true)
    val createdAt: LocalDateTime = LocalDateTime.now()
) 