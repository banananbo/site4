package com.example.api.entity

import java.time.LocalDateTime
import javax.persistence.*

@Entity
@Table(name = "speakers")
data class SpeakerEntity(
    @Id
    val id: String,
    val name: String,
    val age: Int?,
    val gender: String?,
    val nationality: String?,
    val setting: String?,
    val personality: String?,
    val image: String?,
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime
) 