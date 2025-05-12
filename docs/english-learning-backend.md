# 英語学習システム バックエンド設計

## アーキテクチャ概要

バックエンドは以下のコンポーネントで構成されます：

1. **RESTful API サーバー**：フロントエンドからのリクエストを処理
2. **ジョブスケジューラ**：定期的にOpenAI API呼び出しジョブを実行
3. **OpenAI APIクライアント**：単語の翻訳、品詞、例文生成を行う

## ディレクトリ構造

```
kotlin-api/
  ├── src/
  │   ├── main/
  │   │   ├── kotlin/
  │   │   │   ├── com/
  │   │   │   │   ├── site4b/
  │   │   │   │   │   ├── config/
  │   │   │   │   │   │   ├── AppConfig.kt         # アプリ設定
  │   │   │   │   │   │   ├── SecurityConfig.kt    # セキュリティ設定
  │   │   │   │   │   │   └── JobConfig.kt         # ジョブスケジューラ設定
  │   │   │   │   │   ├── controller/
  │   │   │   │   │   │   └── WordController.kt    # 単語関連エンドポイント
  │   │   │   │   │   ├── service/
  │   │   │   │   │   │   ├── WordService.kt       # 単語関連ビジネスロジック
  │   │   │   │   │   │   ├── OpenAIService.kt     # OpenAI API通信
  │   │   │   │   │   │   └── JobService.kt        # ジョブ処理サービス
  │   │   │   │   │   ├── repository/
  │   │   │   │   │   │   ├── WordRepository.kt    # 単語データアクセス
  │   │   │   │   │   │   └── JobRepository.kt     # ジョブデータアクセス
  │   │   │   │   │   ├── model/
  │   │   │   │   │   │   ├── entity/
  │   │   │   │   │   │   │   ├── User.kt          # ユーザーエンティティ
  │   │   │   │   │   │   │   ├── Word.kt          # 単語エンティティ
  │   │   │   │   │   │   │   ├── WordDetail.kt    # 単語詳細エンティティ
  │   │   │   │   │   │   │   └── ProcessingJob.kt # ジョブエンティティ
  │   │   │   │   │   │   └── dto/
  │   │   │   │   │   │       ├── WordRequest.kt   # 単語リクエストDTO
  │   │   │   │   │   │       ├── WordResponse.kt  # 単語レスポンスDTO
  │   │   │   │   │   │       └── OpenAIResponse.kt # OpenAIレスポンスDTO
  │   │   │   │   │   └── EnglishLearningApplication.kt # メインクラス
  │   │   ├── resources/
  │   │   │   ├── application.yml      # アプリケーション設定
  │   │   │   └── db/
  │   │   │       └── migration/       # Flyway DBマイグレーション
  │   └── test/                        # テストコード
```

## 主要コンポーネント設計

### 1. エンティティクラス

#### Word.kt
```kotlin
package com.site4b.model.entity

import java.time.LocalDateTime
import java.util.UUID
import javax.persistence.*

enum class WordStatus {
    PENDING, PROCESSING, COMPLETED, ERROR
}

@Entity
@Table(name = "words")
data class Word(
    @Id
    val id: String = UUID.randomUUID().toString(),
    
    @Column(nullable = false)
    val userId: String,
    
    @Column(nullable = false)
    val word: String,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: WordStatus = WordStatus.PENDING,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),
    
    @OneToOne(mappedBy = "word", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var detail: WordDetail? = null,
    
    @OneToOne(mappedBy = "word", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var processingJob: ProcessingJob? = null
)
```

#### WordDetail.kt
```kotlin
package com.site4b.model.entity

import java.time.LocalDateTime
import java.util.UUID
import javax.persistence.*

@Entity
@Table(name = "word_details")
data class WordDetail(
    @Id
    val id: String = UUID.randomUUID().toString(),
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    val word: Word,
    
    @Column(nullable = false)
    val translation: String,
    
    @Column(name = "part_of_speech", nullable = false)
    val partOfSpeech: String,
    
    @Column(name = "example_sentence", nullable = false)
    val exampleSentence: String,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
```

#### ProcessingJob.kt
```kotlin
package com.site4b.model.entity

import java.time.LocalDateTime
import java.util.UUID
import javax.persistence.*

enum class JobStatus {
    PENDING, PROCESSING, COMPLETED, ERROR
}

@Entity
@Table(name = "processing_jobs")
data class ProcessingJob(
    @Id
    val id: String = UUID.randomUUID().toString(),
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false, unique = true)
    val word: Word,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: JobStatus = JobStatus.PENDING,
    
    @Column(name = "error_message")
    var errorMessage: String? = null,
    
    @Column(name = "retry_count", nullable = false)
    var retryCount: Int = 0,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
```

