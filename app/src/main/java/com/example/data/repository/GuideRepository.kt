package com.example.data.repository

data class ScamWarningItem(
    val id: String,
    val title: String,
    val severity: String, // "CRITICAL", "HIGH", "MODERATE"
    val redFlagDescription: String,
    val howTheScamWorks: String,
    val safeAlternative: String,
    val checklistItem: String
)

data class MatchGuideArticle(
    val id: String,
    val title: String,
    val category: String,
    val readingTimeMinutes: Int,
    val summary: String,
    val keyTakeaways: List<String>,
    val fullContent: String,
    val actionableTemplate: String? = null
)

data class VerifiedScamAlert(
    val id: String,
    val entityName: String,
    val scamCategory: String,
    val location: String,
    val lossReported: String,
    val verifiedFindings: String,
    val documentationVerified: String,
    val status: String = "VERIFIED_ALERT"
)

object GuideRepository {

    const val LEGAL_DISCLOSURE_TITLE = "Legal Safe Harbor & Anti-Libel Disclosure"
    val LEGAL_DISCLOSURE_FULL = """
        IMPORTANT LEGAL NOTICE & ANTI-DEFAMATION POLICY:
        MatchaMD operates as an educational platform and community verification board pursuant to the Communications Decency Act (47 U.S.C. § 230) and applicable anti-SLAPP statutes. 
        
        1. MANDATORY FACTUAL VERIFICATION: To protect legitimate educational institutions, hospital clinics, and attending physicians against libel, slander, and malicious competitor defamation, NO user-reported scam or bad actor allegation is published publicly until documentary evidence (e.g., formal contracts, unedited email chains with domain headers, bank wire/Zelle transfer receipts) is examined through our moderation verification pipeline.
        
        2. ATTESTATION UNDER PENALTY OF LAW: Every submitting applicant must legally certify under penalty of perjury, fraud, and immediate account termination that their report represents true, factual, first-hand experience and that no defamatory, fabricated, or third-party hearsay statements are included.
        
        3. INSTITUTIONAL RIGHT OF RESPONSE & EXPEDITED CORRECTION: Any clinical organization, educational agency, or faculty member referenced in a community dispute may request immediate review or file documentation rebutting any claims by contacting compliance@matchamd.com. Verified inaccuracies are removed immediately.
        
        4. OFFICIAL REPORTING CHANNELS: MatchaMD strongly encourages victims of financial or medical training fraud to simultaneously submit official formal complaints with:
           • Federal Trade Commission (FTC): ReportFraud.ftc.gov
           • ECFMG Credentials Verification & Irregular Behavior Committee
           • State Medical Boards and State Attorney General Consumer Protection Divisions.
    """.trimIndent()

    val verifiedCommunityAlerts: List<VerifiedScamAlert> = listOf(
        VerifiedScamAlert(
            id = "alert_01",
            entityName = "US Match Direct LLC / 'FastTrack Rotations'",
            scamCategory = "Guaranteed Residency Interview Guarantee",
            location = "Online / Florida Maildrop",
            lossReported = "$4,500 per applicant",
            verifiedFindings = "Marketed clinical rotations with 'guaranteed NRMP rank order interviews' at non-existent partner programs. The associated university hospital GME confirmed zero affiliation and issued a formal cease-and-desist.",
            documentationVerified = "Verified written marketing contract, credit card dispute records, official university GME denial letter on file."
        ),
        VerifiedScamAlert(
            id = "alert_02",
            entityName = "Global Clinical Observers Network (Private Gmail entity)",
            scamCategory = "Unverified Wire Transfer & Fake Hospital Badges",
            location = "Chicago, IL / Online",
            lossReported = "$2,800 wire deposit",
            verifiedFindings = "Posed as department residency coordinator using personal Gmail addresses. Provided falsified hospital rotation approval letters. Applicants arrived at hospital reception and were turned away for lack of security clearance.",
            documentationVerified = "Verified fake PDF letterhead comparison, Swift wire receipt, official hospital security incident report."
        ),
        VerifiedScamAlert(
            id = "alert_03",
            entityName = "Elite Residency LOR Prep Services",
            scamCategory = "Templated Fake Letterhead LOR Mill",
            location = "Online / WhatsApp Outreach",
            lossReported = "$1,200 per recommendation",
            verifiedFindings = "Sold pre-signed Letters of Recommendation on counterfeit academic letterheads without attending physician knowledge. ECFMG flagged multiple identical letters under irregular behavior investigations.",
            documentationVerified = "Verified identical template analysis across 4 applicants, confirmation of non-authorization from named attending physician."
        )
    )

