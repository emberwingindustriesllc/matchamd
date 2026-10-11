package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.db.ScamReportEntity
import com.example.data.repository.GuideRepository
import com.example.data.repository.MatchGuideArticle
import com.example.data.repository.ScamWarningItem
import com.example.data.repository.VerifiedScamAlert
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel

enum class GuidesTab {
    SCAM_WARNINGS,
    MATCH_GUIDES
}

@Composable
fun GuidesScreen(
    viewModel: MatchaViewModel,
    onNavigateToPro: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(GuidesTab.SCAM_WARNINGS) }
    val context = LocalContext.current
    val scamReports by viewModel.scamReportsFlow.collectAsState()
    var showReportDialog by remember { mutableStateOf(false) }
    var showLegalModal by remember { mutableStateOf(false) }
    var showModerationQueue by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MatchaBackground)
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MatchaForest)
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "🛡️", fontSize = 24.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Guides & Fraud Shield",
                                style = Typography.titleLarge.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Text(
                                text = "Scam Protection & High-Yield Match Strategy",
                                style = Typography.bodySmall.copy(color = MatchaContainer)
                            )
                        }
                    }

                    Surface(
                        color = GoldPro,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.clickable { onNavigateToPro() }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                Icons.Default.Star,
                                contentDescription = "Pro",
                                tint = Color.White,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "PRO",
                                style = Typography.labelSmall.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Segmented Tab Selector
                Surface(
                    color = MatchaDark.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(4.dp)
                    ) {
                        TabButton(
                            title = "🚨 Scam Warnings & Reports",
                            isSelected = selectedTab == GuidesTab.SCAM_WARNINGS,
                            onClick = { selectedTab = GuidesTab.SCAM_WARNINGS },
                            modifier = Modifier.weight(1f)
                        )
                        TabButton(
                            title = "📚 High-Yield Match Guides",
                            isSelected = selectedTab == GuidesTab.MATCH_GUIDES,
                            onClick = { selectedTab = GuidesTab.MATCH_GUIDES },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // Body Content
        when (selectedTab) {
            GuidesTab.SCAM_WARNINGS -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Legal Disclosures Banner (Anti-Libel & CDA § 230)
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = ScamAmberContainer.copy(alpha = 0.45f)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, ScamAmber.copy(alpha = 0.6f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            Icons.Default.Gavel,
                                            contentDescription = null,
                                            tint = Color(0xFFB45309),
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = GuideRepository.LEGAL_DISCLOSURE_TITLE,
                                            style = Typography.titleSmall.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF78350F)
                                            )
                                        )
                                    }

                                    TextButton(onClick = { showLegalModal = true }) {
                                        Text("Full Policy", color = Color(0xFFB45309), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Text(
                                    text = "To protect against defamation and libel, MatchaMD enforces a strict pre-publication verification pipeline under 47 U.S.C. § 230. Allegations require documentary proof and signed legal attestation before being indexed.",
                                    style = Typography.bodySmall.copy(color = Color(0xFF451A03), fontSize = 11.sp, lineHeight = 16.sp)
                                )
                            }
                        }
                    }

                    // Action Banner: Report a Scam & Verification Pipeline
                    item {
                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Encountered a Bad Actor or Scam?",
                                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                                        )
                                        Text(
                                            text = "Submit a confidential, fact-checked report with documentary evidence.",
                                            style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                                    Button(
                                        onClick = { showReportDialog = true },
                                        colors = ButtonDefaults.buttonColors(containerColor = ScamRed),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Default.ReportProblem, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Report Bad Actor", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    }

                                    OutlinedButton(
                                        onClick = { showModerationQueue = !showModerationQueue },
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(
                                            if (showModerationQueue) Icons.Default.VisibilityOff else Icons.Default.FactCheck,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = MatchaForest
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = if (showModerationQueue) "Hide Queue" else "Review Queue (${scamReports.size})",
                                            color = MatchaForest,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Community Submissions Moderation Queue
                    if (showModerationQueue) {
                        item {
                            Card(
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MatchaContainer.copy(alpha = 0.5f)),
                                border = androidx.compose.foundation.BorderStroke(1.dp, MatchaBorder),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(
                                            text = "Moderation Queue (Pre-Publication Fact-Checking)",
                                            style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                                        )
                                        Surface(
                                            color = ScamAmber,
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Text(
                                                text = "${scamReports.size} pending",
                                                style = Typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold),
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Text(
                                        text = "Submissions remain private until evidence verification (bank receipts, official email headers) is completed to avoid libel.",
                                        style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 11.sp)
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))

                                    if (scamReports.isEmpty()) {
                                        Text(
                                            text = "No pending reports in review queue. Use 'Report Bad Actor' above to test submission.",
                                            style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic),
                                            modifier = Modifier.padding(vertical = 8.dp)
                                        )
                                    } else {
                                        scamReports.forEach { report ->
                                            ModerationReportCard(
                                                report = report,
                                                onVerify = { viewModel.verifyScamReport(report.id, "VERIFIED_ALERT", "Verified documentary evidence on file.") },
                                                onReject = { viewModel.verifyScamReport(report.id, "REJECTED", "Insufficient documentary evidence.") },
                                                onDelete = { viewModel.deleteScamReport(report.id) }
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Interactive Scam Risk Assessment Tool
                    item {
                        RotationRiskAssessmentCard()
                    }

                    // Verified Community Alerts Header
                    item {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🔍", fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "Verified Community Fraud Alerts",
                                    style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                                )
                                Text(
                                    text = "Substantiated through formal contracts & official GME confirmation",
                                    style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                                )
                            }
                        }
                    }

                    // Verified Community Alerts List
                    items(GuideRepository.verifiedCommunityAlerts) { alert ->
                        VerifiedAlertCard(alert = alert)
                    }

                    // Institutional Red Flags Title
                    item {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "⚠️", fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "The 5 Major Medical Training Red Flags",
                                    style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                                )
                                Text(
                                    text = "Detailed mechanics and safe alternatives for USCE rotations",
                                    style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                                )
                            }
                        }
                    }

                    // Warning items
                    items(GuideRepository.scamWarningItems) { item ->
                        ScamWarningItemCard(warning = item)
                    }

                    // Official Reporting Contacts Card
                    item {
                        ReportingContactsCard()
                    }
                }
            }

            GuidesTab.MATCH_GUIDES -> {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MatchaContainer),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = "💡", fontSize = 24.sp)
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = "High-Yield US Match Strategy",
                                        style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                                    )
                                    Text(
                                        text = "Actionable tactics for IMGs and US graduates: program signaling, direct faculty cold outreach, and personal statements.",
                                        style = Typography.bodySmall.copy(color = MatchaOnSurface, fontSize = 11.sp)
                                    )
                                }
                            }
                        }
                    }

                    items(GuideRepository.matchGuides) { guide ->
                        MatchGuideItemCard(
                            article = guide,
                            onCopyTemplate = { template ->
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("MatchaMD Template", template)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "Email template copied to clipboard!", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }
        }
    }

    // Report Bad Actor Dialog with Legal Attestation & Verification Pipeline
    if (showReportDialog) {
        SubmitScamReportDialog(
            onDismiss = { showReportDialog = false },
            onSubmit = { name, type, loc, amt, desc, proof, contact, agreed ->
                viewModel.submitScamReport(name, type, loc, amt, desc, proof, contact, agreed)
                showReportDialog = false
                Toast.makeText(
                    context,
                    "Report submitted to confidential verification queue. Our moderation team will verify documentation before indexing.",
                    Toast.LENGTH_LONG
                ).show()
            }
        )
    }

    // Full Legal Safe Harbor & Policy Modal
    if (showLegalModal) {
        AlertDialog(
            onDismissRequest = { showLegalModal = false },
            icon = { Text(text = "⚖️", fontSize = 32.sp) },
            title = {
                Text(
                    text = GuideRepository.LEGAL_DISCLOSURE_TITLE,
                    style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                )
            },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text(
                        text = GuideRepository.LEGAL_DISCLOSURE_FULL,
                        style = Typography.bodySmall.copy(color = MatchaDark, lineHeight = 17.sp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showLegalModal = false },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaForest)
                ) {
                    Text("I Understand & Agree")
                }
            }
        )
    }
}