### 2. リポジトリ

#### WordRepository.kt
```kotlin
package com.site4b.repository

import com.site4b.model.entity.Word
import com.site4b.model.entity.WordStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface WordRepository : JpaRepository<Word, String> {
    fun findByUserId(userId: String, pageable: Pageable): Page<Word>
    fun findByUserIdAndStatus(userId: String, status: WordStatus, pageable: Pageable): Page<Word>
}
```

#### JobRepository.kt
```kotlin
package com.site4b.repository

import com.site4b.model.entity.ProcessingJob
import com.site4b.model.entity.JobStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface JobRepository : JpaRepository<ProcessingJob, String> {
    fun findByStatus(status: JobStatus, pageable: org.springframework.data.domain.Pageable): List<ProcessingJob>
    
    @Query("SELECT j FROM ProcessingJob j WHERE j.status = :status AND j.retryCount < :maxRetries ORDER BY j.createdAt ASC")
    fun findJobsForProcessing(
        @Param("status") status: JobStatus,
        @Param("maxRetries") maxRetries: Int,
        pageable: org.springframework.data.domain.Pageable
    ): List<ProcessingJob>
}
```

### 3. サービスクラス

#### WordService.kt
```kotlin
package com.site4b.service

import com.site4b.model.dto.WordRequest
import com.site4b.model.dto.WordResponse
import com.site4b.model.entity.ProcessingJob
import com.site4b.model.entity.Word
import com.site4b.model.entity.WordStatus
import com.site4b.repository.JobRepository
import com.site4b.repository.WordRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class WordService(
    private val wordRepository: WordRepository,
    private val jobRepository: JobRepository
) {
    @Transactional
    fun addWord(userId: String, request: WordRequest): WordResponse {
        // 1. 単語エンティティの作成
        val word = Word(
            userId = userId,
            word = request.word.trim().lowercase()
        )
        
        // 2. 単語を保存
        val savedWord = wordRepository.save(word)
        
        // 3. 処理ジョブを作成
        val job = ProcessingJob(word = savedWord)
        jobRepository.save(job)
        
        // 4. レスポンスの生成と返却
        return WordResponse.fromEntity(savedWord)
    }
    
    fun getWordsByUserId(userId: String, status: WordStatus?, pageable: Pageable): Page<WordResponse> {
        val wordsPage = if (status != null) {
            wordRepository.findByUserIdAndStatus(userId, status, pageable)
        } else {
            wordRepository.findByUserId(userId, pageable)
        }
        
        return wordsPage.map { WordResponse.fromEntity(it) }
    }
    
    fun getWordById(id: String): WordResponse? {
        val word = wordRepository.findById(id).orElse(null) ?: return null
        return WordResponse.fromEntity(word)
    }
    
    @Transactional
    fun updateWordStatus(wordId: String, status: WordStatus) {
        val word = wordRepository.findById(wordId).orElse(null) ?: return
        word.status = status
        word.updatedAt = LocalDateTime.now()
        wordRepository.save(word)
    }
}
```

#### OpenAIService.kt
```kotlin
package com.site4b.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.site4b.model.dto.OpenAIResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class OpenAIService(
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper
) {
    @Value("\${openai.api.key}")
    private lateinit var apiKey: String
    
    @Value("\${openai.api.url}")
    private lateinit var apiUrl: String
    
    @Value("\${openai.model}")
    private lateinit var model: String
    
    fun processWord(word: String): OpenAIResponse {
        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_JSON
            setBearerAuth(apiKey)
        }
        
        val requestBody = mapOf(
            "model" to model,
            "messages" to listOf(
                mapOf(
                    "role" to "system",
                    "content" to "あなたは英語学習アシスタントです。以下の英単語に対して、(1)日本語訳、(2)品詞、(3)例文を提供してください。応答は厳密にJSON形式で行ってください。"
                ),
                mapOf(
                    "role" to "user",
                    "content" to "単語: $word"
                )
            ),
            "response_format" to mapOf("type" to "json_object")
        )
        
        val request = HttpEntity(objectMapper.writeValueAsString(requestBody), headers)
        val response = restTemplate.postForEntity(apiUrl, request, Map::class.java)
        
        val choices = response.body?.get("choices") as List<Map<String, Any>>
        val content = (choices[0]["message"] as Map<String, Any>)["content"] as String
        
        return objectMapper.readValue(content, OpenAIResponse::class.java)
    }
}
```

