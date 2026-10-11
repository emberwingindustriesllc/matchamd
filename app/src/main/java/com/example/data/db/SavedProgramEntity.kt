package com.example.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "saved_programs")
data class SavedProgramEntity(
    @PrimaryKey val programId: String,
    val programName: String,
    val hospitalName: String,
    val specialtyName: String,
    val rankOrder: Int,
    val notes: String = "",
    val savedTimestamp: Long = System.currentTimeMillis()
)