@Composable
fun SubmitScamReportDialog(
    onDismiss: () -> Unit,
    onSubmit: (
        name: String,
        type: String,
        loc: String,
        amount: Double,
        desc: String,
        proof: String,
        contact: String,
        agreed: Boolean
    ) -> Unit
) {
    var entityName by remember { mutableStateOf("") }
    var scamType by remember { mutableStateOf("Paid Interview Guarantee Scam") }
    var location by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    var factualDesc by remember { mutableStateOf("") }
    var reporterContact by remember { mutableStateOf("") }

    // Evidence checkboxes
    var hasEmailEvidence by remember { mutableStateOf(false) }
    var hasBankEvidence by remember { mutableStateOf(false) }
    var hasContractEvidence by remember { mutableStateOf(false) }
    var hasScreenshotEvidence by remember { mutableStateOf(false) }

    // Legal Attestation
    var legalAttestationAgreed by remember { mutableStateOf(false) }

    val scamTypes = listOf(
        "Paid Interview Guarantee Scam",
        "Fake Observership / No Hospital Affiliation",
        "Counterfeit LOR / Pre-Signed Template Mill",
        "Unverified Wire / Zelle Extortion",
        "Visa Sponsorship Fraud / False Claims",
        "Unaccredited Certification Fee Mill"
    )

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🚨 ", fontSize = 20.sp)
                Text("Report Suspected Bad Actor", style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold))
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Warning Notice
                Surface(
                    color = ScamAmberContainer.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ScamAmber.copy(alpha = 0.5f))
                ) {
                    Text(
                        text = "Anti-Libel Notice: To avoid defamation and legal liability, only provide objective, verifiable facts based on your direct personal experience. All reports are vetted by legal reviewers.",
                        style = Typography.bodySmall.copy(color = Color(0xFF78350F), fontSize = 11.sp, lineHeight = 15.sp),
                        modifier = Modifier.padding(8.dp)
                    )
                }

                OutlinedTextField(
                    value = entityName,
                    onValueChange = { entityName = it },
                    label = { Text("Organization / Agency / Contact Name *") },
                    placeholder = { Text("e.g., 'FastTrack Rotations LLC'") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Text(
                    text = "Category of Allegation *",
                    style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                )

                scamTypes.forEach { type ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { scamType = type }
                            .padding(vertical = 2.dp)
                    ) {
                        RadioButton(selected = scamType == type, onClick = { scamType = type })
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = type, style = Typography.bodySmall.copy(fontSize = 12.sp))
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = location,
                        onValueChange = { location = it },
                        label = { Text("Location / Online") },
                        placeholder = { Text("e.g. Chicago, IL or Web") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = amountText,
                        onValueChange = { amountText = it },
                        label = { Text("Loss / Demand ($)") },
                        placeholder = { Text("e.g. 3500") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = factualDesc,
                    onValueChange = { factualDesc = it },
                    label = { Text("Factual Description (No Libel / Hearsay) *") },
                    placeholder = { Text("State dates, promises made, actual rotation conditions, and outcome objectively.") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(110.dp),
                    maxLines = 5
                )

                Text(
                    text = "Supporting Evidence in Your Possession:",
                    style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                )

                EvidenceCheckRow("Official email correspondence / headers", hasEmailEvidence) { hasEmailEvidence = it }
                EvidenceCheckRow("Wire / Zelle / Bank payment receipts", hasBankEvidence) { hasBankEvidence = it }
                EvidenceCheckRow("Signed marketing agreement / contract", hasContractEvidence) { hasContractEvidence = it }
                EvidenceCheckRow("Screenshots of chat / portal rejection", hasScreenshotEvidence) { hasScreenshotEvidence = it }

                OutlinedTextField(
                    value = reporterContact,
                    onValueChange = { reporterContact = it },
                    label = { Text("Your Email (For Verification Team) *") },
                    placeholder = { Text("paulfinchpediatrics@gmail.com") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                HorizontalDivider(color = MatchaBorder)

                // Legal Attestation Checkbox (MANDATORY)
                Row(
                    verticalAlignment = Alignment.Top,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { legalAttestationAgreed = !legalAttestationAgreed }
                        .padding(vertical = 4.dp)
                ) {
                    Checkbox(
                        checked = legalAttestationAgreed,
                        onCheckedChange = { legalAttestationAgreed = it },
                        colors = CheckboxDefaults.colors(checkedColor = ScamRed)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "I swear under penalty of perjury and account termination that this report is true, based on my personal first-hand experience, that I possess documentary evidence, and that it contains no defamatory falsehoods.",
                        style = Typography.bodySmall.copy(
                            color = if (legalAttestationAgreed) SafeGreen else Color(0xFFDC2626),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            lineHeight = 15.sp
                        )
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amt = amountText.toDoubleOrNull() ?: 0.0
                    val proofList = mutableListOf<String>()
                    if (hasEmailEvidence) proofList.add("Email Headers")
                    if (hasBankEvidence) proofList.add("Bank Receipts")
                    if (hasContractEvidence) proofList.add("Signed Contract")
                    if (hasScreenshotEvidence) proofList.add("Screenshots")
                    val proofString = proofList.joinToString(", ").ifEmpty { "Pending User Upload" }

                    onSubmit(entityName, scamType, location, amt, factualDesc, proofString, reporterContact, legalAttestationAgreed)
                },
                enabled = entityName.isNotBlank() && factualDesc.isNotBlank() && reporterContact.isNotBlank() && legalAttestationAgreed,
                colors = ButtonDefaults.buttonColors(containerColor = ScamRed)
            ) {
                Text("Submit for Verification", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = MatchaTextSecondary)
            }
        }
    )
}

@Composable
fun EvidenceCheckRow(label: String, isChecked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!isChecked) }
            .padding(vertical = 1.dp)
    ) {
        Checkbox(
            checked = isChecked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(checkedColor = MatchaForest)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(text = label, style = Typography.bodySmall.copy(fontSize = 12.sp, color = MatchaDark))
    }
}

@Composable
fun ModerationReportCard(
    report: ScamReportEntity,
    onVerify: () -> Unit,
    onReject: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, MatchaBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = report.entityName,
                    style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                )

                Surface(
                    color = when (report.verificationStatus) {
                        "VERIFIED_ALERT" -> SafeGreen
                        "REJECTED" -> Color.Gray
                        else -> ScamAmber
                    },
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = when (report.verificationStatus) {
                            "VERIFIED_ALERT" -> "VERIFIED"
                            "REJECTED" -> "REJECTED"
                            else -> "IN REVIEW"
                        },
                        style = Typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold, fontSize = 9.sp),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "${report.scamType} • Loss: $${report.amountPaidOrDemanded.toInt()}",
                style = Typography.bodySmall.copy(color = ScamRed, fontWeight = FontWeight.SemiBold, fontSize = 11.sp)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = report.factualDescription,
                style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Proof on file: ${report.evidenceChecklist} • Attestation signed: ${if (report.legalAttestationAgreed) "Yes ✓" else "No"}",
                style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 10.sp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(
                    onClick = onVerify,
                    colors = ButtonDefaults.buttonColors(containerColor = SafeGreen),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(30.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp)
                ) {
                    Text("Approve Alert", fontSize = 11.sp, color = Color.White)
                }

                OutlinedButton(
                    onClick = onReject,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(30.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp)
                ) {
                    Text("Reject", fontSize = 11.sp, color = Color(0xFFDC2626))
                }

                TextButton(
                    onClick = onDelete,
                    modifier = Modifier.height(30.dp),
                    contentPadding = PaddingValues(horizontal = 6.dp)
                ) {
                    Text("Dismiss", fontSize = 11.sp, color = MatchaTextSecondary)
                }
            }
        }
    }
}

