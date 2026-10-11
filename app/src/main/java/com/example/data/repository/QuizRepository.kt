package com.example.data.repository

import com.example.data.model.ClinicalVignette
import com.example.data.model.MedicalSpecialty

object QuizRepository {

    val vignettes: List<ClinicalVignette> = listOf(
        ClinicalVignette(
            id = "usmle_ped_01",
            specialty = MedicalSpecialty.PEDIATRICS,
            title = "Fever and Limp in a 4-Year-Old",
            patientStem = "A 4-year-old boy is brought to the pediatric clinic by his mother because of a 2-day history of refusal to bear weight on his right leg. His mother notes he had a mild upper respiratory infection 10 days ago that resolved without intervention. He has had no trauma.",
            vitalsAndExam = "Temp: 37.4°C (99.3°F), HR: 98/min, BP: 96/60 mmHg. On exam, the child is comfortable while seated but refuses to stand. The right hip is held in slight flexion, abduction, and external rotation. Passive internal rotation of the hip elicits mild discomfort, but there is no erythema or point tenderness. ESR is 18 mm/hr, CRP is 0.8 mg/dL, WBC is 7,800/μL with normal differential. Hip ultrasound shows a small unilateral joint effusion.",
            questionPrompt = "Which of the following is the most appropriate next step in management?",
            choices = listOf(
                "A. Immediate needle arthrocentesis in the operating room",
                "B. Rest, nonsteroidal anti-inflammatory drugs, and close clinical follow-up",
                "C. Intravenous ceftriaxone and vancomycin",
                "D. Magnetic resonance imaging of the right femur",
                "E. Bone marrow biopsy"
            ),
            correctIndex = 1,
            explanation = "This patient presents with classic Transient Synovitis (toxic synovitis) of the hip following a viral illness. Using the Kocher criteria for septic arthritis (non-weight bearing, fever >38.5°C, ESR >40 mm/hr, WBC >12,000/μL), this child meets only 1 criterion (<3% probability of septic arthritis). Arthrocentesis is reserved for high suspicion of septic arthritis (≥3 Kocher criteria or elevated CRP >2.0). Transient synovitis is self-limiting and managed conservatively with NSAIDs and rest.",
            clinicalPearl = "Kocher Criteria: Fever >38.5°C, non-weight bearing, WBC >12k, ESR >40. If <2 criteria met, transient synovitis is most likely — treat with NSAIDs and observe."
        ),
        ClinicalVignette(
            id = "usmle_ped_02",
            specialty = MedicalSpecialty.PEDIATRICS,
            title = "Cyanosis in a 3-Day-Old Newborn",
            patientStem = "A 3-day-old male newborn is brought to the emergency department for progressive lethargy and blue discoloration around the lips that developed over the past 6 hours. He was born at 39 weeks via uncomplicated vaginal delivery and passed his initial newborn screen.",
            vitalsAndExam = "Temp: 36.8°C, HR: 172/min, RR: 64/min, BP: 64/38 mmHg in right arm and 62/36 mmHg in right leg. Pulse oximetry shows oxygen saturation of 74% on room air that improves to only 76% on 100% oxygen by face mask (hyperoxia test negative). Physical exam reveals marked central cyanosis, a single loud S2, and a grade 2/6 systolic ejection murmur at the left sternal border. Femoral pulses are palpable. Chest X-ray demonstrates an 'egg-on-a-string' cardiac silhouette with narrow mediastinum.",
            questionPrompt = "Which of the following is the most appropriate immediate medical intervention?",
            choices = listOf(
                "A. Intravenous indomethacin",
                "B. Intravenous prostaglandin E1 (alprostadil) infusion",
                "C. Emergent balloon atrial septostomy",
                "D. Intravenous furosemide and digoxin",
                "E. High-dose oral propranolol"
            ),
            correctIndex = 1,
            explanation = "The clinical presentation and classic 'egg-on-a-string' chest radiograph are pathognomonic for Transposition of the Great Arteries (TGA). In TGA, the systemic and pulmonary circulations run in parallel rather than series. Survival is critically dependent on maintaining intercirculatory mixing via a patent ductus arteriosus (PDA) or atrial septal defect. Prostaglandin E1 (alprostadil) must be administered immediately to keep the ductus arteriosus open while preparing for cardiac catheterization or surgical arterial switch.",
            clinicalPearl = "In ductal-dependent congenital heart lesions (TGA, hypoplastic left heart, coarctation), administering Prostaglandin E1 maintains ductal patency and is lifesaving."
        ),
        ClinicalVignette(
            id = "usmle_im_03",
            specialty = MedicalSpecialty.INTERNAL_MEDICINE,
            title = "Shortness of Breath and Lower Extremity Edema",
            patientStem = "A 64-year-old woman with a history of long-standing hypertension and type 2 diabetes presents with a 3-week history of progressively worsening exertional dyspnea, orthopnea requiring 3 pillows, and bilateral ankle swelling.",
            vitalsAndExam = "BP: 154/92 mmHg, HR: 88/min, RR: 20/min. Physical exam reveals jugular venous distension to the angle of the jaw at 45 degrees, bibasilar lung crackles, and 2+ bilateral pitting edema to mid-shins. Transthoracic echocardiogram demonstrates left ventricular hypertrophy with a left ventricular ejection fraction (LVEF) of 34%. Laboratory studies show serum creatinine 1.1 mg/dL, potassium 4.2 mEq/L, and elevated NT-proBNP.",
            questionPrompt = "Which of the following guideline-directed medical therapy combinations confers proven long-term mortality benefit in this patient?",
            choices = listOf(
                "A. Loop diuretic (furosemide) and digoxin",
                "B. ARNI (sacubitril/valsartan), beta-blocker (carvedilol), MRA (spironolactone), and SGLT2 inhibitor (empagliflozin)",
                "C. Calcium channel blocker (amlodipine) and isosorbide mononitrate",
                "D. Aspirin, atorvastatin, and sublingual nitroglycerin PRN",
                "E. Metoprolol tartrate and hydrochlorothiazide"
            ),
            correctIndex = 1,
            explanation = "This patient has Heart Failure with Reduced Ejection Fraction (HFrEF, LVEF ≤40%). The four foundational pillars of Guideline-Directed Medical Therapy (GDMT) proven in landmark clinical trials to reduce all-cause mortality and heart failure hospitalizations are: (1) ARNI (sacubitril/valsartan) or ACEi/ARB, (2) Evidence-based beta-blocker (carvedilol, metoprolol succinate, or bisoprolol), (3) Mineralocorticoid Receptor Antagonist (spironolactone/eplerenone), and (4) SGLT2 inhibitor (dapagliflozin/empagliflozin). Furosemide provides symptom relief but no mortality benefit.",
            clinicalPearl = "HFrEF 4-Pillar GDMT: ARNI + Beta-blocker + MRA + SGLT2i all reduce mortality. Loop diuretics improve symptoms and volume status only."
        ),
        ClinicalVignette(
            id = "usmle_surg_04",
            specialty = MedicalSpecialty.GENERAL_SURGERY,
            title = "Right Lower Quadrant Abdominal Pain",
            patientStem = "A 22-year-old college student presents to the emergency department with a 14-hour history of abdominal pain that began as a dull periumbilical ache and has now localized sharply to the right lower quadrant. He reports nausea, two episodes of non-bilious emesis, and anorexia.",
            vitalsAndExam = "Temp: 38.2°C (100.8°F), HR: 104/min, BP: 118/76 mmHg. Abdominal exam reveals focal tenderness at McBurney's point with voluntary guarding, positive Rovsing sign (pain in RLQ upon left-sided palpation), and positive psoas sign. WBC is 14,800/μL with 82% neutrophils. Urine pregnancy test is negative.",
            questionPrompt = "Which of the following is the initial underlying pathophysiologic event responsible for this condition in adolescents and young adults?",
            choices = listOf(
                "A. Impaction of a calcified fecalith",
                "B. Lymphoid hyperplasia obstructing the appendiceal lumen",
                "C. Carcinoid tumor of the appendiceal tip",
                "D. Direct bacterial transmural translocation without obstruction",
                "E. Invagination of the ileum into the cecum"
            ),
            correctIndex = 1,
            explanation = "Acute appendicitis results from appendiceal lumen obstruction. In children and young adults, lymphoid hyperplasia (frequently triggered by recent viral infections) is the most common etiology of luminal obstruction (accounting for ~60% of cases). In older adults, obstruction is more commonly caused by a fecalith (calcified stool deposit), gallstone, or neoplasm (adenocarcinoma/carcinoid). Obstruction causes increased intraluminal pressure, ischemia, bacterial overgrowth, and inflammation.",
            clinicalPearl = "Appendicitis etiology: Lymphoid hyperplasia is #1 in young adults/children; Fecalith is #1 in older adults."
        )
    )
}
