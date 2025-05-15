package com.example.api.controller

import com.example.api.entity.ConversationIdiomEntity
import com.example.api.model.IdiomRef
import com.example.api.repository.ConversationEntityRepository
import com.example.api.repository.ConversationIdiomEntityRepository
import com.example.api.repository.IdiomRepository
import com.example.api.service.UserService
import com.example.api.util.AuthUtils
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDateTime
import java.util.UUID
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/conversations")
class ConversationIdiomController(
    private val conversationEntityRepository: ConversationEntityRepository,
    private val conversationIdiomEntityRepository: ConversationIdiomEntityRepository,
    private val idiomRepository: IdiomRepository,
    private val userService: UserService
) {
    /**
     * 会話に含まれるイディオム一覧を取得する
     */
    @GetMapping("/{conversationId}/idioms")
    fun getConversationIdioms(@PathVariable conversationId: String): ResponseEntity<List<IdiomRef>> {
        // 会話の存在を確認
        if (!conversationEntityRepository.existsById(conversationId)) {
            return ResponseEntity.notFound().build()
        }

        // 会話に含まれるイディオムを取得
        val idiomRefs = conversationIdiomEntityRepository.findByConversationId(conversationId).mapNotNull { relation ->
            val idiom = idiomRepository.findById(relation.idiomId).orElse(null) ?: return@mapNotNull null
            IdiomRef(idiom.id, idiom.idiom)
        }

        return ResponseEntity.ok(idiomRefs)
    }

    /**
     * 会話にイディオムを追加する
     */
    @PostMapping("/{conversationId}/idioms")
    fun addIdiomToConversation(
        principal: Principal?,
        @PathVariable conversationId: String,
        @RequestBody request: AddIdiomRequest
    ): ResponseEntity<Any> {
        // 認証確認（オプション：会話の編集権限を確認する場合）
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))

        try {
            // 会話の存在を確認
            if (!conversationEntityRepository.existsById(conversationId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("error" to "会話が見つかりません"))
            }

            // イディオムの存在を確認
            if (!idiomRepository.existsById(request.idiomId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("error" to "イディオムが見つかりません"))
            }

            // 既に関連があるか確認
            val existing = conversationIdiomEntityRepository.findAll()
                .find { it.conversationId == conversationId && it.idiomId == request.idiomId }

            if (existing != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(mapOf("error" to "このイディオムは既に会話に追加されています"))
            }

            // 新しい関連を作成
            val relation = ConversationIdiomEntity(
                id = UUID.randomUUID().toString(),
                conversationId = conversationId,
                idiomId = request.idiomId,
                createdAt = LocalDateTime.now()
            )

            conversationIdiomEntityRepository.save(relation)

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapOf("message" to "イディオムを会話に追加しました"))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "エラーが発生しました: ${e.message}"))
        }
    }

    /**
     * 会話からイディオムを削除する
     */
    @DeleteMapping("/{conversationId}/idioms/{idiomId}")
    fun removeIdiomFromConversation(
        principal: Principal?,
        @PathVariable conversationId: String,
        @PathVariable idiomId: String
    ): ResponseEntity<Any> {
        // 認証確認（オプション：会話の編集権限を確認する場合）
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))

        try {
            // 関連を探す
            val relation = conversationIdiomEntityRepository.findAll()
                .find { it.conversationId == conversationId && it.idiomId == idiomId }
                ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(mapOf("error" to "指定されたイディオムは会話に含まれていません"))

            // 関連を削除
            conversationIdiomEntityRepository.delete(relation)

            return ResponseEntity.ok(mapOf("message" to "イディオムを会話から削除しました"))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "エラーが発生しました: ${e.message}"))
        }
    }
}

data class AddIdiomRequest(
    val idiomId: String
) 