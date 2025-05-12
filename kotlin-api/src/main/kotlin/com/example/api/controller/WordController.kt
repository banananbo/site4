package com.example.api.controller

import com.example.api.model.Word
import com.example.api.service.WordService
import com.example.api.service.UserService
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

data class RegisterWordRequest(
    val word: String
)

data class WordResponse(
    val id: String,
    val word: String,
    val meaning: String,
    val partOfSpeech: String,
    val status: String,
    val learningStatus: String? = null,
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
                createdAt = word.createdAt.toString(),
                updatedAt = word.updatedAt.toString()
            )
        }
    }
}

@RestController
@RequestMapping("/api/words")
class WordController(
    private val wordService: WordService,
    private val userService: UserService
) {

    /**
     * 単語一覧を取得する
     */
    @GetMapping
    fun getWords(principal: Principal?): ResponseEntity<List<WordResponse>> {
        // ユーザーIDを取得
        val auth0Id = principal?.name
        val userId = auth0Id?.let { userService.findUserByAuth0Id(it).orElse(null)?.id }
        
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
        // ユーザーIDを取得
        val auth0Id = principal?.name
        val userId = auth0Id?.let { userService.findUserByAuth0Id(it).orElse(null)?.id }
        
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
}