package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel
import java.text.NumberFormat
import java.util.Locale

@Composable
fun CalculatorScreen(
    viewModel: MatchaViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val cost = uiState.costProfile
    val currencyFormat = NumberFormat.getCurrencyInstance(Locale.US).apply {
        maximumFractionDigits = 0
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MatchaBackground)
            .verticalScroll(rememberScrollState())
    ) {
        // Header Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MatchaForest)
                .padding(horizontal = 20.dp, vertical = 18.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Calculate,
                        contentDescription = null,
                        tint = MatchaAccent,
                        modifier = Modifier.size(26.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "ERAS & Match Cost Estimator",
                        style = Typography.titleLarge.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Calculate total application, exam, and travel expenses using official AAMC ERAS tiered fee formulas.",
                    style = Typography.bodySmall.copy(color = MatchaContainer)
                )
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Grand Total Hero Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MatchaPrimary),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("calc_grand_total_card")
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "ESTIMATED TOTAL MATCH BUDGET",
                        style = Typography.labelSmall.copy(
                            color = MatchaContainer,
                            letterSpacing = 1.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = currencyFormat.format(cost.grandTotal),
                        style = Typography.displayLarge.copy(
                            color = Color.White,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 38.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(MatchaDark.copy(alpha = 0.4f))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        BudgetMiniMetric(
                            label = "ERAS Apps",
                            value = currencyFormat.format(cost.totalErasApplicationFees)
                        )
                        BudgetMiniMetric(
                            label = "Exams & ECFMG",
                            value = currencyFormat.format(cost.examFeesTotal)
                        )
                        BudgetMiniMetric(
                            label = "NRMP + Travel",
                            value = currencyFormat.format(cost.nrmpMatchFee + cost.miscellaneousTotal)
                        )
                    }
                }
            }

            // Application Volume Configuration Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                shape = RoundedCornerShape(14.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(MatchaBorder)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Programs Per Specialty",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                        Text(
                            text = "${cost.programsPerSpecialty} programs",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaLeaf)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Slider(
                        value = cost.programsPerSpecialty.toFloat(),
                        onValueChange = { viewModel.updateProgramsPerSpecialty(it.toInt()) },
                        valueRange = 1f..120f,
                        steps = 119,
                        colors = SliderDefaults.colors(
                            thumbColor = MatchaLeaf,
                            activeTrackColor = MatchaLeaf,
                            inactiveTrackColor = MatchaSurfaceVariant
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("calc_slider_programs")
                    )

                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("1 (Low)", style = Typography.labelSmall.copy(color = Color.Gray))
                        Text("30 (Typical)", style = Typography.labelSmall.copy(color = Color.Gray))
                        Text("70+ (High Volume)", style = Typography.labelSmall.copy(color = Color.Gray))
                        Text("120", style = Typography.labelSmall.copy(color = Color.Gray))
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = MatchaBorder)
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            Text(
                                text = "Number of Specialties Applied",
                                style = Typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold, color = MatchaDark)
                            )
                            Text(
                                text = "e.g. Dual-applying Pediatrics & Family Med",
                                style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { viewModel.updateNumberOfSpecialties(cost.numberOfSpecialties - 1) },
                                enabled = cost.numberOfSpecialties > 1,
                                modifier = Modifier
                                    .size(34.dp)
                                    .testTag("calc_btn_minus_specialty")
                            ) {
                                Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Decrease")
                            }
                            Text(
                                text = "${cost.numberOfSpecialties}",
                                style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark),
                                modifier = Modifier.padding(horizontal = 8.dp)
                            )
                            IconButton(
                                onClick = { viewModel.updateNumberOfSpecialties(cost.numberOfSpecialties + 1) },
                                enabled = cost.numberOfSpecialties < 4,
                                modifier = Modifier
                                    .size(34.dp)
                                    .testTag("calc_btn_plus_specialty")
                            ) {
                                Icon(Icons.Default.AddCircleOutline, contentDescription = "Increase")
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Tier Breakdown Box
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MatchaSurfaceVariant, RoundedCornerShape(8.dp))
                            .padding(10.dp)
                    ) {
                        Column {
                            Text(
                                text = "Official AAMC ERAS Tier Calculation:",
                                style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "• 1 to 10 programs: $99 flat package\n• 11 to 30 programs: $19 each\n• 31+ programs: $27 each (Multiplied by ${cost.numberOfSpecialties} specialty)",
                                style = Typography.bodySmall.copy(color = MatchaTextSecondary, lineHeight = 18.sp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Subtotal ERAS Fee: ${currencyFormat.format(cost.totalErasApplicationFees)}",
                                style = Typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = MatchaLeaf)
                            )
                        }
                    }
                }
            }

            // Required Licensing & Certification Exams Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                shape = RoundedCornerShape(14.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(MatchaBorder)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Exams & ECFMG Certification Fees",
                        style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                    )
                    Text(
                        text = "Toggle fees relevant to your remaining match timeline:",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    ExamCheckboxRow(
                        title = "USMLE Step 1 Registration",
                        subtitle = "Standard test administration fee",
                        amount = "$1,025",
                        checked = cost.includeStep1Fee,
                        onCheckedChange = { viewModel.toggleExamFee("step1") },
                        testTag = "calc_check_step1"
                    )
                    ExamCheckboxRow(
                        title = "USMLE Step 2 CK Registration",
                        subtitle = "Clinical knowledge examination fee",
                        amount = "$1,025",
                        checked = cost.includeStep2Fee,
                        onCheckedChange = { viewModel.toggleExamFee("step2") },
                        testTag = "calc_check_step2"
                    )
                    ExamCheckboxRow(
                        title = "OET Medicine Exam",
                        subtitle = "Occupational English Test for ECFMG Pathways",
                        amount = "$455",
                        checked = cost.includeOetFee,
                        onCheckedChange = { viewModel.toggleExamFee("oet") },
                        testTag = "calc_check_oet"
                    )
                    ExamCheckboxRow(
                        title = "ECFMG Certification Application",
                        subtitle = "Credential verification & pathway processing",
                        amount = "$160",
                        checked = cost.includeEcfmgFee,
                        onCheckedChange = { viewModel.toggleExamFee("ecfmg") },
                        testTag = "calc_check_ecfmg"
                    )
                }
            }

            // Travel & Miscellaneous Budget Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                shape = RoundedCornerShape(14.dp),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(MatchaBorder)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Travel, Second-Looks & Tech Budget",
                        style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                    )
                    Text(
                        text = "Flights, hotels for open houses, webcams & attire:",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Travel & Lodging:", style = Typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                        Text(currencyFormat.format(cost.travelAndLodgingBudget), style = Typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = MatchaLeaf))
                    }
                    Slider(
                        value = cost.travelAndLodgingBudget.toFloat(),
                        onValueChange = { viewModel.updateTravelBudget(it.toInt()) },
                        valueRange = 0f..4000f,
                        steps = 39,
                        colors = SliderDefaults.colors(
                            thumbColor = MatchaLeaf,
                            activeTrackColor = MatchaLeaf
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("calc_slider_travel")
                    )

                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp)
                    ) {
                        Text("Interview Lighting, Audio & Attire:", style = Typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                        Text("$300 (Fixed)", style = Typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark))
                    }
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                    ) {
                        Text("NRMP Standard Registration:", style = Typography.bodyMedium.copy(fontWeight = FontWeight.Medium))
                        Text("$85 (Standard)", style = Typography.bodyMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark))
                    }
                }
            }

            // High Yield Cost-Saving Strategy
            Card(
                colors = CardDefaults.cardColors(containerColor = MatchaContainer),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.Lightbulb,
                        contentDescription = null,
                        tint = MatchaDark,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Strategic Signaling Recommendation",
                            style = Typography.labelLarge.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Applying to >30 programs incurs the highest $27/program marginal rate. Use program signaling preferences wisely on programs whose Step 2 CK cutoffs closely align with your score to optimize your interview yield per dollar.",
                            style = Typography.bodySmall.copy(color = MatchaDark, lineHeight = 18.sp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun BudgetMiniMetric(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, style = Typography.labelSmall.copy(color = Color(0xFFD4E2D2), fontSize = 10.sp))
        Text(text = value, style = Typography.titleSmall.copy(color = Color.White, fontWeight = FontWeight.Bold))
    }
}

@Composable
private fun ExamCheckboxRow(
    title: String,
    subtitle: String,
    amount: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    testTag: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Checkbox(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = CheckboxDefaults.colors(
                    checkedColor = MatchaLeaf,
                    checkmarkColor = Color.White
                ),
                modifier = Modifier.testTag(testTag)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Column {
                Text(
                    text = title,
                    style = Typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold, color = MatchaDark)
                )
                Text(
                    text = subtitle,
                    style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 11.sp)
                )
            }
        }
        Text(
            text = amount,
            style = Typography.bodyMedium.copy(
                fontWeight = FontWeight.Bold,
                color = if (checked) MatchaLeaf else Color.Gray
            )
        )
    }
}
