package com.example.api.repository

import com.example.api.entity.UserConversationEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserConversationEntityRepository : JpaRepository<UserConversationEntity, String> 