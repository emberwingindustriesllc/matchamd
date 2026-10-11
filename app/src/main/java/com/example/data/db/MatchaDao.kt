package com.example.data.db

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface MatchaDao {
    @Query("SELECT * FROM saved_programs ORDER BY rankOrder ASC")
    fun getAllSavedPrograms(): Flow<List<SavedProgramEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSavedProgram(program: SavedProgramEntity)

    @Query("DELETE FROM saved_programs WHERE programId = :programId")
    suspend fun deleteSavedProgram(programId: String)

    @Query("UPDATE saved_programs SET rankOrder = :newRank WHERE programId = :programId")
    suspend fun updateRank(programId: String, newRank: Int)

    @Query("UPDATE saved_programs SET notes = :notes WHERE programId = :programId")
    suspend fun updateNotes(programId: String, notes: String)

    @Query("DELETE FROM saved_programs")
    suspend fun clearAllSavedPrograms()

    @Query("SELECT * FROM quiz_history")
    fun getAllQuizHistory(): Flow<List<QuizHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuizResult(result: QuizHistoryEntity)

    @Query("DELETE FROM quiz_history")
    suspend fun clearAllQuizHistory()

    // Community-Submitted Programs & Admin Verification
    @Query("SELECT * FROM community_programs ORDER BY submittedAt DESC")
    fun getAllCommunityPrograms(): Flow<List<CommunityProgramEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCommunityProgram(program: CommunityProgramEntity)

    @Query("UPDATE community_programs SET isVerified = :isVerified WHERE id = :id")
    suspend fun updateCommunityProgramVerification(id: String, isVerified: Boolean)

    @Query("DELETE FROM community_programs WHERE id = :id")
    suspend fun deleteCommunityProgram(id: String)

    @Query("DELETE FROM community_programs")
    suspend fun clearAllCommunityPrograms()

    // Scam Reports & Verification (Anti-Libel Pipeline)
    @Query("SELECT * FROM scam_reports ORDER BY submittedAt DESC")
    fun getAllScamReports(): Flow<List<ScamReportEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScamReport(report: ScamReportEntity)

    @Query("UPDATE scam_reports SET verificationStatus = :status, adminNotes = :adminNotes WHERE id = :id")
    suspend fun updateScamReportStatus(id: String, status: String, adminNotes: String)

    @Query("DELETE FROM scam_reports WHERE id = :id")
    suspend fun deleteScamReport(id: String)

    @Query("DELETE FROM scam_reports")
    suspend fun clearAllScamReports()
}
