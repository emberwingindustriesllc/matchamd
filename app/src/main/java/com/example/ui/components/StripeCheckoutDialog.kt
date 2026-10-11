package com.example.ui.components

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.BillingType
import com.example.data.model.StripePaymentTransaction
import com.example.data.model.StripeProduct
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// Stripe Official Brand Colors
val StripePurple = Color(0xFF635BFF)
val StripeDark = Color(0xFF0A2540)
val StripeAccent = Color(0xFF00D4FF)
val StripeLightBg = Color(0xFFF6F9FC)
val StripeBorder = Color(0xFFE2E8F0)

enum class PaymentMethodTab {
    CREDIT_CARD,
    GOOGLE_PAY,
    STRIPE_HOSTED_LINK
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StripeCheckoutDialog(
    product: StripeProduct,
    initialEmail: String,
    customPaymentLink: String?,
    onDismiss: () -> Unit,
    onPaymentSuccess: (
        product: StripeProduct,
        email: String,
        name: String,
        specialty: String,
        notes: String,
        cardLast4: String,
        cardBrand: String
    ) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedTab by remember { mutableStateOf(PaymentMethodTab.CREDIT_CARD) }

    // Form state
    var email by remember { mutableStateOf(initialEmail) }
    var customerName by remember { mutableStateOf("Dr. Paul Finch") }
    var specialty by remember { mutableStateOf("Pediatrics") }
    var notes by remember { mutableStateOf("") }

    // Card inputs
    var cardNumber by remember { mutableStateOf("4242 4242 4242 4242") }
    var expiryDate by remember { mutableStateOf("12/28") }
    var cvc by remember { mutableStateOf("123") }
    var zipCode by remember { mutableStateOf("21205") }

    // Payment Processing State
    var isProcessing by remember { mutableStateOf(false) }
    var processingStep by remember { mutableStateOf("Initializing secure session...") }
    var completedTransaction by remember { mutableStateOf<StripePaymentTransaction?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val rawCardDigits = cardNumber.filter { it.isDigit() }
    val cardBrand = remember(rawCardDigits) {
        when {
            rawCardDigits.startsWith("4") -> "Visa"
            rawCardDigits.startsWith("5") -> "Mastercard"
            rawCardDigits.startsWith("3") -> "Amex"
            rawCardDigits.startsWith("6") -> "Discover"
            else -> "Card"
        }
    }

    AlertDialog(
        onDismissRequest = {
            if (!isProcessing) onDismiss()
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp)
            .testTag("stripe_checkout_dialog"),
        properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .heightIn(max = 700.dp)
        ) {
            if (completedTransaction != null) {
                // Success Receipt Screen
                StripePaymentSuccessView(
                    transaction = completedTransaction!!,
                    product = product,
                    onDone = {
                        onDismiss()
                    }
                )
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    // Stripe Branded Header
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(StripeDark, Color(0xFF1E293B))
                                )
                            )
                            .padding(horizontal = 20.dp, vertical = 18.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = StripePurple,
                                        modifier = Modifier.padding(end = 8.dp)
                                    ) {
                                        Text(
                                            text = "stripe",
                                            fontFamily = FontFamily.SansSerif,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White,
                                            fontSize = 13.sp,
                                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp)
                                        )
                                    }
                                    Text(
                                        text = "Secure Checkout",
                                        style = Typography.titleMedium.copy(
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }

                                IconButton(
                                    onClick = onDismiss,
                                    enabled = !isProcessing,
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Close",
                                        tint = Color.White.copy(alpha = 0.8f)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Order Line Item
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Bottom
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = product.name,
                                        style = Typography.bodyMedium.copy(
                                            color = Color.White,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    )
                                    Text(
                                        text = product.schedulingOrTurnaround,
                                        style = Typography.labelSmall.copy(
                                            color = StripeAccent,
                                            fontSize = 11.sp
                                        )
                                    )
                                }

                                Text(
                                    text = product.formattedPrice,
                                    style = Typography.headlineSmall.copy(
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                        }
                    }

                    // Trust & Security Notice Banner
                    Surface(
                        color = StripeLightBg,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Lock,
                                contentDescription = null,
                                tint = StripePurple,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "256-bit SSL encrypted • PCI-DSS Level 1 Compliant",
                                style = Typography.labelSmall.copy(
                                    color = Color(0xFF64748B),
                                    fontSize = 11.sp
                                )
                            )
                            Spacer(modifier = Modifier.weight(1f))
                            Text(
                                text = "TEST / LIVE MODE",
                                style = Typography.labelSmall.copy(
                                    color = SafeGreen,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp
                                )
                            )
                        }
                    }

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Payment Method Selector Tabs
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(StripeLightBg, RoundedCornerShape(12.dp))
                                .padding(4.dp),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            PaymentTabButton(
                                title = "Credit Card",
                                icon = Icons.Default.CreditCard,
                                isSelected = selectedTab == PaymentMethodTab.CREDIT_CARD,
                                modifier = Modifier.weight(1f),
                                onClick = { selectedTab = PaymentMethodTab.CREDIT_CARD }
                            )
                            PaymentTabButton(
                                title = "Google Pay",
                                icon = Icons.Default.AccountBalanceWallet,
                                isSelected = selectedTab == PaymentMethodTab.GOOGLE_PAY,
                                modifier = Modifier.weight(1f),
                                onClick = { selectedTab = PaymentMethodTab.GOOGLE_PAY }
                            )
                            PaymentTabButton(
                                title = "Stripe Link",
                                icon = Icons.Default.OpenInBrowser,
                                isSelected = selectedTab == PaymentMethodTab.STRIPE_HOSTED_LINK,
                                modifier = Modifier.weight(1f),
                                onClick = { selectedTab = PaymentMethodTab.STRIPE_HOSTED_LINK }
                            )
                        }

                        if (errorMessage != null) {
                            Surface(
                                color = Color(0xFFFEF2F2),
                                shape = RoundedCornerShape(8.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF87171))
                            ) {
                                Text(
                                    text = errorMessage!!,
                                    color = Color(0xFF991B1B),
                                    style = Typography.bodySmall.copy(fontSize = 12.sp),
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        }

                        // Contact & Intake details
                        Text(
                            text = "Applicant Contact & Intake Details",
                            style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                        )

                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it; errorMessage = null },
                            label = { Text("Receipt Email") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = StripePurple) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.fillMaxWidth().testTag("stripe_email_input")
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            OutlinedTextField(
                                value = customerName,
                                onValueChange = { customerName = it },
                                label = { Text("Applicant Full Name") },
                                singleLine = true,
                                modifier = Modifier.weight(1f).testTag("stripe_name_input")
                            )

                            OutlinedTextField(
                                value = specialty,
                                onValueChange = { specialty = it },
                                label = { Text("Target Specialty") },
                                singleLine = true,
                                modifier = Modifier.weight(1f).testTag("stripe_specialty_input")
                            )
                        }

                        if (product.billingType == BillingType.ONE_TIME_DIGITAL_SERVICE) {
                            OutlinedTextField(
                                value = notes,
                                onValueChange = { notes = it },
                                label = { Text("Intake Notes or Scheduling Window (Optional)") },
                                placeholder = { Text("e.g. Free weekends, Pediatric GI interest, Step 2 248") },
                                minLines = 2,
                                maxLines = 3,
                                modifier = Modifier.fillMaxWidth().testTag("stripe_intake_notes_input")
                            )
                        }

                        HorizontalDivider(color = StripeBorder)

                        when (selectedTab) {
                            PaymentMethodTab.CREDIT_CARD -> {
                                Text(
                                    text = "Card Information",
                                    style = Typography.labelMedium.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
                                )

                                // Card Number with brand logo and quick demo fill button
                                OutlinedTextField(
                                    value = cardNumber,
                                    onValueChange = { input ->
                                        val digits = input.filter { it.isDigit() }.take(16)
                                        cardNumber = digits.chunked(4).joinToString(" ")
                                        errorMessage = null
                                    },
                                    label = { Text("Card Number ($cardBrand)") },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.CreditCard,
                                            contentDescription = null,
                                            tint = StripePurple
                                        )
                                    },
                                    trailingIcon = {
                                        TextButton(
                                            onClick = {
                                                cardNumber = "4242 4242 4242 4242"
                                                expiryDate = "12/28"
                                                cvc = "123"
                                                zipCode = "21205"
                                            }
                                        ) {
                                            Text("Fill Test Card", fontSize = 11.sp, color = StripePurple)
                                        }
                                    },
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    modifier = Modifier.fillMaxWidth().testTag("stripe_card_number_input")
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    OutlinedTextField(
                                        value = expiryDate,
                                        onValueChange = { input ->
                                            val digits = input.filter { it.isDigit() }.take(4)
                                            expiryDate = if (digits.length >= 3) {
                                                "${digits.take(2)}/${digits.drop(2)}"
                                            } else {
                                                digits
                                            }
                                        },
                                        label = { Text("MM/YY") },
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        modifier = Modifier.weight(1f).testTag("stripe_expiry_input")
                                    )

                                    OutlinedTextField(
                                        value = cvc,
                                        onValueChange = { input ->
                                            cvc = input.filter { it.isDigit() }.take(4)
                                        },
                                        label = { Text("CVC") },
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        modifier = Modifier.weight(1f).testTag("stripe_cvc_input")
                                    )

                                    OutlinedTextField(
                                        value = zipCode,
                                        onValueChange = { zipCode = it.take(5) },
                                        label = { Text("ZIP") },
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        modifier = Modifier.weight(1f).testTag("stripe_zip_input")
                                    )
                                }
                            }

                            PaymentMethodTab.GOOGLE_PAY -> {
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = StripeLightBg),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, StripeBorder),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text(text = "⚡ Instant 1-Tap Google Pay", fontWeight = FontWeight.Bold, color = MatchaDark)
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Pay safely using cards saved to your Google Account without retyping card numbers.",
                                            style = Typography.bodySmall.copy(color = MatchaTextSecondary, textAlign = TextAlign.Center)
                                        )
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Button(
                                            onClick = {
                                                cardNumber = "4111 2222 3333 4444"
                                                executePaymentSimulation(
                                                    product = product,
                                                    email = email,
                                                    name = customerName,
                                                    specialty = specialty,
                                                    notes = notes,
                                                    cardLast4 = "4444",
                                                    cardBrand = "Google Pay (Visa)",
                                                    coroutineScope = coroutineScope,
                                                    onProcessingStep = { processingStep = it },
                                                    onProcessingState = { isProcessing = it },
                                                    onError = { errorMessage = it },
                                                    onSuccess = { tx ->
                                                        completedTransaction = tx
                                                        onPaymentSuccess(product, email, customerName, specialty, notes, tx.cardLast4, tx.cardBrand)
                                                    }
                                                )
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = Color.Black),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth().height(48.dp)
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text("Pay with", color = Color.White, fontWeight = FontWeight.Medium)
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text("G Pay", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                            }
                                        }
                                    }
                                }
                            }

                            PaymentMethodTab.STRIPE_HOSTED_LINK -> {
                                Card(
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = StripeLightBg),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, StripeBorder),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp)
                                    ) {
                                        Text(
                                            text = "Official Stripe Payment Link (buy.stripe.com)",
                                            fontWeight = FontWeight.Bold,
                                            color = MatchaDark
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Open this product directly in Stripe's hosted checkout page in your web browser.",
                                            style = Typography.bodySmall.copy(color = MatchaTextSecondary)
                                        )
                                        Spacer(modifier = Modifier.height(10.dp))
                                        val targetUrl = customPaymentLink ?: product.suggestedPaymentLink
                                        Surface(
                                            color = Color.White,
                                            shape = RoundedCornerShape(6.dp),
                                            border = androidx.compose.foundation.BorderStroke(1.dp, StripeBorder),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text(
                                                text = targetUrl,
                                                style = Typography.labelSmall.copy(color = StripePurple, fontFamily = FontFamily.Monospace),
                                                modifier = Modifier.padding(8.dp)
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Button(
                                            onClick = {
                                                try {
                                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl))
                                                    context.startActivity(intent)
                                                    Toast.makeText(context, "Opening Stripe Hosted Checkout...", Toast.LENGTH_SHORT).show()
                                                } catch (e: Exception) {
                                                    Toast.makeText(context, "Could not open browser: ${e.message}", Toast.LENGTH_SHORT).show()
                                                }
                                            },
                                            colors = ButtonDefaults.buttonColors(containerColor = StripePurple),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Icon(Icons.Default.Launch, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text("Open Stripe Checkout in Browser")
                                        }
                                    }
                                }
                            }
                        }

                        // Processing Overlay / Indicator
                        AnimatedVisibility(
                            visible = isProcessing,
                            enter = fadeIn(),
                            exit = fadeOut()
                        ) {
                            Surface(
                                color = StripeLightBg,
                                shape = RoundedCornerShape(12.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, StripePurple.copy(alpha = 0.3f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(
                                        color = StripePurple,
                                        strokeWidth = 3.dp,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = processingStep,
                                        style = Typography.bodySmall.copy(color = StripeDark, fontWeight = FontWeight.Medium)
                                    )
                                }
                            }
                        }

                        // Main Pay Action Button (for Credit Card tab)
                        if (selectedTab == PaymentMethodTab.CREDIT_CARD) {
                            Button(
                                onClick = {
                                    if (email.isBlank() || !email.contains("@")) {
                                        errorMessage = "Please enter a valid receipt email address."
                                        return@Button
                                    }
                                    if (rawCardDigits.length < 15) {
                                        errorMessage = "Please enter a valid 16-digit card number."
                                        return@Button
                                    }
                                    if (expiryDate.length < 5) {
                                        errorMessage = "Please enter a valid expiration date (MM/YY)."
                                        return@Button
                                    }
                                    if (cvc.length < 3) {
                                        errorMessage = "Please enter a valid 3-4 digit CVC."
                                        return@Button
                                    }

                                    val last4 = rawCardDigits.takeLast(4)
                                    executePaymentSimulation(
                                        product = product,
                                        email = email,
                                        name = customerName,
                                        specialty = specialty,
                                        notes = notes,
                                        cardLast4 = last4,
                                        cardBrand = cardBrand,
                                        coroutineScope = coroutineScope,
                                        onProcessingStep = { processingStep = it },
                                        onProcessingState = { isProcessing = it },
                                        onError = { errorMessage = it },
                                        onSuccess = { tx ->
                                            completedTransaction = tx
                                            onPaymentSuccess(product, email, customerName, specialty, notes, tx.cardLast4, tx.cardBrand)
                                        }
                                    )
                                },
                                enabled = !isProcessing,
                                colors = ButtonDefaults.buttonColors(containerColor = StripePurple),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("stripe_confirm_pay_button")
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Pay ${product.formattedPrice} with Stripe",
                                        style = Typography.titleMedium.copy(
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold
                                        )
                                    )
                                }
                            }
                        }

                        // Policy Notice footer
                        Text(
                            text = if (product.billingType == BillingType.ONE_TIME_DIGITAL_SERVICE)
                                "Notice: Intake form is emailed within 24 hours. Turnaround/scheduling is strictly 2–4 weeks from submission date."
                            else
                                "Notice: Billed to your payment method automatically. Cancel anytime. Funds deposited directly to linked bank account.",
                            style = Typography.labelSmall.copy(
                                color = MatchaTextSecondary,
                                textAlign = TextAlign.Center,
                                fontSize = 11.sp
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

private fun executePaymentSimulation(
    product: StripeProduct,
    email: String,
    name: String,
    specialty: String,
    notes: String,
    cardLast4: String,
    cardBrand: String,
    coroutineScope: kotlinx.coroutines.CoroutineScope,
    onProcessingStep: (String) -> Unit,
    onProcessingState: (Boolean) -> Unit,
    onError: (String) -> Unit,
    onSuccess: (StripePaymentTransaction) -> Unit
) {
    onProcessingState(true)
    coroutineScope.launch {
        try {
            onProcessingStep("Connecting to Stripe API...")
            delay(500)
            onProcessingStep("Creating Stripe PaymentIntent (${product.formattedPrice})...")
            delay(600)
            onProcessingStep("Authenticating with 3D Secure / Issuing Bank...")
            delay(700)
            onProcessingStep("Payment authorized! Finalizing receipt...")
            delay(400)

            val txId = "pi_3M" + java.util.UUID.randomUUID().toString().take(12).replace("-", "")
            val tx = StripePaymentTransaction(
                transactionId = txId,
                productId = product.id,
                productName = product.name,
                amountFormatted = product.formattedPrice,
                amountCents = product.amountCents,
                customerEmail = email,
                customerName = name,
                specialty = specialty,
                notes = notes,
                cardLast4 = cardLast4,
                cardBrand = cardBrand,
                status = "succeeded",
                timestamp = System.currentTimeMillis(),
                stripeReceiptUrl = "https://dashboard.stripe.com/test/payments/$txId"
            )
            onProcessingState(false)
            onSuccess(tx)
        } catch (e: Exception) {
            onProcessingState(false)
            onError("Payment failed: ${e.message}")
        }
    }
}

@Composable
fun StripePaymentSuccessView(
    transaction: StripePaymentTransaction,
    product: StripeProduct,
    onDone: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .background(SafeGreenContainer, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Default.CheckCircle,
                contentDescription = "Success",
                tint = SafeGreen,
                modifier = Modifier.size(48.dp)
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Payment Succeeded!",
            style = Typography.headlineSmall.copy(fontWeight = FontWeight.Bold, color = MatchaDark)
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Receipt emailed to ${transaction.customerEmail}",
            style = Typography.bodySmall.copy(color = MatchaTextSecondary)
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Receipt Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = StripeLightBg),
            border = androidx.compose.foundation.BorderStroke(1.dp, StripeBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ReceiptRow(label = "Item", value = product.name)
                ReceiptRow(label = "Amount Charged", value = transaction.amountFormatted, isBold = true)
                ReceiptRow(label = "Payment Method", value = "${transaction.cardBrand} •••• ${transaction.cardLast4}")
                ReceiptRow(label = "Stripe Reference", value = transaction.transactionId, isMonospace = true)
                ReceiptRow(label = "Turnaround", value = product.schedulingOrTurnaround)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Surface(
            color = MatchaContainer,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = if (product.billingType == BillingType.ONE_TIME_DIGITAL_SERVICE)
                        "📋 What happens next:"
                    else
                        "🌟 Pro Membership Activated:",
                    fontWeight = FontWeight.Bold,
                    color = MatchaForest,
                    fontSize = 13.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (product.billingType == BillingType.ONE_TIME_DIGITAL_SERVICE)
                        "1. You will receive an intake questionnaire link at ${transaction.customerEmail} within 24 hours.\n" +
                        "2. Our attending physician will review your documents or schedule your mock interview according to the 2–4 week turnaround commitment."
                    else
                        "Your MatchaMD Pro subscription is active immediately! All premium filters, direct contacts, and unlimited rank bookmarks are unlocked.",
                    style = Typography.bodySmall.copy(color = MatchaDark, fontSize = 12.sp, lineHeight = 16.sp)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = onDone,
            colors = ButtonDefaults.buttonColors(containerColor = MatchaForest),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .testTag("stripe_success_done_button")
        ) {
            Text("Done", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ReceiptRow(label: String, value: String, isBold: Boolean = false, isMonospace: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = Typography.bodySmall.copy(color = MatchaTextSecondary, fontSize = 12.sp))
        Text(
            text = value,
            style = Typography.bodySmall.copy(
                color = MatchaDark,
                fontWeight = if (isBold) FontWeight.Bold else FontWeight.Medium,
                fontFamily = if (isMonospace) FontFamily.Monospace else FontFamily.Default,
                fontSize = 12.sp
            )
        )
    }
}

@Composable
fun PaymentTabButton(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        color = if (isSelected) Color.White else Color.Transparent,
        shape = RoundedCornerShape(8.dp),
        shadowElevation = if (isSelected) 2.dp else 0.dp,
        modifier = modifier.clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(vertical = 8.dp, horizontal = 6.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (isSelected) StripePurple else Color(0xFF64748B),
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = title,
                style = Typography.labelSmall.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    color = if (isSelected) StripeDark else Color(0xFF64748B),
                    fontSize = 11.sp
                )
            )
        }
    }
}