@Composable
fun VerifiedAlertCard(alert: VerifiedScamAlert) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = ScamRedContainer.copy(alpha = 0.5f)),
        border = androidx.compose.foundation.BorderStroke(1.dp, ScamRed.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = alert.entityName,
                    style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = Color(0xFF991B1B))
                )

                Surface(
                    color = ScamRed,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "DOCUMENTED ALERT",
                        style = Typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold, fontSize = 9.sp),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "${alert.scamCategory} • ${alert.location}",
                style = Typography.bodySmall.copy(color = Color(0xFF7F1D1D), fontWeight = FontWeight.SemiBold, fontSize = 11.sp)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = alert.verifiedFindings,
                style = Typography.bodySmall.copy(color = Color(0xFF1E293B), fontSize = 12.sp, lineHeight = 16.sp)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = SafeGreen, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = alert.documentationVerified,
                    style = Typography.bodySmall.copy(color = SafeGreen, fontSize = 10.sp, fontWeight = FontWeight.Medium)
                )
            }
        }
    }
}

@Composable
fun TabButton(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = if (isSelected) MatchaSurface else Color.Transparent,
        shape = RoundedCornerShape(10.dp),
        modifier = modifier.clickable { onClick() }
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.padding(vertical = 8.dp)
        ) {
            Text(
                text = title,
                style = Typography.labelMedium.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) MatchaForest else Color.White.copy(alpha = 0.85f),
                    fontSize = 12.sp
                )
            )
        }
    }
}

