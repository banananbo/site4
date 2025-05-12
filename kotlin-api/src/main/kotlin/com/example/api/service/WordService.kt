package com.example.api.service

import com.example.api.entity.WordEntity
import com.example.api.entity.WordStatusEntity
import com.example.api.model.Word
import com.example.api.model.WordStatus
import com.example.api.repository.WordRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime
import java.util.*

@Service
class WordService(
    private val wordRepository: WordRepository
) {
    /**
     * 単語を登録する
     * 既に存在する場合は既存の単語を返す
     */
    @Transactional
    fun registerWord(wordText: String, userId: Long?): Word {
        // 既に単語が存在するか確認
        val normalizedWord = wordText.trim().lowercase()
        val existingWord = wordRepository.findByWord(normalizedWord)
        
        if (existingWord != null) {
            return existingWord.toDomain()
        }
        
        // 新しい単語を作成
        val newWord = WordEntity(
            id = UUID.randomUUID().toString(),
            word = normalizedWord,
            meaning = "",
            partOfSpeech = "",
            status = WordStatusEntity.pending,
            createdBy = userId,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        val savedWord = wordRepository.save(newWord)
        return savedWord.toDomain()
    }
    
    /**
     * 指定IDの単語を取得する
     */
    fun getWord(id: String): Word? {
        return wordRepository.findById(id)
            .map { it.toDomain() }
            .orElse(null)
    }
    
    /**
     * ユーザーIDに基づいて単語リストを取得する
     */
    fun getWordsByUserId(userId: Long, pageable: Pageable): List<Word> {
        return wordRepository.findByCreatedBy(userId, pageable)
            .content
            .map { it.toDomain() }
    }
}