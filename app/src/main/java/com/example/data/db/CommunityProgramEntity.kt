package com.example.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "community_programs")
data class CommunityProgramEntity(
    @PrimaryKey val id: String,
    val name: String,
    val hospitalName: String,
    val programType: String, // RESIDENCY, FELLOWSHIP, OBSERVERSHIP
    val specialty: String,
    val city: String,
    val state: String,
    val acgmeCode: String = "",
    val visaSponsorship: String = "J1_AND_H1B",
    val minStep2Score: Int = 215,
    val annualSalaryOrFee: String = "",
    val hospitalSetting: String = "COMMUNITY_AFFILIATED",
    val imgFriendlyScore: Int = 8,
    val websiteUrl: String = "",
    val contactEmail: String = "",
    val programDirector: String = "",
    val highlights: String = "",
    val handsOnVsObservership: String = "Clinical Observership",
    val letterOfRecommendationType: String = "Merit-Based LOR on Hospital Letterhead",
    val isVerified: Boolean = false,
    val submittedAt: Long = System.currentTimeMillis()
)
