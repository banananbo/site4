package com.example.api.controller

import com.example.api.entity.GrammarEntity
import com.example.api.entity.GrammarLevelEntity
import com.example.api.model.GrammarResponse
import com.example.api.repository.GrammarRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/grammars")
class GrammarController(
    private val grammarRepository: GrammarRepository
) {
    @GetMapping
    fun getGrammars(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) level: String?
    ): Page<GrammarResponse> {
        val pageRequest = PageRequest.of(page, size)
        
        val grammars = if (level != null) {
            val grammarLevel = try {
                GrammarLevelEntity.valueOf(level.lowercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid level: $level. Valid values are: beginner, intermediate, advanced")
            }
            grammarRepository.findByLevel(grammarLevel, pageRequest)
        } else {
            grammarRepository.findAll(pageRequest)
        }
        
        return grammars.map { GrammarResponse.from(it) }
    }
} 