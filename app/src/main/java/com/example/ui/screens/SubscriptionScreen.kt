package com.example.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.BillingType
import com.example.data.model.StripeCatalog
import com.example.data.model.StripeProduct
import com.example.ui.components.StripeCheckoutDialog
import com.example.ui.components.StripePurple
import com.example.ui.components.StripeLightBg
import com.example.ui.components.StripeDark
import com.example.ui.components.StripeAccent
import com.example.ui.components.StripeBorder
import com.example.ui.theme.*
import com.example.ui.viewmodel.MatchaViewModel

enum class BillingCycle {
    MONTHLY,
    ANNUAL
}

@Composable
fun SubscriptionScreen(
    viewModel: MatchaViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val stripeConfig by viewModel.stripeConfig.collectAsState()
    val stripeTransactions by viewModel.stripeTransactions.collectAsState()
    val context = LocalContext.current

    var selectedCycle by remember { mutableStateOf(BillingCycle.ANNUAL) }
    var selectedStripeProductForCheckout by remember { mutableStateOf<StripeProduct?>(null) }
    var showStripeAdminSetup by remember { mutableStateOf(false) }
    var showStripeKeyDialog by remember { mutableStateOf(false) }

    // Pro Products mapped to StripeCatalog
    val activeProProduct = if (selectedCycle == BillingCycle.MONTHLY) {
        StripeCatalog.PRO_MONTHLY
    } else {
        StripeCatalog.PRO_ANNUAL
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MatchaBackground)
            .verticalScroll(rememberScrollState())
    ) {
        // Hero Header Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(MatchaDark, MatchaForest)
                    )
                )
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier
                            .background(Color.White.copy(alpha = 0.15f), CircleShape)
                            .size(36.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }

                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Stripe Connected Bank Badge
                        Surface(
                            color = StripePurple,
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.AccountBalance, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "STRIPE LINKED",
                                    style = Typography.labelSmall.copy(color = Color.White, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                                )
                            }
                        }

                        Surface(
                            color = GoldPro,
                            shape = RoundedCornerShape(20.dp)
                        ) {
                            Text(
                                text = if (uiState.isProMember) "PRO ACTIVE 🌟" else "PREMIUM TIERS",
                                style = Typography.labelSmall.copy(
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                ),
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .background(GoldProContainer, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "👑", fontSize = 28.sp)
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "MatchaMD Pro & Services",
                    style = Typography.headlineMedium.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Free to download & search. Power your match with Pro data and verified attending physician reviews.",
                    style = Typography.bodyMedium.copy(
                        color = MatchaContainer,
                        textAlign = TextAlign.Center
                    ),
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Billing Cycle Toggle (Monthly vs Annual: $9.99/mo or $100 for 12 months)
                Surface(
                    color = Color.White.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(30.dp),
                    modifier = Modifier.padding(horizontal = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        PlanTogglePill(
                            title = "Monthly",
                            subtitle = "$9.99 / mo",
                            isSelected = selectedCycle == BillingCycle.MONTHLY,
                            onClick = { selectedCycle = BillingCycle.MONTHLY }
                        )
                        PlanTogglePill(
                            title = "12 Months",
                            subtitle = "$100 for 12 mos (~$8.33/mo)",
                            isSelected = selectedCycle == BillingCycle.ANNUAL,
                            onClick = { selectedCycle = BillingCycle.ANNUAL }
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
            // Free Tier vs Pro Tier Value Notice
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "🎁", fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Free to Download & Search",
                            style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                        Text(
                            text = "Residency/Fellowship/Observership search, USMLE quiz, and basic ERAS cost modeling are 100% free with no paywall on search.",
                            style = Typography.bodySmall.copy(color = MatchaOnSurface, fontSize = 12.sp)
                        )
                    }
                }
            }

            // Pro Membership Card (Stripe Powered)
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(2.dp, if (uiState.isProMember) SafeGreen else GoldProLight, RoundedCornerShape(20.dp))
                    .testTag("pro_subscription_card")
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            Text(
                                text = "MatchaMD Pro All-Access",
                                style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                            )
                            Text(
                                text = if (selectedCycle == BillingCycle.ANNUAL)
                                    "Billed $100 for 12 months (~$8.33/mo)"
                                else
                                    "Billed monthly at $9.99/month",
                                style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = if (selectedCycle == BillingCycle.ANNUAL) "$100" else "$9.99",
                                style = Typography.headlineMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = GoldPro
                                )
                            )
                            Text(
                                text = if (selectedCycle == BillingCycle.ANNUAL) "for 12 months" else "per month",
                                style = Typography.labelSmall.copy(color = MatchaTextSecondary)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = MatchaBorder)
                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Included Pro Benefits:",
                        style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaForest)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    ProBenefitRow("Unlimited Program Bookmarks & Rank Order List custom notes")
                    ProBenefitRow("Direct Observership & GME Coordinator emails and phone contacts")
                    ProBenefitRow("Advanced Multi-Specialty ERAS Cost Breakdown & Budget modeling")
                    ProBenefitRow("Full USMLE Step 2 CK Clinical Vignettes Bank with explanations")
                    ProBenefitRow("Priority verification of community-submitted programs")
                    ProBenefitRow("Real-time scam alert alerts and institutional verification updates")

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = {
                            selectedStripeProductForCheckout = activeProProduct
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = if (uiState.isProMember) MatchaForest else StripePurple),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("subscribe_pro_button")
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (uiState.isProMember)
                                    "Pro Active • Manage via Stripe"
                                else
                                    "Upgrade via Stripe (${if (selectedCycle == BillingCycle.ANNUAL) "$100/12 mos" else "$9.99/mo"})",
                                style = Typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Processed securely via Stripe with direct bank deposit. Cancel anytime.",
                        style = Typography.labelSmall.copy(
                            color = MatchaTextSecondary,
                            textAlign = TextAlign.Center
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            // Developer / Reviewer Simulator Tool
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaContainer),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.padding(14.dp)
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🧪", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Test Pro Features Mode",
                                style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                            )
                        }
                        Text(
                            text = "Toggle Pro status ON/OFF to test how locked perks and badges appear.",
                            style = Typography.bodySmall.copy(color = MatchaOnSurface, fontSize = 11.sp)
                        )
                    }

                    Switch(
                        checked = uiState.isProMember,
                        onCheckedChange = { viewModel.toggleProMembership() },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = MatchaForest
                        ),
                        modifier = Modifier.testTag("toggle_pro_status_switch")
                    )
                }
            }

            // Attending Physician Review Services (The 4 Stripe Services requested)
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "🩺", fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "Attending Physician Review Services",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                        Text(
                            text = "1-on-1 mock interviews and application reviews by US board-certified physicians",
                            style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                        )
                    }
                }

                // Important Turnaround & Booking Disclosure
                Surface(
                    color = ScamAmberContainer.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ScamAmber.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text(text = "⏳", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Strict scheduling & turnaround policy: All document reviews require 2–4 weeks from submission. Mock interviews require 2–4 weeks advance notice to coordinate attending physician hospital schedules.",
                            style = Typography.bodySmall.copy(color = Color(0xFF78350F), fontSize = 11.sp, lineHeight = 15.sp)
                        )
                    }
                }

                StripeCatalog.ALL_SERVICES.forEach { product ->
                    StripeServiceCard(
                        product = product,
                        onClickOrder = {
                            selectedStripeProductForCheckout = product
                        }
                    )
                }
            }

            // Stripe & Bank Account Connection Summary Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth().testTag("stripe_account_card")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = StripePurple,
                                modifier = Modifier.size(24.dp),
                                contentColor = Color.White
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text("S", fontWeight = FontWeight.Black, fontSize = 14.sp)
                                }
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Stripe & Bank Account Integration",
                                style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = SafeGreenContainer
                        ) {
                            Text(
                                text = "ACTIVE",
                                style = Typography.labelSmall.copy(color = SafeGreen, fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Your bank account is linked to Stripe for automatic payouts. Below are the 6 Stripe products configured in your catalog with matching prices and turnaround guarantees.",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // 6 Products Quick Reference Grid
                    Surface(
                        color = StripeLightBg,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            StripeItemSummaryRow("1-on-1 Mock Interview", "$150.00", "2–4 wks booking")
                            StripeItemSummaryRow("Medical CV & ERAS Experience Review", "$125.00", "2–4 wks review")
                            StripeItemSummaryRow("Personal Statement & Letter of Intent (LOI)", "$140.00", "2–4 wks review")
                            StripeItemSummaryRow("Complete ERAS Application Packet Audit", "$249.00", "2–4 wks audit")
                            StripeItemSummaryRow("MatchaMD Pro (Monthly)", "$9.99/mo", "Recurring")
                            StripeItemSummaryRow("MatchaMD Pro (12 Months)", "$100.00/yr", "Recurring")
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { showStripeAdminSetup = !showStripeAdminSetup },
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(if (showStripeAdminSetup) "Hide Stripe Guide" else "Stripe Setup Guide", fontSize = 12.sp)
                        }

                        Button(
                            onClick = { showStripeKeyDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = StripePurple),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.VpnKey, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Stripe Keys", fontSize = 12.sp)
                        }
                    }

                    // Collapsible Stripe Dashboard setup instructions
                    AnimatedVisibility(visible = showStripeAdminSetup) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp)
                        ) {
                            Surface(
                                color = Color(0xFFF8FAFC),
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFCBD5E1)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text(
                                        text = "How to configure in your Stripe Dashboard (dashboard.stripe.com):",
                                        fontWeight = FontWeight.Bold,
                                        style = Typography.labelMedium.copy(color = MatchaDark)
                                    )
                                    Text(
                                        text = "1. Go to Stripe Dashboard -> Product Catalog -> Add Product.\n" +
                                                "2. Add the 4 one-time services ($150, $125, $140, $249) as 'One-time products'.\n" +
                                                "3. Add 'MatchaMD Pro' as a recurring product with two prices: $9.99/month and $100.00/year.\n" +
                                                "4. Optional: Under each product, click 'Create payment link' to get a direct buy.stripe.com URL.\n" +
                                                "5. Enter your Publishable Key (`pk_live_...` or `pk_test_...`) in the keys dialog to connect.",
                                        style = Typography.bodySmall.copy(color = Color(0xFF334155), fontSize = 11.sp, lineHeight = 16.sp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Transactions Ledger (If any Stripe purchases made)
            if (stripeTransactions.isNotEmpty()) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MatchaSurface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Recent Stripe Transactions (${stripeTransactions.size})",
                                style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                            )
                            Text(
                                text = "Bank Direct",
                                style = Typography.labelSmall.copy(color = SafeGreen, fontWeight = FontWeight.Bold)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        stripeTransactions.take(5).forEach { tx ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(text = tx.productName, style = Typography.bodySmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark))
                                    Text(
                                        text = "${tx.customerEmail} • ${tx.transactionId}",
                                        style = Typography.labelSmall.copy(color = MatchaTextSecondary, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                    )
                                }
                                Text(
                                    text = tx.amountFormatted,
                                    style = Typography.bodySmall.copy(color = GoldPro, fontWeight = FontWeight.Bold)
                                )
                            }
                            HorizontalDivider(color = MatchaBorder.copy(alpha = 0.5f))
                        }
                    }
                }
            }
        }
    }

    // Stripe Checkout Sheet / Modal
    if (selectedStripeProductForCheckout != null) {
        val prod = selectedStripeProductForCheckout!!
        val customLink = stripeConfig.customPaymentLinks[prod.id]
        StripeCheckoutDialog(
            product = prod,
            initialEmail = uiState.userEmail,
            customPaymentLink = customLink,
            onDismiss = { selectedStripeProductForCheckout = null },
            onPaymentSuccess = { product, email, name, specialty, notes, cardLast4, cardBrand ->
                viewModel.processStripePayment(
                    product = product,
                    customerEmail = email,
                    customerName = name,
                    specialty = specialty,
                    notes = notes,
                    cardLast4 = cardLast4,
                    cardBrand = cardBrand,
                    onSuccess = { tx ->
                        Toast.makeText(
                            context,
                            "Stripe payment of ${tx.amountFormatted} succeeded! Reference: ${tx.transactionId}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                )
            }
        )
    }

    // Stripe Key Configuration Dialog
    if (showStripeKeyDialog) {
        var tempKey by remember { mutableStateOf(stripeConfig.publishableKey) }
        var isLive by remember { mutableStateOf(stripeConfig.isLiveMode) }

        AlertDialog(
            onDismissRequest = { showStripeKeyDialog = false },
            title = { Text("Configure Stripe Keys", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Enter your Stripe Publishable Key (`pk_test_...` or `pk_live_...`) from dashboard.stripe.com/apikeys. All charges route directly to your linked bank account.",
                        style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                    )

                    OutlinedTextField(
                        value = tempKey,
                        onValueChange = { tempKey = it },
                        label = { Text("Stripe Publishable Key") },
                        placeholder = { Text("pk_live_... or pk_test_...") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Live Production Mode", style = Typography.bodySmall)
                        Switch(
                            checked = isLive,
                            onCheckedChange = { isLive = it }
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateStripeKey(tempKey.trim(), isLive)
                        showStripeKeyDialog = false
                        Toast.makeText(context, "Stripe configuration saved!", Toast.LENGTH_SHORT).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StripePurple)
                ) {
                    Text("Save Stripe Config")
                }
            },
            dismissButton = {
                TextButton(onClick = { showStripeKeyDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun StripeItemSummaryRow(name: String, price: String, note: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = name, style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark))
            Text(text = note, style = Typography.labelSmall.copy(color = MatchaTextSecondary, fontSize = 9.sp))
        }
        Text(text = price, style = Typography.labelSmall.copy(fontWeight = FontWeight.Bold, color = StripePurple))
    }
}

@Composable
fun PlanTogglePill(
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        color = if (isSelected) Color.White else Color.Transparent,
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier.clickable { onClick() }
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Text(
                text = title,
                style = Typography.labelMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) MatchaForest else Color.White
                )
            )
            Text(
                text = subtitle,
                style = Typography.labelSmall.copy(
                    fontSize = 10.sp,
                    color = if (isSelected) MatchaDark else MatchaContainer
                )
            )
        }
    }
}

@Composable
fun ProBenefitRow(text: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            Icons.Default.CheckCircle,
            contentDescription = null,
            tint = SafeGreen,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp)
        )
    }
}

@Composable
fun StripeServiceCard(
    product: StripeProduct,
    onClickOrder: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MatchaSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MatchaBorder, RoundedCornerShape(16.dp))
            .testTag("digital_product_${product.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Text(text = product.iconEmoji, fontSize = 26.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = product.name,
                            style = Typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )
                        Surface(
                            color = MatchaContainer,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = product.schedulingOrTurnaround,
                                style = Typography.labelSmall.copy(color = MatchaForest, fontSize = 10.sp, fontWeight = FontWeight.SemiBold),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = product.formattedPrice,
                        style = Typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = GoldPro
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = product.description,
                style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                product.deliverables.take(2).forEach { deliverable ->
                    Row(verticalAlignment = Alignment.Top) {
                        Text(text = "•", color = MatchaForest, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = deliverable,
                            style = Typography.bodySmall.copy(fontSize = 11.sp, color = MatchaDark)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onClickOrder,
                colors = ButtonDefaults.buttonColors(containerColor = StripePurple),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Pay ${product.formattedPrice} with Stripe",
                        style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = Color.White)
                    )
                }
            }
        }
    }
}
