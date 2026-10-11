package com.example.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "scam_reports")
data class ScamReportEntity(
    @PrimaryKey val id: String,
    val entityName: String,
    val scamType: String,
    val location: String,
    val amountPaidOrDemanded: Double,
    val factualDescription: String,
    val evidenceChecklist: String,
    val reporterContact: String,
    val legalAttestationAgreed: Boolean,
    val verificationStatus: String, // PENDING_LEGAL_VERIFICATION, UNDER_FACT_CHECK, VERIFIED_ALERT, REJECTED
    val submittedAt: Long = System.currentTimeMillis(),
    val adminNotes: String = ""
)
