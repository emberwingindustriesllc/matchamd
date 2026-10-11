package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProgramsScreen(
    viewModel: MatchaViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val filteredPrograms by viewModel.filteredPrograms.collectAsState()
    val context = LocalContext.current

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MatchaBackground)
    ) {
        // Top Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MatchaForest)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "🍵", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "MatchaMD",
                                style = Typography.titleLarge.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                            Text(
                                text = "Residencies, Fellowships & Observerships",
                                style = Typography.bodySmall.copy(color = MatchaContainer, fontSize = 11.sp)
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Admin Queue Mode Toggle
                        Surface(
                            color = if (uiState.showAdminPendingQueue) ScamAmber else Color.White.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(20.dp),
                            modifier = Modifier
                                .clickable { viewModel.toggleAdminPendingQueue() }
                                .testTag("admin_pending_queue_toggle")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Icon(
                                    imageVector = if (uiState.showAdminPendingQueue) Icons.Default.AdminPanelSettings else Icons.Default.VerifiedUser,
                                    contentDescription = "Review",
                                    tint = Color.White,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (uiState.showAdminPendingQueue) "Reviewing" else "Verify",
                                    style = Typography.labelSmall.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(6.dp))

                        Box(
                            modifier = Modifier
                                .background(MatchaLight, RoundedCornerShape(20.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "${filteredPrograms.size}",
                                style = Typography.labelSmall.copy(
                                    color = MatchaDark,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                }

                // If admin review mode is active, show banner
                if (uiState.showAdminPendingQueue) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(ScamAmberContainer, RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = ScamAmber, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Review Mode: Showing Community Submissions pending verification",
                                style = Typography.labelSmall.copy(color = ScamAmber, fontWeight = FontWeight.Bold)
                            )
                        }
                    }
                }
            }
        }

        // Search Bar & Filter Controls
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MatchaSurface)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Search Input
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.updateSearchQuery(it) },
                placeholder = { Text("Search residencies, fellowships, observerships, or city...", fontSize = 12.sp) },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = MatchaPrimary)
                },
                trailingIcon = {
                    if (uiState.searchQuery.isNotEmpty()) {
                        IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", tint = Color.Gray)
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MatchaPrimary,
                    unfocusedBorderColor = MatchaBorder,
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = MatchaBackground
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("program_search_input")
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Program Type Filter Chips (Residencies, Fellowships, Observerships)
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
            ) {
                ProgramTypeFilterPill(
                    label = "All Programs",
                    isSelected = uiState.selectedProgramType == null,
                    badgeColor = MatchaForest,
                    onClick = { viewModel.selectProgramTypeFilter(null) }
                )
                ProgramTypeFilterPill(
                    label = "Residencies",
                    isSelected = uiState.selectedProgramType == ProgramType.RESIDENCY,
                    badgeColor = TypeResidencyBadge,
                    onClick = { viewModel.selectProgramTypeFilter(ProgramType.RESIDENCY) }
                )
                ProgramTypeFilterPill(
                    label = "Fellowships",
                    isSelected = uiState.selectedProgramType == ProgramType.FELLOWSHIP,
                    badgeColor = TypeFellowshipBadge,
                    onClick = { viewModel.selectProgramTypeFilter(ProgramType.FELLOWSHIP) }
                )
                ProgramTypeFilterPill(
                    label = "Observerships / USCE",
                    isSelected = uiState.selectedProgramType == ProgramType.OBSERVERSHIP,
                    badgeColor = TypeObservershipBadge,
                    onClick = { viewModel.selectProgramTypeFilter(ProgramType.OBSERVERSHIP) }
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Specialty Filter Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = uiState.selectedSpecialty == null,
                        onClick = { viewModel.selectSpecialtyFilter(null) },
                        label = { Text("All Specialties", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MatchaPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
                items(MedicalSpecialty.values()) { spec ->
                    FilterChip(
                        selected = uiState.selectedSpecialty == spec,
                        onClick = { viewModel.selectSpecialtyFilter(spec) },
                        label = { Text(spec.displayName, fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = spec.color,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Visa Sponsorship Chips & Submit Button
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .weight(1f)
                        .horizontalScroll(rememberScrollState())
                ) {
                    VisaFilterPill(
                        label = "All Visas",
                        isSelected = uiState.selectedVisa == null,
                        onClick = { viewModel.selectVisaFilter(null) }
                    )
                    VisaFilterPill(
                        label = "J-1 & H-1B",
                        isSelected = uiState.selectedVisa == VisaSponsorship.J1_AND_H1B,
                        onClick = { viewModel.selectVisaFilter(VisaSponsorship.J1_AND_H1B) }
                    )
                    VisaFilterPill(
                        label = "J-1 Sponsored",
                        isSelected = uiState.selectedVisa == VisaSponsorship.J1_ONLY,
                        onClick = { viewModel.selectVisaFilter(VisaSponsorship.J1_ONLY) }
                    )
                }

                // Add Program Button
                Button(
                    onClick = { viewModel.toggleSubmitProgramDialog(true) },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier
                        .height(32.dp)
                        .testTag("add_program_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Program", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Program Cards List
        if (filteredPrograms.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "🩺", fontSize = 44.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = if (uiState.showAdminPendingQueue) "No Pending Submissions" else "No Programs Found",
                        style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (uiState.showAdminPendingQueue)
                            "All community-submitted programs have been reviewed and verified!"
                        else
                            "Try clearing your filters or tap '+ Add Program' to submit one.",
                        style = Typography.bodyMedium.copy(color = Color.Gray)
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredPrograms, key = { it.id }) { program ->
                    ResidencyProgramCard(
                        program = program,
                        onOpenDetails = { viewModel.openProgramDetails(program) },
                        onToggleBookmark = { viewModel.toggleSaveProgram(program) },
                        onVerify = { viewModel.verifyCommunityProgram(program.id, true) },
                        onDismiss = { viewModel.deleteCommunityProgram(program.id) },
                        isAdminMode = uiState.showAdminPendingQueue
                    )
                }
            }
        }

        // Program Details Modal Bottom Sheet
        if (uiState.selectedProgramForModal != null) {
            ProgramDetailsModal(
                program = uiState.selectedProgramForModal!!,
                onDismiss = { viewModel.openProgramDetails(null) },
                onToggleBookmark = {
                    viewModel.toggleSaveProgram(uiState.selectedProgramForModal!!)
                },
                onVerify = {
                    viewModel.verifyCommunityProgram(uiState.selectedProgramForModal!!.id, true)
                    viewModel.openProgramDetails(null)
                }
            )
        }

        // Community Program Submission Dialog
        if (uiState.showSubmitProgramDialog) {
            SubmitProgramDialog(
                onDismiss = { viewModel.toggleSubmitProgramDialog(false) },
                onSubmit = { name, hospital, type, specialty, city, state, visa, minScore, fee, email, url, notes, handsOn ->
                    viewModel.submitCommunityProgram(
                        name = name,
                        hospitalName = hospital,
                        programType = type,
                        specialty = specialty,
                        city = city,
                        state = state,
                        visaSponsorship = visa,
                        minStepScore = minScore,
                        feeOrSalary = fee,
                        contactEmail = email,
                        websiteUrl = url,
                        highlights = notes,
                        handsOnType = handsOn
                    )
                    viewModel.toggleSubmitProgramDialog(false)
                    Toast.makeText(
                        context,
                        "Program submitted! It will appear in the verification review queue.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            )
        }
    }
}

@Composable
private fun ProgramTypeFilterPill(
    label: String,
    isSelected: Boolean,
    badgeColor: Color,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .shadow(if (isSelected) 2.dp else 0.dp, RoundedCornerShape(16.dp))
            .background(
                if (isSelected) badgeColor else MatchaSurfaceVariant,
                RoundedCornerShape(16.dp)
            )
            .border(
                1.dp,
                if (isSelected) badgeColor else MatchaBorder,
                RoundedCornerShape(16.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) Color.White else MatchaTextSecondary
        )
    }
}

@Composable
fun VisaFilterPill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .shadow(if (isSelected) 2.dp else 0.dp, RoundedCornerShape(16.dp))
            .background(
                if (isSelected) MatchaForest else MatchaSurfaceVariant,
                RoundedCornerShape(16.dp)
            )
            .border(
                1.dp,
                if (isSelected) MatchaForest else MatchaBorder,
                RoundedCornerShape(16.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) Color.White else MatchaTextSecondary
        )
    }
}

@Composable
fun ResidencyProgramCard(
    program: ResidencyProgram,
    onOpenDetails: () -> Unit,
    onToggleBookmark: () -> Unit,
    onVerify: () -> Unit,
    onDismiss: () -> Unit,
    isAdminMode: Boolean
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenDetails() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row: Program Type, Specialty Pill & Bookmark
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    // Program Type Badge
                    Surface(
                        color = program.programType.badgeColor,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = program.programType.displayName.uppercase(),
                            style = Typography.labelSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            ),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Specialty Pill
                    Box(
                        modifier = Modifier
                            .background(program.specialty.color.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = program.specialty.displayName,
                            style = Typography.labelSmall.copy(
                                color = program.specialty.color,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            )
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Visa Badge
                    Box(
                        modifier = Modifier
                            .background(program.visaSponsorship.badgeColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = program.visaSponsorship.label,
                            style = Typography.labelSmall.copy(
                                color = program.visaSponsorship.badgeColor,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 9.sp
                            )
                        )
                    }
                }

                IconButton(
                    onClick = onToggleBookmark,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = if (program.isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = if (program.isSaved) MatchaForest else Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Program Name & Location
            Text(
                text = program.name,
                style = Typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = MatchaOnSurface,
                    fontSize = 15.sp
                )
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${program.hospitalName} • ${program.city}, ${program.state}",
                style = Typography.bodySmall.copy(color = MatchaTextSecondary)
            )

            if (program.subspecialtyFocus.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Focus: ${program.subspecialtyFocus}",
                    style = Typography.bodySmall.copy(
                        color = MatchaForest,
                        fontWeight = FontWeight.Medium,
                        fontSize = 11.sp
                    )
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Key Stats Pills (Positions/Spots, Min Step 2, Stipend / Fee, IMG Score)
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MatchaSurfaceVariant, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Column {
                    Text(
                        text = if (program.programType == ProgramType.OBSERVERSHIP) "ROTATION TYPE" else "POSITIONS",
                        fontSize = 8.sp,
                        color = MatchaTextSecondary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (program.programType == ProgramType.OBSERVERSHIP) "Observership" else "${program.pgy1Positions}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MatchaOnSurface
                    )
                }
                Column {
                    Text(text = "MIN STEP 2", fontSize = 8.sp, color = MatchaTextSecondary, fontWeight = FontWeight.Bold)
                    Text(text = "${program.minStep2Score}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MatchaForest)
                }
                Column {
                    Text(
                        text = if (program.programType == ProgramType.OBSERVERSHIP) "FEE / COST" else "STIPEND",
                        fontSize = 8.sp,
                        color = MatchaTextSecondary,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (program.applicationFeeOrSalary.isNotEmpty()) program.applicationFeeOrSalary.take(14)
                        else if (program.annualSalary > 0) "$${program.annualSalary / 1000}k/yr" else "N/A",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MatchaOnSurface
                    )
                }
                Column {
                    Text(text = "IMG FRIENDLY", fontSize = 8.sp, color = MatchaTextSecondary, fontWeight = FontWeight.Bold)
                    Text(text = "${program.imgFriendlyScore}/10", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ImgFriendlyBadge)
                }
            }

            // Community Submitted / Admin Verification Actions
            if (program.isCommunitySubmitted) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Surface(
                        color = if (program.verificationStatus == VerificationStatus.VERIFIED) SafeGreenContainer else ScamAmberContainer,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = program.verificationStatus.label,
                            style = Typography.labelSmall.copy(
                                color = program.verificationStatus.color,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            ),
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    if (isAdminMode && program.verificationStatus == VerificationStatus.PENDING_REVIEW) {
                        Row {
                            TextButton(onClick = onDismiss) {
                                Text("Dismiss", color = ScamRed, fontSize = 11.sp)
                            }
                            Button(
                                onClick = onVerify,
                                colors = ButtonDefaults.buttonColors(containerColor = SafeGreen),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Approve & Verify", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProgramDetailsModal(
    program: ResidencyProgram,
    onDismiss: () -> Unit,
    onToggleBookmark: () -> Unit,
    onVerify: () -> Unit
) {
    val context = LocalContext.current

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color.White,
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = program.programType.badgeColor,
                        shape = RoundedCornerShape(6.dp)
                    ) {
                        Text(
                            text = program.programType.displayName,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .background(program.specialty.color.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = program.specialty.displayName,
                            color = program.specialty.color,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }

                Button(
                    onClick = onToggleBookmark,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (program.isSaved) MatchaDark else MatchaForest
                    )
                ) {
                    Icon(
                        imageVector = if (program.isSaved) Icons.Default.Check else Icons.Default.Add,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (program.isSaved) "Ranked" else "Add to Rank List")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = program.name,
                style = Typography.titleLarge.copy(fontWeight = FontWeight.Bold, fontSize = 18.sp)
            )
            Text(
                text = "${program.hospitalName} • ${program.city}, ${program.state}",
                style = Typography.bodyMedium.copy(color = MatchaTextSecondary)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Details Breakdown Grid
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MatchaBackground, RoundedCornerShape(12.dp))
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                DetailRow("Program Type", program.programType.displayName)
                if (program.subspecialtyFocus.isNotEmpty()) {
                    DetailRow("Focus Area", program.subspecialtyFocus)
                }
                DetailRow("Visa Sponsorship", program.visaSponsorship.label)
                DetailRow("Min Step 2 Score", "${program.minStep2Score}")
                DetailRow("Salary / Fee", if (program.applicationFeeOrSalary.isNotEmpty()) program.applicationFeeOrSalary else "$${program.annualSalary}/year")
                DetailRow("Hospital Setting", program.hospitalSetting.label)
                DetailRow("Clinical Experience", program.handsOnVsObservership)
                DetailRow("LOR Opportunity", program.letterOfRecommendationType)
                if (program.programDirector.isNotEmpty()) {
                    DetailRow("Program Director", program.programDirector)
                }
                if (program.acgmeCode.isNotEmpty()) {
                    DetailRow("ACGME / ID Code", program.acgmeCode)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = "Program Highlights & Rotations:",
                style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = program.highlights,
                style = Typography.bodyMedium.copy(color = MatchaOnSurface, lineHeight = 20.sp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Contact Actions (Website & Email)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (program.contactEmail.isNotEmpty()) {
                    OutlinedButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_SENDTO).apply {
                                data = Uri.parse("mailto:${program.contactEmail}")
                                putExtra(Intent.EXTRA_SUBJECT, "Inquiry: ${program.name}")
                            }
                            try {
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "Contact: ${program.contactEmail}", Toast.LENGTH_LONG).show()
                            }
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Email Coordinator", fontSize = 12.sp)
                    }
                }

                if (program.websiteUrl.isNotEmpty()) {
                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(program.websiteUrl))
                            try {
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                Toast.makeText(context, "URL: ${program.websiteUrl}", Toast.LENGTH_SHORT).show()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Visit Website", fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = Typography.bodySmall.copy(color = MatchaTextSecondary))
        Text(text = value, style = Typography.bodySmall.copy(fontWeight = FontWeight.SemiBold, color = MatchaOnSurface))
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SubmitProgramDialog(
    onDismiss: () -> Unit,
    onSubmit: (
        name: String,
        hospital: String,
        type: ProgramType,
        specialty: MedicalSpecialty,
        city: String,
        state: String,
        visa: VisaSponsorship,
        minScore: Int,
        feeOrSalary: String,
        email: String,
        url: String,
        notes: String,
        handsOn: String
    ) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var hospital by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf(ProgramType.OBSERVERSHIP) }
    var selectedSpecialty by remember { mutableStateOf(MedicalSpecialty.INTERNAL_MEDICINE) }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var selectedVisa by remember { mutableStateOf(VisaSponsorship.J1_AND_H1B) }
    var minScoreText by remember { mutableStateOf("220") }
    var feeOrSalary by remember { mutableStateOf("") }
    var contactEmail by remember { mutableStateOf("") }
    var websiteUrl by remember { mutableStateOf("") }
    var highlights by remember { mutableStateOf("") }
    var handsOnType by remember { mutableStateOf("Inpatient Clinical Observership") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Add Program / Rotation",
                style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Submit a residency, fellowship, or observership program. It will be added to the database and can be verified by admin.",
                    style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                )

                // Program Type Selector
                Text(text = "Program Type:", style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    ProgramType.values().forEach { t ->
                        FilterChip(
                            selected = selectedType == t,
                            onClick = { selectedType = t },
                            label = { Text(t.displayName, fontSize = 10.sp) }
                        )
                    }
                }

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Program / Rotation Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = hospital,
                    onValueChange = { hospital = it },
                    label = { Text("Hospital or Institution *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = city,
                        onValueChange = { city = it },
                        label = { Text("City *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = state,
                        onValueChange = { state = it },
                        label = { Text("State (e.g. TX) *") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                OutlinedTextField(
                    value = feeOrSalary,
                    onValueChange = { feeOrSalary = it },
                    label = { Text("Salary or Rotation Fee (e.g. Free / $500 fee)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = contactEmail,
                    onValueChange = { contactEmail = it },
                    label = { Text("Coordinator Email *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = websiteUrl,
                    onValueChange = { websiteUrl = it },
                    label = { Text("Official Website URL") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = highlights,
                    onValueChange = { highlights = it },
                    label = { Text("Key Details / LOR Policy / Requirements") },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isBlank() || hospital.isBlank()) return@Button
                    val parsedScore = minScoreText.toIntOrNull() ?: 215
                    onSubmit(
                        name,
                        hospital,
                        selectedType,
                        selectedSpecialty,
                        city,
                        state,
                        selectedVisa,
                        parsedScore,
                        feeOrSalary,
                        contactEmail,
                        websiteUrl,
                        highlights,
                        handsOnType
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = MatchaForest)
            ) {
                Text("Submit Program")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
