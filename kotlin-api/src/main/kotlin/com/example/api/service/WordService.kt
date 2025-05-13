package com.example.api.service

import com.example.api.entity.JobStatusEntity
import com.example.api.entity.JobTypeEntity
import com.example.api.entity.LearningStatusEntity
import com.example.api.entity.ProcessingJobEntity
import com.example.api.entity.SentenceEntity
import com.example.api.entity.UserWordEntity
import com.example.api.entity.WordEntity
import com.example.api.entity.WordSentenceEntity
import com.example.api.entity.WordStatusEntity
import com.example.api.model.LearningStatus
import com.example.api.model.Sentence
import com.example.api.model.UserWord
import com.example.api.model.Word
import com.example.api.model.WordStatus
import com.example.api.repository.JobRepository
import com.example.api.repository.SentenceRepository
import com.example.api.repository.UserWordRepository
import com.example.api.repository.WordRepository
import com.example.api.repository.WordSentenceRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class WordService(
    private val wordRepository: WordRepository,
    private val userWordRepository: UserWordRepository,
    private val jobRepository: JobRepository,
    private val wordSentenceRepository: WordSentenceRepository,
    private val sentenceRepository: SentenceRepository,
    private val objectMapper: ObjectMapper
) {
    /**
     * 単語を登録する
     */
    @Transactional
    fun registerWord(word: String, userId: Long?): Word {
        // 既存の単語を確認
        val existingWord = wordRepository.findByWord(word)
        
        if (existingWord != null) {
            // 既存の単語が見つかった場合
            val wordDomain = existingWord.toDomain()
            
            // ユーザーIDが指定されていれば、ユーザーと単語の関連付けを作成
            if (userId != null) {
                createUserWordRelation(userId, wordDomain.id)
            }
            
            return wordDomain
        }
        
        // 新しい単語エンティティを作成
        val now = LocalDateTime.now()
        val wordId = UUID.randomUUID().toString()
        
        val wordEntity = WordEntity(
            id = wordId,
            word = word,
            meaning = "",
            partOfSpeech = "",
            status = WordStatusEntity.pending,
            createdBy = userId,
            createdAt = now,
            updatedAt = now
        )
        
        // 単語を保存
        val savedWord = wordRepository.save(wordEntity).toDomain()
        
        // ユーザーIDが指定されていれば、ユーザーと単語の関連付けを作成
        if (userId != null) {
            createUserWordRelation(userId, savedWord.id)
        }
        
        // 単語処理ジョブを作成
        createWordProcessingJob(savedWord)
        
        return savedWord
    }
    
    /**
     * ユーザーと単語の関連付けを作成する
     */
    private fun createUserWordRelation(userId: Long, wordId: String) {
        // 既存の関連付けを確認
        val existingRelations = userWordRepository.findByUserId(userId, PageRequest.of(0, 1000)).content
        val exists = existingRelations.any { it.wordId == wordId }
        
        if (!exists) {
            // 新しい関連付けを作成
            val now = LocalDateTime.now()
            val userWord = UserWord(
                userId = userId,
                wordId = wordId,
                learningStatus = LearningStatus.NEW,
                isFavorite = false,
                lastReviewedAt = null,
                createdAt = now,
                updatedAt = now
            )
            
            userWordRepository.save(UserWordEntity.fromDomain(userWord))
        }
    }
    
    /**
     * 指定IDの単語を取得する（例文も含む）
     */
    fun getWord(id: String): Word? {
        val wordEntity = wordRepository.findById(id).orElse(null) ?: return null
        val sentences = getSentencesForWord(id)
        
        return wordEntity.toDomain().copy(sentences = sentences)
    }
    
    /**
     * 単語に関連する例文を取得する
     */
    private fun getSentencesForWord(wordId: String): List<Sentence> {
        // 単語と例文の関連を取得
        val wordSentences = wordSentenceRepository.findByWordId(wordId)
        
        if (wordSentences.isEmpty()) {
            return emptyList()
        }
        
        // 例文IDを取得
        val sentenceIds = wordSentences.map { it.sentenceId }
        
        // 例文エンティティを取得して変換
        return sentenceRepository.findAllById(sentenceIds)
            .map { 
                Sentence(
                    id = it.id,
                    sentence = it.sentence,
                    translation = it.translation
                ) 
            }
    }
    
    /**
     * ユーザーIDに基づいて単語リストを取得する（例文も含む）
     */
    fun getWordsByUserId(userId: Long, pageable: Pageable): List<Word> {
        // user_wordsテーブルからユーザーに関連付けられた単語IDを取得
        val userWords = userWordRepository.findByUserId(userId, pageable).content
        
        // 単語IDのリストを作成
        val wordIds = userWords.map { it.wordId }
        
        // 単語IDに基づいて単語を取得
        val words = wordRepository.findAllById(wordIds)
            .map { it.toDomain() }
            .toList()
        
        // 各単語に例文を追加
        return words.map { word ->
            word.copy(sentences = getSentencesForWord(word.id))
        }
    }
    
    /**
     * 全単語リストを取得する（例文も含む）
     */
    fun getAllWords(pageable: Pageable): List<Word> {
        return wordRepository.findAll(pageable)
            .content
            .map { it.toDomain() }
            .map { word ->
                word.copy(sentences = getSentencesForWord(word.id))
            }
    }
    
    /**
     * 単語処理ジョブを作成する
     */
    private fun createWordProcessingJob(word: Word) {
        // 単語処理ジョブのペイロードを作成
        val payload = mapOf(
            "word_id" to word.id,
            "word" to word.word,
            "created_by" to word.createdBy
        )
        
        // 単語処理ジョブを作成
        val processingJob = ProcessingJobEntity(
            id = UUID.randomUUID().toString(),
            jobType = JobTypeEntity.word_processing,
            payload = objectMapper.writeValueAsString(payload),
            status = JobStatusEntity.pending,
            retryCount = 0,
            nextRetryAt = null,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        // ジョブを保存
        jobRepository.save(processingJob)
    }

    /**
     * ユーザーと単語の関連付けを追加する
     * @return 成功した場合はtrue、既に関連付けが存在する場合はfalse
     */
    @Transactional
    fun addWordToUser(userId: Long, wordId: String): Boolean {
        // 単語の存在確認
        if (!wordRepository.existsById(wordId)) {
            throw NoSuchElementException("単語が見つかりません: $wordId")
        }
        
        // 既存の関連付けを確認
        val userWords = userWordRepository.findByUserId(userId, PageRequest.of(0, 1000)).content
        val exists = userWords.any { it.wordId == wordId }
        
        if (exists) {
            return false // 既に関連付けが存在する
        }
        
        // 新しい関連付けを作成
        val now = LocalDateTime.now()
        val userWord = UserWord(
            userId = userId,
            wordId = wordId,
            learningStatus = LearningStatus.NEW,
            isFavorite = false,
            lastReviewedAt = null,
            createdAt = now,
            updatedAt = now
        )
        
        userWordRepository.save(UserWordEntity.fromDomain(userWord))
        return true
    }
    
    /**
     * ユーザーと単語の関連付けを削除する
     * @return 成功した場合はtrue、関連付けが存在しない場合はfalse
     */
    @Transactional
    fun removeWordFromUser(userId: Long, wordId: String): Boolean {
        // 関連付けを検索
        val userWords = userWordRepository.findByUserId(userId, PageRequest.of(0, 1000)).content
        val userWord = userWords.find { it.wordId == wordId }
        
        if (userWord == null) {
            return false // 関連付けが存在しない
        }
        
        // 関連付けを削除
        userWordRepository.deleteById(userWord.id)
        return true
    }

    /**
     * 単語の学習状態を更新する
     */
    @Transactional
    fun updateLearningStatus(wordId: String, userId: Long, learningStatus: LearningStatus): Word {
        // ワードの存在確認
        val wordEntity = wordRepository.findById(wordId).orElseThrow {
            throw RuntimeException("単語が見つかりません (ID: $wordId)")
        }
        
        // ユーザーと単語の関連を取得
        val userWordEntity = userWordRepository.findByUserIdAndWordId(userId, wordId) ?: run {
            // 関連がなければ作成する
            val now = LocalDateTime.now()
            val userWord = UserWord(
                userId = userId,
                wordId = wordId,
                learningStatus = learningStatus,
                isFavorite = false,
                lastReviewedAt = LocalDateTime.now(),
                createdAt = now,
                updatedAt = now
            )
            
            userWordRepository.save(UserWordEntity.fromDomain(userWord))
            return wordEntity.toDomain().copy(
                sentences = getSentencesForWord(wordId),
                learningStatus = learningStatus
            )
        }
        
        // 学習状態を更新
        val entityLearningStatus = when(learningStatus) {
            LearningStatus.NEW -> LearningStatusEntity.new
            LearningStatus.LEARNING -> LearningStatusEntity.learning
            LearningStatus.MASTERED -> LearningStatusEntity.mastered
        }
        
        userWordEntity.learningStatus = entityLearningStatus
        userWordEntity.lastReviewedAt = LocalDateTime.now()
        userWordEntity.updatedAt = LocalDateTime.now()
        
        userWordRepository.save(userWordEntity)
        
        // ワードのドメインモデルを返す（更新された学習状態を含む）
        return wordEntity.toDomain().copy(
            sentences = getSentencesForWord(wordId),
            learningStatus = learningStatus
        )
    }
}