@Composable
fun RotationRiskAssessmentCard() {
    var checkNoBadges by remember { mutableStateOf(false) }
    var checkPersonalEmail by remember { mutableStateOf(false) }
    var checkWireZelle by remember { mutableStateOf(false) }
    var checkGuaranteedMatch by remember { mutableStateOf(false) }
    var checkPreSignedLor by remember { mutableStateOf(false) }

    val flagsCount = listOf(checkNoBadges, checkPersonalEmail, checkWireZelle, checkGuaranteedMatch, checkPreSignedLor).count { it }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "🧪", fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Interactive Rotation Scam Calculator",
                        style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                    )
                }

                Surface(
                    color = when {
                        flagsCount == 0 -> SafeGreen
                        flagsCount in 1..2 -> ScamAmber
                        else -> ScamRed
                    },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = when {
                            flagsCount == 0 -> "LOW RISK"
                            flagsCount in 1..2 -> "CAUTION"
                            else -> "HIGH FRAUD RISK"
                        },
                        style = Typography.labelSmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Select any warning signs present in your rotation offer to calculate scam probability:",
                style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 11.sp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            RiskCheckItem("Demands payment via Zelle, Venmo, or Personal Wire", checkWireZelle) { checkWireZelle = it }
            RiskCheckItem("Coordinator communicates via personal Gmail/Yahoo address", checkPersonalEmail) { checkPersonalEmail = it }
            RiskCheckItem("Promises 'Guaranteed Residency Interview' or 'Match Guarantee'", checkGuaranteedMatch) { checkGuaranteedMatch = it }
            RiskCheckItem("No hospital ID badge or institutional EMR credential provided", checkNoBadges) { checkNoBadges = it }
            RiskCheckItem("Instructs student to write own Letter of Recommendation for signature", checkPreSignedLor) { checkPreSignedLor = it }

            if (flagsCount > 0) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = if (flagsCount >= 3) ScamRedContainer else ScamAmberContainer,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = if (flagsCount >= 3) "🚨" else "⚠️", fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (flagsCount >= 3)
                                "Critical Risk ($flagsCount red flags): This offer strongly matches documented medical rotation fraud schemes. Do not send funds."
                            else
                                "Moderate Caution ($flagsCount flag): Verify hospital affiliation with the official GME office before sending payment.",
                            style = Typography.bodySmall.copy(
                                color = if (flagsCount >= 3) ScamRed else Color(0xFF78350F),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun RiskCheckItem(text: String, isChecked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCheckedChange(!isChecked) }
            .padding(vertical = 3.dp)
    ) {
        Checkbox(
            checked = isChecked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(
                checkedColor = ScamRed,
                uncheckedColor = MatchaBorder
            )
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = text,
            style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp)
        )
    }
}

