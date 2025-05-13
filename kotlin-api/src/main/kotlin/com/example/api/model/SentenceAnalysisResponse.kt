package com.example.api.model

/**
 * 文分析のレスポンスを表すデータクラス
 */
data class SentenceAnalysisResponse(
    val translation: String? = null,
    val idioms: List<IdiomInfo> = emptyList(),
    val grammars: List<GrammarInfo> = emptyList()
) {
    data class IdiomInfo(
        val idiom: String,
        val meaning: String,
        val example: String? = null
    )
    
    data class GrammarInfo(
        val pattern: String,
        val explanation: String,
        val level: String = "INTERMEDIATE"
    )
} 