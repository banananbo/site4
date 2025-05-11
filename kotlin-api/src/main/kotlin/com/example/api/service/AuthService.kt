package com.example.api.service

import com.auth0.client.auth.AuthAPI
import com.auth0.json.auth.TokenHolder
import com.example.api.model.Auth0UserInfo
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.util.UUID

@Service
class AuthService(
    private val authAPI: AuthAPI,
    private val userService: UserService,
    private val restTemplate: RestTemplate
) {
    
    @Value("\${auth0.domain}")
    private lateinit var domain: String
    
    @Value("\${auth0.redirectUri}")
    private lateinit var redirectUri: String
    
    @Value("\${auth0.audience}")
    private lateinit var audience: String
    
    /**
     * Auth0のログインURLを生成します
     */
    fun createAuthorizationUrl(): String {
        // ステート値を生成（CSRF対策）
        val state = UUID.randomUUID().toString()
        
        // Auth0ログインURLを生成
        return authAPI.authorizeUrl(redirectUri)
            .withAudience(audience)
            .withScope("openid profile email")
            .withState(state)
            .build()
    }
    
    /**
     * 認証コードからユーザー情報を取得し、データベースに保存します
     * @return ユーザーIDと追加情報
     */
    fun handleAuthorizationCode(code: String): Map<String, Any> {
        // Auth0に認証コードを送信してトークンを取得
        val holder: TokenHolder = authAPI.exchangeCode(code, redirectUri).execute()
        val accessToken = holder.accessToken
        val expiresIn = holder.expiresIn
        
        // トークンを使ってユーザー情報を取得
        val userInfo = getUserInfo(accessToken)
        
        // ユーザー情報をデータベースに保存
        val user = userService.createOrUpdateUser(
            auth0Id = userInfo.sub,
            email = userInfo.email,
            name = userInfo.name,
            profilePicture = userInfo.picture,
            accessToken = accessToken,
            expiresIn = expiresIn
        )
        
        // フロントエンド用のレスポンス（アクセストークンは含まない）
        return mapOf(
            "userId" to (user.id?.toString() ?: ""),
            "email" to user.email,
            "name" to user.name,
            "profilePicture" to (user.profilePicture ?: "")
        )
    }
    
    /**
     * アクセストークンを使用してAuth0からユーザー情報を取得
     */
    private fun getUserInfo(accessToken: String): Auth0UserInfo {
        val url = "https://$domain/userinfo"
        val headers = org.springframework.http.HttpHeaders().apply {
            setBearerAuth(accessToken)
        }
        val entity = org.springframework.http.HttpEntity<String>(headers)
        val response = restTemplate.exchange(
            url,
            org.springframework.http.HttpMethod.GET,
            entity,
            Auth0UserInfo::class.java
        )
        return response.body ?: throw RuntimeException("Failed to get user info from Auth0")
    }
} 