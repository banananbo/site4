package com.example.api.entity

import javax.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    val id: Long? = null,
    
    @Column(name = "auth0_id", nullable = false, unique = true)
    val auth0Id: String,
    
    @Column(name = "email", nullable = false)
    val email: String,
    
    @Column(name = "name", nullable = false)
    val name: String = "",
    
    @Column(name = "picture", nullable = true)
    val profilePicture: String? = null,
    
    @Column(name = "created_at", nullable = true)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = true)
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 