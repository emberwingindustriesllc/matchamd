package com.example

import android.app.Application
import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.db.CommunityProgramEntity
import com.example.data.db.MatchaDatabase
import com.example.data.db.SavedProgramEntity
import com.example.data.db.ScamReportEntity
import com.example.data.model.CostProfile
import com.example.data.model.MedicalSpecialty
import com.example.data.model.ProgramType
import com.example.data.model.VisaSponsorship
import com.example.data.repository.GuideRepository
import com.example.data.repository.InterviewRepository
import com.example.data.repository.ProgramRepository
import com.example.data.repository.QuizRepository
import com.example.ui.viewmodel.MatchaViewModel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun `read string from context matches MatchaMD`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("MatchaMD", appName)
  }

  @Test
  fun `verify verified residency programs list is populated with specialties`() {
    val programs = ProgramRepository.verifiedPrograms
    assertTrue(programs.isNotEmpty())
    val peds = programs.filter { it.specialty == MedicalSpecialty.PEDIATRICS }
    val im = programs.filter { it.specialty == MedicalSpecialty.INTERNAL_MEDICINE }
    val surgery = programs.filter { it.specialty == MedicalSpecialty.GENERAL_SURGERY }
    assertTrue(peds.isNotEmpty())
    assertTrue(im.isNotEmpty())
    assertTrue(surgery.isNotEmpty())
  }

  @Test
  fun `verify fellowships and observerships search and filtering`() {
    val fellowships = ProgramRepository.searchPrograms(programType = ProgramType.FELLOWSHIP)
    assertTrue("Fellowships should not be empty", fellowships.isNotEmpty())
    assertTrue(fellowships.all { it.programType == ProgramType.FELLOWSHIP })

    val observerships = ProgramRepository.searchPrograms(programType = ProgramType.OBSERVERSHIP)
    assertTrue("Observerships should not be empty", observerships.isNotEmpty())
    assertTrue(observerships.all { it.programType == ProgramType.OBSERVERSHIP })
  }

  @Test
  fun `verify program search and visa filtering logic`() {
    val j1Programs = ProgramRepository.searchPrograms(
      visaSponsorship = VisaSponsorship.J1_ONLY
    )
    assertTrue(j1Programs.isNotEmpty())
    assertTrue(j1Programs.all { it.visaSponsorship == VisaSponsorship.J1_ONLY || it.visaSponsorship == VisaSponsorship.J1_AND_H1B })
  }

  @Test
  fun `verify legal safe harbor disclosures and verified scam alerts loaded`() {
    assertTrue(GuideRepository.LEGAL_DISCLOSURE_FULL.contains("47 U.S.C. § 230"))
    assertTrue(GuideRepository.LEGAL_DISCLOSURE_FULL.contains("defamation"))
    assertTrue(GuideRepository.verifiedCommunityAlerts.isNotEmpty())
    assertTrue(GuideRepository.scamWarningItems.isNotEmpty())
    assertTrue(GuideRepository.matchGuides.isNotEmpty())
    val criticalScams = GuideRepository.scamWarningItems.filter { it.severity == "CRITICAL" }
    assertTrue(criticalScams.isNotEmpty())
  }

  @Test
  fun `verify scam reporting and moderation verification pipeline in Room DB`() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val db = MatchaDatabase.getInstance(context)
    val dao = db.matchaDao()

    val report = ScamReportEntity(
      id = "scam_test_001",
      entityName = "Unaccredited Broker X",
      scamType = "Paid Interview Guarantee Scam",
      location = "Online",
      amountPaidOrDemanded = 3500.0,
      factualDescription = "Demanded upfront $3500 promising match interview.",
      evidenceChecklist = "Email Headers, Bank Wire Receipt",
      reporterContact = "paulfinchpediatrics@gmail.com",
      legalAttestationAgreed = true,
      verificationStatus = "PENDING_LEGAL_VERIFICATION"
    )

    dao.insertScamReport(report)
    val listBefore = dao.getAllScamReports().first()
    assertTrue(listBefore.any { it.id == "scam_test_001" })
    assertEquals("PENDING_LEGAL_VERIFICATION", listBefore.first { it.id == "scam_test_001" }.verificationStatus)

    // Moderation step: verify the report
    dao.updateScamReportStatus("scam_test_001", "VERIFIED_ALERT", "Documentation substantiated")
    val listAfter = dao.getAllScamReports().first()
    assertEquals("VERIFIED_ALERT", listAfter.first { it.id == "scam_test_001" }.verificationStatus)
  }

  @Test
  fun `verify community program submission and verification in Room DB`() = runBlocking {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val db = MatchaDatabase.getInstance(context)
    val dao = db.matchaDao()

    val testProgram = CommunityProgramEntity(
      id = "test_comm_001",
      name = "Test Community Observership",
      hospitalName = "Memorial Hospital",
      programType = "OBSERVERSHIP",
      specialty = "INTERNAL_MEDICINE",
      city = "Dallas",
      state = "TX",
      isVerified = false
    )

    dao.insertCommunityProgram(testProgram)
    val listBefore = dao.getAllCommunityPrograms().first()
    assertTrue(listBefore.any { it.id == "test_comm_001" })
    assertFalse(listBefore.first { it.id == "test_comm_001" }.isVerified)

    // Admin verifies the program
    dao.updateCommunityProgramVerification("test_comm_001", true)
    val listAfter = dao.getAllCommunityPrograms().first()
    assertTrue(listAfter.first { it.id == "test_comm_001" }.isVerified)
  }

  @Test
  fun `verify user data export JSON generation and account deletion clearing Room DB`() = runBlocking {
    val app = ApplicationProvider.getApplicationContext<Application>()
    val db = MatchaDatabase.getInstance(app)
    val dao = db.matchaDao()

    // Insert saved program
    dao.insertSavedProgram(
      SavedProgramEntity(
        programId = "prog_001",
        programName = "Johns Hopkins Pediatrics",
        hospitalName = "The Johns Hopkins Hospital",
        specialtyName = "Pediatrics",
        rankOrder = 1,
        notes = "Top choice program"
      )
    )

    val saved = dao.getAllSavedPrograms().first()
    assertTrue(saved.isNotEmpty())

    // Generate JSON export
    val vm = MatchaViewModel(app)
    val jsonString = vm.generateUserDataExport()
    val jsonObj = JSONObject(jsonString)
    assertEquals("MatchaMD Residency & Match Platform", jsonObj.getString("app"))
    assertTrue(jsonObj.has("savedRankOrderList"))
    assertTrue(jsonObj.has("erasCostCalculation"))

    // Test account deletion & full database purge
    vm.purgeAllUserData()

    val savedAfter = dao.getAllSavedPrograms().first()
    val commAfter = dao.getAllCommunityPrograms().first()
    val scamsAfter = dao.getAllScamReports().first()
    assertTrue("Saved programs should be cleared", savedAfter.isEmpty())
    assertTrue("Community programs should be cleared", commAfter.isEmpty())
    assertTrue("Scam reports should be cleared", scamsAfter.isEmpty())
  }

  @Test
  fun `verify ERAS tiered fee schedule calculations`() {
    // 10 programs tier 1
    val cost10 = CostProfile(programsPerSpecialty = 10, numberOfSpecialties = 1)
    assertEquals(99, cost10.erasFeePerSpecialty)

    // 25 programs: 99 + (15 * 19) = 99 + 285 = 384
    val cost25 = CostProfile(programsPerSpecialty = 25, numberOfSpecialties = 1)
    assertEquals(384, cost25.erasFeePerSpecialty)

    // 35 programs: 99 + (20 * 19) + (5 * 27) = 99 + 380 + 135 = 614
    val cost35 = CostProfile(programsPerSpecialty = 35, numberOfSpecialties = 1)
    assertEquals(614, cost35.erasFeePerSpecialty)

    // Dual applying: 2 specialties
    val costDual = CostProfile(programsPerSpecialty = 25, numberOfSpecialties = 2)
    assertEquals(768, costDual.totalErasApplicationFees)
  }

  @Test
  fun `verify clinical vignettes and interview questions are loaded`() {
    assertTrue(QuizRepository.vignettes.isNotEmpty())
    assertTrue(InterviewRepository.interviewQuestions.isNotEmpty())
    assertTrue(InterviewRepository.timelineEvents.isNotEmpty())
  }
}
