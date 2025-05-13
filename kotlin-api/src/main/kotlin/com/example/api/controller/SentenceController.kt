package com.example.api.controller

import com.example.api.model.Sentence
import com.example.api.model.Idiom
import com.example.api.model.Grammar
import com.example.api.service.SentenceService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.format.DateTimeFormatter
import java.util.NoSuchElementException

data class SentenceRequest(
    val sentence: String,
    val translation: String,
    val source: String? = null,
    val idioms: List<IdiomRequest>? = null,
    val grammars: List<GrammarRequest>? = null
)

data class IdiomRequest(
    val idiom: String,
    val meaning: String,
    val example: String? = null
)

data class GrammarRequest(
    val pattern: String,
    val explanation: String,
    val level: String = "INTERMEDIATE"
)

data class GrammarResponse(
    val id: String,
    val pattern: String,
    val explanation: String,
    val level: String,
    val createdAt: String,
    val updatedAt: String
)

data class IdiomResponse(
    val id: String,
    val idiom: String,
    val meaning: String,
    val example: String?,
    val createdAt: String,
    val updatedAt: String
)

data class SentenceDetailResponse(
    val id: String,
    val sentence: String,
    val translation: String,
    val source: String?,
    val difficulty: String,
    val isAnalyzed: Boolean,
    val idioms: List<IdiomResponse>? = null,
    val grammars: List<GrammarResponse>? = null,
    val createdAt: String,
    val updatedAt: String
) {
    companion object {
        fun fromDomain(domain: Sentence): SentenceDetailResponse {
            val formatter = DateTimeFormatter.ISO_DATE_TIME
            return SentenceDetailResponse(
                id = domain.id,
                sentence = domain.sentence,
                translation = domain.translation,
                source = domain.source,
                difficulty = domain.difficulty.name,
                isAnalyzed = domain.isAnalyzed,
                idioms = domain.idioms?.map { idiom ->
                    IdiomResponse(
                        id = idiom.id,
                        idiom = idiom.idiom,
                        meaning = idiom.meaning,
                        example = idiom.example,
                        createdAt = formatter.format(idiom.createdAt),
                        updatedAt = formatter.format(idiom.updatedAt)
                    )
                },
                grammars = domain.grammars?.map { grammar ->
                    GrammarResponse(
                        id = grammar.id,
                        pattern = grammar.pattern,
                        explanation = grammar.explanation,
                        level = grammar.level.name,
                        createdAt = formatter.format(grammar.createdAt),
                        updatedAt = formatter.format(grammar.updatedAt)
                    )
                },
                createdAt = formatter.format(domain.createdAt),
                updatedAt = formatter.format(domain.updatedAt)
            )
        }
    }
}

@RestController
@RequestMapping("/api/sentences")
class SentenceController(private val sentenceService: SentenceService) {

    @PostMapping
    fun createSentence(@RequestBody request: SentenceRequest): ResponseEntity<SentenceDetailResponse> {
        val idioms = request.idioms?.map { 
            Idiom(
                idiom = it.idiom,
                meaning = it.meaning,
                example = it.example
            )
        }
        
        val grammars = request.grammars?.map {
            Grammar(
                pattern = it.pattern,
                explanation = it.explanation,
                level = when (it.level.uppercase()) {
                    "BEGINNER" -> com.example.api.model.GrammarLevel.BEGINNER
                    "ADVANCED" -> com.example.api.model.GrammarLevel.ADVANCED
                    else -> com.example.api.model.GrammarLevel.INTERMEDIATE
                }
            )
        }
        
        val sentence = Sentence(
            sentence = request.sentence,
            translation = request.translation,
            source = request.source,
            idioms = idioms,
            grammars = grammars
        )
        
        val result = sentenceService.registerSentence(sentence)
        return ResponseEntity.status(HttpStatus.CREATED).body(SentenceDetailResponse.fromDomain(result))
    }
    
    @GetMapping("/{id}")
    fun getSentence(@PathVariable id: String): ResponseEntity<SentenceDetailResponse> {
        return try {
            val sentence = sentenceService.getSentenceById(id)
            ResponseEntity.ok(SentenceDetailResponse.fromDomain(sentence))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping
    fun getAllSentences(): ResponseEntity<List<SentenceDetailResponse>> {
        val sentences = sentenceService.getAllSentences()
        return ResponseEntity.ok(sentences.map { SentenceDetailResponse.fromDomain(it) })
    }
} 