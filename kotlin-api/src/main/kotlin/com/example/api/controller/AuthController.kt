package com.example.api.controller

import com.example.api.model.AuthCodeRequest
import com.example.api.model.LoginUrlResponse
import com.example.api.service.AuthService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {
    private val logger = LoggerFactory.getLogger(javaClass)

    /**
     * Auth0ログインURLを生成するエンドポイント
     * @return Auth0の認証ページへのURL
     */
    @GetMapping("/login")
    fun login(): LoginUrlResponse {
        val authorizationUrl = authService.createAuthorizationUrl()
        return LoginUrlResponse(authorizationUrl)
    }
    
    /**
     * Auth0からの認証コードを処理し、ユーザー情報を返すエンドポイント
     * アクセストークンはサーバー側でのみ保持し、フロントエンドには返しません
     * @param request 認証コードリクエスト
     * @return ユーザー情報
     */
    @PostMapping("/code")
    fun handleAuthorizationCode(@RequestBody request: AuthCodeRequest): ResponseEntity<Map<String, Any>> {
        val userInfo = authService.handleAuthorizationCode(request.code)
        logger.info("認証コードの処理結果: $userInfo")
        return ResponseEntity.ok(userInfo)
    }
    
    /**
     * ログアウト処理を行い、Auth0のログアウトURLを返すエンドポイント
     * JWTトークンによる認証を使用
     * @param jwt 認証されたJWTトークン
     * @return Auth0のログアウトURL
     */
    @GetMapping("/logout")
    fun logout(@AuthenticationPrincipal jwt: Jwt?): ResponseEntity<Map<String, String>> {
        logger.info("JWTベースのログアウトリクエスト受信")
        
        val logoutUrl = if (jwt != null) {
            try {
                // JWTからユーザー情報を抽出
                val userId = jwt.getClaim<String>("userId")
                val auth0UserId = jwt.subject
                
                logger.info("JWT情報 - userId: $userId, auth0UserId: $auth0UserId")
                
                if (userId != null) {
                    try {
                        authService.createLogoutUrl(userId.toLong())
                    } catch (e: Exception) {
                        logger.warn("ユーザーIDの変換エラー: $userId", e)
                        authService.createLogoutUrlWithoutUserId()
                    }
                } else {
                    // ユーザーIDが取得できない場合
                    logger.info("JWTからユーザーIDを取得できませんでした。Auth0 IDを使用します: $auth0UserId")
                    authService.createLogoutUrlWithoutUserId()
                }
            } catch (e: Exception) {
                logger.error("JWTからのユーザー情報抽出中にエラー発生", e)
                authService.createLogoutUrlWithoutUserId()
            }
        } else {
            logger.warn("JWT情報がないため、ユーザーIDなしでログアウト")
            authService.createLogoutUrlWithoutUserId()
        }
        
        return ResponseEntity.ok(mapOf("logoutUrl" to logoutUrl))
    }
} 