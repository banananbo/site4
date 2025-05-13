package com.example.api.service

import com.example.api.entity.JobStatusEntity
import com.example.api.entity.JobTypeEntity
import com.example.api.entity.ProcessingJobEntity
import com.example.api.entity.SentenceEntity
import com.example.api.entity.SentenceDifficultyEntity
import com.example.api.entity.WordEntity
import com.example.api.entity.WordSentenceEntity
import com.example.api.entity.WordStatusEntity
import com.example.api.entity.IdiomEntity
import com.example.api.entity.GrammarEntity
import com.example.api.entity.GrammarLevelEntity
import com.example.api.entity.SentenceIdiomEntity
import com.example.api.entity.SentenceGrammarEntity
import com.example.api.model.SentenceAnalysisResponse
import com.example.api.repository.JobRepository
import com.example.api.repository.SentenceRepository
import com.example.api.repository.WordRepository
import com.example.api.repository.WordSentenceRepository
import com.example.api.repository.IdiomRepository
import com.example.api.repository.GrammarRepository
import com.example.api.repository.SentenceIdiomRepository
import com.example.api.repository.SentenceGrammarRepository
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
    private val objectMapper: ObjectMapper,
    private val idiomRepository: IdiomRepository,
    private val grammarRepository: GrammarRepository,
    private val sentenceIdiomRepository: SentenceIdiomRepository,
    private val sentenceGrammarRepository: SentenceGrammarRepository
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
                    JobTypeEntity.sentence_analysis -> processSentenceAnalysisJob(job)
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
     * 文分析ジョブを処理する
     */
    @Transactional
    fun processSentenceAnalysisJob(job: ProcessingJobEntity) {
        // ジョブのステータスを処理中に更新
        job.status = JobStatusEntity.processing
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
        
        try {
            // ペイロードからsentence_idを取得
            val payload = objectMapper.readTree(job.payload)
            val sentenceId = payload.get("sentence_id").asText()
            val sentenceText = payload.get("sentence").asText()
            val translationText = payload.get("translation").asText()
            
            logger.info("文分析ジョブを開始します: ${job.id}, センテンス: '$sentenceText'")
            
            // 文を取得
            val sentenceEntity = sentenceRepository.findById(sentenceId).orElseThrow {
                throw RuntimeException("文が見つかりません (ID: $sentenceId)")
            }
            
            // すでに分析済みの場合はスキップ
            if (sentenceEntity.isAnalyzed) {
                job.status = JobStatusEntity.completed
                job.updatedAt = LocalDateTime.now()
                jobRepository.save(job)
                logger.info("文分析ジョブ ${job.id} (文: '${sentenceText}') はすでに分析済みのためスキップしました")
                return
            }
            
            // OpenAI APIを使用して文の分析を実行
            logger.info("文分析のためにOpenAI APIを呼び出します: ${job.id}")
            val analysisResult = openAIService.analyzeSentence(sentenceText, translationText)
            logger.info("OpenAI API解析結果: イディオム数=${analysisResult.idioms.size}, 文法数=${analysisResult.grammars.size}")
            
            // 解析結果が空の場合
            if (analysisResult.idioms.isEmpty() && analysisResult.grammars.isEmpty()) {
                logger.warn("文分析の結果、イディオムと文法が見つかりませんでした: ${job.id}")
            }
            
            // 分析結果からイディオムを処理
            var idiomCount = 0
            analysisResult.idioms.forEach { idiomInfo: SentenceAnalysisResponse.IdiomInfo ->
                try {
                    logger.debug("イディオム処理: '${idiomInfo.idiom}'")
                    // イディオムを検索または新規作成
                    val idiomEntity = idiomRepository.findByIdiom(idiomInfo.idiom) ?: run {
                        // 新しいイディオムを保存
                        val newIdiom = IdiomEntity(
                            id = UUID.randomUUID().toString(),
                            idiom = idiomInfo.idiom,
                            meaning = idiomInfo.meaning,
                            example = idiomInfo.example,
                            createdAt = LocalDateTime.now(),
                            updatedAt = LocalDateTime.now()
                        )
                        logger.info("新しいイディオムを保存します: '${idiomInfo.idiom}'")
                        idiomRepository.save(newIdiom)
                    }
                    
                    // 既存の関連を確認
                    val existingRelation = sentenceIdiomRepository.findBySentenceIdAndIdiomId(sentenceId, idiomEntity.id)
                    if (existingRelation == null) {
                        // 文とイディオムの関連を保存
                        val sentenceIdiom = SentenceIdiomEntity(
                            id = UUID.randomUUID().toString(),
                            sentenceId = sentenceId,
                            idiomId = idiomEntity.id,
                            createdAt = LocalDateTime.now()
                        )
                        sentenceIdiomRepository.save(sentenceIdiom)
                        idiomCount++
                        logger.debug("センテンスとイディオムの関連付けを保存しました: '${idiomInfo.idiom}'")
                    } else {
                        logger.debug("センテンスとイディオムの関連付けは既に存在します: '${idiomInfo.idiom}'")
                    }
                } catch (e: Exception) {
                    logger.error("イディオム処理中にエラーが発生しました: ${e.message}", e)
                }
            }
            logger.info("処理したイディオム数: $idiomCount")
            
            // 分析結果から文法を処理
            var grammarCount = 0
            analysisResult.grammars.forEach { grammarInfo: SentenceAnalysisResponse.GrammarInfo ->
                try {
                    logger.debug("文法処理: '${grammarInfo.pattern}'")
                    // 文法を検索または新規作成
                    val grammarEntity = grammarRepository.findByPattern(grammarInfo.pattern) ?: run {
                        // 新しい文法を保存
                        val level = when (grammarInfo.level.uppercase()) {
                            "BEGINNER" -> GrammarLevelEntity.beginner
                            "ADVANCED" -> GrammarLevelEntity.advanced
                            else -> GrammarLevelEntity.intermediate
                        }
                        
                        val newGrammar = GrammarEntity(
                            id = UUID.randomUUID().toString(),
                            pattern = grammarInfo.pattern,
                            explanation = grammarInfo.explanation,
                            level = level,
                            createdAt = LocalDateTime.now(),
                            updatedAt = LocalDateTime.now()
                        )
                        logger.info("新しい文法を保存します: '${grammarInfo.pattern}'")
                        grammarRepository.save(newGrammar)
                    }
                    
                    // 既存の関連を確認
                    val existingRelation = sentenceGrammarRepository.findBySentenceIdAndGrammarId(sentenceId, grammarEntity.id)
                    if (existingRelation == null) {
                        // 文と文法の関連を保存
                        val sentenceGrammar = SentenceGrammarEntity(
                            id = UUID.randomUUID().toString(),
                            sentenceId = sentenceId,
                            grammarId = grammarEntity.id,
                            createdAt = LocalDateTime.now()
                        )
                        sentenceGrammarRepository.save(sentenceGrammar)
                        grammarCount++
                        logger.debug("センテンスと文法の関連付けを保存しました: '${grammarInfo.pattern}'")
                    } else {
                        logger.debug("センテンスと文法の関連付けは既に存在します: '${grammarInfo.pattern}'")
                    }
                } catch (e: Exception) {
                    logger.error("文法処理中にエラーが発生しました: ${e.message}", e)
                }
            }
            logger.info("処理した文法数: $grammarCount")
            
            // 文を分析済みに更新
            sentenceEntity.isAnalyzed = true
            
            // 分析結果に翻訳情報が含まれている場合は更新
            if (analysisResult.translation != null && analysisResult.translation.isNotBlank()) {
                logger.info("OpenAI APIから取得した翻訳で更新します: ${analysisResult.translation}")
                
                // 読み取り専用プロパティが含まれるため、新しいエンティティを作成して置き換え
                val updatedEntity = SentenceEntity(
                    id = sentenceEntity.id,
                    sentence = sentenceEntity.sentence,
                    translation = analysisResult.translation, // 新しい翻訳で更新
                    source = sentenceEntity.source,
                    difficulty = sentenceEntity.difficulty,
                    isAnalyzed = true,
                    createdAt = sentenceEntity.createdAt,
                    updatedAt = LocalDateTime.now()
                )
                
                // 更新された文を保存
                sentenceRepository.save(updatedEntity)
                logger.info("センテンスを分析済みに更新し、翻訳も更新しました: ${sentenceId}")
            } else {
                // 翻訳の更新がない場合は、既存の文を更新
                sentenceEntity.updatedAt = LocalDateTime.now()
                sentenceRepository.save(sentenceEntity)
                logger.info("センテンスを分析済みに更新しました: ${sentenceId}")
            }
            
            // ジョブを完了状態に更新
            job.status = JobStatusEntity.completed
            job.updatedAt = LocalDateTime.now()
            jobRepository.save(job)
            
            logger.info("文分析ジョブ ${job.id} の処理が完了しました。イディオム: ${idiomCount}件, 文法: ${grammarCount}件")
        } catch (e: Exception) {
            logger.error("文分析ジョブ ${job.id} の処理中にエラーが発生しました: ${e.message}", e)
            handleJobError(job, e)
        }
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
                source = null,
                difficulty = SentenceDifficultyEntity.medium,
                isAnalyzed = false,
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