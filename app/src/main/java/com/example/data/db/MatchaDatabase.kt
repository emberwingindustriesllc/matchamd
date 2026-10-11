package com.example.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        SavedProgramEntity::class,
        QuizHistoryEntity::class,
        CommunityProgramEntity::class,
        ScamReportEntity::class
    ],
    version = 3,
    exportSchema = false
)
abstract class MatchaDatabase : RoomDatabase() {
    abstract fun matchaDao(): MatchaDao

    companion object {
        @Volatile
        private var INSTANCE: MatchaDatabase? = null

        fun getInstance(context: Context): MatchaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MatchaDatabase::class.java,
                    "matchamd_local_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