#### JobService.kt
```kotlin
package com.site4b.service

import com.site4b.model.entity.JobStatus
import com.site4b.model.entity.ProcessingJob
import com.site4b.model.entity.WordDetail
import com.site4b.model.entity.WordStatus
import com.site4b.repository.JobRepository
import com.site4b.repository.WordRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class JobService(
    private val jobRepository: JobRepository,
    private val wordRepository: WordRepository,
    private val openAIService: OpenAIService
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    
    @Value("\${app.job.batch-size}")
    private val batchSize: Int = 10
    
    @Value("\${app.job.max-retries}")
    private val maxRetries: Int = 3
    
    @Scheduled(fixedDelayString = "\${app.job.interval:180000}")
    @Transactional
    fun processJobs() {
        logger.info("Starting job processing...")
        
        // ペンディング状態のジョブを最大batchSize件取得
        val jobs = jobRepository.findJobsForProcessing(
            JobStatus.PENDING,
            maxRetries,
            PageRequest.of(0, batchSize)
        )
        
        if (jobs.isEmpty()) {
            logger.info("No pending jobs found.")
            return
        }
        
        logger.info("Found ${jobs.size} jobs to process.")
        
        jobs.forEach { job ->
            try {
                processJob(job)
            } catch (e: Exception) {
                handleJobError(job, e)
            }
        }
        
        logger.info("Job processing completed.")
    }
    
    @Transactional
    fun processJob(job: ProcessingJob) {
        // 1. ジョブを処理中に更新
        job.status = JobStatus.PROCESSING
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
        
        // 2. 単語のステータスを処理中に更新
        val word = job.word
        word.status = WordStatus.PROCESSING
        word.updatedAt = LocalDateTime.now()
        wordRepository.save(word)
        
        // 3. OpenAI APIを呼び出し
        val result = openAIService.processWord(word.word)
        
        // 4. 結果をDBに保存
        val wordDetail = WordDetail(
            word = word,
            translation = result.translation,
            partOfSpeech = result.partOfSpeech,
            exampleSentence = result.exampleSentence
        )
        
        // 5. 単語の詳細を設定し、ステータスを完了に更新
        word.detail = wordDetail
        word.status = WordStatus.COMPLETED
        word.updatedAt = LocalDateTime.now()
        wordRepository.save(word)
        
        // 6. ジョブのステータスを完了に更新
        job.status = JobStatus.COMPLETED
        job.updatedAt = LocalDateTime.now()
        jobRepository.save(job)
        
        logger.info("Successfully processed job ${job.id} for word '${word.word}'")
    }
    
    private fun handleJobError(job: ProcessingJob, exception: Exception) {
        logger.error("Error processing job ${job.id}: ${exception.message}", exception)
        
        // リトライカウントを増やす
        job.retryCount++
        job.errorMessage = exception.message ?: "Unknown error"
        job.updatedAt = LocalDateTime.now()
        
        // 最大リトライ回数を超えた場合はエラー状態に
        if (job.retryCount >= maxRetries) {
            job.status = JobStatus.ERROR
            job.word.status = WordStatus.ERROR
            job.word.updatedAt = LocalDateTime.now()
            wordRepository.save(job.word)
        } else {
            // まだリトライ可能な場合はPENDINGに戻す
            job.status = JobStatus.PENDING
        }
        
        jobRepository.save(job)
    }
}
```

### 4. コントローラー

#### WordController.kt
```kotlin
package com.site4b.controller

import com.site4b.model.dto.WordRequest
import com.site4b.model.dto.WordResponse
import com.site4b.model.entity.WordStatus
import com.site4b.service.WordService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/words")
class WordController(private val wordService: WordService) {

    @PostMapping
    fun addWord(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: WordRequest
    ): ResponseEntity<WordResponse> {
        val userId = jwt.claims["userId"] as String
        val word = wordService.addWord(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(word)
    }
    
    @GetMapping
    fun getWords(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(required = false) status: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") limit: Int
    ): ResponseEntity<Map<String, Any>> {
        val userId = jwt.claims["userId"] as String
        val wordStatus = status?.let { WordStatus.valueOf(it.uppercase()) }
        
        val pageable = PageRequest.of(page, limit)
        val wordsPage = wordService.getWordsByUserId(userId, wordStatus, pageable)
        
        val response = mapOf(
            "words" to wordsPage.content,
            "page" to page,
            "limit" to limit,
            "total" to wordsPage.totalElements
        )
        
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/{id}")
    fun getWordById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: String
    ): ResponseEntity<WordResponse> {
        val word = wordService.getWordById(id) ?: return ResponseEntity.notFound().build()
        
        val userId = jwt.claims["userId"] as String
        if (word.userId != userId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        
        return ResponseEntity.ok(word)
    }
}
```

