package com.example.api.controller

import com.example.api.model.Sentence
import com.example.api.service.SentenceService
import com.example.api.service.UserService
import com.example.api.util.AuthUtils
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import java.security.Principal
import java.util.NoSuchElementException

data class IdiomResponse(
    val id: String,
    val idiom: String,
    val meaning: String,
    val example: String?
)

data class GrammarResponse(
    val id: String,
    val pattern: String,
    val explanation: String,
    val level: String
)

data class SentenceDetailResponse(
    val id: String,
    val sentence: String,
    val translation: String,
    val source: String?,
    val difficulty: String,
    val isAnalyzed: Boolean,
    val idioms: List<IdiomResponse> = emptyList(),
    val grammars: List<GrammarResponse> = emptyList(),
    val createdAt: String,
    val updatedAt: String
) {
    companion object {
        fun fromSentence(sentence: Sentence): SentenceDetailResponse {
            return SentenceDetailResponse(
                id = sentence.id,
                sentence = sentence.sentence,
                translation = sentence.translation,
                source = sentence.source,
                difficulty = sentence.difficulty.name,
                isAnalyzed = sentence.isAnalyzed,
                idioms = sentence.idioms?.map { 
                    IdiomResponse(
                        id = it.id,
                        idiom = it.idiom,
                        meaning = it.meaning,
                        example = it.example
                    )
                } ?: emptyList(),
                grammars = sentence.grammars?.map { 
                    GrammarResponse(
                        id = it.id,
                        pattern = it.pattern,
                        explanation = it.explanation,
                        level = it.level.name
                    )
                } ?: emptyList(),
                createdAt = sentence.createdAt.toString(),
                updatedAt = sentence.updatedAt.toString()
            )
        }
    }
}

@RestController
@RequestMapping("/api/sentences")
class SentenceController(
    private val sentenceService: SentenceService,
    private val userService: UserService
) {
    /**
     * ユーザーのセンテンス一覧を取得（専用エンドポイント）
     */
    @GetMapping("/user")
    fun getUserSentencesEndpoint(
        principal: Principal,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDirection: String
    ): ResponseEntity<List<SentenceDetailResponse>> {
        try {
            // AuthUtilsを使ってユーザーIDを取得
            val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
            
            // ソート方向を決定
            val direction = if (sortDirection.equals("asc", ignoreCase = true)) {
                Sort.Direction.ASC
            } else {
                Sort.Direction.DESC
            }
            
            // ページングを設定
            val pageable = PageRequest.of(page, size, Sort.by(direction, sortBy))
            
            // ユーザーに関連するセンテンスを取得
            val sentences = sentenceService.getSentencesByUserId(userId, pageable)
            
            // レスポンスを作成
            val response = sentences.map { sentence ->
                SentenceDetailResponse.fromSentence(sentence)
            }
            
            return ResponseEntity.ok(response)
        } catch (e: NoSuchElementException) {
            return ResponseEntity.notFound().build()
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * ユーザーのセンテンス一覧を取得
     */
    @GetMapping
    fun getUserSentences(
        principal: Principal,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDirection: String
    ): ResponseEntity<List<SentenceDetailResponse>> {
        try {
            // AuthUtilsを使ってユーザーIDを取得
            val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
            
            // ソート方向を決定
            val direction = if (sortDirection.equals("asc", ignoreCase = true)) {
                Sort.Direction.ASC
            } else {
                Sort.Direction.DESC
            }
            
            // ページングを設定
            val pageable = PageRequest.of(page, size, Sort.by(direction, sortBy))
            
            // ユーザーに関連するセンテンスを取得
            val sentences = sentenceService.getSentencesByUserId(userId, pageable)
            
            // レスポンスを作成
            val response = sentences.map { sentence ->
                SentenceDetailResponse.fromSentence(sentence)
            }
            
            return ResponseEntity.ok(response)
        } catch (e: NoSuchElementException) {
            return ResponseEntity.notFound().build()
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * センテンスの詳細情報を取得
     */
    @GetMapping("/{id}")
    fun getSentenceById(@PathVariable id: String): ResponseEntity<SentenceDetailResponse> {
        return try {
            val sentence = sentenceService.getSentenceById(id)
            ResponseEntity.ok(SentenceDetailResponse.fromSentence(sentence))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * センテンスをユーザーに追加
     */
    @PostMapping("/{id}/add")
    fun addSentenceToUser(
        principal: Principal,
        @PathVariable id: String
    ): ResponseEntity<Map<String, Any>> {
        try {
            // AuthUtilsを使ってユーザーIDを取得
            val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(mapOf("success" to false, "error" to "有効なユーザー情報を取得できませんでした"))
            
            val success = sentenceService.addSentenceToUser(userId, id)
            return ResponseEntity.ok(mapOf("success" to success))
        } catch (e: NoSuchElementException) {
            return ResponseEntity.notFound().build()
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * センテンスをユーザーから削除
     */
    @DeleteMapping("/{id}/remove")
    fun removeSentenceFromUser(
        principal: Principal,
        @PathVariable id: String
    ): ResponseEntity<Map<String, Any>> {
        try {
            // AuthUtilsを使ってユーザーIDを取得
            val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
                ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(mapOf("success" to false, "error" to "有効なユーザー情報を取得できませんでした"))
            
            val success = sentenceService.removeSentenceFromUser(userId, id)
            return ResponseEntity.ok(mapOf("success" to success))
        } catch (e: NoSuchElementException) {
            return ResponseEntity.notFound().build()
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }
} 