package com.example.api.controller

import com.example.api.model.LearningStatus
import com.example.api.service.WordService
import com.example.api.service.SentenceService
import com.example.api.service.UserService
import com.example.api.util.AuthUtils
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.slf4j.LoggerFactory
import java.security.Principal

/**
 * 学習状態を更新するコントローラー
 */
@RestController
@RequestMapping("/api")
class LearningStatusController(
    private val wordService: WordService,
    private val sentenceService: SentenceService,
    private val userService: UserService
) {
    private val logger = LoggerFactory.getLogger(LearningStatusController::class.java)
    
    /**
     * 単語の学習状態を更新する (PUT)
     */
    @PutMapping("/words/{wordId}/learning-status")
    fun updateWordLearningStatusPut(
        @PathVariable wordId: String,
        @RequestParam status: String,
        principal: Principal
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))
                
        logger.info("PUT リクエスト: 単語 $wordId の学習状態を $status に更新します (ユーザーID: $userId)")
        return updateWordLearningStatus(wordId, userId, status)
    }
    
    /**
     * 単語の学習状態を更新する (POST)
     */
    @PostMapping("/words/{wordId}/learning-status")
    fun updateWordLearningStatusPost(
        @PathVariable wordId: String,
        @RequestParam status: String,
        principal: Principal
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))
                
        logger.info("POST リクエスト: 単語 $wordId の学習状態を $status に更新します (ユーザーID: $userId)")
        return updateWordLearningStatus(wordId, userId, status)
    }
    
    /**
     * 単語の学習状態を更新する（共通処理）
     */
    private fun updateWordLearningStatus(
        wordId: String, 
        userId: Long, 
        status: String
    ): ResponseEntity<Any> {
        val learningStatus = try {
            LearningStatus.valueOf(status.uppercase())
        } catch (e: IllegalArgumentException) {
            logger.error("無効な学習状態: $status")
            return ResponseEntity.badRequest()
                .body(mapOf("error" to "無効な学習状態です。NEW, LEARNING, MASTEREDのいずれかを指定してください。"))
        }
        
        return try {
            val updatedWord = wordService.updateLearningStatus(wordId, userId, learningStatus)
            logger.info("単語 $wordId の学習状態を ${learningStatus.name} に正常に更新しました")
            ResponseEntity.ok(updatedWord)
        } catch (e: Exception) {
            logger.error("単語の学習状態更新中にエラーが発生しました: ${e.message}", e)
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
    
    /**
     * センテンスの学習状態を更新する (PUT)
     */
    @PutMapping("/sentences/{sentenceId}/learning-status")
    fun updateSentenceLearningStatusPut(
        @PathVariable sentenceId: String,
        @RequestParam status: String,
        principal: Principal
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))
                
        logger.info("PUT リクエスト: センテンス $sentenceId の学習状態を $status に更新します (ユーザーID: $userId)")
        return updateSentenceLearningStatus(sentenceId, userId, status)
    }
    
    /**
     * センテンスの学習状態を更新する (POST)
     */
    @PostMapping("/sentences/{sentenceId}/learning-status")
    fun updateSentenceLearningStatusPost(
        @PathVariable sentenceId: String,
        @RequestParam status: String,
        principal: Principal
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))
                
        logger.info("POST リクエスト: センテンス $sentenceId の学習状態を $status に更新します (ユーザーID: $userId)")
        return updateSentenceLearningStatus(sentenceId, userId, status)
    }
    
    /**
     * センテンスの学習状態を更新する（共通処理）
     */
    private fun updateSentenceLearningStatus(
        sentenceId: String, 
        userId: Long, 
        status: String
    ): ResponseEntity<Any> {
        val learningStatus = try {
            LearningStatus.valueOf(status.uppercase())
        } catch (e: IllegalArgumentException) {
            logger.error("無効な学習状態: $status")
            return ResponseEntity.badRequest()
                .body(mapOf("error" to "無効な学習状態です。NEW, LEARNING, MASTEREDのいずれかを指定してください。"))
        }
        
        return try {
            val updatedSentence = sentenceService.updateLearningStatus(sentenceId, userId, learningStatus)
            logger.info("センテンス $sentenceId の学習状態を ${learningStatus.name} に正常に更新しました")
            ResponseEntity.ok(updatedSentence)
        } catch (e: Exception) {
            logger.error("センテンスの学習状態更新中にエラーが発生しました: ${e.message}", e)
            ResponseEntity.badRequest().body(mapOf("error" to e.message))
        }
    }
} 