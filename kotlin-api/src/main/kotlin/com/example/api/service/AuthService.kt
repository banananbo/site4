package com.example.api.service

import com.auth0.client.auth.AuthAPI
import com.auth0.exception.Auth0Exception
import com.auth0.json.auth.TokenHolder
import com.auth0.json.auth.UserInfo
import com.example.api.entity.User
import com.example.api.entity.UserSession
import com.example.api.model.Auth0UserInfo
import com.example.api.repository.UserRepository
import com.example.api.repository.UserSessionRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import java.time.LocalDateTime
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository,
    private val authAPI: AuthAPI,
    private val userService: UserService,
    private val restTemplate: RestTemplate,
    @Value("\${auth0.domain}") private val domain: String,
    @Value("\${auth0.clientId}") private val clientId: String,
    @Value("\${auth0.audience}") private val audience: String,
    @Value("\${auth0.redirectUri}") private val redirectUri: String,
    @Value("\${auth0.logoutRedirectUri}") private val logoutRedirectUri: String
) {
    
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
        val idToken = holder.idToken
        val expiresIn = holder.expiresIn
        
        // トークンを使ってユーザー情報を取得
        val userInfo = getUserInfo(accessToken)
        val auth0UserInfo = Auth0UserInfo(
            sub = userInfo.values["sub"] as String,
            email = userInfo.values["email"] as String,
            name = userInfo.values["name"] as? String ?: "",
            picture = userInfo.values["picture"] as? String
        )
        
        // ユーザー情報をデータベースに保存
        val user = userService.createOrUpdateUser(
            auth0Id = auth0UserInfo.sub,
            email = auth0UserInfo.email,
            name = auth0UserInfo.name,
            profilePicture = auth0UserInfo.picture,
            accessToken = accessToken,
            expiresIn = expiresIn
        )
        
        // フロントエンド用のレスポンス（アクセストークンは含まない）
        return mapOf(
            "userId" to (user.id?.toString() ?: ""),
            "email" to user.email,
            "name" to user.name,
            "profilePicture" to (user.profilePicture ?: ""),
            "idToken" to idToken
        )
    }
    
    /**
     * ユーザーのログアウト処理を行い、Auth0のログアウトURLを生成します
     * @param userId ログアウトするユーザーID
     * @return Auth0のログアウトURL
     */
    fun createLogoutUrl(userId: Long): String {
        // ユーザーセッションを削除
        userService.removeUserSessions(userId)
        
        // Auth0のログアウトURLを生成
        return createLogoutUrlWithoutUserId()
    }
    
    /**
     * ユーザーIDなしでAuth0のログアウトURLを生成します
     * セッション削除は行わず、単にログアウトURLを返します
     * @return Auth0のログアウトURL
     */
    fun createLogoutUrlWithoutUserId(): String {
        return UriComponentsBuilder.newInstance()
            .scheme("https")
            .host(domain)
            .path("/v2/logout")
            .queryParam("client_id", clientId)
            .queryParam("returnTo", logoutRedirectUri)
            .build()
            .toUriString()
    }
    
    /**
     * アクセストークンを使用してAuth0からユーザー情報を取得
     */
    private fun getUserInfo(accessToken: String): UserInfo {
        val url = "https://$domain/userinfo"
        val headers = HttpHeaders().apply {
            setBearerAuth(accessToken)
        }
        val entity = HttpEntity<String>(headers)
        val response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            UserInfo::class.java
        )
        return response.body ?: throw RuntimeException("Failed to get user info from Auth0")
    }
} 