    val scamWarningItems: List<ScamWarningItem> = listOf(
        ScamWarningItem(
            id = "scam_01",
            title = "The 'Guaranteed Residency Interview' or 'Match Guarantee' Scam",
            severity = "CRITICAL",
            redFlagDescription = "Third-party rotation agencies claiming that booking their $3,000–$5,000 rotation 'guarantees an interview or residency spot' at an affiliated program.",
            howTheScamWorks = "Under the NRMP Match Participation Agreement and ACGME bylaws, offering guaranteed interviews in exchange for commercial payment is strictly prohibited. Brokers collect massive upfront fees, place students in unaccredited private clinics, and disappear when interview season arrives.",
            safeAlternative = "Only apply directly to hospital-sponsored observerships where admissions decisions are governed by official GME (Graduate Medical Education) offices. Never pay any company promising match outcomes.",
            checklistItem = "Never trust any entity promising guaranteed interviews or matching."
        ),
        ScamWarningItem(
            id = "scam_02",
            title = "Generic Shadowing Sold as 'Hands-on USCE' (US Clinical Experience)",
            severity = "HIGH",
            redFlagDescription = "Brokers advertising 'hands-on clinical rotations' that turn out to be purely observational shadowing in an outpatient storefront without electronic medical record (EMR) access or hospital privileges.",
            howTheScamWorks = "Brokers charge premium rates for 'hands-on' experience. However, state medical boards forbid unlicensed medical graduates from touching patients without an institutional medical school affiliation or state training license. Misrepresenting pure shadowing as 'hands-on USCE' on ERAS can lead to credential audits.",
            safeAlternative = "Clarify whether the hospital provides official trainee badges and Epic/Cerner read-only accounts. If it's an observership, own it honestly on your ERAS CV; PDs value clinical acumen and strong attending letters over exaggerated shadowing.",
            checklistItem = "Verify if hospital badge and institutional EMR login are provided."
        ),
        ScamWarningItem(
            id = "scam_03",
            title = "Unverified Gmail / Wire Transfer Payment Demands",
            severity = "CRITICAL",
            redFlagDescription = "Communication conducted exclusively through private @gmail.com or @yahoo.com addresses, with payment demanded via Zelle, Venmo, Western Union, or personal international bank wires.",
            howTheScamWorks = "Scammers pose as 'residency coordinators' or 'university department assistants' using cloned logos. They demand $1,500–$3,500 deposit fees sent to personal accounts. Once the money is wired, the contact blocks the applicant.",
            safeAlternative = "Official university and hospital programs will ONLY communicate from official domains (e.g., @ccf.org, @harvard.edu, @mayo.edu) and invoice payments through an official university cashier/bursar portal with merchant receipts.",
            checklistItem = "Only pay institutional bursars; never wire money to personal accounts."
        ),
        ScamWarningItem(
            id = "scam_04",
            title = "Ghostwritten / Fake Letterhead Letters of Recommendation (LOR)",
            severity = "CRITICAL",
            redFlagDescription = "Rotations where the student is instructed to 'write your own LOR and we'll stamp it,' or where the attending provides an unverified letterhead with no ACGME faculty affiliation.",
            howTheScamWorks = "Residency program selection committees recognize generic, templated letters immediately. If an applicant uploads a fraudulent or copied LOR, ECFMG's Credentials Review Committee can flag the applicant for irregular behavior, resulting in lifetime bans from the Match.",
            safeAlternative = "A genuine, strong LOR comes from direct clinical observation where the attending personally describes your patient presentations, bedside manner, and medical knowledge.",
            checklistItem = "Ensure your supervising attending is active clinical faculty with an active NPI."
        ),
        ScamWarningItem(
            id = "scam_05",
            title = "Unaccredited 'Residency Preparation' Fee Mills",
            severity = "HIGH",
            redFlagDescription = "Programs charging $10,000+ for 'clinical immersion fellowship' titles that have zero ACGME accreditation and do not count toward board certification.",
            howTheScamWorks = "These programs exploit desperate IMGs by creating fancy certificates that hold zero weight with ACGME program directors.",
            safeAlternative = "Check all programs on ACGME.org and FREIDA (AMA). If the program does not possess an official 10-digit ACGME accreditation code, it is not an approved residency program.",
            checklistItem = "Verify program in the official ACGME Accreditation Database."
        )
    )

