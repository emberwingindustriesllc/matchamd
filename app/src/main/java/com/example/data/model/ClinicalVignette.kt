package com.example.data.model

data class ClinicalVignette(
    val id: String,
    val specialty: MedicalSpecialty,
    val title: String,
    val patientStem: String,
    val vitalsAndExam: String,
    val questionPrompt: String,
    val choices: List<String>,
    val correctIndex: Int,
    val explanation: String,
    val clinicalPearl: String
)

data class InterviewPracticeQuestion(
    val id: String,
    val category: String, // "Traditional", "Behavioral (STAR)", "Ethics", "Pediatrics/Specialty"
    val question: String,
    val keyPointsToCover: List<String>,
    val sampleAnswer: String,
    val redFlagsToAvoid: String
)
