package com.example.api.service

import com.example.api.entity.JobStatusEntity
import com.example.api.entity.JobTypeEntity
import com.example.api.entity.ProcessingJobEntity
import com.example.api.entity.SentenceEntity
import com.example.api.entity.WordEntity
import com.example.api.entity.WordSentenceEntity
import com.example.api.entity.WordStatusEntity
import com.example.api.repository.JobRepository
import com.example.api.repository.SentenceRepository
import com.example.api.repository.WordRepository
import com.example.api.repository.WordSentenceRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class JobService(
    private val jobRepository: JobRepository,
    private val wordRepository: WordRepository,
    private val sentenceRepository: SentenceRepository,
    private val wordSentenceRepository: WordSentenceRepository,
    private val openAIService: OpenAIService,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    
    @Value("\${app.job.batch-size:10}")
    private val batchSize: Int = 10
    
    @Value("\${app.job.max-retries:3}")
    private val maxRetries: Int = 3
    
    /**
     * 3分ごとに実行されるジョブ処理タスク
     */
    @Scheduled(fixedDelayString = "\${app.job.interval:180000}")
    @Transactional
    fun processJobs() {
        logger.info("ジョブ処理を開始します")
        
        // ペンディング状態のジョブを最大batchSize件取得
        val now = LocalDateTime.now()
        val jobs = jobRepository.findJobsForProcessing(
            JobStatusEntity.pending,
            maxRetries,
            PageRequest.of(0, batchSize)
        ).filter { job -> job.nextRetryAt == null || job.nextRetryAt!!.isBefore(now) }
        
        if (jobs.isEmpty()) {
            logger.info("処理対象のジョブがありません")
            return
        }
        
        logger.info("${jobs.size}件のジョブを処理します")
        
        jobs.forEach { job ->
            try {
                when (job.jobType) {
                    JobTypeEntity.word_processing -> processWordJob(job)
                    JobTypeEntity.batch_translation -> processBatchTranslationJob(job)
                    JobTypeEntity.learning_reminder -> processLearningReminderJob(job)
                }
            } catch (e: Exception) {
                handleJobError(job, e)
            }
        }
        
        logger.info("ジョブ処理が完了しました")
    }
    
    /**
     * 単語処理ジョブを処理する
     */
    @Transactional
    fun processWordJob(job: ProcessingJobEntity) {
        // ジョブのステータスを処理中に更新
        job.status = JobStatusEntity.processing
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
        
        try {
            // ペイロードからword_idを取得
            val payload = objectMapper.readTree(job.payload)
            val wordId = payload.get("word_id").asText()
            
            // 単語を取得
            val word = wordRepository.findById(wordId).orElseThrow {
                throw RuntimeException("単語が見つかりません (ID: $wordId)")
            }
            
            // 単語のステータスを処理中に更新
            word.status = WordStatusEntity.processing
            word.updatedAt = LocalDateTime.now()
            wordRepository.save(word)
            
            // 単語の処理を実行
            val processedWord = processWord(word)
            
            // 処理結果を保存
            word.meaning = processedWord.meaning
            word.partOfSpeech = processedWord.partOfSpeech
            word.status = WordStatusEntity.completed
            word.updatedAt = LocalDateTime.now()
            wordRepository.save(word)
            
            // ジョブを完了状態に更新
            job.status = JobStatusEntity.completed
            job.updatedAt = LocalDateTime.now()
            jobRepository.save(job)
            
            logger.info("単語処理ジョブ ${job.id} (単語: '${word.word}') の処理が完了しました")
        } catch (e: Exception) {
            handleJobError(job, e)
        }
    }
    
    /**
     * バッチ翻訳ジョブを処理する
     */
    @Transactional
    fun processBatchTranslationJob(job: ProcessingJobEntity) {
        // バッチ翻訳の処理を実装する
        // TODO: 実装
        logger.info("バッチ翻訳ジョブ ${job.id} の処理は現在実装されていません")
        
        // ジョブを完了状態に更新
        job.status = JobStatusEntity.completed
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
    }
    
    /**
     * 学習リマインダージョブを処理する
     */
    @Transactional
    fun processLearningReminderJob(job: ProcessingJobEntity) {
        // 学習リマインダーの処理を実装する
        // TODO: 実装
        logger.info("学習リマインダージョブ ${job.id} の処理は現在実装されていません")
        
        // ジョブを完了状態に更新
        job.status = JobStatusEntity.completed
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
    }
    
    /**
     * 単語を処理する（OpenAI APIを呼び出して意味や品詞、例文を取得）
     */
    private fun processWord(word: WordEntity): WordEntity {
        // OpenAI APIを使用して単語情報を取得
        val response = openAIService.processWord(word.word)
        
        // 単語情報を更新
        word.meaning = response.translation
        word.partOfSpeech = response.partOfSpeech
        
        // 例文を処理
        response.examples.forEach { example ->
            // 既存の例文を検索または新規作成
            val sentence = sentenceRepository.findBySentence(example.english) ?: SentenceEntity(
                id = UUID.randomUUID().toString(),
                sentence = example.english,
                translation = example.japanese,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            ).also { sentenceRepository.save(it) }
            
            // 単語と例文の関連付けを作成
            val wordSentence = WordSentenceEntity(
                id = UUID.randomUUID().toString(),
                wordId = word.id,
                sentenceId = sentence.id,
                createdAt = LocalDateTime.now()
            )
            wordSentenceRepository.save(wordSentence)
        }
        
        return word
    }
    
    /**
     * ジョブエラーを処理する
     */
    private fun handleJobError(job: ProcessingJobEntity, exception: Exception) {
        logger.error("ジョブ ${job.id} の処理中にエラーが発生しました: ${exception.message}", exception)
        
        // リトライカウントを増やす
        job.retryCount++
        job.errorMessage = exception.message ?: "Unknown error"
        
        // 最大リトライ回数に達したかチェック
        if (job.retryCount >= maxRetries) {
            // 最大リトライ回数に達した場合、エラー状態に設定
            job.status = JobStatusEntity.error
            
            // 単語処理ジョブの場合、対応する単語もエラー状態に設定
            if (job.jobType == JobTypeEntity.word_processing) {
                try {
                    val payload = objectMapper.readTree(job.payload)
                    val wordId = payload.get("word_id").asText()
                    wordRepository.findById(wordId).ifPresent { word ->
                        word.status = WordStatusEntity.error
                        word.updatedAt = LocalDateTime.now()
                        wordRepository.save(word)
                    }
                } catch (e: Exception) {
                    logger.error("単語ステータス更新中にエラーが発生しました: ${e.message}", e)
                }
            }
        } else {
            // リトライ可能な場合、再度ペンディング状態に設定
            job.status = JobStatusEntity.pending
            
            // 指数バックオフでリトライ時間を設定
            val delayMinutes = Math.pow(2.0, job.retryCount.toDouble()).toLong()
            job.nextRetryAt = LocalDateTime.now().plus(delayMinutes, ChronoUnit.MINUTES)
        }
        
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
    }
} 