package com.example.api.entity

import com.example.api.model.Word
import com.example.api.model.WordStatus
import java.time.LocalDateTime
import javax.persistence.*

enum class WordStatusEntity {
    pending, processing, completed, error
}

@Entity
@Table(name = "words")
data class WordEntity(
    @Id
    val id: String,
    
    @Column(nullable = false, unique = true)
    val word: String,
    
    @Column(nullable = false)
    var meaning: String,
    
    @Column(name = "part_of_speech", nullable = false)
    var partOfSpeech: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: WordStatusEntity,
    
    @Column(name = "created_by")
    val createdBy: Long?,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): Word {
        return Word(
            id = id,
            word = word,
            meaning = meaning,
            partOfSpeech = partOfSpeech,
            status = when(status) {
                WordStatusEntity.pending -> WordStatus.PENDING
                WordStatusEntity.processing -> WordStatus.PROCESSING
                WordStatusEntity.completed -> WordStatus.COMPLETED
                WordStatusEntity.error -> WordStatus.ERROR
            },
            createdBy = createdBy,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
    
    companion object {
        fun fromDomain(domain: Word): WordEntity {
            val entityStatus = when(domain.status) {
                WordStatus.PENDING -> WordStatusEntity.pending
                WordStatus.PROCESSING -> WordStatusEntity.processing
                WordStatus.COMPLETED -> WordStatusEntity.completed
                WordStatus.ERROR -> WordStatusEntity.error
            }
            
            return WordEntity(
                id = domain.id,
                word = domain.word,
                meaning = domain.meaning,
                partOfSpeech = domain.partOfSpeech,
                status = entityStatus,
                createdBy = domain.createdBy,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
}