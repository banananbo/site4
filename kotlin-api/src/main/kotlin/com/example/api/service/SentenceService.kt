package com.example.api.service

import com.example.api.entity.SentenceEntity
import com.example.api.entity.SentenceIdiomEntity
import com.example.api.entity.SentenceGrammarEntity
import com.example.api.entity.IdiomEntity
import com.example.api.entity.GrammarEntity
import com.example.api.model.Sentence
import com.example.api.model.Idiom
import com.example.api.model.Grammar
import com.example.api.repository.SentenceRepository
import com.example.api.repository.IdiomRepository
import com.example.api.repository.GrammarRepository
import com.example.api.repository.SentenceIdiomRepository
import com.example.api.repository.SentenceGrammarRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID
import java.util.NoSuchElementException
import org.slf4j.LoggerFactory

@Service
class SentenceService(
    private val sentenceRepository: SentenceRepository,
    private val idiomRepository: IdiomRepository,
    private val grammarRepository: GrammarRepository,
    private val sentenceIdiomRepository: SentenceIdiomRepository,
    private val sentenceGrammarRepository: SentenceGrammarRepository
) {
    private val logger = LoggerFactory.getLogger(SentenceService::class.java)

    /**
     * 文を登録する
     */
    @Transactional
    fun registerSentence(sentence: Sentence): Sentence {
        // 既存の文を検索
        val existingSentence = sentenceRepository.findBySentence(sentence.sentence)
        if (existingSentence != null) {
            logger.info("文が既に存在します: ${sentence.sentence}")
            return existingSentence.toDomain()
        }

        // 新しい文を保存
        val sentenceEntity = SentenceEntity.fromDomain(sentence)
        val savedSentence = sentenceRepository.save(sentenceEntity)
        logger.info("新しい文を登録しました: ${sentence.sentence}")

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

        return getSentenceById(savedSentence.id)
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
} 