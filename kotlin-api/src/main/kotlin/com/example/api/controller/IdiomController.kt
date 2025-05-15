package com.example.api.controller

import com.example.api.entity.IdiomEntity
import com.example.api.model.Idiom
import com.example.api.model.UserIdiom
import com.example.api.model.LearningStatus
import com.example.api.repository.IdiomRepository
import com.example.api.service.IdiomService
import com.example.api.service.UserService
import com.example.api.util.AuthUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDateTime
import java.util.UUID
import java.util.NoSuchElementException
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/idioms")
class IdiomController(
    private val idiomRepository: IdiomRepository,
    private val idiomService: IdiomService,
    private val userService: UserService
) {
    private val logger = LoggerFactory.getLogger(IdiomController::class.java)

    /**
     * ルートエンドポイント - すべてのイディオムをリスト形式で返す
     */
    @GetMapping("/")
    fun getAllIdioms(): ResponseEntity<List<Idiom>> {
        logger.info("GET /api/idioms/ が呼び出されました")
        val idioms = idiomRepository.findAll().map { it.toDomain() }
        logger.info("イディオムの取得が完了しました: ${idioms.size}件")
        return ResponseEntity.ok(idioms)
    }

    /**
     * イディオム一覧を取得する
     */
    @GetMapping
    fun getIdioms(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<Idiom> {
        logger.info("GET /api/idioms が呼び出されました (page: $page, size: $size)")
        val pageable = PageRequest.of(page, size, Sort.by("idiom"))
        val result = idiomRepository.findAll(pageable).map { it.toDomain() }
        logger.info("ページ付きイディオムの取得が完了しました: ${result.content.size}件")
        return result
    }

    /**
     * 特定のイディオムを取得する
     */
    @GetMapping("/{id}")
    fun getIdiom(@PathVariable id: String): ResponseEntity<Idiom> {
        return try {
            val idiom = idiomService.findById(id)
            ResponseEntity.ok(idiom)
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * イディオムをユーザーの学習リストに追加する
     */
    @PostMapping("/{id}/learn")
    fun addToLearning(
        principal: Principal?,
        @PathVariable id: String
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))

        return try {
            val userIdiom = idiomService.addToUserLearning(userId, id)
            ResponseEntity.ok(userIdiom)
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "エラーが発生しました: ${e.message}"))
        }
    }

    /**
     * ユーザーのイディオム学習状態を更新する
     */
    @PutMapping("/{id}/status")
    fun updateLearningStatus(
        principal: Principal?,
        @PathVariable id: String,
        @RequestBody request: UpdateLearningStatusRequest
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))

        return try {
            val status = when (request.status.uppercase()) {
                "NEW" -> LearningStatus.NEW
                "LEARNING" -> LearningStatus.LEARNING
                "MASTERED" -> LearningStatus.MASTERED
                else -> throw IllegalArgumentException("無効な学習状態: ${request.status}")
            }

            val updatedUserIdiom = idiomService.updateLearningStatus(userId, id, status)
            ResponseEntity.ok(updatedUserIdiom)
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "ユーザーとイディオムの関連が見つかりません"))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "エラーが発生しました: ${e.message}"))
        }
    }

    /**
     * ユーザーの学習中イディオムリストを取得する
     */
    @GetMapping("/learning")
    fun getLearningIdioms(
        principal: Principal?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ResponseEntity<Any> {
        logger.info("GET /api/idioms/learning が呼び出されました (page: $page, size: $size)")
        
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
        if (userId == null) {
            logger.warn("認証されていないユーザーからのリクエスト")
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))
        }
        
        logger.info("ユーザーID: $userId の学習中イディオムを取得します")
        val pageable = PageRequest.of(page, size)
        val userIdiomsWithDetails = idiomService.getUserLearningIdioms(userId, pageable)
        logger.info("学習中イディオムの取得が完了しました: ${userIdiomsWithDetails.content.size}件")
        
        return ResponseEntity.ok(userIdiomsWithDetails)
    }

    /**
     * ユーザーのお気に入り状態を更新する
     */
    @PutMapping("/{id}/favorite")
    fun updateFavoriteStatus(
        principal: Principal?,
        @PathVariable id: String,
        @RequestBody request: UpdateFavoriteRequest
    ): ResponseEntity<Any> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))

        return try {
            val updatedUserIdiom = idiomService.updateFavoriteStatus(userId, id, request.isFavorite)
            ResponseEntity.ok(updatedUserIdiom)
        } catch (e: NoSuchElementException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "ユーザーとイディオムの関連が見つかりません"))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "エラーが発生しました: ${e.message}"))
        }
    }
}

data class UpdateLearningStatusRequest(
    val status: String
)

data class UpdateFavoriteRequest(
    val isFavorite: Boolean
) 