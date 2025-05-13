package com.example.api.util

import com.example.api.service.UserService
import org.slf4j.LoggerFactory
import java.security.Principal

/**
 * 認証関連のユーティリティクラス
 */
object AuthUtils {
    private val logger = LoggerFactory.getLogger(AuthUtils::class.java)
    
    /**
     * 認証情報からユーザーIDを取得する
     * 
     * @param principal 認証情報
     * @param userService ユーザーサービス
     * @return ユーザーID（認証情報が無効な場合はnull）
     */
    fun getUserIdFromPrincipal(principal: Principal?, userService: UserService): Long? {
        if (principal == null) {
            logger.error("認証情報がありません")
            return null
        }
        
        try {
            val auth0Id = principal.name
            logger.info("Auth0 ID: $auth0Id")
            
            val user = userService.findUserByAuth0Id(auth0Id).orElse(null)
            if (user == null) {
                logger.error("ユーザーが見つかりません: $auth0Id")
                return null
            }
            
            val userId = user.id
            if (userId == null) {
                logger.error("ユーザーIDがnullです")
                return null
            }
            
            logger.info("ユーザーID取得: $userId")
            return userId
        } catch (e: Exception) {
            logger.error("ユーザーID取得エラー", e)
            return null
        }
    }
} 