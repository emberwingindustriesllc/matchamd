package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.repository.InterviewRepository
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel

@Composable
fun TimelineScreen(
    viewModel: MatchaViewModel,
    modifier: Modifier = Modifier
) {
    val events = InterviewRepository.timelineEvents

    // Interactive checklist states
    var lORChecked by remember { mutableStateOf(true) }
    var personalStatementChecked by remember { mutableStateOf(true) }
    var ecfmgChecked by remember { mutableStateOf(false) }
    var signalingChecked by remember { mutableStateOf(false) }

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
                            imageVector = Icons.Default.Event,
                            contentDescription = null,
                            tint = MatchaAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Match Season Timeline",
                            style = Typography.titleLarge.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    Box(
                        modifier = Modifier
                            .background(MatchaLight, RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "ERAS 2025-2026",
                            style = Typography.labelSmall.copy(
                                color = MatchaDark,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Critical NRMP & ERAS milestones, lock dates, and pre-submission checklist.",
                    style = Typography.bodySmall.copy(color = MatchaContainer)
                )
            }
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Milestone Progress Alert
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MatchaPrimary),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.NotificationsActive,
                                contentDescription = null,
                                tint = MatchaAccent,
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Next Major Milestone Ahead",
                                style = Typography.titleSmall.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "MyERAS application submission unlocks simultaneously for all ACGME residency programs at 9:00 AM ET. Complete document certifying 48h prior to avoid server bottlenecks.",
                            style = Typography.bodySmall.copy(color = MatchaContainer, lineHeight = 18.sp)
                        )
                    }
                }
            }

            // Pre-Submission Readiness Checklist
            item {
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
                            text = "Pre-Submission Readiness Checklist",
                            style = Typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = MatchaDark
                            )
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        ChecklistRow(
                            label = "3-4 Specialty Letters of Recommendation (LoRs) uploaded & assigned",
                            checked = lORChecked,
                            onChecked = { lORChecked = !lORChecked }
                        )
                        ChecklistRow(
                            label = "Specialty-specific Personal Statements formatted & proofread",
                            checked = personalStatementChecked,
                            onChecked = { personalStatementChecked = !personalStatementChecked }
                        )
                        ChecklistRow(
                            label = "ECFMG Pathway validation / Step 2 CK score transcript released",
                            checked = ecfmgChecked,
                            onChecked = { ecfmgChecked = !ecfmgChecked }
                        )
                        ChecklistRow(
                            label = "Program Geographic Preferences & Supplemental Signaling finalized",
                            checked = signalingChecked,
                            onChecked = { signalingChecked = !signalingChecked }
                        )
                    }
                }
            }

            // Timeline Items
            items(events) { event ->
                TimelineCard(event = event)
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun ChecklistRow(
    label: String,
    checked: Boolean,
    onChecked: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = { onChecked() },
            colors = CheckboxDefaults.colors(checkedColor = MatchaLeaf)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            style = Typography.bodySmall.copy(
                color = if (checked) MatchaDark else MatchaTextSecondary,
                fontWeight = if (checked) FontWeight.Medium else FontWeight.Normal
            )
        )
    }
}

@Composable
private fun TimelineCard(event: com.example.data.model.MatchTimelineEvent) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        shape = RoundedCornerShape(14.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(MatchaBorder)),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("timeline_card_${event.title.take(10)}")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(if (event.isCrucial) DeadlineUrgent.copy(alpha = 0.15f) else MatchaContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (event.isCrucial) Icons.Default.PriorityHigh else Icons.Default.CalendarToday,
                    contentDescription = null,
                    tint = if (event.isCrucial) DeadlineUrgent else MatchaDark,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = event.title,
                        style = Typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MatchaDark
                        )
                    )

                    if (event.isCrucial) {
                        Box(
                            modifier = Modifier
                                .background(DeadlineUrgent, RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "CRITICAL",
                                style = Typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold, fontSize = 9.sp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = event.dateString,
                    style = Typography.labelMedium.copy(
                        color = MatchaLeaf,
                        fontWeight = FontWeight.SemiBold
                    )
                )

                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = event.description,
                    style = Typography.bodySmall.copy(
                        color = MatchaOnSurface,
                        lineHeight = 18.sp
                    )
                )
            }
        }
    }
}
