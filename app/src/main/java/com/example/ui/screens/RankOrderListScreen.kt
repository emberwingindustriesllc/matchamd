package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
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
import com.example.data.db.SavedProgramEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaScreen
import com.example.ui.viewmodel.MatchaViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RankOrderListScreen(
    viewModel: MatchaViewModel,
    modifier: Modifier = Modifier
) {
    val savedPrograms by viewModel.savedProgramsEntities.collectAsState()
    var editingEntityId by remember { mutableStateOf<String?>(null) }
    var editNotesText by remember { mutableStateOf("") }

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
                            imageVector = Icons.Default.FormatListNumbered,
                            contentDescription = null,
                            tint = MatchaAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Rank Order List (ROL)",
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
                            text = "${savedPrograms.size} Ranked",
                            style = Typography.labelSmall.copy(
                                color = MatchaDark,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Personalized NRMP rank hierarchy. Reorder preferences and log rotation & interview impressions.",
                    style = Typography.bodySmall.copy(color = MatchaContainer)
                )
            }
        }

        if (savedPrograms.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.BookmarkBorder,
                        contentDescription = null,
                        tint = MatchaLeaf,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Your Rank Order List is Empty",
                        style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Explore verified ACGME residency programs and tap 'Bookmark / Add to Rank List' to organize your match list.",
                        style = Typography.bodyMedium.copy(color = MatchaTextSecondary, lineHeight = 20.sp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = { viewModel.navigateTo(MatchaScreen.PROGRAMS) },
                        colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.testTag("rol_explore_programs_btn")
                    ) {
                        Icon(Icons.Default.Search, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Explore Residency Programs")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    // Match Strategy Reminder Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MatchaContainer),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = MatchaDark,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "NRMP uses the Roth-Peranson matching algorithm, which is strictly applicant-proposing. Rank according to your genuine true preference, not where you think you have the highest chance.",
                                style = Typography.bodySmall.copy(color = MatchaDark, lineHeight = 18.sp)
                            )
                        }
                    }
                }

                itemsIndexed(savedPrograms) { index, programEntity ->
                    RankedProgramCard(
                        entity = programEntity,
                        isFirst = index == 0,
                        isLast = index == savedPrograms.size - 1,
                        onMoveUp = { viewModel.moveRankUp(programEntity.programId) },
                        onMoveDown = { viewModel.moveRankDown(programEntity.programId) },
                        onDelete = {
                            // Find the program and toggle save to remove
                            val matching = com.example.data.repository.ProgramRepository.verifiedPrograms
                                .find { it.id == programEntity.programId }
                            if (matching != null) {
                                viewModel.toggleSaveProgram(matching.copy(isSaved = true))
                            }
                        },
                        onEditNotes = {
                            editingEntityId = programEntity.programId
                            editNotesText = programEntity.notes
                        }
                    )
                }

                item {
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }

    // Edit Notes Dialog
    if (editingEntityId != null) {
        AlertDialog(
            onDismissRequest = { editingEntityId = null },
            title = {
                Text(
                    text = "Personal Program Notes",
                    style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                )
            },
            text = {
                Column {
                    Text(
                        text = "Log interview feedback, resident happiness, call schedules, and research opportunities:",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = editNotesText,
                        onValueChange = { editNotesText = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp),
                        placeholder = { Text("e.g. Supportive PD, excellent PICU volume, 4 weeks vacation...") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MatchaLeaf,
                            unfocusedBorderColor = MatchaBorder
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        editingEntityId?.let { id ->
                            viewModel.updateProgramNotes(id, editNotesText)
                        }
                        editingEntityId = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaForest)
                ) {
                    Text("Save Notes")
                }
            },
            dismissButton = {
                TextButton(onClick = { editingEntityId = null }) {
                    Text("Cancel", color = MatchaTextSecondary)
                }
            }
        )
    }
}

@Composable
private fun RankedProgramCard(
    entity: SavedProgramEntity,
    isFirst: Boolean,
    isLast: Boolean,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onDelete: () -> Unit,
    onEditNotes: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        shape = RoundedCornerShape(14.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(MatchaBorder)),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("ranked_card_${entity.rankOrder}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(if (entity.rankOrder == 1) MatchaAccent else MatchaPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "#${entity.rankOrder}",
                            style = Typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (entity.rankOrder == 1) MatchaDark else Color.White
                            )
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = entity.specialtyName,
                            style = Typography.labelSmall.copy(color = MatchaLeaf, fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = entity.programName,
                            style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                    }
                }

                // Rank reorder controls
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onMoveUp,
                        enabled = !isFirst,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowUp,
                            contentDescription = "Move Up",
                            tint = if (!isFirst) MatchaDark else Color.LightGray
                        )
                    }
                    IconButton(
                        onClick = onMoveDown,
                        enabled = !isLast,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Move Down",
                            tint = if (!isLast) MatchaDark else Color.LightGray
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = entity.hospitalName,
                style = Typography.bodySmall.copy(color = MatchaTextSecondary)
            )

            if (entity.notes.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MatchaSurfaceVariant, RoundedCornerShape(8.dp))
                        .padding(8.dp)
                ) {
                    Text(
                        text = "Notes: ${entity.notes}",
                        style = Typography.bodySmall.copy(color = MatchaDark, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                horizontalArrangement = Arrangement.End,
                modifier = Modifier.fillMaxWidth()
            ) {
                TextButton(
                    onClick = onEditNotes,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Icon(Icons.Default.EditNote, contentDescription = null, modifier = Modifier.size(16.dp), tint = MatchaLeaf)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (entity.notes.isBlank()) "Add Note" else "Edit Note", color = MatchaLeaf, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.width(4.dp))
                TextButton(
                    onClick = onDelete,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color(0xFFDC2626))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Remove", color = Color(0xFFDC2626), fontSize = 12.sp)
                }
            }
        }
    }
}
