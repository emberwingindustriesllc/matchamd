package com.example.data.model

data class StripeProduct(
    val id: String,
    val name: String,
    val description: String,
    val amountCents: Long,
    val formattedPrice: String,
    val billingType: BillingType,
    val schedulingOrTurnaround: String,
    val iconEmoji: String,
    val stripePriceId: String,
    val stripeProductId: String,
    val suggestedPaymentLink: String,
    val deliverables: List<String>
) {
    val amountDollars: Double get() = amountCents / 100.0
}

enum class BillingType {
    ONE_TIME_DIGITAL_SERVICE,
    RECURRING_MONTHLY,
    RECURRING_ANNUAL
}

data class StripePaymentTransaction(
    val transactionId: String,
    val productId: String,
    val productName: String,
    val amountFormatted: String,
    val amountCents: Long,
    val customerEmail: String,
    val customerName: String,
    val specialty: String,
    val notes: String,
    val cardLast4: String,
    val cardBrand: String,
    val status: String, // "succeeded", "processing", "refunded"
    val timestamp: Long,
    val stripeReceiptUrl: String
)

object StripeCatalog {
    val MOCK_INTERVIEW = StripeProduct(
        id = "mock_interview_150",
        name = "1-on-1 Mock Interview",
        description = "60-minute simulated residency interview conducted by board-certified US attending physician with recorded oral debrief and scoring rubric.",
        amountCents = 15000,
        formattedPrice = "$150.00",
        billingType = BillingType.ONE_TIME_DIGITAL_SERVICE,
        schedulingOrTurnaround = "Scheduling within 2–4 Weeks",
        iconEmoji = "🎙️",
        stripePriceId = "price_mock_interview_150",
        stripeProductId = "prod_mock_interview_150",
        suggestedPaymentLink = "https://buy.stripe.com/test_mock_interview_150",
        deliverables = listOf(
            "Requires 2–4 weeks advance notice to coordinate attending clinical shifts",
            "Full 60-minute realistic interview simulating top academic hospital panels",
            "Comprehensive ACGME competency evaluation & oral feedback session",
            "Actionable coaching on high-stakes behavioral and ethical dilemmas"
        )
    )

    val CV_REVIEW = StripeProduct(
        id = "cv_review_125",
        name = "Medical CV & ERAS Experience Review",
        description = "Line-by-line developmental critique of all 10 ERAS experience descriptions and your 3 Most Meaningful essays by matched US clinical faculty.",
        amountCents = 12500,
        formattedPrice = "$125.00",
        billingType = BillingType.ONE_TIME_DIGITAL_SERVICE,
        schedulingOrTurnaround = "2–4 Weeks Turnaround",
        iconEmoji = "📄",
        stripePriceId = "price_cv_review_125",
        stripeProductId = "prod_cv_review_125",
        suggestedPaymentLink = "https://buy.stripe.com/test_cv_review_125",
        deliverables = listOf(
            "Strict 2–4 weeks turnaround from intake submission",
            "Active clinical verbs and quantified impact optimization",
            "Refining context for international medical graduates (IMGs)",
            "Specialty-specific alignment check for your target ACGME field"
        )
    )

    val PS_LOI_REVIEW = StripeProduct(
        id = "ps_loi_review_140",
        name = "Personal Statement & Letter of Intent (LOI)",
        description = "Structural critique, theme development, red flag mitigation, and tone polishing for your Personal Statement and post-interview Letters of Intent.",
        amountCents = 14000,
        formattedPrice = "$140.00",
        billingType = BillingType.ONE_TIME_DIGITAL_SERVICE,
        schedulingOrTurnaround = "2–4 Weeks Turnaround",
        iconEmoji = "✍️",
        stripePriceId = "price_ps_loi_140",
        stripeProductId = "prod_ps_loi_140",
        suggestedPaymentLink = "https://buy.stripe.com/test_ps_loi_140",
        deliverables = listOf(
            "Strict 2–4 weeks turnaround from intake submission",
            "Addressing exam attempts, gaps, or specialty changes constructively",
            "Specialized guidance on Letter of Intent (LOI) & Letter of Interest etiquette",
            "2 developmental critique rounds ensuring authentic clinical voice"
        )
    )

    val PACKET_AUDIT = StripeProduct(
        id = "packet_audit_249",
        name = "Complete ERAS Application Packet Audit",
        description = "End-to-end audit of entire ERAS submission packet before token submission: CV, Personal Statement, Geographic Preferences, and Gold/Silver signaling.",
        amountCents = 24900,
        formattedPrice = "$249.00",
        billingType = BillingType.ONE_TIME_DIGITAL_SERVICE,
        schedulingOrTurnaround = "2–4 Weeks Turnaround",
        iconEmoji = "🏥",
        stripePriceId = "price_eras_packet_249",
        stripeProductId = "prod_eras_packet_249",
        suggestedPaymentLink = "https://buy.stripe.com/test_packet_audit_249",
        deliverables = listOf(
            "Strict 2–4 weeks turnaround from intake submission",
            "Holistic review of CV, Personal Statement, and ERAS supplemental essays",
            "Data-driven Gold and Silver preference signaling strategy",
            "Prioritized executive summary highlighting vulnerabilities and fixes"
        )
    )

    val PRO_MONTHLY = StripeProduct(
        id = "pro_monthly_999",
        name = "MatchaMD Pro (Monthly)",
        description = "Full access to unlimited program bookmarks, direct GME coordinator contacts, USMLE question bank, and multi-specialty ERAS cost modeling.",
        amountCents = 999,
        formattedPrice = "$9.99 / mo",
        billingType = BillingType.RECURRING_MONTHLY,
        schedulingOrTurnaround = "Instant Activation",
        iconEmoji = "🌟",
        stripePriceId = "price_matchamd_pro_monthly",
        stripeProductId = "prod_matchamd_pro_subscription",
        suggestedPaymentLink = "https://buy.stripe.com/test_pro_monthly_999",
        deliverables = listOf(
            "Billed monthly at $9.99/month, cancel anytime",
            "Unlimited program saves and custom rank order notes",
            "Direct coordinator emails & phone contacts",
            "Complete USMLE Step 2 CK vignette questions with answers"
        )
    )

    val PRO_ANNUAL = StripeProduct(
        id = "pro_annual_100",
        name = "MatchaMD Pro (12 Months)",
        description = "Complete 12-month access covering application submission, interview season, SOAP, and rank order list submission.",
        amountCents = 10000,
        formattedPrice = "$100.00 / 12 mos",
        billingType = BillingType.RECURRING_ANNUAL,
        schedulingOrTurnaround = "Instant Activation (Save $19.88)",
        iconEmoji = "👑",
        stripePriceId = "price_matchamd_pro_annual_100",
        stripeProductId = "prod_matchamd_pro_subscription",
        suggestedPaymentLink = "https://buy.stripe.com/test_pro_annual_100",
        deliverables = listOf(
            "Billed $100 for 12 months (~$8.33/month)",
            "Saves ~17% compared to monthly renewal over a full match cycle",
            "Unrestricted access through Match Day & post-match onboarding",
            "All Pro features and priority support included"
        )
    )

    val ALL_SERVICES = listOf(
        MOCK_INTERVIEW,
        CV_REVIEW,
        PS_LOI_REVIEW,
        PACKET_AUDIT
    )

    val ALL_PRODUCTS = listOf(
        PRO_MONTHLY,
        PRO_ANNUAL,
        MOCK_INTERVIEW,
        CV_REVIEW,
        PS_LOI_REVIEW,
        PACKET_AUDIT
    )
}
