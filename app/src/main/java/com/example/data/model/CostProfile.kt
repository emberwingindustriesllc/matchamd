package com.example.data.model

data class CostProfile(
    val programsPerSpecialty: Int = 25,
    val numberOfSpecialties: Int = 1,
    val includeStep1Fee: Boolean = true,
    val includeStep2Fee: Boolean = true,
    val includeOetFee: Boolean = true,
    val includeEcfmgFee: Boolean = true,
    val travelAndLodgingBudget: Int = 800,
    val interviewTechAndAttire: Int = 300
) {
    // Official AAMC ERAS Tiered Fee Schedule (calculated per specialty):
    // 1-10 programs: $99
    // 11-30 programs: $99 + (N - 10) * $19
    // 31+ programs: $99 + (20 * $19) + (N - 30) * $27
    val erasFeePerSpecialty: Int
        get() {
            if (programsPerSpecialty <= 0) return 0
            if (programsPerSpecialty <= 10) return 99
            if (programsPerSpecialty <= 30) return 99 + (programsPerSpecialty - 10) * 19
            return 99 + (20 * 19) + (programsPerSpecialty - 30) * 27
        }

    val totalErasApplicationFees: Int
        get() = erasFeePerSpecialty * numberOfSpecialties

    val nrmpMatchFee: Int = 85

    val examFeesTotal: Int
        get() = (if (includeStep1Fee) 1025 else 0) +
                (if (includeStep2Fee) 1025 else 0) +
                (if (includeOetFee) 455 else 0) +
                (if (includeEcfmgFee) 160 else 0)

    val miscellaneousTotal: Int
        get() = travelAndLodgingBudget + interviewTechAndAttire

    val grandTotal: Int
        get() = totalErasApplicationFees + nrmpMatchFee + examFeesTotal + miscellaneousTotal
}

data class MatchTimelineEvent(
    val title: String,
    val dateString: String,
    val description: String,
    val daysRemaining: Int,
    val isCrucial: Boolean = false
)
