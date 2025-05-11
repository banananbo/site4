package com.example.api.repository

import com.example.api.entity.User
import com.example.api.entity.UserSession
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface UserSessionRepository : JpaRepository<UserSession, String> {
    fun findByToken(token: String): UserSession?
    fun findByExpiresAtBefore(date: LocalDateTime): List<UserSession>
    fun findByUser(user: User): List<UserSession>
} 