package com.example.api.service

import com.example.api.model.User
import com.example.api.model.UserSession
import com.example.api.repository.UserRepository
import com.example.api.repository.UserSessionRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UserService(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository
) {

    /**
     * Auth0ユーザーIDでユーザーを検索します
     */
    fun findUserByAuth0Id(auth0Id: String) = userRepository.findByAuth0Id(auth0Id)

    /**
     * Auth0ユーザー情報からユーザーを作成または更新します
     */
    fun createOrUpdateUser(
        auth0Id: String, 
        email: String, 
        name: String? = null, 
        profilePicture: String? = null,
        accessToken: String? = null,
        expiresIn: Long? = null
    ): User {
        val existingUser = userRepository.findByAuth0Id(auth0Id).orElse(null)
        
        return if (existingUser != null) {
            // 既存ユーザーを更新
            val updatedUser = existingUser.copy(
                email = email,
                name = name ?: existingUser.name,
                profilePicture = profilePicture ?: existingUser.profilePicture,
                updatedAt = LocalDateTime.now()
            )
            val savedUser = userRepository.save(updatedUser)
            
            // アクセストークンが提供されている場合はセッションを保存
            if (accessToken != null && expiresIn != null) {
                saveUserSession(savedUser, accessToken, expiresIn)
            }
            
            savedUser
        } else {
            // 新規ユーザーを作成
            val newUser = User(
                auth0Id = auth0Id,
                email = email,
                name = name ?: "",
                profilePicture = profilePicture
            )
            val savedUser = userRepository.save(newUser)
            
            // アクセストークンが提供されている場合はセッションを保存
            if (accessToken != null && expiresIn != null) {
                saveUserSession(savedUser, accessToken, expiresIn)
            }
            
            savedUser
        }
    }
    
    /**
     * ユーザーセッションを保存します
     */
    private fun saveUserSession(user: User, token: String, expiresIn: Long): UserSession {
        val expiresAt = LocalDateTime.now().plusSeconds(expiresIn)
        
        val session = UserSession(
            user = user,
            token = token,
            expiresAt = expiresAt
        )
        
        return userSessionRepository.save(session)
    }
} 