package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.db.CommunityProgramEntity
import com.example.data.db.MatchaDatabase
import com.example.data.db.QuizHistoryEntity
import com.example.data.db.SavedProgramEntity
import com.example.data.db.ScamReportEntity
import com.example.data.model.*
import com.example.data.repository.InterviewRepository
import com.example.data.repository.ProgramRepository
import com.example.data.repository.QuizRepository
import com.example.data.repository.StripeAccountConfig
import com.example.data.repository.StripeRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

enum class MatchaScreen {
    PROGRAMS,
    CALCULATOR,
    GUIDES_AND_SCAMS,
    QUIZ,
    INTERVIEW,
    SAVED_ROL,
    TIMELINE,
    PRO_STORE,
    ACCOUNT
}

data class MatchaUiState(
    val currentScreen: MatchaScreen = MatchaScreen.PROGRAMS,
    val userEmail: String = "paulfinchpediatrics@gmail.com",
    // Programs Search & Filter State
    val searchQuery: String = "",
    val selectedSpecialty: MedicalSpecialty? = null,
    val selectedProgramType: ProgramType? = null,
    val selectedVisa: VisaSponsorship? = null,
    val minStepScoreFilter: Int = 0,
    val selectedProgramForModal: ResidencyProgram? = null,
    val showAdminPendingQueue: Boolean = false,
    val showSubmitProgramDialog: Boolean = false,
    // Pro Membership State
    val isProMember: Boolean = false,
    // Cost Calculator State
    val costProfile: CostProfile = CostProfile(),
    // Quiz State
    val activeVignetteIndex: Int = 0,
    val selectedAnswerIndex: Int? = null,
    val isAnswerSubmitted: Boolean = false,
    val totalQuizCorrect: Int = 0,
    val totalQuizAnswered: Int = 0,
    // Interview State
    val activeInterviewQuestionIndex: Int = 0,
    val isAnswerRevealed: Boolean = false,
    val selectedInterviewCategory: String? = null,
    // Account / Auth State
    val passwordResetSentMessage: String? = null
)

class MatchaViewModel(application: Application) : AndroidViewModel(application) {

    private val database = MatchaDatabase.getInstance(application)
    private val dao = database.matchaDao()

    val savedProgramsEntities: StateFlow<List<SavedProgramEntity>> = dao.getAllSavedPrograms()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val quizHistory: StateFlow<List<QuizHistoryEntity>> = dao.getAllQuizHistory()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val communityProgramsFlow: StateFlow<List<CommunityProgramEntity>> = dao.getAllCommunityPrograms()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val scamReportsFlow: StateFlow<List<ScamReportEntity>> = dao.getAllScamReports()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val stripeRepo = StripeRepository(application)
    val stripeConfig: StateFlow<StripeAccountConfig> = stripeRepo.config
    val stripeTransactions: StateFlow<List<StripePaymentTransaction>> = stripeRepo.transactions

    private val _uiState = MutableStateFlow(MatchaUiState())
    val uiState: StateFlow<MatchaUiState> = _uiState.asStateFlow()

