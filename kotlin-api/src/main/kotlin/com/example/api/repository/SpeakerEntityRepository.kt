package com.example.api.repository

import com.example.api.entity.SpeakerEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpeakerEntityRepository : JpaRepository<SpeakerEntity, String> 