    val matchGuides: List<MatchGuideArticle> = listOf(
        MatchGuideArticle(
            id = "guide_img_roadmap",
            title = "The Master IMG Roadmap to the US Match (2026-2027)",
            category = "Strategy & Timeline",
            readingTimeMinutes = 8,
            summary = "A comprehensive month-by-month blueprint for international medical graduates: ECFMG pathways, Step 2 CK timing, USCE strategy, and token submission.",
            keyTakeaways = listOf(
                "Aim to complete USMLE Step 2 CK by June/July of your application year to have scores verified before September ERAS opening.",
                "Target at least 3 US Clinical Experience (USCE) rotations yielding 3 specialty-specific LORs.",
                "OET Medicine must be taken early to ensure ECFMG certificate clearance by the Rank Order List deadline in February.",
                "Geographic and program signaling should be aligned with your clinical ties and Step 2 CK profile."
            ),
            fullContent = """
# Master IMG Roadmap to the US Match

### Phase 1: Foundation (January – April)
1. **USMLE Step 2 CK**: With Step 1 being Pass/Fail, Step 2 CK is your single most critical objective metric. Programs use automated filters (often 230–240+ in competitive internal medicine and pediatrics). Give yourself dedicated preparation time.
2. **ECFMG Pathway Application**: Verify which pathway applies to your school (Pathway 1: License to Practice, Pathway 2: Objective Structured Clinical Exam, Pathway 3-5: World Directory accreditation).

### Phase 2: US Clinical Experience (May – July)
1. Secure 3–4 months of US clinical rotations. Prioritize university hospitals and community-affiliated programs with active residency programs.
2. Request Letters of Recommendation (LORs) in person at the end of each rotation. Provide the attending with your updated CV, personal statement draft, and ERAS Letter Request Form.

### Phase 3: Application Submission (August – September)
1. Purchase your MyERAS Token through ECFMG OASIS in late June.
2. Complete your MyERAS application: 10 experiences (3 highlighted as most meaningful), impactful personal statement, and MSPE (Medical Student Performance Evaluation).
            """.trimIndent()
        ),
        MatchGuideArticle(
            id = "guide_cold_email_rotations",
            title = "How to Ethically Secure Free / Low-Cost University Observerships",
            category = "USCE & Observerships",
            readingTimeMinutes = 6,
            summary = "Direct academic outreach strategy to secure legitimate hospital observerships without paying predatory broker markups.",
            keyTakeaways = listOf(
                "Target Associate Program Directors and Research Faculty rather than solely the Program Director.",
                "Keep initial cold emails strictly under 150 words with your CV attached as a single PDF.",
                "Focus on programs in regions where your medical school has an alumni network or where you have familial ties.",
                "Always offer to present a clinical case or assist in departmental literature reviews during your observership."
            ),
            fullContent = """
# Cold Outreach Strategy for Legitimate Rotations

Instead of paying commercial brokerages thousands of dollars for generic outpatient shadowing, direct institutional outreach consistently yields high-quality, authentic university observerships.

### Rules of Professional Outreach:
1. **Target the Right Faculty**: Program Directors receive 200+ emails per day during interview season. Reach out to Clerkship Directors, Associate Program Directors (APDs), or Clinician-Educators who actively mentor international graduates.
2. **Personalize Your Connection**: Reference a recent publication, a clinical symposium they spoke at, or mutual alumni connections.
3. **Be Clear About What You Need**: Request an observational observership or clinical research rotation with clear prospective start and end dates.
            """.trimIndent(),
            actionableTemplate = """
Subject: Medical Graduate Observership Inquiry: Dr. [Attending Last Name] - Internal Medicine

Dear Dr. [Attending Last Name],

I hope this email finds you well. My name is [Your Name], MD, an aspiring internal medicine resident and recent graduate from [Your Medical School] (USMLE Step 2 CK: [Your Score], ECFMG Certified).

I have followed your departmental work on [Specific Topic / Case / Clinical Focus], and I greatly admire [Hospital Name]'s academic dedication to comprehensive patient care. 

I am writing to respectfully inquire whether your clinical service has availability for a 4-week clinical observership during [Month, Year] or [Month, Year]. I am eager to participate in daily teaching rounds, contribute to departmental journal clubs, and learn from your team's clinical management.

I have attached my updated Medical CV and ECFMG certificate for your review. I would be deeply grateful for your consideration or guidance on your department's GME application protocol.

Thank you very much for your time and mentorship.

Warm regards,
[Your Full Name], MD
[Phone Number] | [Email Address] | [AAMC ID]
            """.trimIndent()
        ),
        MatchGuideArticle(
            id = "guide_personal_statement",
            title = "Crafting a Compelling ERAS Personal Statement",
            category = "Application Polish",
            readingTimeMinutes = 7,
            summary = "How to write an authentic personal statement that highlights clinical resilience, overcomes gaps or red flags, and leaves a memorable impression.",
            keyTakeaways = listOf(
                "Limit your statement to exactly 1 page (600–750 words). Program directors review hundreds in an evening.",
                "Start with a pivotal clinical case that demonstrates your bedside empathy and diagnostic curiosity.",
                "Address any attempts or graduation gaps directly, concisely, and with lessons learned—never make excuses.",
                "Conclude with your long-term career aspirations and what you bring to their residency culture."
            ),
            fullContent = """
# Writing a Standout Personal Statement

### The 4-Paragraph Formula
• **Paragraph 1: The Spark**: A vivid, specific patient interaction that shaped your clinical commitment.
• **Paragraph 2: Academic Growth & Resilience**: Overcoming challenges, research initiatives, and adapting to US clinical environments.
• **Paragraph 3: Why This Specialty**: Specific patient population challenges and clinical skills you enjoy (e.g., longitudinal chronic care in IM, advocating for children in Peds).
• **Paragraph 4: Vision for Residency & Contribution**: What you bring to the program: strong work ethic, cultural dexterity, and team leadership.
            """.trimIndent()
        ),
        MatchGuideArticle(
            id = "guide_signaling_strategy",
            title = "ERAS Program Signaling & Geo Preference Strategy",
            category = "Match Tactics",
            readingTimeMinutes = 5,
            summary = "How to maximize your Gold and Silver signals and geographic preference selections for higher interview yield based on recent NRMP data.",
            keyTakeaways = listOf(
                "Do not waste Gold signals on hyper-competitive reach programs that historically match 0% IMGs.",
                "Use Gold signals on programs where your Step 2 CK is at or above their 50th percentile and they sponsor your required visa.",
                "Geographic preferences provide a 2x to 3x multiplier on interview conversion when aligned with signals.",
                "Always write thoughtful 300-character explanations for your chosen geographic divisions."
            ),
            fullContent = """
# Strategic Program Signaling

According to recent NRMP data, residency programs receive over 4,000 applications for 20 spots. Program directors use **Signals** to filter the pile first:
1. **Gold Signals**: Reserved for programs you would immediately rank in your Top 3.
2. **Silver Signals**: High-yield targets where your credentials closely match the program's resident roster.
3. **No Preference**: If you have no genuine regional ties, selecting 'No Preference' with a compelling reason ('willing to go wherever rigorous training is offered') is far better than leaving it blank.
            """.trimIndent()
        )
    )
}
