package com.example.api.repository

import com.example.api.model.Conversation

interface ConversationRepository {
    fun saveAggregate(conversation: Conversation, userId: String?)
    // 必要に応じてfindByIdWithAggregateなども追加可能
} 