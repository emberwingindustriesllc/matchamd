package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.screens.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaScreen
import com.example.ui.viewmodel.MatchaViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MatchaViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MatchaAppRoot(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MatchaAppRoot(viewModel: MatchaViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val savedPrograms by viewModel.savedProgramsEntities.collectAsState()

    // Handle back button: returns to PROGRAMS screen if on another tab
    BackHandler(enabled = uiState.currentScreen != MatchaScreen.PROGRAMS) {
        viewModel.navigateTo(MatchaScreen.PROGRAMS)
    }

    Scaffold(
        topBar = {
            if (uiState.currentScreen != MatchaScreen.PRO_STORE && uiState.currentScreen != MatchaScreen.ACCOUNT) {
                MatchaAppTopBar(
                    currentScreen = uiState.currentScreen,
                    isPro = uiState.isProMember,
                    onNavigate = { screen -> viewModel.navigateTo(screen) }
                )
            }
        },
        bottomBar = {
            if (uiState.currentScreen != MatchaScreen.PRO_STORE && uiState.currentScreen != MatchaScreen.ACCOUNT) {
                MatchaBottomNavigationBar(
                    currentScreen = uiState.currentScreen,
                    savedCount = savedPrograms.size,
                    onNavigate = { screen -> viewModel.navigateTo(screen) }
                )
            }
        },
        contentWindowInsets = WindowInsets.safeDrawing,
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (uiState.currentScreen) {
                MatchaScreen.PROGRAMS -> ProgramsScreen(viewModel = viewModel)
                MatchaScreen.CALCULATOR -> CalculatorScreen(viewModel = viewModel)
                MatchaScreen.GUIDES_AND_SCAMS -> GuidesScreen(
                    viewModel = viewModel,
                    onNavigateToPro = { viewModel.navigateTo(MatchaScreen.PRO_STORE) }
                )
                MatchaScreen.QUIZ -> QuizScreen(viewModel = viewModel)
                MatchaScreen.INTERVIEW -> InterviewScreen(viewModel = viewModel)
                MatchaScreen.SAVED_ROL -> RankOrderListScreen(viewModel = viewModel)
                MatchaScreen.TIMELINE -> TimelineScreen(viewModel = viewModel)
                MatchaScreen.PRO_STORE -> SubscriptionScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(MatchaScreen.PROGRAMS) }
                )
                MatchaScreen.ACCOUNT -> AccountScreen(
                    viewModel = viewModel,
                    onBack = { viewModel.navigateTo(MatchaScreen.PROGRAMS) }
                )
            }
        }
    }
}

@Composable
fun MatchaAppTopBar(
    currentScreen: MatchaScreen,
    isPro: Boolean,
    onNavigate: (MatchaScreen) -> Unit
) {
    Surface(
        color = MatchaDark,
        shadowElevation = 4.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { onNavigate(MatchaScreen.PROGRAMS) }
            ) {
                Text(text = "🍵", fontSize = 20.sp)
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "MatchaMD",
                    style = Typography.titleMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                // Match Timeline Quick Button
                IconButton(
                    onClick = { onNavigate(MatchaScreen.TIMELINE) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Event,
                        contentDescription = "Timeline",
                        tint = if (currentScreen == MatchaScreen.TIMELINE) MatchaAccent else Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.size(18.dp)
                    )
                }

                Spacer(modifier = Modifier.width(2.dp))

                // Account & Privacy Profile Button
                IconButton(
                    onClick = { onNavigate(MatchaScreen.ACCOUNT) },
                    modifier = Modifier
                        .size(32.dp)
                        .testTag("top_account_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = "Account & Privacy",
                        tint = if (currentScreen == MatchaScreen.ACCOUNT) MatchaAccent else Color.White.copy(alpha = 0.85f),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(4.dp))

                // MatchaMD Pro Button
                Surface(
                    color = if (isPro) SafeGreen else GoldPro,
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier
                        .clickable { onNavigate(MatchaScreen.PRO_STORE) }
                        .testTag("top_pro_button")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Pro",
                            tint = Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isPro) "PRO ACTIVE" else "GET PRO",
                            style = Typography.labelSmall.copy(
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MatchaBottomNavigationBar(
    currentScreen: MatchaScreen,
    savedCount: Int,
    onNavigate: (MatchaScreen) -> Unit
) {
    Surface(
        color = MatchaSurface,
        tonalElevation = 8.dp,
        shadowElevation = 10.dp,
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceAround,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp, horizontal = 2.dp)
        ) {
            MatchaNavTab(
                title = "Programs",
                icon = Icons.Default.LocalHospital,
                isSelected = currentScreen == MatchaScreen.PROGRAMS,
                onClick = { onNavigate(MatchaScreen.PROGRAMS) },
                testTag = "nav_programs_tab"
            )
            MatchaNavTab(
                title = "Guides & Scams",
                icon = Icons.Default.HealthAndSafety,
                isSelected = currentScreen == MatchaScreen.GUIDES_AND_SCAMS,
                onClick = { onNavigate(MatchaScreen.GUIDES_AND_SCAMS) },
                testTag = "nav_guides_scams_tab"
            )
            MatchaNavTab(
                title = "Calculator",
                icon = Icons.Default.Calculate,
                isSelected = currentScreen == MatchaScreen.CALCULATOR,
                onClick = { onNavigate(MatchaScreen.CALCULATOR) },
                testTag = "nav_calculator_tab"
            )
            MatchaNavTab(
                title = "Step 2 Quiz",
                icon = Icons.Default.School,
                isSelected = currentScreen == MatchaScreen.QUIZ,
                onClick = { onNavigate(MatchaScreen.QUIZ) },
                testTag = "nav_quiz_tab"
            )
            MatchaNavTab(
                title = "Interview",
                icon = Icons.Default.RecordVoiceOver,
                isSelected = currentScreen == MatchaScreen.INTERVIEW,
                onClick = { onNavigate(MatchaScreen.INTERVIEW) },
                testTag = "nav_interview_tab"
            )
            MatchaNavTab(
                title = "Rank List",
                icon = Icons.Default.FormatListNumbered,
                isSelected = currentScreen == MatchaScreen.SAVED_ROL,
                badgeCount = if (savedCount > 0) savedCount else null,
                onClick = { onNavigate(MatchaScreen.SAVED_ROL) },
                testTag = "nav_saved_rol_tab"
            )
        }
    }
}

@Composable
fun MatchaNavTab(
    title: String,
    icon: ImageVector,
    isSelected: Boolean,
    badgeCount: Int? = null,
    onClick: () -> Unit,
    testTag: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .clickable { onClick() }
            .padding(horizontal = 4.dp, vertical = 6.dp)
            .testTag(testTag)
    ) {
        BadgedBox(
            badge = {
                if (badgeCount != null && badgeCount > 0) {
                    Badge(
                        containerColor = MatchaAccent,
                        contentColor = Color.White
                    ) {
                        Text(text = "$badgeCount", fontSize = 10.sp)
                    }
                }
            }
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = if (isSelected) MatchaForest else MatchaTextSecondary,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = title,
            style = Typography.labelSmall.copy(
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                color = if (isSelected) MatchaForest else MatchaTextSecondary,
                fontSize = 10.sp
            )
        )
    }
}
