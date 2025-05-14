package com.example.api.service

import com.example.api.entity.SentenceEntity
import com.example.api.entity.SentenceIdiomEntity
import com.example.api.entity.SentenceGrammarEntity
import com.example.api.entity.IdiomEntity
import com.example.api.entity.GrammarEntity
import com.example.api.entity.ProcessingJobEntity
import com.example.api.entity.JobStatusEntity
import com.example.api.entity.JobTypeEntity
import com.example.api.entity.UserSentenceEntity
import com.example.api.entity.LearningStatusEntity
import com.example.api.model.Sentence
import com.example.api.model.Idiom
import com.example.api.model.Grammar
import com.example.api.model.UserSentence
import com.example.api.model.LearningStatus
import com.example.api.repository.SentenceRepository
import com.example.api.repository.IdiomRepository
import com.example.api.repository.GrammarRepository
import com.example.api.repository.SentenceIdiomRepository
import com.example.api.repository.SentenceGrammarRepository
import com.example.api.repository.JobRepository
import com.example.api.repository.UserSentenceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime
import java.util.UUID
import java.util.NoSuchElementException
import org.slf4j.LoggerFactory
import com.fasterxml.jackson.databind.ObjectMapper

@Service
class SentenceService(
    private val sentenceRepository: SentenceRepository,
    private val idiomRepository: IdiomRepository,
    private val grammarRepository: GrammarRepository,
    private val sentenceIdiomRepository: SentenceIdiomRepository,
    private val sentenceGrammarRepository: SentenceGrammarRepository,
    private val jobRepository: JobRepository,
    private val userSentenceRepository: UserSentenceRepository,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(SentenceService::class.java)

    /**
     * 文を登録する
     */
    @Transactional
    fun registerSentence(sentence: Sentence, userId: Long? = null): Sentence {
        // 既存の文を検索
        val existingSentence = sentenceRepository.findBySentence(sentence.sentence)
        if (existingSentence != null) {
            logger.info("文が既に存在します: ${sentence.sentence}")
            // 既存の文が分析されていない場合は分析ジョブを作成
            if (!existingSentence.isAnalyzed) {
                createSentenceAnalysisJob(existingSentence.toDomain())
            }

            // ユーザーIDが指定されていれば、ユーザーとセンテンスの関連付けを作成
            if (userId != null) {
                createUserSentenceRelation(userId, existingSentence.id)
            }

            return existingSentence.toDomain()
        }

        // 新しい文を保存
        val sentenceEntity = SentenceEntity.fromDomain(sentence)
        val savedSentence = sentenceRepository.save(sentenceEntity)
        logger.info("新しい文を登録しました: ${sentence.sentence}")

        // ユーザーIDが指定されていれば、ユーザーとセンテンスの関連付けを作成
        if (userId != null) {
            createUserSentenceRelation(userId, savedSentence.id)
        }

        // イディオムを処理（存在する場合）
        sentence.idioms?.forEach { idiom ->
            // イディオムを保存または取得
            val idiomEntity = idiomRepository.findByIdiom(idiom.idiom) ?: run {
                val newIdiom = idiomRepository.save(idiom.run {
                    IdiomEntity.fromDomain(this)
                })
                logger.info("新しいイディオムを登録しました: ${idiom.idiom}")
                newIdiom
            }

            // 文とイディオムの関連を保存
            val sentenceIdiom = SentenceIdiomEntity(
                id = UUID.randomUUID().toString(),
                sentenceId = savedSentence.id,
                idiomId = idiomEntity.id,
                createdAt = LocalDateTime.now()
            )
            sentenceIdiomRepository.save(sentenceIdiom)
        }

        // 文法を処理（存在する場合）
        sentence.grammars?.forEach { grammar ->
            // 文法を保存または取得
            val grammarEntity = grammarRepository.findByPattern(grammar.pattern) ?: run {
                val newGrammar = grammarRepository.save(grammar.run {
                    GrammarEntity.fromDomain(this)
                })
                logger.info("新しい文法を登録しました: ${grammar.pattern}")
                newGrammar
            }

            // 文と文法の関連を保存
            val sentenceGrammar = SentenceGrammarEntity(
                id = UUID.randomUUID().toString(),
                sentenceId = savedSentence.id,
                grammarId = grammarEntity.id,
                createdAt = LocalDateTime.now()
            )
            sentenceGrammarRepository.save(sentenceGrammar)
        }

        // 文の分析ジョブを作成（イディオムと文法が事前に指定されていない場合）
        if ((sentence.idioms == null || sentence.idioms.isEmpty()) && 
            (sentence.grammars == null || sentence.grammars.isEmpty())) {
            createSentenceAnalysisJob(savedSentence.toDomain())
        }

        return getSentenceById(savedSentence.id)
    }

    /**
     * ユーザーとセンテンスの関連付けを作成する
     */
    private fun createUserSentenceRelation(userId: Long?, sentenceId: String) {
        // ユーザーIDがnullの場合は何もしない
        if (userId == null) {
            return
        }
        
        // 既存の関連付けを確認
        val existingRelation = userSentenceRepository.findByUserIdAndSentenceId(userId, sentenceId)
        
        if (existingRelation == null) {
            // 新しい関連付けを作成
            val now = LocalDateTime.now()
            val userSentence = UserSentence(
                userId = userId,
                sentenceId = sentenceId,
                learningStatus = LearningStatus.NEW,
                isFavorite = false,
                lastReviewedAt = null,
                createdAt = now,
                updatedAt = now
            )
            
            userSentenceRepository.save(UserSentenceEntity.fromDomain(userSentence))
            logger.info("ユーザー(ID: $userId)とセンテンス(ID: $sentenceId)の関連付けを作成しました")
        } else {
            logger.info("ユーザー(ID: $userId)とセンテンス(ID: $sentenceId)の関連付けは既に存在します")
        }
    }

    /**
     * 文のIDによる取得
     */
    @Transactional(readOnly = true)
    fun getSentenceById(id: String): Sentence {
        val sentenceEntity = sentenceRepository.findById(id)
            .orElseThrow { NoSuchElementException("文が見つかりません: $id") }

        // イディオムとの関連を取得
        val idiomRelations = sentenceIdiomRepository.findBySentenceId(id)
        val idioms = idiomRelations.mapNotNull { relation ->
            idiomRepository.findById(relation.idiomId).orElse(null)?.toDomain()
        }

        // 文法との関連を取得
        val grammarRelations = sentenceGrammarRepository.findBySentenceId(id)
        val grammars = grammarRelations.mapNotNull { relation ->
            grammarRepository.findById(relation.grammarId).orElse(null)?.toDomain()
        }

        // ドメインモデルに変換して返す
        return sentenceEntity.toDomain().copy(
            idioms = idioms,
            grammars = grammars
        )
    }

    /**
     * ユーザーIDに基づいてセンテンスリストを取得する
     */
    @Transactional(readOnly = true)
    fun getSentencesByUserId(userId: Long?, pageable: Pageable): List<Sentence> {
        // ユーザーIDがnullの場合は空リストを返す
        if (userId == null) {
            return emptyList()
        }
        
        // user_sentencesテーブルからユーザーに関連付けられたセンテンスIDを取得
        val userSentences = userSentenceRepository.findByUserId(userId, pageable).content
        
        // センテンスIDのリストを作成
        val sentenceIds = userSentences.map { it.sentenceId }
        
        // ユーザーセンテンスをIDでマップ化して高速アクセスできるようにする
        val userSentenceMap = userSentences.associateBy { it.sentenceId }
        
        // センテンスIDに基づいてセンテンスを取得
        return sentenceRepository.findAllById(sentenceIds)
            .map { entity ->
                val idioms = sentenceIdiomRepository.findBySentenceId(entity.id)
                    .mapNotNull { idiomRepository.findById(it.idiomId).orElse(null)?.toDomain() }

                val grammars = sentenceGrammarRepository.findBySentenceId(entity.id)
                    .mapNotNull { grammarRepository.findById(it.grammarId).orElse(null)?.toDomain() }

                // ユーザーセンテンス関連から学習ステータスを取得
                val userSentence = userSentenceMap[entity.id]
                val learningStatus = userSentence?.learningStatus?.let {
                    when(it) {
                        LearningStatusEntity.new -> LearningStatus.NEW
                        LearningStatusEntity.learning -> LearningStatus.LEARNING
                        LearningStatusEntity.mastered -> LearningStatus.MASTERED
                    }
                }

                entity.toDomain().copy(
                    idioms = idioms,
                    grammars = grammars,
                    learningStatus = learningStatus
                )
            }
    }

    /**
     * すべての文を取得
     */
    @Transactional(readOnly = true)
    fun getAllSentences(): List<Sentence> {
        return sentenceRepository.findAll().map { entity ->
            val idioms = sentenceIdiomRepository.findBySentenceId(entity.id)
                .mapNotNull { idiomRepository.findById(it.idiomId).orElse(null)?.toDomain() }

            val grammars = sentenceGrammarRepository.findBySentenceId(entity.id)
                .mapNotNull { grammarRepository.findById(it.grammarId).orElse(null)?.toDomain() }

            entity.toDomain().copy(
                idioms = idioms,
                grammars = grammars
            )
        }
    }

    /**
     * 文の分析ジョブを作成する
     */
    private fun createSentenceAnalysisJob(sentence: Sentence) {
        // 文分析ジョブのペイロードを作成
        val payload = mapOf(
            "sentence_id" to sentence.id,
            "sentence" to sentence.sentence,
            "translation" to sentence.translation
        )
        
        // 文分析ジョブを作成
        val processingJob = ProcessingJobEntity(
            id = UUID.randomUUID().toString(),
            jobType = JobTypeEntity.sentence_analysis,
            payload = objectMapper.writeValueAsString(payload),
            status = JobStatusEntity.pending,
            retryCount = 0,
            nextRetryAt = null,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        // ジョブを保存
        jobRepository.save(processingJob)
        logger.info("文分析ジョブを作成しました: ${sentence.id} (${sentence.sentence})")
    }

    /**
     * ユーザーにセンテンスを関連付ける
     * @return 成功した場合はtrue、既に関連付けが存在する場合はfalse
     */
    @Transactional
    fun addSentenceToUser(userId: Long?, sentenceId: String): Boolean {
        // ユーザーIDがnullの場合は失敗
        if (userId == null) {
            return false
        }
        
        // 既存の関連付けを確認
        val existingRelation = userSentenceRepository.findByUserIdAndSentenceId(userId, sentenceId)
        if (existingRelation != null) {
            // 既に関連付けが存在する場合
            return false
        }

        // センテンスの存在を確認
        val sentenceEntity = sentenceRepository.findById(sentenceId)
            .orElseThrow { NoSuchElementException("センテンスが見つかりません: $sentenceId") }

        // 新しい関連付けを作成
        createUserSentenceRelation(userId, sentenceId)
        return true
    }

    /**
     * ユーザーからセンテンスの関連付けを削除する
     * @return 成功した場合はtrue、関連付けが存在しない場合はfalse
     */
    @Transactional
    fun removeSentenceFromUser(userId: Long?, sentenceId: String): Boolean {
        // ユーザーIDがnullの場合は失敗
        if (userId == null) {
            return false
        }
        
        // 既存の関連付けを確認
        val existingRelation = userSentenceRepository.findByUserIdAndSentenceId(userId, sentenceId)
            ?: return false // 関連付けが存在しない場合

        // 関連付けを削除
        userSentenceRepository.delete(existingRelation)
        logger.info("ユーザー(ID: $userId)とセンテンス(ID: $sentenceId)の関連付けを削除しました")
        return true
    }

    /**
     * センテンスの学習状態を更新する
     */
    @Transactional
    fun updateLearningStatus(sentenceId: String, userId: Long, learningStatus: LearningStatus): Sentence {
        // センテンスの存在確認
        val sentenceEntity = sentenceRepository.findById(sentenceId).orElseThrow {
            throw RuntimeException("センテンスが見つかりません (ID: $sentenceId)")
        }
        
        // ユーザーと文の関連を取得
        val userSentenceEntity = userSentenceRepository.findByUserIdAndSentenceId(userId, sentenceId)
        
        if (userSentenceEntity == null) {
            // 関連がなければ新規作成
            val now = LocalDateTime.now()
            val entityLearningStatus = when(learningStatus) {
                LearningStatus.NEW -> LearningStatusEntity.new
                LearningStatus.LEARNING -> LearningStatusEntity.learning
                LearningStatus.MASTERED -> LearningStatusEntity.mastered
            }
            
            val newUserSentence = UserSentenceEntity(
                id = UUID.randomUUID().toString(),
                userId = userId,
                sentenceId = sentenceId,
                learningStatus = entityLearningStatus,
                isFavorite = false,
                lastReviewedAt = LocalDateTime.now(),
                createdAt = now,
                updatedAt = now
            )
            
            userSentenceRepository.save(newUserSentence)
            logger.info("ユーザー(ID: $userId)とセンテンス(ID: $sentenceId)の関連を作成し、学習状態を${learningStatus}に設定しました")
        } else {
            // 既存の関連を更新
            // UserSentenceEntityのlearningStatusがvalで定義されているため、新しいインスタンスを作成して置き換え
            val entityLearningStatus = when(learningStatus) {
                LearningStatus.NEW -> LearningStatusEntity.new
                LearningStatus.LEARNING -> LearningStatusEntity.learning
                LearningStatus.MASTERED -> LearningStatusEntity.mastered
            }
            
            val updatedUserSentence = UserSentenceEntity(
                id = userSentenceEntity.id,
                userId = userSentenceEntity.userId,
                sentenceId = userSentenceEntity.sentenceId,
                learningStatus = entityLearningStatus,
                isFavorite = userSentenceEntity.isFavorite,
                lastReviewedAt = LocalDateTime.now(),
                createdAt = userSentenceEntity.createdAt,
                updatedAt = LocalDateTime.now()
            )

            logger.info("--------------------------------")
            logger.info("updatedUserSentence.learningStatus: ${updatedUserSentence.learningStatus}")
            logger.info("--------------------------------")
            
            userSentenceRepository.save(updatedUserSentence)
            logger.info("ユーザー(ID: $userId)のセンテンス(ID: $sentenceId)の学習状態を${learningStatus}に更新しました")
        }
        
        // センテンスの詳細情報を取得して返す
       // return getSentenceById(sentenceId)
        return sentenceEntity.toDomain().copy(
            learningStatus = learningStatus
        )
    }
} 