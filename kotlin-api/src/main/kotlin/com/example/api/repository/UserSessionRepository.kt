package com.example.api.repository

import com.example.api.model.User
import com.example.api.model.UserSession
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface UserSessionRepository : JpaRepository<UserSession, String> {
    fun findByToken(token: String): Optional<UserSession>
    fun findByUserAndExpiresAtGreaterThan(user: User, dateTime: LocalDateTime): List<UserSession>
} 