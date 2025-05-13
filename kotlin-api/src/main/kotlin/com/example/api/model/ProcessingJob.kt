package com.example.api.model

import java.time.LocalDateTime
import java.util.UUID

enum class JobStatus {
    PENDING, PROCESSING, COMPLETED, ERROR
}

enum class JobType {
    WORD_PROCESSING, BATCH_TRANSLATION, LEARNING_REMINDER, SENTENCE_ANALYSIS
}

data class ProcessingJob(
    val id: String = UUID.randomUUID().toString(),
    val jobType: JobType,
    val payload: String, // JSONデータを文字列として格納
    val status: JobStatus = JobStatus.PENDING,
    val errorMessage: String? = null,
    val retryCount: Int = 0,
    val nextRetryAt: LocalDateTime? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 