@Composable
fun ScamWarningItemCard(warning: ScamWarningItem) {
    var isExpanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { isExpanded = !isExpanded }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Surface(
                        color = if (warning.severity == "CRITICAL") ScamRed else ScamAmber,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = warning.severity,
                            style = Typography.labelSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            ),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = warning.title,
                        style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                    )
                }

                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = MatchaForest
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = warning.redFlagDescription,
                style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp)
            )

            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(top = 10.dp)) {
                    HorizontalDivider(color = MatchaBorder)
                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "How the Scheme Operates:",
                        style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = ScamRed)
                    )
                    Text(
                        text = warning.howTheScamWorks,
                        style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp, lineHeight = 16.sp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Safe & Ethical Countermeasure:",
                        style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = SafeGreen)
                    )
                    Text(
                        text = warning.safeAlternative,
                        style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp, lineHeight = 16.sp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        color = MatchaContainer,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(8.dp)
                        ) {
                            Text(text = "✓", color = SafeGreen, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = warning.checklistItem,
                                style = Typography.bodySmall.copy(color = MatchaForest, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ReportingContactsCard() {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MatchaContainer),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.ContactPhone, contentDescription = null, tint = MatchaForest, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Official Medical Fraud Reporting Authorities",
                    style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "If you have paid money to an entity falsely claiming hospital residency affiliation, report immediately to:",
                style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 11.sp)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "• FTC Fraud Hotline: reportfraud.ftc.gov\n" +
                        "• ECFMG Credentials Investigation: casereview@ecfmg.org\n" +
                        "• AMA Division of Graduate Medical Education",
                style = Typography.bodySmall.copy(color = MatchaForest, fontWeight = FontWeight.Medium, fontSize = 11.sp)
            )
        }
    }
}

