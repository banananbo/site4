package com.example.api.controller

import com.example.api.entity.JobStatusEntity
import com.example.api.entity.JobTypeEntity
import com.example.api.entity.ProcessingJobEntity
import com.example.api.repository.JobRepository
import com.example.api.repository.SentenceRepository
import com.example.api.service.JobService
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.util.UUID
import java.util.NoSuchElementException
import java.security.Principal
import com.example.api.util.AuthUtils
import com.example.api.service.UserService

@RestController
@RequestMapping("/api/jobs")
class JobController(
    private val jobRepository: JobRepository,
    private val jobService: JobService,
    private val sentenceRepository: SentenceRepository,
    private val objectMapper: ObjectMapper,
    private val userService: UserService
) {

    /**
     * ジョブの状態を表示する
     */
    @GetMapping("/status")
    fun getJobStatus(): ResponseEntity<Map<String, Any>> {
        val pendingCount = jobRepository.findByStatus(JobStatusEntity.pending, PageRequest.of(0, 1)).size
        val processingCount = jobRepository.findByStatus(JobStatusEntity.processing, PageRequest.of(0, 1)).size
        val completedCount = jobRepository.findByStatus(JobStatusEntity.completed, PageRequest.of(0, 1)).size
        val errorCount = jobRepository.findByStatus(JobStatusEntity.error, PageRequest.of(0, 1)).size
        
        val pendingJobs = jobRepository.findByStatus(
            JobStatusEntity.pending, 
            PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map { mapOf(
            "id" to it.id,
            "type" to it.jobType.name,
            "created_at" to it.createdAt.toString(),
            "retry_count" to it.retryCount
        )}
        
        val processingJobs = jobRepository.findByStatus(
            JobStatusEntity.processing, 
            PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map { mapOf(
            "id" to it.id,
            "type" to it.jobType.name,
            "created_at" to it.createdAt.toString(),
            "updated_at" to it.updatedAt.toString()
        )}
        
        val recentCompletedJobs = jobRepository.findByStatus(
            JobStatusEntity.completed, 
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "updatedAt"))
        ).map { mapOf(
            "id" to it.id,
            "type" to it.jobType.name,
            "created_at" to it.createdAt.toString(),
            "completed_at" to it.updatedAt.toString()
        )}
        
        val recentErrorJobs = jobRepository.findByStatus(
            JobStatusEntity.error, 
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "updatedAt"))
        ).map { mapOf(
            "id" to it.id,
            "type" to it.jobType.name,
            "created_at" to it.createdAt.toString(),
            "error" to it.errorMessage,
            "retry_count" to it.retryCount
        )}
        
        return ResponseEntity.ok(mapOf(
            "counts" to mapOf(
                "pending" to pendingCount,
                "processing" to processingCount,
                "completed" to completedCount,
                "error" to errorCount
            ),
            "pending_jobs" to pendingJobs,
            "processing_jobs" to processingJobs,
            "recent_completed_jobs" to recentCompletedJobs,
            "recent_error_jobs" to recentErrorJobs
        ))
    }
    
    /**
     * 特定の文の解析ジョブを手動で実行する
     */
    @PostMapping("/analyze-sentence/{sentenceId}")
    fun analyzeSentence(@PathVariable sentenceId: String): ResponseEntity<Map<String, Any>> {
        try {
            // センテンスの存在を確認
            val sentence = sentenceRepository.findById(sentenceId).orElseThrow {
                throw NoSuchElementException("センテンスが見つかりません: $sentenceId")
            }
            
            // すでに解析済みの場合
            if (sentence.isAnalyzed) {
                return ResponseEntity.ok(mapOf(
                    "message" to "センテンスはすでに解析済みです",
                    "sentence_id" to sentenceId
                ))
            }
            
            // 新しいジョブを作成
            val now = LocalDateTime.now()
            val payload = mapOf(
                "sentence_id" to sentence.id,
                "sentence" to sentence.sentence,
                "translation" to sentence.translation
            )
            
            val job = ProcessingJobEntity(
                id = UUID.randomUUID().toString(),
                jobType = JobTypeEntity.sentence_analysis,
                payload = objectMapper.writeValueAsString(payload),
                status = JobStatusEntity.pending,
                retryCount = 0,
                nextRetryAt = null,
                createdAt = now,
                updatedAt = now
            )
            
            // ジョブを保存
            val savedJob = jobRepository.save(job)
            
            // 直接ジョブを実行
            jobService.processSentenceAnalysisJob(savedJob)
            
            return ResponseEntity.ok(mapOf(
                "message" to "センテンス解析処理を実行しました",
                "sentence_id" to sentenceId,
                "job_id" to savedJob.id
            ))
        } catch (e: NoSuchElementException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf(
                "error" to "センテンスが見つかりません",
                "sentence_id" to sentenceId
            ))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "error" to "エラーが発生しました: ${e.message}",
                "sentence_id" to sentenceId
            ))
        }
    }
    
    /**
     * 保留中のすべてのジョブを強制的に処理する
     */
    @PostMapping("/process-all")
    fun processAllJobs(): ResponseEntity<Map<String, Any>> {
        try {
            jobService.processJobs()
            return ResponseEntity.ok(mapOf(
                "message" to "すべての保留中ジョブの処理を開始しました"
            ))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf(
                "error" to "エラーが発生しました: ${e.message}"
            ))
        }
    }

    /**
     * 会話生成ジョブを登録する
     */
    @PostMapping("/conversation-generation")
    fun createConversationGenerationJob(
        principal: Principal?,
        @RequestBody request: ConversationGenerationJobRequest
    ): ResponseEntity<Map<String, Any>> {
        val userId = AuthUtils.getUserIdFromPrincipal(principal, userService)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "有効なユーザー情報を取得できませんでした"))
        val now = LocalDateTime.now()
        val jobId = UUID.randomUUID().toString()
        val payload = mapOf(
            "user_id" to userId.toString(),
            "situation" to request.situation,
            "level" to request.level,
            "idiom_ids" to request.idiomIds
        )
        val job = ProcessingJobEntity(
            id = jobId,
            jobType = JobTypeEntity.valueOf("conversation_generation"),
            payload = objectMapper.writeValueAsString(payload),
            status = JobStatusEntity.pending,
            retryCount = 0,
            nextRetryAt = null,
            createdAt = now,
            updatedAt = now
        )
        jobRepository.save(job)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf(
            "message" to "会話生成ジョブを登録しました",
            "job_id" to jobId
        ))
    }
}

// --- リクエストDTO ---
data class ConversationGenerationJobRequest(
    val situation: String,
    val level: Int? = null,
    val idiomIds: List<String>? = null
) 