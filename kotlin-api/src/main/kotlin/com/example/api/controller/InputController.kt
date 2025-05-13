package com.example.api.controller

import com.example.api.model.Sentence
import com.example.api.model.Word
import com.example.api.service.WordService
import com.example.api.service.SentenceService
import com.example.api.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.format.DateTimeFormatter
import java.util.regex.Pattern

/**
 * 汎用入力リクエスト（単語またはセンテンス）
 */
data class TextInputRequest(
    val text: String,
    val translation: String? = null
)

/**
 * 汎用レスポンス
 */
data class TextInputResponse(
    val id: String,
    val type: String, // "word" または "sentence"
    val text: String,
    val translation: String,
    val status: String,
    val createdAt: String,
    val updatedAt: String
)

@RestController
@RequestMapping("/api/input")
class InputController(
    private val wordService: WordService,
    private val sentenceService: SentenceService,
    private val userService: UserService
) {
    
    /**
     * テキスト入力を処理する（単語/センテンスを自動判定）
     */
    @PostMapping
    fun processInput(
        @RequestBody request: TextInputRequest,
        principal: Principal?
    ): ResponseEntity<TextInputResponse> {
        // ユーザーIDを取得
        val auth0Id = principal?.name
        val userId = auth0Id?.let { userService.findUserByAuth0Id(it).orElse(null)?.id }
        
        // 入力内容が単語かセンテンスかを判定
        val input = request.text.trim()
        
        // 入力が単語かどうかを判定するロジック
        val isWord = isInputWord(input)
        
        return if (isWord) {
            // 単語として処理
            processAsWord(input, userId)
        } else {
            // センテンスとして処理
            processAsSentence(input, request.translation, userId)
        }
    }
    
    /**
     * 単語として処理する
     */
    private fun processAsWord(word: String, userId: Long?): ResponseEntity<TextInputResponse> {
        val registeredWord = wordService.registerWord(word, userId)
        val formatter = DateTimeFormatter.ISO_DATE_TIME
        
        val response = TextInputResponse(
            id = registeredWord.id,
            type = "word",
            text = registeredWord.word,
            translation = registeredWord.meaning,
            status = registeredWord.status.name,
            createdAt = formatter.format(registeredWord.createdAt),
            updatedAt = formatter.format(registeredWord.updatedAt)
        )
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
    
    /**
     * センテンスとして処理する
     */
    private fun processAsSentence(sentenceText: String, translation: String?, userId: Long?): ResponseEntity<TextInputResponse> {
        // 翻訳が提供されていない場合は、空の文字列を使用
        val translationText = translation ?: ""
        
        val sentence = Sentence(
            sentence = sentenceText,
            translation = translationText
        )
        
        val registeredSentence = sentenceService.registerSentence(sentence, userId)
        val formatter = DateTimeFormatter.ISO_DATE_TIME
        
        val response = TextInputResponse(
            id = registeredSentence.id,
            type = "sentence",
            text = registeredSentence.sentence,
            translation = registeredSentence.translation,
            status = if (registeredSentence.isAnalyzed) "ANALYZED" else "PENDING",
            createdAt = formatter.format(registeredSentence.createdAt),
            updatedAt = formatter.format(registeredSentence.updatedAt)
        )
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
    
    /**
     * 入力が単語かセンテンスかを判定する
     * - スペースが含まれていないか
     * - 単語の最大長を超えていないか
     * - 句読点が含まれていないか
     */
    private fun isInputWord(input: String): Boolean {
        // 単語の最大長（一般的な単語の長さ制限）
        val MAX_WORD_LENGTH = 30
        
        // スペースが含まれていれば文章と判定
        if (input.contains(" ")) {
            return false
        }
        
        // 長すぎる場合は文章と判定
        if (input.length > MAX_WORD_LENGTH) {
            return false
        }
        
        // 句読点が含まれていれば文章と判定
        val punctuationPattern = Pattern.compile("[.,;:!?\"'()]")
        if (punctuationPattern.matcher(input).find()) {
            return false
        }
        
        // 上記のすべての条件をクリアした場合は単語と判定
        return true
    }
} 