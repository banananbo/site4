package com.example.api.controller

import com.example.api.model.AuthCodeRequest
import com.example.api.model.LoginUrlResponse
import com.example.api.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

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
        return ResponseEntity.ok(userInfo)
    }
    
    /**
     * ログアウト処理を行い、Auth0のログアウトURLを返すエンドポイント
     * @param userId ログアウトするユーザーID (オプション)
     * @return Auth0のログアウトURL
     */
    @GetMapping("/logout")
    fun logout(@RequestParam(required = false) userId: Long?): ResponseEntity<Map<String, String>> {
        val logoutUrl = if (userId != null) {
            authService.createLogoutUrl(userId)
        } else {
            authService.createLogoutUrlWithoutUserId()
        }
        return ResponseEntity.ok(mapOf("logoutUrl" to logoutUrl))
    }
} 