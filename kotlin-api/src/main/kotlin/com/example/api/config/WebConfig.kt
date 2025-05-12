package com.example.api.config

import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "http://lvh.me", 
                "http://www.lvh.me", 
                "http://api.lvh.me",
                "https://banananbo.com"
            )
            .allowedMethods("*")
            .allowedHeaders("*")
            .exposedHeaders(
                HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS,
                HttpHeaders.CONTENT_TYPE, 
                HttpHeaders.AUTHORIZATION, 
                "X-Requested-With", 
                "Accept"
            )
            .allowCredentials(true)
            .maxAge(3600)
    }
} 