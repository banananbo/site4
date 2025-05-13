package com.example.api.repository

import com.example.api.entity.IdiomEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface IdiomRepository : JpaRepository<IdiomEntity, String> {
    fun findByIdiom(idiom: String): IdiomEntity?
} 