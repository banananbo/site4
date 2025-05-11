package com.example.api.controller

import com.example.api.model.AuthCodeRequest
import com.example.api.model.LoginUrlResponse
import com.example.api.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

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
} 