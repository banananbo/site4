package com.example.api.model

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonAlias

data class OpenAIResponse(
    @JsonProperty("translation")
    @JsonAlias("meaning", "japanese_translation")
    val translation: String,
    
    @JsonProperty("partOfSpeech")
    @JsonAlias("part_of_speech", "pos")
    val partOfSpeech: String,
    
    @JsonProperty("examples")
    @JsonAlias("example_sentences", "sentences", "example")
    val examples: List<Example>
) {
    data class Example(
        @JsonProperty("english")
        @JsonAlias("sentence", "english_sentence", "text")
        val english: String,
        
        @JsonProperty("japanese")
        @JsonAlias("japanese_translation", "translation", "japanese_text")
        val japanese: String
    )
} 