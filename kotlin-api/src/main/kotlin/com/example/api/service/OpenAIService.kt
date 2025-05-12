package com.example.api.service

import com.example.api.model.OpenAIResponse
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.JsonNode
import com.theokanning.openai.completion.CompletionRequest
import com.theokanning.openai.service.OpenAiService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration

@Service
class OpenAIService(
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    
    @Value("\${openai.api.key}")
    private lateinit var apiKey: String
    
    @Value("\${openai.model}")
    private lateinit var model: String
    
    fun processWord(word: String): OpenAIResponse {
        try {
            // OpenAI APIクライアントを初期化
            val timeout = Duration.ofSeconds(30)
            val service = OpenAiService(apiKey, timeout)
            
            // リクエストを構築
            val prompt = "あなたは英語学習アシスタントです。以下の英単語について、日本語訳、品詞、および例文を提供してください。レスポンスは必ず以下のJSONフォーマットで返してください：\n{\"translation\": \"日本語訳\", \"partOfSpeech\": \"品詞\", \"examples\": [{\"english\": \"英語の例文\", \"japanese\": \"日本語訳\"}]}\n\n単語: $word"
            
            val completionRequest = CompletionRequest.builder()
                .model(model)
                .prompt(prompt)
                .n(1)
                .maxTokens(1000)
                .temperature(0.7)
                .build()
            
            // APIを呼び出し
            val completion = service.createCompletion(completionRequest)
            val content = completion.choices[0].text.trim()
            
            logger.info("OpenAI API応答: $content")
            
            // JSON処理
            return try {
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
        } catch (e: Exception) {
            logger.error("OpenAI API呼び出し中にエラーが発生しました: ${e.message}", e)
            throw e
        }
    }
} 