### 5. スケジューラ設定

#### JobConfig.kt
```kotlin
package com.site4b.config

import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling

@Configuration
@EnableScheduling
class JobConfig {
    // スケジューリング設定
}
```

## アプリケーション設定

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DB:site4b}
    username: ${MYSQL_USER:root}
    password: ${MYSQL_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true

server:
  port: 8080

openai:
  api:
    key: ${OPENAI_API_KEY}
    url: https://api.openai.com/v1/chat/completions
  model: gpt-4

app:
  job:
    interval: 180000  # 3分 (ミリ秒)
    batch-size: 10    # 一度に処理するジョブ数
    max-retries: 3    # 最大リトライ回数

auth0:
  audience: ${AUTH0_AUDIENCE}
  issuer: ${AUTH0_ISSUER}
```

## DBマイグレーション

### V1__create_tables.sql
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE words (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  word VARCHAR(255) NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX (user_id, word)
);

CREATE TABLE word_details (
  id VARCHAR(36) PRIMARY KEY,
  word_id VARCHAR(36) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  part_of_speech VARCHAR(50) NOT NULL,
  example_sentence TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

CREATE TABLE processing_jobs (
  id VARCHAR(36) PRIMARY KEY,
  word_id VARCHAR(36) NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR') DEFAULT 'PENDING',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  UNIQUE INDEX (word_id)
);
```

## セキュリティ設定

### SecurityConfig.kt
```kotlin
package com.site4b.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.jwt.*
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Value("\${auth0.audience}")
    private lateinit var audience: String

    @Value("\${auth0.issuer}")
    private lateinit var issuer: String

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.csrf().disable()
            .authorizeRequests()
            .antMatchers("/api/public/**").permitAll()
            .antMatchers("/api/**").authenticated()
            .and()
            .oauth2ResourceServer().jwt()
            .and().and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        
        return http.build()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuer) as NimbusJwtDecoder

        val audienceValidator: OAuth2TokenValidator<Jwt> = AudienceValidator(audience)
        val withIssuer: OAuth2TokenValidator<Jwt> = JwtValidators.createDefaultWithIssuer(issuer)
        val withAudience: OAuth2TokenValidator<Jwt> = DelegatingOAuth2TokenValidator(withIssuer, audienceValidator)

        jwtDecoder.setJwtValidator(withAudience)
        return jwtDecoder
    }
}

class AudienceValidator(private val audience: String) : OAuth2TokenValidator<Jwt> {
    override fun validate(jwt: Jwt): OAuth2TokenValidatorResult {
        val error = OAuth2Error("invalid_token", "The required audience is missing", null)
        
        if (jwt.audience.contains(audience)) {
            return OAuth2TokenValidatorResult.success()
        }
        
        return OAuth2TokenValidatorResult.failure(error)
    }
}
```

## DTOクラス

### WordRequest.kt
```kotlin
package com.site4b.model.dto

data class WordRequest(
    val word: String
)
```

### WordResponse.kt
```kotlin
package com.site4b.model.dto

import com.site4b.model.entity.Word
import com.site4b.model.entity.WordStatus
import java.time.LocalDateTime

data class WordResponse(
    val id: String,
    val userId: String,
    val word: String,
    val status: WordStatus,
    val translation: String? = null,
    val partOfSpeech: String? = null,
    val exampleSentence: String? = null,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun fromEntity(word: Word): WordResponse {
            return WordResponse(
                id = word.id,
                userId = word.userId,
                word = word.word,
                status = word.status,
                translation = word.detail?.translation,
                partOfSpeech = word.detail?.partOfSpeech,
                exampleSentence = word.detail?.exampleSentence,
                createdAt = word.createdAt,
                updatedAt = word.updatedAt
            )
        }
    }
}
```

### OpenAIResponse.kt
```kotlin
package com.site4b.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class OpenAIResponse(
    val translation: String,
    
    @JsonProperty("partOfSpeech")
    val partOfSpeech: String,
    
    @JsonProperty("exampleSentence")
    val exampleSentence: String
)
``` 