    // Combined filtered programs: static verified + community submissions
    val filteredPrograms: StateFlow<List<ResidencyProgram>> = combine(
        _uiState,
        savedProgramsEntities,
        communityProgramsFlow
    ) { state, savedList, communityList ->
        val savedIds = savedList.associateBy({ it.programId }, { it.rankOrder to it.notes })

        // Convert community entities to ResidencyProgram models
        val convertedCommunity = communityList.map { entity ->
            val spec = try {
                MedicalSpecialty.valueOf(entity.specialty)
            } catch (e: Exception) {
                MedicalSpecialty.INTERNAL_MEDICINE
            }
            val progType = try {
                ProgramType.valueOf(entity.programType)
            } catch (e: Exception) {
                ProgramType.RESIDENCY
            }
            val visa = try {
                VisaSponsorship.valueOf(entity.visaSponsorship)
            } catch (e: Exception) {
                VisaSponsorship.J1_AND_H1B
            }
            val setting = try {
                HospitalSetting.valueOf(entity.hospitalSetting)
            } catch (e: Exception) {
                HospitalSetting.COMMUNITY_AFFILIATED
            }

            ResidencyProgram(
                id = entity.id,
                name = entity.name,
                hospitalName = entity.hospitalName,
                specialty = spec,
                city = entity.city,
                state = entity.state,
                acgmeCode = entity.acgmeCode,
                visaSponsorship = visa,
                minStep2Score = entity.minStep2Score,
                pgy1Positions = 10,
                annualSalary = 62000,
                hospitalSetting = setting,
                imgFriendlyScore = entity.imgFriendlyScore,
                websiteUrl = entity.websiteUrl,
                programDirector = entity.programDirector,
                highlights = entity.highlights,
                programType = progType,
                subspecialtyFocus = entity.specialty,
                applicationFeeOrSalary = entity.annualSalaryOrFee,
                contactEmail = entity.contactEmail,
                handsOnVsObservership = entity.handsOnVsObservership,
                letterOfRecommendationType = entity.letterOfRecommendationType,
                isCommunitySubmitted = true,
                verificationStatus = if (entity.isVerified) VerificationStatus.VERIFIED else VerificationStatus.PENDING_REVIEW
            )
        }

        // Combine verified built-in programs with community programs
        val allAvailablePrograms = ProgramRepository.verifiedPrograms + convertedCommunity

        val filtered = allAvailablePrograms.filter { p ->
            // Verification / Admin filter
            val verificationPass = if (state.showAdminPendingQueue) {
                p.verificationStatus == VerificationStatus.PENDING_REVIEW
            } else {
                p.verificationStatus == VerificationStatus.VERIFIED || !p.isCommunitySubmitted
            }

            // Program Type filter (Residency, Fellowship, Observership)
            val typePass = state.selectedProgramType == null || p.programType == state.selectedProgramType

            // Specialty filter
            val specialtyPass = state.selectedSpecialty == null || p.specialty == state.selectedSpecialty

            // Visa Sponsorship filter
            val visaPass = state.selectedVisa == null || p.visaSponsorship == state.selectedVisa

            // Step 2 score cutoff
            val scorePass = state.minStepScoreFilter == 0 || p.minStep2Score <= state.minStepScoreFilter

            // Search query across name, hospital, city, state, and subspecialty
            val query = state.searchQuery.trim().lowercase()
            val queryPass = query.isEmpty() ||
                    p.name.lowercase().contains(query) ||
                    p.hospitalName.lowercase().contains(query) ||
                    p.city.lowercase().contains(query) ||
                    p.state.lowercase().contains(query) ||
                    p.subspecialtyFocus.lowercase().contains(query) ||
                    p.programType.displayName.lowercase().contains(query)

            verificationPass && typePass && specialtyPass && visaPass && scorePass && queryPass
        }

        // Annotate with user bookmark state
        filtered.map { p ->
            val savedInfo = savedIds[p.id]
            p.copy(
                isSaved = savedInfo != null,
                userRank = savedInfo?.first,
                userNotes = savedInfo?.second
            )
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // === Navigation ===
    fun navigateTo(screen: MatchaScreen) {
        _uiState.update { it.copy(currentScreen = screen) }
    }

    // === Pro Membership Actions ===
    fun toggleProMembership() {
        _uiState.update { it.copy(isProMember = !it.isProMember) }
    }

    fun setProMembership(enabled: Boolean) {
        _uiState.update { it.copy(isProMember = enabled) }
    }

    // === Stripe Payments & Integration ===
    fun updateStripeKey(key: String, isLive: Boolean) {
        stripeRepo.updatePublishableKey(key, isLive)
    }

    fun setStripeCustomPaymentLink(productId: String, linkUrl: String) {
        stripeRepo.setCustomPaymentLink(productId, linkUrl)
    }

    fun processStripePayment(
        product: StripeProduct,
        customerEmail: String,
        customerName: String,
        specialty: String,
        notes: String,
        cardLast4: String,
        cardBrand: String,
        onSuccess: (StripePaymentTransaction) -> Unit
    ) {
        val tx = stripeRepo.recordSuccessfulPayment(
            product = product,
            customerEmail = customerEmail,
            customerName = customerName,
            specialty = specialty,
            notes = notes,
            cardLast4 = cardLast4,
            cardBrand = cardBrand
        )
        if (product.billingType == BillingType.RECURRING_MONTHLY || product.billingType == BillingType.RECURRING_ANNUAL) {
            _uiState.update { it.copy(isProMember = true) }
        }
        onSuccess(tx)
    }

    // === Programs Filter & Search Actions ===
    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun setSearchQuery(query: String) = updateSearchQuery(query)

    fun selectProgramTypeFilter(type: ProgramType?) {
        _uiState.update { it.copy(selectedProgramType = type) }
    }

    fun setProgramTypeFilter(type: ProgramType?) = selectProgramTypeFilter(type)

    fun selectSpecialtyFilter(specialty: MedicalSpecialty?) {
        _uiState.update { it.copy(selectedSpecialty = specialty) }
    }

    fun setSpecialtyFilter(specialty: MedicalSpecialty?) = selectSpecialtyFilter(specialty)

    fun selectVisaFilter(visa: VisaSponsorship?) {
        _uiState.update { it.copy(selectedVisa = visa) }
    }

    fun setVisaFilter(visa: VisaSponsorship?) = selectVisaFilter(visa)

    fun setMinStepScoreFilter(score: Int) {
        _uiState.update { it.copy(minStepScoreFilter = score) }
    }

    fun openProgramDetails(program: ResidencyProgram?) {
        _uiState.update { it.copy(selectedProgramForModal = program) }
    }

    fun setSelectedProgramForModal(program: ResidencyProgram?) = openProgramDetails(program)

    fun toggleAdminPendingQueue() {
        _uiState.update { it.copy(showAdminPendingQueue = !it.showAdminPendingQueue) }
    }

    fun toggleAdminReviewQueue() = toggleAdminPendingQueue()

    fun toggleSubmitProgramDialog(show: Boolean) {
        _uiState.update { it.copy(showSubmitProgramDialog = show) }
    }

    fun setShowSubmitProgramDialog(show: Boolean) = toggleSubmitProgramDialog(show)

    // === Community Submissions & Verification Actions ===
    fun submitCommunityProgram(
        name: String,
        hospitalName: String,
        programType: ProgramType,
        specialty: MedicalSpecialty,
        city: String,
        state: String,
        visaSponsorship: VisaSponsorship,
        minStepScore: Int,
        feeOrSalary: String,
        contactEmail: String,
        websiteUrl: String,
        highlights: String,
        handsOnType: String
    ) {
        viewModelScope.launch {
            val entity = CommunityProgramEntity(
                id = "community_" + UUID.randomUUID().toString().take(8),
                name = name.trim(),
                hospitalName = hospitalName.trim(),
                specialty = specialty.name,
                programType = programType.name,
                city = city.trim(),
                state = state.trim().uppercase(),
                acgmeCode = "Community-Reported",
                visaSponsorship = visaSponsorship.name,
                minStep2Score = minStepScore,
                annualSalaryOrFee = feeOrSalary.trim().ifEmpty { "Inquire with GME" },
                hospitalSetting = HospitalSetting.COMMUNITY_AFFILIATED.name,
                imgFriendlyScore = 8,
                websiteUrl = websiteUrl.trim(),
                programDirector = "GME Department / Coordinator",
                highlights = highlights.trim().ifEmpty { "User-submitted rotation/program" },
                contactEmail = contactEmail.trim(),
                handsOnVsObservership = handsOnType.trim().ifEmpty { "Clinical Observership" },
                letterOfRecommendationType = "Merit-Based LOR on Hospital Letterhead",
                isVerified = false,
                submittedAt = System.currentTimeMillis()
            )
            dao.insertCommunityProgram(entity)
        }
    }

    fun verifyCommunityProgram(programId: String, isVerified: Boolean) {
        viewModelScope.launch {
            dao.updateCommunityProgramVerification(programId, isVerified)
        }
    }

    fun deleteCommunityProgram(programId: String) {
        viewModelScope.launch {
            dao.deleteCommunityProgram(programId)
        }
    }

    // === Scam Reports & Verification Actions (Anti-Libel Pipeline) ===
    fun submitScamReport(
        entityName: String,
        scamType: String,
        location: String,
        amount: Double,
        factualDescription: String,
        evidenceChecklist: String,
        reporterContact: String,
        legalAttestationAgreed: Boolean
    ) {
        viewModelScope.launch {
            val report = ScamReportEntity(
                id = "scam_rep_" + UUID.randomUUID().toString().take(8),
                entityName = entityName.trim(),
                scamType = scamType.trim(),
                location = location.trim(),
                amountPaidOrDemanded = amount,
                factualDescription = factualDescription.trim(),
                evidenceChecklist = evidenceChecklist.trim(),
                reporterContact = reporterContact.trim(),
                legalAttestationAgreed = legalAttestationAgreed,
                verificationStatus = "PENDING_LEGAL_VERIFICATION",
                submittedAt = System.currentTimeMillis(),
                adminNotes = "Awaiting verification documents from submitter."
            )
            dao.insertScamReport(report)
        }
    }

    fun verifyScamReport(id: String, status: String, adminNotes: String) {
        viewModelScope.launch {
            dao.updateScamReportStatus(id, status, adminNotes)
        }
    }

    fun deleteScamReport(id: String) {
        viewModelScope.launch {
            dao.deleteScamReport(id)
        }
    }

    // === Saved Programs & ROL Actions ===
    fun toggleSaveProgram(program: ResidencyProgram) {
        viewModelScope.launch {
            if (program.isSaved) {
                dao.deleteSavedProgram(program.id)
            } else {
                val nextRank = savedProgramsEntities.value.size + 1
                dao.insertSavedProgram(
                    SavedProgramEntity(
                        programId = program.id,
                        programName = program.name,
                        hospitalName = program.hospitalName,
                        specialtyName = program.specialty.displayName,
                        rankOrder = nextRank,
                        notes = ""
                    )
                )
            }
        }
    }

    fun updateProgramNotes(programId: String, notes: String) {
        viewModelScope.launch {
            dao.updateNotes(programId, notes)
        }
    }

    fun moveRankUp(programId: String) {
        viewModelScope.launch {
            val list = savedProgramsEntities.value
            val index = list.indexOfFirst { it.programId == programId }
            if (index > 0) {
                val current = list[index]
                val prev = list[index - 1]
                dao.updateRank(current.programId, prev.rankOrder)
                dao.updateRank(prev.programId, current.rankOrder)
            }
        }
    }

    fun moveRankDown(programId: String) {
        viewModelScope.launch {
            val list = savedProgramsEntities.value
            val index = list.indexOfFirst { it.programId == programId }
            if (index != -1 && index < list.size - 1) {
                val current = list[index]
                val next = list[index + 1]
                dao.updateRank(current.programId, next.rankOrder)
                dao.updateRank(next.programId, current.rankOrder)
            }
        }
    }

    // === Cost Calculator Actions ===
    fun updateProgramsPerSpecialty(count: Int) {
        _uiState.update {
            it.copy(costProfile = it.costProfile.copy(programsPerSpecialty = count.coerceIn(1, 150)))
        }
    }

    fun updateNumberOfSpecialties(specialtiesCount: Int) {
        _uiState.update {
            it.copy(costProfile = it.costProfile.copy(numberOfSpecialties = specialtiesCount.coerceIn(1, 4)))
        }
    }

    fun toggleExamFee(examKey: String) {
        _uiState.update {
            val curr = it.costProfile
            val updated = when (examKey) {
                "step1" -> curr.copy(includeStep1Fee = !curr.includeStep1Fee)
                "step2" -> curr.copy(includeStep2Fee = !curr.includeStep2Fee)
                "oet" -> curr.copy(includeOetFee = !curr.includeOetFee)
                "ecfmg" -> curr.copy(includeEcfmgFee = !curr.includeEcfmgFee)
                else -> curr
            }
            it.copy(costProfile = updated)
        }
    }

    fun updateTravelBudget(amount: Int) {
        _uiState.update {
            it.copy(costProfile = it.costProfile.copy(travelAndLodgingBudget = amount.coerceIn(0, 5000)))
        }
    }

    // === USMLE Clinical Quiz Actions ===
    fun selectQuizAnswer(index: Int) {
        if (_uiState.value.isAnswerSubmitted) return
        val currentVignette = QuizRepository.vignettes[_uiState.value.activeVignetteIndex]
        val isCorrect = (index == currentVignette.correctIndex)

        _uiState.update {
            it.copy(
                selectedAnswerIndex = index,
                isAnswerSubmitted = true,
                totalQuizCorrect = it.totalQuizCorrect + (if (isCorrect) 1 else 0),
                totalQuizAnswered = it.totalQuizAnswered + 1
            )
        }

        viewModelScope.launch {
            dao.insertQuizResult(
                QuizHistoryEntity(
                    vignetteId = currentVignette.id,
                    selectedIndex = index,
                    isCorrect = isCorrect
                )
            )
        }
    }

    fun nextQuizVignette() {
        val nextIndex = (_uiState.value.activeVignetteIndex + 1) % QuizRepository.vignettes.size
        _uiState.update {
            it.copy(
                activeVignetteIndex = nextIndex,
                selectedAnswerIndex = null,
                isAnswerSubmitted = false
            )
        }
    }

    // === Interview Practice Actions ===
    fun toggleRevealInterviewAnswer() {
        _uiState.update { it.copy(isAnswerRevealed = !it.isAnswerRevealed) }
    }

    fun nextInterviewQuestion() {
        val nextIdx = (_uiState.value.activeInterviewQuestionIndex + 1) % InterviewRepository.interviewQuestions.size
        _uiState.update {
            it.copy(
                activeInterviewQuestionIndex = nextIdx,
                isAnswerRevealed = false
            )
        }
    }

    fun prevInterviewQuestion() {
        val size = InterviewRepository.interviewQuestions.size
        val prevIdx = (_uiState.value.activeInterviewQuestionIndex - 1 + size) % size
        _uiState.update {
            it.copy(
                activeInterviewQuestionIndex = prevIdx,
                isAnswerRevealed = false
            )
        }
    }

    // === Account Management: Password Reset, Data Export, Delete Account ===
    fun requestPasswordReset(email: String, onResult: (Boolean, String) -> Unit) {
        val targetEmail = email.trim().ifEmpty { _uiState.value.userEmail }
        if (!targetEmail.contains("@") || !targetEmail.contains(".")) {
            onResult(false, "Please enter a valid email address.")
            return
        }
        val message = "Password reset instructions sent to $targetEmail. Please check your inbox and spam folder."
        _uiState.update { it.copy(passwordResetSentMessage = message) }
        onResult(true, message)
    }

    fun updatePassword(newPass: String, confirmPass: String, onResult: (Boolean, String) -> Unit) {
        if (newPass.length < 8) {
            onResult(false, "Password must be at least 8 characters long.")
            return
        }
        if (newPass != confirmPass) {
            onResult(false, "Passwords do not match.")
            return
        }
        onResult(true, "Password updated successfully. Your new credentials are now active.")
    }

    fun generateUserDataExport(): String {
        val root = JSONObject()
        root.put("exportDate", System.currentTimeMillis())
        root.put("app", "MatchaMD Residency & Match Platform")
        root.put("userEmail", _uiState.value.userEmail)
        root.put("membershipTier", if (_uiState.value.isProMember) "MatchaMD Pro" else "Free Tier")

        // Saved Programs & ROL
        val savedArray = JSONArray()
        savedProgramsEntities.value.forEach { sp ->
            val obj = JSONObject()
            obj.put("programId", sp.programId)
            obj.put("programName", sp.programName)
            obj.put("hospitalName", sp.hospitalName)
            obj.put("specialty", sp.specialtyName)
            obj.put("rankOrder", sp.rankOrder)
            obj.put("userNotes", sp.notes)
            savedArray.put(obj)
        }
        root.put("savedRankOrderList", savedArray)

        // Cost Profile
        val costObj = JSONObject()
        val cp = _uiState.value.costProfile
        costObj.put("programsPerSpecialty", cp.programsPerSpecialty)
        costObj.put("numberOfSpecialties", cp.numberOfSpecialties)
        costObj.put("totalErasApplicationFees", cp.totalErasApplicationFees)
        costObj.put("grandTotal", cp.grandTotal)
        costObj.put("travelBudget", cp.travelAndLodgingBudget)
        root.put("erasCostCalculation", costObj)

        // Quiz History
        val quizArray = JSONArray()
        quizHistory.value.forEach { q ->
            val qObj = JSONObject()
            qObj.put("vignetteId", q.vignetteId)
            qObj.put("selectedIndex", q.selectedIndex)
            qObj.put("isCorrect", q.isCorrect)
            qObj.put("timestamp", q.timestamp)
            quizArray.put(qObj)
        }
        root.put("step2QuizHistory", quizArray)

        // User Community Programs
        val commArray = JSONArray()
        communityProgramsFlow.value.forEach { c ->
            val cObj = JSONObject()
            cObj.put("name", c.name)
            cObj.put("hospital", c.hospitalName)
            cObj.put("specialty", c.specialty)
            cObj.put("isVerified", c.isVerified)
            commArray.put(cObj)
        }
        root.put("submittedCommunityPrograms", commArray)

        // User Scam Reports
        val scamArray = JSONArray()
        scamReportsFlow.value.forEach { s ->
            val sObj = JSONObject()
            sObj.put("entityName", s.entityName)
            sObj.put("scamType", s.scamType)
            sObj.put("status", s.verificationStatus)
            scamArray.put(sObj)
        }
        root.put("filedScamReports", scamArray)

        return root.toString(2)
    }

    suspend fun purgeAllUserData() {
        dao.clearAllSavedPrograms()
        dao.clearAllQuizHistory()
        dao.clearAllCommunityPrograms()
        dao.clearAllScamReports()

        _uiState.update {
            it.copy(
                isProMember = false,
                totalQuizCorrect = 0,
                totalQuizAnswered = 0,
                costProfile = CostProfile(),
                passwordResetSentMessage = null,
                currentScreen = MatchaScreen.PROGRAMS
            )
        }
    }

    fun deleteUserAccount(onComplete: () -> Unit) {
        viewModelScope.launch {
            purgeAllUserData()
            onComplete()
        }
    }
}
