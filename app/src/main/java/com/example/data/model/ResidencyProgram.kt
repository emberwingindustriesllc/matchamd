package com.example.data.model

import androidx.compose.ui.graphics.Color
import com.example.ui.theme.*

enum class ProgramType(val displayName: String, val badgeColor: Color) {
    RESIDENCY("Residency", TypeResidencyBadge),
    FELLOWSHIP("Fellowship", TypeFellowshipBadge),
    OBSERVERSHIP("Observership / USCE", TypeObservershipBadge)
}

enum class VerificationStatus(val label: String, val color: Color) {
    VERIFIED("Verified by MatchaMD", SafeGreen),
    PENDING_REVIEW("Pending Verification", ScamAmber),
    COMMUNITY_SUBMITTED("Community Added", VisaJ1Badge)
}

enum class MedicalSpecialty(val displayName: String, val color: Color) {
    PEDIATRICS("Pediatrics", SpecPediatrics),
    INTERNAL_MEDICINE("Internal Medicine", SpecInternalMed),
    FAMILY_MEDICINE("Family Medicine", SpecFamilyMed),
    GENERAL_SURGERY("General Surgery", SpecSurgery),
    PSYCHIATRY("Psychiatry", SpecPsychiatry),
    OBGYN("OB/GYN", SpecOBGYN),
    NEUROLOGY("Neurology", SpecNeurology)
}

enum class VisaSponsorship(val label: String, val badgeColor: Color) {
    J1_AND_H1B("J-1 & H-1B", VisaH1BBadge),
    J1_ONLY("J-1 Only", VisaJ1Badge),
    NO_VISA("US Citizen / GC Only", VisaGreenCardBadge)
}

enum class HospitalSetting(val label: String) {
    UNIVERSITY("University Hospital"),
    COMMUNITY_AFFILIATED("University-Affiliated"),
    COMMUNITY("Community Hospital")
}

data class ResidencyProgram(
    val id: String,
    val name: String,
    val hospitalName: String,
    val specialty: MedicalSpecialty,
    val city: String,
    val state: String,
    val acgmeCode: String,
    val visaSponsorship: VisaSponsorship,
    val minStep2Score: Int,
    val pgy1Positions: Int,
    val annualSalary: Int,
    val hospitalSetting: HospitalSetting,
    val imgFriendlyScore: Int, // 1 - 10 rating based on historical IMG matching
    val websiteUrl: String,
    val programDirector: String,
    val highlights: String,
    val isSaved: Boolean = false,
    val userRank: Int? = null,
    val userNotes: String? = null,
    // Enhanced attributes for Fellowships & Observerships & Verification
    val programType: ProgramType = ProgramType.RESIDENCY,
    val subspecialtyFocus: String = "",
    val applicationFeeOrSalary: String = "",
    val contactEmail: String = "",
    val handsOnVsObservership: String = "ACGME Accredited",
    val letterOfRecommendationType: String = "Department Chair & Program Director Evaluation",
    val isCommunitySubmitted: Boolean = false,
    val verificationStatus: VerificationStatus = VerificationStatus.VERIFIED
)
