package com.example.api.controller

import com.example.api.model.Word
import com.example.api.service.WordService
import com.example.api.service.UserService
import com.example.api.util.AuthUtils
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.core.context.SecurityContextHolder
import java.security.Principal
import java.util.NoSuchElementException

data class RegisterWordRequest(
    val word: String
)

data class SentenceResponse(
    val id: String,
    val sentence: String,
    val translation: String
)

data class WordResponse(
    val id: String,
    val word: String,
    val meaning: String,
    val partOfSpeech: String,
    val status: String,
    val learningStatus: String? = null,
    val sentences: List<SentenceResponse> = emptyList(),
    val createdAt: String? = null,
    val updatedAt: String? = null
) {
    companion object {
        fun fromWord(word: Word): WordResponse {
            return WordResponse(
                id = word.id,
                word = word.word,
                meaning = word.meaning,
                partOfSpeech = word.partOfSpeech,
                status = word.status.name,
                learningStatus = word.learningStatus?.name,
                sentences = word.sentences?.map { 
                    SentenceResponse(
                        id = it.id,
                        sentence = it.sentence,
                        translation = it.translation
                    )
                } ?: emptyList(),
                createdAt = word.createdAt.toString(),
                updatedAt = word.updatedAt.toString()
            )
        }
    }
}

data class WordRelationRequest(
    val wordId: String
)

data class WordRelationResponse(
    val success: Boolean,
    val message: String
)

@RestController
@RequestMapping("/api/words")
class WordController(
    private val wordService: WordService,
    private val userService: UserService
) {

    /**
     * ユーザーの単語一覧を取得する
     */
    @GetMapping("/user")
    fun getUserWords(
        principal: Principal?
    ): ResponseEntity<List<WordResponse>> {
        // AuthUtilsを使ってユーザーIDを取得
        val userId = principal?.let { AuthUtils.getUserIdFromPrincipal(it, userService) }
        
        // ページングと並び替えの設定
        val pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        // ユーザーの単語一覧を取得
        val words = if (userId != null) {
            wordService.getWordsByUserId(userId, pageable)
        } else {
            // 認証情報がない場合は空リストを返す
            emptyList()
        }
        
        return ResponseEntity.ok(words.map { WordResponse.fromWord(it) })
    }

    /**
     * 単語一覧を取得する
     */
    @GetMapping
    fun getWords(principal: Principal?): ResponseEntity<List<WordResponse>> {
        // AuthUtilsを使ってユーザーIDを取得
        val userId = principal?.let { AuthUtils.getUserIdFromPrincipal(it, userService) }
        
        // ページングと並び替えの設定
        val pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        // ユーザーの単語一覧を取得
        val words = if (userId != null) {
            wordService.getWordsByUserId(userId, pageable)
        } else {
            // 認証情報がない場合は空リストを返す
            emptyList()
        }
        
        return ResponseEntity.ok(words.map { WordResponse.fromWord(it) })
    }

    /**
     * 単語を登録する
     */
    @PostMapping
    fun registerWord(
        @RequestBody request: RegisterWordRequest,
        principal: Principal?
    ): ResponseEntity<WordResponse> {
        // AuthUtilsを使ってユーザーIDを取得
        val userId = principal?.let { AuthUtils.getUserIdFromPrincipal(it, userService) }
        
        val registeredWord = wordService.registerWord(request.word, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(WordResponse.fromWord(registeredWord))
    }

    /**
     * 単語を取得する
     */
    @GetMapping("/{id}")
    fun getWord(@PathVariable id: String): ResponseEntity<WordResponse> {
        val word = wordService.getWord(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(WordResponse.fromWord(word))
    }

    /**
     * 全単語一覧を取得する
     */
    @GetMapping("/all")
    fun getAllWords(): ResponseEntity<List<WordResponse>> {
        // ページングと並び替えの設定
        val pageable = PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        // 全単語リストを取得
        val words = wordService.getAllWords(pageable)
        
        return ResponseEntity.ok(words.map { WordResponse.fromWord(it) })
    }

    /**
     * ユーザーに単語を関連付ける
     */
    @PostMapping("/user/add")
    fun addWordToUser(
        @RequestBody request: WordRelationRequest,
        principal: Principal?
    ): ResponseEntity<WordRelationResponse> {
        // 認証情報がない場合
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(WordRelationResponse(false, "認証が必要です"))
        }
        
        // AuthUtilsを使ってユーザーIDを取得
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(WordRelationResponse(false, "ユーザー情報を取得できませんでした"))
        
        try {
            val result = wordService.addWordToUser(userId, request.wordId)
            return if (result) {
                ResponseEntity.ok(WordRelationResponse(true, "単語が追加されました"))
            } else {
                ResponseEntity.ok(WordRelationResponse(false, "既に追加されている単語です"))
            }
        } catch (e: NoSuchElementException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(WordRelationResponse(false, e.message ?: "単語が見つかりません"))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(WordRelationResponse(false, "エラーが発生しました: ${e.message}"))
        }
    }
    
    /**
     * ユーザーから単語の関連付けを削除する
     */
    @PostMapping("/user/remove")
    fun removeWordFromUser(
        @RequestBody request: WordRelationRequest,
        principal: Principal?
    ): ResponseEntity<WordRelationResponse> {
        // 認証情報がない場合
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(WordRelationResponse(false, "認証が必要です"))
        }
        
        // AuthUtilsを使ってユーザーIDを取得
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(WordRelationResponse(false, "ユーザー情報を取得できませんでした"))
        
        try {
            val result = wordService.removeWordFromUser(userId, request.wordId)
            return if (result) {
                ResponseEntity.ok(WordRelationResponse(true, "単語が削除されました"))
            } else {
                ResponseEntity.ok(WordRelationResponse(false, "関連付けられていない単語です"))
            }
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(WordRelationResponse(false, "エラーが発生しました: ${e.message}"))
        }
    }

    
}