@Composable
fun MatchGuideItemCard(
    article: MatchGuideArticle,
    onCopyTemplate: (String) -> Unit
) {
    var isExpanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Surface(
                    color = MatchaContainer,
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = article.category,
                        style = Typography.labelSmall.copy(
                            color = MatchaForest,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        ),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Text(
                    text = "${article.readingTimeMinutes} min read",
                    style = Typography.labelSmall.copy(color = MatchaTextSecondary, fontSize = 10.sp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = article.title,
                style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = article.summary,
                style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Key Takeaways:",
                style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = MatchaForest)
            )

            Spacer(modifier = Modifier.height(4.dp))

            article.keyTakeaways.forEach { takeaway ->
                Row(
                    modifier = Modifier.padding(vertical = 2.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Text(text = "•", color = MatchaForest, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = takeaway,
                        style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 11.sp)
                    )
                }
            }

            if (article.actionableTemplate != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { onCopyTemplate(article.actionableTemplate) },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color.White)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Copy Email Template", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(
                onClick = { isExpanded = !isExpanded },
                modifier = Modifier.align(Alignment.End)
            ) {
                Text(
                    text = if (isExpanded) "Hide Full Article" else "Read Full Guide",
                    color = MatchaForest,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = MatchaForest,
                    modifier = Modifier.size(16.dp)
                )
            }

            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(top = 8.dp)) {
                    HorizontalDivider(color = MatchaBorder)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = article.fullContent,
                        style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp, lineHeight = 17.sp)
                    )
                }
            }
        }
    }
}
