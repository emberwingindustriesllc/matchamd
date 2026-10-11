package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
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
import com.example.data.repository.QuizRepository
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel

@Composable
fun QuizScreen(
    viewModel: MatchaViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val vignettes = QuizRepository.vignettes
    val currentVignette = vignettes.getOrElse(uiState.activeVignetteIndex) { vignettes.first() }
    val isSubmitted = uiState.isAnswerSubmitted
    val selectedIndex = uiState.selectedAnswerIndex

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MatchaBackground)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MatchaForest)
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.MedicalServices,
                            contentDescription = null,
                            tint = MatchaAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "USMLE Step 2 CK Vignettes",
                            style = Typography.titleLarge.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    // Score pill
                    Box(
                        modifier = Modifier
                            .background(MatchaLight, RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${uiState.totalQuizCorrect}/${uiState.totalQuizAnswered} Correct",
                            style = Typography.labelSmall.copy(
                                color = MatchaDark,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "High-yield pediatric, internal medicine & surgery board-style clinical vignettes with management pearls.",
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
            // Case Info Banner
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .background(currentVignette.specialty.color.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = currentVignette.specialty.displayName,
                        style = Typography.labelMedium.copy(
                            color = currentVignette.specialty.color,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Text(
                    text = "Case ${uiState.activeVignetteIndex + 1} of ${vignettes.size}",
                    style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontWeight = FontWeight.SemiBold)
                )
            }

            // Case Card (Patient Stem & Exam)
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
                        text = currentVignette.title,
                        style = Typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MatchaDark
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = currentVignette.patientStem,
                        style = Typography.bodyMedium.copy(
                            color = MatchaOnSurface,
                            lineHeight = 22.sp
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Vitals & Labs callout
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MatchaSurfaceVariant, RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Text(
                            text = currentVignette.vitalsAndExam,
                            style = Typography.bodySmall.copy(
                                color = MatchaDark,
                                lineHeight = 19.sp,
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = currentVignette.questionPrompt,
                        style = Typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MatchaDark
                        )
                    )
                }
            }

            // Options List
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                currentVignette.choices.forEachIndexed { index, choiceText ->
                    val isChosen = selectedIndex == index
                    val isCorrectOption = index == currentVignette.correctIndex

                    val cardColor = when {
                        !isSubmitted && isChosen -> MatchaContainer
                        isSubmitted && isCorrectOption -> Color(0xFFDCFCE7) // Soft Green
                        isSubmitted && isChosen && !isCorrectOption -> Color(0xFFFFE4E6) // Soft Red
                        else -> MatchaSurface
                    }

                    val borderColor = when {
                        isSubmitted && isCorrectOption -> Color(0xFF16A34A)
                        isSubmitted && isChosen && !isCorrectOption -> Color(0xFFDC2626)
                        !isSubmitted && isChosen -> MatchaLeaf
                        else -> MatchaBorder
                    }

                    Card(
                        colors = CardDefaults.cardColors(containerColor = cardColor),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, borderColor),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = !isSubmitted) {
                                viewModel.selectQuizAnswer(index)
                            }
                            .testTag("quiz_option_$index")
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clip(CircleShape)
                                    .background(
                                        when {
                                            isSubmitted && isCorrectOption -> Color(0xFF16A34A)
                                            isSubmitted && isChosen && !isCorrectOption -> Color(0xFFDC2626)
                                            else -> MatchaSurfaceVariant
                                        }
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isSubmitted && isCorrectOption) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                } else if (isSubmitted && isChosen && !isCorrectOption) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                } else {
                                    Text(
                                        text = choiceText.take(1),
                                        style = Typography.labelMedium.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MatchaDark
                                        )
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Text(
                                text = choiceText,
                                style = Typography.bodyMedium.copy(
                                    color = MatchaOnSurface,
                                    fontWeight = if (isChosen || (isSubmitted && isCorrectOption)) FontWeight.SemiBold else FontWeight.Normal
                                )
                            )
                        }
                    }
                }
            }

            // Feedback Explanation & Clinical Pearl (when submitted)
            if (isSubmitted) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                    shape = RoundedCornerShape(14.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(MatchaBorder)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("quiz_explanation_card")
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (selectedIndex == currentVignette.correctIndex) Icons.Default.CheckCircle else Icons.Default.Error,
                                contentDescription = null,
                                tint = if (selectedIndex == currentVignette.correctIndex) Color(0xFF16A34A) else Color(0xFFDC2626),
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (selectedIndex == currentVignette.correctIndex) "Correct! Excellent Clinical Reasoning." else "Incorrect — Review Key Concepts",
                                style = Typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedIndex == currentVignette.correctIndex) Color(0xFF16A34A) else Color(0xFFDC2626)
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "Detailed Rationale:",
                            style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = currentVignette.explanation,
                            style = Typography.bodyMedium.copy(
                                color = MatchaOnSurface,
                                lineHeight = 21.sp
                            )
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // High Yield Clinical Pearl
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(MatchaContainer, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Star,
                                        contentDescription = null,
                                        tint = MatchaLeaf,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "High-Yield USMLE Pearl",
                                        style = Typography.labelSmall.copy(
                                            color = MatchaDark,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = currentVignette.clinicalPearl,
                                    style = Typography.bodySmall.copy(
                                        color = MatchaDark,
                                        lineHeight = 18.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = { viewModel.nextQuizVignette() },
                            colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("quiz_next_button")
                        ) {
                            Text("Next Vignette", style = Typography.labelLarge.copy(color = Color.White))
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
