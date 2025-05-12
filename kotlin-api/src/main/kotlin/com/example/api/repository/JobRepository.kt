package com.example.api.repository

import com.example.api.entity.JobStatusEntity
import com.example.api.entity.ProcessingJobEntity
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface JobRepository : JpaRepository<ProcessingJobEntity, String> {
    fun findByStatus(status: JobStatusEntity, pageable: Pageable): List<ProcessingJobEntity>
    
    @Query("SELECT j FROM ProcessingJobEntity j WHERE j.status = :status AND j.retryCount < :maxRetries ORDER BY j.createdAt ASC")
    fun findJobsForProcessing(
        @Param("status") status: JobStatusEntity,
        @Param("maxRetries") maxRetries: Int,
        pageable: Pageable
    ): List<ProcessingJobEntity>
} 