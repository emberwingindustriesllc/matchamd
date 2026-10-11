package com.example.data.repository

import com.example.data.model.InterviewPracticeQuestion
import com.example.data.model.MatchTimelineEvent

object InterviewRepository {

    val timelineEvents: List<MatchTimelineEvent> = listOf(
        MatchTimelineEvent(
            title = "MyERAS Application Submission",
            dateString = "September 24",
            description = "Residency programs begin reviewing applications and MSPEs simultaneously at 9:00 AM ET.",
            daysRemaining = 14,
            isCrucial = true
        ),
        MatchTimelineEvent(
            title = "MSPE (Dean's Letter) Release",
            dateString = "September 24",
            description = "Medical School Performance Evaluations become viewable by all ACGME programs.",
            daysRemaining = 14,
            isCrucial = true
        ),
        MatchTimelineEvent(
            title = "Peak Interview Season",
            dateString = "October - January",
            description = "Virtual and in-person interviews conducted; log notes and impressions promptly.",
            daysRemaining = 45,
            isCrucial = false
        ),
        MatchTimelineEvent(
            title = "NRMP Rank Order List (ROL) Opens",
            dateString = "February 1",
            description = "Applicants enter and certify their final ranked list of preferred residency programs.",
            daysRemaining = 145,
            isCrucial = false
        ),
        MatchTimelineEvent(
            title = "ROL Certification Deadline",
            dateString = "March 4 (9:00 PM ET)",
            description = "Final certified Rank Order List locked in NRMP R3 system. No changes permitted thereafter.",
            daysRemaining = 175,
            isCrucial = true
        ),
        MatchTimelineEvent(
            title = "Match Week & SOAP",
            dateString = "Third Monday of March",
            description = "Applicants learn IF they matched; unmatched applicants participate in SOAP rounds.",
            daysRemaining = 188,
            isCrucial = true
        ),
        MatchTimelineEvent(
            title = "MATCH DAY! 🎉",
            dateString = "Third Friday of March (12:00 PM ET)",
            description = "Official match envelopes/emails opened revealing where you will train for residency!",
            daysRemaining = 192,
            isCrucial = true
        )
    )

    val interviewQuestions: List<InterviewPracticeQuestion> = listOf(
        InterviewPracticeQuestion(
            id = "int_01",
            category = "Traditional",
            question = "Tell me about yourself, and what drew you to this specialty?",
            keyPointsToCover = listOf(
                "Chronological narrative from early scientific interest to pivotal clinical rotation",
                "Specific patient encounter that confirmed your specialty dedication",
                "Unique background perspective (e.g. international clinical experience, research)",
                "Why you are energized for residency training at this specific hospital"
            ),
            sampleAnswer = "I grew up with a deep fascination for developmental physiology, which solidified during my pediatric third-year clerkship when I cared for a 6-year-old with newly diagnosed asthma. Guiding both the child and their anxious parents through home nebulizer care showed me the unique longitudinal partnership inherent in pediatrics. Since then, I've pursued research in childhood health equity and completed clinical rotations in tertiary academic centers. Outside the hospital, I'm an avid distance runner and enjoy baking sourdough. I am thrilled to be here today because your program balances rigorous inpatient critical care with dedicated community advocacy.",
            redFlagsToAvoid = "Do not recite your CV line by line. Avoid cliches like 'I love science and helping people' without concrete clinical anecdotes."
        ),
        InterviewPracticeQuestion(
            id = "int_02",
            category = "Behavioral (STAR Method)",
            question = "Describe a time you experienced clinical conflict with a colleague or nurse. How did you resolve it?",
            keyPointsToCover = listOf(
                "Situation & Task: Set up the clinical disagreement objectively without blaming",
                "Action: Focused on open communication, active listening, and patient safety first",
                "Result: Reached collaborative consensus and maintained a positive professional bond"
            ),
            sampleAnswer = "During an inpatient sub-internship, an experienced bedside nurse questioned my senior resident's order for fluid boluses in an oliguric post-op patient with a mild murmur. Rather than dismissing her concern, I went to the bedside, listened to her assessment, and noted bilateral lung crackles that had developed since morning rounds. I immediately discussed these findings with my senior resident. We paused the bolus, obtained an urgent chest radiograph, and consulted cardiology, which diagnosed acute fluid overload. The nurse and I established a strong collaborative rapport, and I learned that respecting multidisciplinary nursing intuition is fundamental to patient safety.",
            redFlagsToAvoid = "Never blame the other party or speak negatively about nurses or attendings. Never say 'I've never had any conflicts with anyone'."
        ),
        InterviewPracticeQuestion(
            id = "int_03",
            category = "Ethics & Situational",
            question = "What would you do if you noticed a senior resident on your service who appeared visibly intoxicated or impaired on night float?",
            keyPointsToCover = listOf(
                "Prioritize patient safety above all other considerations immediately",
                "Discreetly and professionally relieve the resident from direct clinical duties",
                "Notify the chief resident or on-call attending promptly through official hospital channels",
                "Approach the colleague with supportive empathy while maintaining accountability"
            ),
            sampleAnswer = "Patient safety is my non-negotiable priority. If I suspected a colleague was clinically impaired, I would immediately and discreetly ask them to step away from active patient care. I would take over any urgent pending orders and immediately contact the chief resident or on-call attending to ensure coverage and safety. Once patients are secure, I would follow institutional protocol to ensure the resident receives proper medical and wellness evaluation. Impairment is a safety emergency and a medical vulnerability that requires both swift action and compassionate support.",
            redFlagsToAvoid = "Do not attempt to cover for the colleague or wait until morning rounds to report an active impairment."
        ),
        InterviewPracticeQuestion(
            id = "int_04",
            category = "Specialty Specific",
            question = "Why Pediatrics? How do you handle emotionally difficult situations with sick children and grieving families?",
            keyPointsToCover = listOf(
                "Distinctive resilience and joy in working with children and multi-generational families",
                "Clinical strategies for compassionate presence and boundary maintenance",
                "Healthy self-care and debriefing mechanisms with clinical teams"
            ),
            sampleAnswer = "Pediatrics is uniquely rewarding because children are remarkably resilient and honest in their healing. However, pediatric illness can be heartbreaking for families. When caring for critically ill children, I've learned that compassionate presence—truly listening to parents without rushing to fill the silence—is as essential as medical pharmacology. After difficult resuscitations or oncology losses, I practice structured debriefing with our care team and maintain emotional wellness through regular exercise and mentorship. This balance allows me to remain fully empathetic and dedicated without developing burnout.",
            redFlagsToAvoid = "Do not say 'I prefer kids because adults are difficult' or minimize the emotional toll of critical illness."
        )
    )
}
