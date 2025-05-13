package com.example.api.entity

import com.example.api.model.Idiom
import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "idioms")
data class IdiomEntity(
    @Id
    val id: String,
    
    @Column(nullable = false, unique = true)
    val idiom: String,
    
    @Column(nullable = false)
    val meaning: String,
    
    @Column
    val example: String?,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): Idiom {
        return Idiom(
            id = id,
            idiom = idiom,
            meaning = meaning,
            example = example,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
    
    companion object {
        fun fromDomain(domain: Idiom): IdiomEntity {
            return IdiomEntity(
                id = domain.id,
                idiom = domain.idiom,
                meaning = domain.meaning,
                example = domain.example,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 