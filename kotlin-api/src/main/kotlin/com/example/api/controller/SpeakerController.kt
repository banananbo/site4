package com.example.api.controller

import com.example.api.entity.SpeakerEntity
import com.example.api.repository.SpeakerRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/speakers")
class SpeakerController(
    private val speakerRepository: SpeakerRepository
) {
    @GetMapping
    fun getSpeakers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): Page<SpeakerResponse> {
        val pageRequest = PageRequest.of(page, size)
        return speakerRepository.findAll(pageRequest).map { it.toResponse() }
    }
}

data class SpeakerResponse(
    val id: String,
    val name: String,
    val age: Int?,
    val gender: String?,
    val nationality: String?,
    val setting: String?,
    val personality: String?,
    val image: String?,
    val createdAt: String
) {
    companion object {
        fun fromEntity(entity: SpeakerEntity): SpeakerResponse {
            return SpeakerResponse(
                id = entity.id,
                name = entity.name,
                age = entity.age,
                gender = entity.gender,
                nationality = entity.nationality,
                setting = entity.setting,
                personality = entity.personality,
                image = entity.image,
                createdAt = entity.createdAt.toString()
            )
        }
    }
}

private fun SpeakerEntity.toResponse() = SpeakerResponse.fromEntity(this) 