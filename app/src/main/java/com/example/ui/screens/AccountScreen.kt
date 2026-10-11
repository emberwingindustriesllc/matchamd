package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel

@Composable
fun AccountScreen(
    viewModel: MatchaViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val savedPrograms by viewModel.savedProgramsEntities.collectAsState()
    val quizHistory by viewModel.quizHistory.collectAsState()
    val context = LocalContext.current

    var showResetPasswordDialog by remember { mutableStateOf(false) }
    var showChangePasswordDialog by remember { mutableStateOf(false) }
    var showDeleteAccountDialog by remember { mutableStateOf(false) }
    var showDataExportPreviewDialog by remember { mutableStateOf(false) }
    var exportedDataString by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MatchaBackground)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MatchaForest)
                .padding(horizontal = 16.dp, vertical = 16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier
                            .background(Color.White.copy(alpha = 0.15f), CircleShape)
                            .size(36.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Account & Data Privacy",
                            style = Typography.titleLarge.copy(color = Color.White, fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Manage credentials, GDPR data export & account controls",
                            style = Typography.bodySmall.copy(color = MatchaContainer)
                        )
                    }
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Profile & Authentication Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .background(MatchaContainer, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🩺", fontSize = 24.sp)
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Logged in User",
                                style = Typography.labelSmall.copy(color = MatchaTextSecondary)
                            )
                            Text(
                                text = uiState.userEmail,
                                style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) {
                                Surface(
                                    color = if (uiState.isProMember) SafeGreen else MatchaForest,
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text(
                                        text = if (uiState.isProMember) "MatchaMD Pro" else "Free Account",
                                        style = Typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold),
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Synced with Supabase & Room Cache",
                                    style = Typography.bodySmall.copy(color = SafeGreen, fontSize = 10.sp, fontWeight = FontWeight.Medium)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = MatchaBorder)
                    Spacer(modifier = Modifier.height(14.dp))

                    // Account Stats
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        StatPill("Saved Programs", "${savedPrograms.size}")
                        StatPill("Quiz History", "${quizHistory.size} items")
                        StatPill("Cloud Status", "Active ✓")
                    }
                }
            }

            // Security & Password Management Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = MatchaForest, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Security & Credentials",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Reset your password via verified email link or update credentials directly.",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = { showResetPasswordDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Email Reset Link", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { showChangePasswordDialog = true },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Password, contentDescription = null, modifier = Modifier.size(16.dp), tint = MatchaForest)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Change Password", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MatchaForest)
                        }
                    }

                    if (uiState.passwordResetSentMessage != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = SafeGreenContainer,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = uiState.passwordResetSentMessage!!,
                                style = Typography.bodySmall.copy(color = SafeGreen, fontSize = 11.sp),
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                    }
                }
            }

            // Data Portability / Download My Data Card (GDPR / CCPA)
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Download, contentDescription = null, tint = MatchaForest, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Download My Data (Data Portability)",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Under GDPR and California Consumer Privacy Act regulations, you have the right to obtain a full copy of all personal records, Rank Order Lists, quiz performance metrics, custom notes, and ERAS budget profiles stored on MatchaMD.",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp, lineHeight = 16.sp)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            exportedDataString = viewModel.generateUserDataExport()
                            showDataExportPreviewDialog = true
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MatchaDark),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().testTag("download_my_data_button")
                    ) {
                        Icon(Icons.Default.FileDownload, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Export & Download My Complete Archive", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }

            // Danger Zone: Delete Account (Right to Erasure)
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = ScamRedContainer.copy(alpha = 0.35f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, ScamRed.copy(alpha = 0.5f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = ScamRed, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Danger Zone: Delete Account",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = ScamRed)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Permanently erase your MatchaMD user account, all saved programs, custom notes, quiz test statistics, community submissions, and cloud sync history. This operation is permanent and irreversible.",
                        style = Typography.bodySmall.copy(color = Color(0xFF7F1D1D), fontSize = 12.sp, lineHeight = 16.sp)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = { showDeleteAccountDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = ScamRed),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().testTag("delete_account_button")
                    ) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Delete My Account & Erase All Data", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }

    // Email Password Reset Dialog
    if (showResetPasswordDialog) {
        var emailInput by remember { mutableStateOf(uiState.userEmail) }
        AlertDialog(
            onDismissRequest = { showResetPasswordDialog = false },
            icon = { Icon(Icons.Default.Email, contentDescription = null, tint = MatchaForest, modifier = Modifier.size(32.dp)) },
            title = { Text("Reset Password via Email") },
            text = {
                Column {
                    Text(
                        text = "We will send secure password reset instructions to your verified email address:",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it },
                        label = { Text("Email Address") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.requestPasswordReset(emailInput) { success, msg ->
                            Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                            if (success) showResetPasswordDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaForest)
                ) {
                    Text("Send Reset Link")
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetPasswordDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Change Password Directly Dialog
    if (showChangePasswordDialog) {
        var newPassword by remember { mutableStateOf("") }
        var confirmPassword by remember { mutableStateOf("") }
        var errorMessage by remember { mutableStateOf<String?>(null) }

        AlertDialog(
            onDismissRequest = { showChangePasswordDialog = false },
            icon = { Icon(Icons.Default.Password, contentDescription = null, tint = MatchaForest, modifier = Modifier.size(32.dp)) },
            title = { Text("Update Password") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Enter a new secure password (at least 8 characters):",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                    )

                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = {
                            newPassword = it
                            errorMessage = null
                        },
                        label = { Text("New Password") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = {
                            confirmPassword = it
                            errorMessage = null
                        },
                        label = { Text("Confirm New Password") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth()
                    )

                    if (errorMessage != null) {
                        Text(
                            text = errorMessage!!,
                            color = Color(0xFFDC2626),
                            style = Typography.bodySmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updatePassword(newPassword, confirmPassword) { success, msg ->
                            if (success) {
                                Toast.makeText(context, msg, Toast.LENGTH_LONG).show()
                                showChangePasswordDialog = false
                            } else {
                                errorMessage = msg
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaForest)
                ) {
                    Text("Save Password")
                }
            },
            dismissButton = {
                TextButton(onClick = { showChangePasswordDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Data Export Preview & Sharing Dialog
    if (showDataExportPreviewDialog) {
        AlertDialog(
            onDismissRequest = { showDataExportPreviewDialog = false },
            icon = { Text(text = "📦", fontSize = 32.sp) },
            title = { Text("Your Data Archive is Ready") },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text(
                        text = "The complete JSON archive contains your Rank Order List (${savedPrograms.size} programs), Step 2 quiz logs (${quizHistory.size} records), and ERAS budget model.",
                        style = Typography.bodySmall.copy(color = MatchaDark)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        color = MatchaBackground,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = exportedDataString.take(400) + "\n... [Remaining data included in download]",
                            style = Typography.bodySmall.copy(fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace, fontSize = 10.sp),
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val sendIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, exportedDataString)
                            putExtra(Intent.EXTRA_SUBJECT, "MatchaMD_Personal_Data_Export.json")
                            type = "application/json"
                        }
                        val shareIntent = Intent.createChooser(sendIntent, "Save or Export MatchaMD Data")
                        context.startActivity(shareIntent)
                        showDataExportPreviewDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MatchaDark)
                ) {
                    Text("Share / Save Archive")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        val clip = ClipData.newPlainText("MatchaMD Export", exportedDataString)
                        clipboard.setPrimaryClip(clip)
                        Toast.makeText(context, "Data archive copied to clipboard!", Toast.LENGTH_SHORT).show()
                        showDataExportPreviewDialog = false
                    }
                ) {
                    Text("Copy to Clipboard")
                }
            }
        )
    }

    // Delete Account Confirmation Dialog (Two-Step with typed DELETE)
    if (showDeleteAccountDialog) {
        var confirmationText by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showDeleteAccountDialog = false },
            icon = { Icon(Icons.Default.DeleteForever, contentDescription = null, tint = ScamRed, modifier = Modifier.size(36.dp)) },
            title = { Text("Confirm Permanent Account Erasure", color = ScamRed) },
            text = {
                Column {
                    Text(
                        text = "This will permanently wipe all your data from both your local device and cloud backups. To proceed, please type 'DELETE' below to confirm:",
                        style = Typography.bodySmall.copy(color = MatchaDark)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = confirmationText,
                        onValueChange = { confirmationText = it },
                        label = { Text("Type DELETE to confirm") },
                        placeholder = { Text("DELETE") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth().testTag("delete_confirmation_input")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteUserAccount {
                            Toast.makeText(context, "Account and all personal data erased successfully.", Toast.LENGTH_LONG).show()
                            showDeleteAccountDialog = false
                        }
                    },
                    enabled = confirmationText.trim() == "DELETE",
                    colors = ButtonDefaults.buttonColors(containerColor = ScamRed),
                    modifier = Modifier.testTag("confirm_delete_account_button")
                ) {
                    Text("Permanently Erase Everything", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteAccountDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun StatPill(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaForest)
        )
        Text(
            text = label,
            style = Typography.labelSmall.copy(color = MatchaTextSecondary, fontSize = 10.sp)
        )
    }
}
