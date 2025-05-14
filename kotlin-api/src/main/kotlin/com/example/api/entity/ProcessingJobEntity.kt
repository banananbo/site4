package com.example.api.entity

import com.example.api.model.JobStatus
import java.time.LocalDateTime
import javax.persistence.*

enum class JobStatusEntity {
    pending, processing, completed, error
}

enum class JobTypeEntity {
    word_processing, batch_translation, learning_reminder, sentence_analysis, conversation_generation
}

@Entity
@Table(name = "processing_jobs")
data class ProcessingJobEntity(
    @Id
    val id: String,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    val jobType: JobTypeEntity,
    
    @Column(nullable = false, columnDefinition = "JSON")
    val payload: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: JobStatusEntity = JobStatusEntity.pending,
    
    @Column(name = "error_message")
    var errorMessage: String? = null,
    
    @Column(name = "retry_count", nullable = false)
    var retryCount: Int = 0,
    
    @Column(name = "next_retry_at")
    var nextRetryAt: LocalDateTime? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime,
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime
) {
    fun toDomain(): com.example.api.model.ProcessingJob {
        return com.example.api.model.ProcessingJob(
            id = id,
            jobType = when(jobType) {
                JobTypeEntity.word_processing -> com.example.api.model.JobType.WORD_PROCESSING
                JobTypeEntity.batch_translation -> com.example.api.model.JobType.BATCH_TRANSLATION
                JobTypeEntity.learning_reminder -> com.example.api.model.JobType.LEARNING_REMINDER
                JobTypeEntity.sentence_analysis -> com.example.api.model.JobType.SENTENCE_ANALYSIS
                JobTypeEntity.conversation_generation -> com.example.api.model.JobType.CONVERSATION_GENERATION
            },
            payload = payload,
            status = when(status) {
                JobStatusEntity.pending -> com.example.api.model.JobStatus.PENDING
                JobStatusEntity.processing -> com.example.api.model.JobStatus.PROCESSING
                JobStatusEntity.completed -> com.example.api.model.JobStatus.COMPLETED
                JobStatusEntity.error -> com.example.api.model.JobStatus.ERROR
            },
            errorMessage = errorMessage,
            retryCount = retryCount,
            nextRetryAt = nextRetryAt,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
    
    companion object {
        fun fromDomain(domain: com.example.api.model.ProcessingJob): ProcessingJobEntity {
            return ProcessingJobEntity(
                id = domain.id,
                jobType = when(domain.jobType) {
                    com.example.api.model.JobType.WORD_PROCESSING -> JobTypeEntity.word_processing
                    com.example.api.model.JobType.BATCH_TRANSLATION -> JobTypeEntity.batch_translation
                    com.example.api.model.JobType.LEARNING_REMINDER -> JobTypeEntity.learning_reminder
                    com.example.api.model.JobType.SENTENCE_ANALYSIS -> JobTypeEntity.sentence_analysis
                    com.example.api.model.JobType.CONVERSATION_GENERATION -> JobTypeEntity.conversation_generation
                },
                payload = domain.payload,
                status = when(domain.status) {
                    com.example.api.model.JobStatus.PENDING -> JobStatusEntity.pending
                    com.example.api.model.JobStatus.PROCESSING -> JobStatusEntity.processing
                    com.example.api.model.JobStatus.COMPLETED -> JobStatusEntity.completed
                    com.example.api.model.JobStatus.ERROR -> JobStatusEntity.error
                },
                errorMessage = domain.errorMessage,
                retryCount = domain.retryCount,
                nextRetryAt = domain.nextRetryAt,
                createdAt = domain.createdAt,
                updatedAt = domain.updatedAt
            )
        }
    }
} 