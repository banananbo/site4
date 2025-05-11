package com.example.api.model

import com.fasterxml.jackson.annotation.JsonProperty

data class Auth0UserInfo(
    val sub: String,
    val nickname: String? = null,
    val name: String? = null,
    val email: String,
    @JsonProperty("email_verified")
    val emailVerified: Boolean = false,
    val picture: String? = null
) 