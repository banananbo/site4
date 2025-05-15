package com.example.api.service

import com.example.api.entity.OpenAILogEntity
import com.example.api.model.OpenAIResponse
import com.example.api.model.SentenceAnalysisResponse
import com.example.api.repository.OpenAILogRepository
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.annotation.JsonProperty
import com.theokanning.openai.completion.CompletionRequest
import com.theokanning.openai.service.OpenAiService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.LocalDateTime
import java.util.UUID


@Service
class OpenAIService(
    private val objectMapper: ObjectMapper,
    private val openAILogRepository: OpenAILogRepository
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    
    @Value("\${openai.api.key}")
    private lateinit var apiKey: String
    
    @Value("\${openai.model}")
    private lateinit var configuredModel: String
    
    // 環境変数から読み込まれたモデルを使用（.envでOPENAI_MODEL=gpt-3.5-turbo-instructと設定）
    
    fun processWord(word: String): OpenAIResponse {
        val startTime = System.currentTimeMillis()
        val prompt = "あなたは英語学習アシスタントです。以下の英単語について、日本語訳、品詞、および例文を提供してください。レスポンスは必ず以下のJSONフォーマットで返してください：\n{\"translation\": \"日本語訳\", \"partOfSpeech\": \"品詞\", \"examples\": [{\"english\": \"英語の例文\", \"japanese\": \"日本語訳\"}]}\n\n単語: $word"
        
        try {
            // OpenAI APIクライアントを初期化
            val timeout = Duration.ofSeconds(30)
            val service = OpenAiService(apiKey, timeout)
            
            // リクエストを構築
            val completionRequest = CompletionRequest.builder()
                .model(configuredModel)
                .prompt(prompt)
                .n(1)
                .maxTokens(1000)
                .temperature(0.7)
                .build()
            
            // APIを呼び出し
            val completion = service.createCompletion(completionRequest)
            val content = completion.choices[0].text.trim()
            val requestTime = System.currentTimeMillis() - startTime
            
            logger.info("OpenAI API応答: $content")
            
            // 処理結果
            val response: OpenAIResponse
            
            // JSON処理
            response = try {
                objectMapper.readValue(content, OpenAIResponse::class.java)
            } catch (e: Exception) {
                logger.error("標準フォーマットでのパースに失敗しました: ${e.message}")
                
                // 入れ子になったJSONを処理
                try {
                    val rootNode = objectMapper.readTree(content)
                    val wordNode = rootNode.fields().next().value
                    
                    val translation = wordNode.get("translation").asText()
                    val partOfSpeech = wordNode.get("part_of_speech").asText()
                    
                    val examples = mutableListOf<OpenAIResponse.Example>()
                    val examplesNode = wordNode.get("example_sentences")
                    if (examplesNode != null && examplesNode.isArray) {
                        for (exampleNode in examplesNode) {
                            val english = exampleNode.get("sentence").asText()
                            val japanese = exampleNode.get("english_translation").asText()
                            examples.add(OpenAIResponse.Example(english, japanese))
                        }
                    }
                    
                    OpenAIResponse(translation, partOfSpeech, examples)
                } catch (nestedEx: Exception) {
                    logger.error("入れ子JSONのパースにも失敗しました: ${nestedEx.message}")
                    throw nestedEx
                }
            }
            
            // ログをDBに保存
            val log = OpenAILogEntity(
                id = UUID.randomUUID().toString(),
                requestPrompt = prompt,
                responseContent = content,
                tokensUsed = calculateTokens(prompt, content),
                requestTimeMs = requestTime.toInt(),
                createdAt = LocalDateTime.now()
            )
            openAILogRepository.save(log)
            
            return response
        } catch (e: Exception) {
            logger.error("OpenAI API呼び出し中にエラーが発生しました: ${e.message}", e)
            
            // エラーが発生してもログを記録
            try {
                val log = OpenAILogEntity(
                    id = UUID.randomUUID().toString(),
                    requestPrompt = prompt,
                    responseContent = "ERROR: ${e.message}",
                    tokensUsed = null,
                    requestTimeMs = (System.currentTimeMillis() - startTime).toInt(),
                    createdAt = LocalDateTime.now()
                )
                openAILogRepository.save(log)
            } catch (logError: Exception) {
                logger.error("ログ保存中にエラーが発生しました: ${logError.message}", logError)
            }
            
            throw e
        }
    }
    
    /**
     * トークン数を概算する簡易的な方法
     * 英語では、1トークンは約4文字に相当
     */
    private fun calculateTokens(prompt: String, response: String): Int {
        val totalChars = prompt.length + response.length
        return (totalChars / 4).coerceAtLeast(1)
    }

    /**
     * 英文の分析を行い、含まれるイディオムと文法を抽出する
     */
    fun analyzeSentence(sentence: String, translation: String): SentenceAnalysisResponse {
        val startTime = System.currentTimeMillis()
        val prompt = """
            あなたは英語学習アシスタントです。以下の英文を分析して、含まれるイディオムと文法項目を抽出してください。

            非常に重要: レスポンスは純粋なJSONのみを返してください。説明やコメントは一切含めないでください。
            以下の正確なJSONフォーマットで返してください：
            
            {
              "translation": "日本語訳",
              "idioms": [
                {
                  "idiom": "イディオム表現",
                  "meaning": "意味の説明",
                  "example": "使用例（任意）"
                }
              ],
              "grammars": [
                {
                  "pattern": "文法パターン",
                  "explanation": "文法の説明",
                  "level": "難易度（BEGINNER, INTERMEDIATE, ADVANCED）"
                }
              ]
            }
            
            文: $sentence
        """.trimIndent()
        
        try {
            // OpenAI APIクライアントを初期化
            val timeout = Duration.ofSeconds(30)
            val service = OpenAiService(apiKey, timeout)
            
            // リクエストを構築
            val completionRequest = CompletionRequest.builder()
                .model(configuredModel)
                .prompt(prompt)
                .n(1)
                .maxTokens(1500)
                .temperature(0.7)
                .build()
            
            // APIを呼び出し
            val completion = service.createCompletion(completionRequest)
            val content = completion.choices[0].text.trim()
            val requestTime = System.currentTimeMillis() - startTime
            
            logger.info("OpenAI API応答: $content")

            // JSON部分を抽出（余計なテキストが付いている場合に対応）
            val extractedJson = extractJsonFromResponse(content)
            logger.info("抽出されたJSON: $extractedJson")
            
            // JSON処理
            val response = try {
                objectMapper.readValue(extractedJson, SentenceAnalysisResponse::class.java)
            } catch (e: Exception) {
                logger.error("標準フォーマットでのJSONパースに失敗しました: ${e.message}")
                logger.error("受信したJSON: $extractedJson")
                
                // JSONフォーマットを修正して再試行
                try {
                    // 一般的なJSONエラーの修正を試みる
                    val cleanedContent = extractedJson
                        .replace("'", "\"") // シングルクォートをダブルクォートに変換
                        .replace(",\\s*}", "}") // 末尾のカンマを削除
                        .replace(",\\s*]", "]") // 配列末尾のカンマを削除
                    
                    logger.info("修正したJSON: $cleanedContent")
                    
                    // 修正したJSONで再試行
                    val fixedResponse = objectMapper.readValue(cleanedContent, SentenceAnalysisResponse::class.java)
                    logger.info("修正したJSONのパースに成功しました")
                    fixedResponse
                } catch (e2: Exception) {
                    logger.error("修正したJSONのパースにも失敗しました: ${e2.message}")
                    
                    // 手動のJSONパースを試みる
                    try {
                        val jsonNode = objectMapper.readTree(extractedJson)
                        
                        // translationノードの処理
                        val translation = jsonNode.get("translation")?.asText()
                        
                        // idiomsノードの処理
                        val idioms = mutableListOf<SentenceAnalysisResponse.IdiomInfo>()
                        val idiomsNode = jsonNode.get("idioms")
                        if (idiomsNode != null && idiomsNode.isArray) {
                            for (idiomNode in idiomsNode) {
                                val idiom = idiomNode.get("idiom")?.asText() ?: continue
                                val meaning = idiomNode.get("meaning")?.asText() ?: ""
                                val example = idiomNode.get("example")?.asText()
                                
                                idioms.add(SentenceAnalysisResponse.IdiomInfo(
                                    idiom = idiom,
                                    meaning = meaning,
                                    example = example
                                ))
                            }
                        }
                        
                        // grammarsノードの処理
                        val grammars = mutableListOf<SentenceAnalysisResponse.GrammarInfo>()
                        val grammarsNode = jsonNode.get("grammars")
                        if (grammarsNode != null && grammarsNode.isArray) {
                            for (grammarNode in grammarsNode) {
                                val pattern = grammarNode.get("pattern")?.asText() ?: continue
                                val explanation = grammarNode.get("explanation")?.asText() ?: ""
                                val level = grammarNode.get("level")?.asText() ?: "INTERMEDIATE"
                                
                                grammars.add(SentenceAnalysisResponse.GrammarInfo(
                                    pattern = pattern,
                                    explanation = explanation,
                                    level = level
                                ))
                            }
                        }
                        
                        logger.info("手動JSONパースに成功しました: 翻訳=${translation != null}, イディオム=${idioms.size}, 文法=${grammars.size}")
                        SentenceAnalysisResponse(translation, idioms, grammars)
                    } catch (e3: Exception) {
                        logger.error("手動JSONパースにも失敗しました: ${e3.message}")
                        // すべてのパースが失敗した場合は空のレスポンスを返す
                        SentenceAnalysisResponse(null, emptyList(), emptyList())
                    }
                }
            }
            
            // ログをDBに保存
            val log = OpenAILogEntity(
                id = UUID.randomUUID().toString(),
                requestPrompt = prompt,
                responseContent = content,
                tokensUsed = calculateTokens(prompt, content),
                requestTimeMs = requestTime.toInt(),
                createdAt = LocalDateTime.now()
            )
            openAILogRepository.save(log)
            
            return response
        } catch (e: Exception) {
            logger.error("OpenAI API呼び出し中にエラーが発生しました: ${e.message}", e)
            
            // エラーが発生してもログを記録
            try {
                val log = OpenAILogEntity(
                    id = UUID.randomUUID().toString(),
                    requestPrompt = prompt,
                    responseContent = "ERROR: ${e.message}",
                    tokensUsed = null,
                    requestTimeMs = (System.currentTimeMillis() - startTime).toInt(),
                    createdAt = LocalDateTime.now()
                )
                openAILogRepository.save(log)
            } catch (logError: Exception) {
                logger.error("ログ保存中にエラーが発生しました: ${logError.message}", logError)
            }
            
            // エラー時は空のレスポンスを返す
            return SentenceAnalysisResponse(null, emptyList(), emptyList())
        }
    }

    /**
     * OpenAIの応答から実際のJSON部分を抽出する
     * 応答は「ここに入れてください」などの余計なテキストを含む場合があるため、
     * 最初の「{」から最後の「}」までを抽出する
     */
    private fun extractJsonFromResponse(response: String): String {
        val startIndex = response.indexOf("{")
        val endIndex = response.lastIndexOf("}")
        
        return if (startIndex >= 0 && endIndex > startIndex) {
            response.substring(startIndex, endIndex + 1)
        } else {
            // JSON形式が見つからない場合は元の応答を返す
            logger.warn("応答からJSON形式が検出できませんでした")
            response
        }
    }

    data class GeneratedSpeaker(
        val id: String,
        val name: String,
        val age: Int?,
        val gender: String?,
        val nationality: String?,
        val setting: String?,
        val personality: String?,
        val image: String?
    )

    data class GeneratedLine(
        val speaker: String?,
        val english: String,
        val japanese: String
    )

    data class GeneratedConversation(
        val description: String?,
        val speakers: List<GeneratedSpeaker>,
        val lines: List<GeneratedLine>
    )

    /**
     * 会話生成用のOpenAI呼び出し
     */
    fun generateConversation(
        userId: String?,
        situation: String?,
        level: Int?,
        learningWords: List<String>,
        learningSentences: List<String>
    ): GeneratedConversation? {
        val startTime = System.currentTimeMillis()
        val prompt = buildString {
            append("あなたは英語学習アシスタントです。\n")
            append("以下の条件で英会話例を生成してください。ユーザーが学習中の単語を使い、学習中の例文に近い表現を利用して会話をします\n")
            append("・シチュエーション: ")
            append(situation ?: "指定なし")
            append("\n・レベル: ")
            append(level ?: "指定なし")
            append("\n・ユーザーが現在学習中の単語: ")
            append(learningWords.joinToString(", "))
            append("\n・ユーザーが現在学習中の例文: ")
            append(learningSentences.joinToString(", "))
            append("\n---\n")
            append("descriptionには、誰と誰が、いつ、どこで、どのような状況で、どんなことについて会話をしているかを英語で簡潔に記述してください。\n")
            append("出力フォーマットは必ず以下のJSONで返してください。\n")
            append("""
{
  "description": "Alice and Bob are talking about their weekend plans at a cafe on Saturday afternoon.",
  "speakers": [
    {
      "id": "A",
      "name": "Alice",
      "age": 20,
      "gender": "female",
      "nationality": "Japanese",
      "setting": "学生",
      "personality": "明るく前向き",
      "image": ""
    },
    {
      "id": "B",
      "name": "Bob",
      "age": 35,
      "gender": "male",
      "nationality": "American",
      "setting": "先生",
      "personality": "優しく丁寧",
      "image": ""
    }
  ],
  "lines": [
    {
      "speaker": "A",
      "english": "Hello, how are you?",
      "japanese": "こんにちは、お元気ですか？"
    },
    {
      "speaker": "B",
      "english": "I'm fine, thank you. And you?",
      "japanese": "元気です。あなたは？"
    }
  ]
}
""")
        }
        try {
            val timeout = Duration.ofSeconds(60)
            val service = OpenAiService(apiKey, timeout)
            val completionRequest = CompletionRequest.builder()
                .model(configuredModel)
                .prompt(prompt)
                .n(1)
                .maxTokens(2000)
                .temperature(0.7)
                .build()
            val completion = service.createCompletion(completionRequest)
            val content = completion.choices[0].text.trim()
            val requestTime = System.currentTimeMillis() - startTime
            logger.info("OpenAI 会話生成応答: $content")
            // JSON部分を抽出
            val extractedJson = extractJsonFromResponse(content)
            try {
                val root = objectMapper.readTree(extractedJson)
                val description = root.get("description")?.asText()
                val speakers = mutableListOf<GeneratedSpeaker>()
                val speakersNode = root.get("speakers")
                if (speakersNode != null && speakersNode.isArray) {
                    for (node in speakersNode) {
                        speakers.add(
                            GeneratedSpeaker(
                                id = node.get("id")?.asText() ?: "",
                                name = node.get("name")?.asText() ?: "",
                                age = node.get("age")?.asInt(),
                                gender = node.get("gender")?.asText(),
                                nationality = node.get("nationality")?.asText(),
                                setting = node.get("setting")?.asText(),
                                personality = node.get("personality")?.asText(),
                                image = node.get("image")?.asText()
                            )
                        )
                    }
                }
                val lines = mutableListOf<GeneratedLine>()
                val linesNode = root.get("lines")
                if (linesNode != null && linesNode.isArray) {
                    for (node in linesNode) {
                        val speaker = node.get("speaker")?.asText()
                        val english = node.get("english")?.asText() ?: continue
                        val japanese = node.get("japanese")?.asText() ?: ""
                        lines.add(GeneratedLine(speaker, english, japanese))
                    }
                }
                // ログ保存
                val log = OpenAILogEntity(
                    id = UUID.randomUUID().toString(),
                    requestPrompt = prompt,
                    responseContent = content,
                    tokensUsed = calculateTokens(prompt, content),
                    requestTimeMs = requestTime.toInt(),
                    createdAt = LocalDateTime.now()
                )
                openAILogRepository.save(log)
                return GeneratedConversation(description, speakers, lines)
            } catch (e: Exception) {
                logger.error("会話生成JSONパース失敗: ", e)
            }
            // パース失敗時もログ保存
            val log = OpenAILogEntity(
                id = UUID.randomUUID().toString(),
                requestPrompt = prompt,
                responseContent = content,
                tokensUsed = calculateTokens(prompt, content),
                requestTimeMs = requestTime.toInt(),
                createdAt = LocalDateTime.now()
            )
            openAILogRepository.save(log)
            return null
        } catch (e: Exception) {
            logger.error("OpenAI会話生成呼び出し中にエラー: ${e.message}", e)
            return null
        }
    }
} 