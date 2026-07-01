import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/navigation/Header';
import BottomNav from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock,
  ChevronRight,
  Brain,
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGate from '@/components/premium/PremiumGate';

const sampleQuestions = {
  step1_anatomy: [
    {
      id: 1,
      question: "A 45-year-old male presents with severe hoarseness after a total thyroidectomy. Laryngoscopy reveals a fixed vocal cord in the paramedian position. Which nerve was most likely injured during surgery?",
      options: [
        "Superior laryngeal nerve (internal branch)",
        "Superior laryngeal nerve (external branch)",
        "Recurrent laryngeal nerve",
        "Glossopharyngeal nerve"
      ],
      correct: 2,
      explanation: "The recurrent laryngeal nerve innervates all intrinsic muscles of the larynx except the cricothyroid muscle. Injury during thyroid surgery leads to vocal cord paralysis and hoarseness."
    },
    {
      id: 2,
      question: "A 28-year-old motorcyclist suffers a knee injury. Physical examination shows anterior displacement of the tibia relative to the femur when the knee is flexed at 90 degrees (positive anterior drawer test). Which structure is torn?",
      options: [
        "Posterior cruciate ligament (PCL)",
        "Anterior cruciate ligament (ACL)",
        "Medial collateral ligament (MCL)",
        "Lateral meniscus"
      ],
      correct: 1,
      explanation: "The anterior cruciate ligament (ACL) prevents anterior translation of the tibia on the femur. A positive anterior drawer or Lachman test confirms an ACL tear."
    },
    {
      id: 201,
      question: "A 55-year-old female presents with acute pain in her right upper quadrant after eating a fatty meal. Ultrasound shows gallstones. Which nerve fibers transmit the visceral pain associated with acute cholecystitis?",
      options: [
        "Vagus nerve (CN X) fibers",
        "Celiac plexus sympathetic afferents",
        "Right phrenic nerve somatic afferents",
        "Greater splanchnic nerve sympathetic afferents"
      ],
      correct: 3,
      explanation: "Visceral pain from the gallbladder and biliary tree is carried by sympathetic afferent fibers traveling via the greater splanchnic nerve to the celiac plexus."
    }
  ],
  step1_physiology: [
    {
      id: 3,
      question: "A 23-year-old male runs a marathon on a hot day. He becomes severely dehydrated. Which of the following physiological changes is most likely present in this patient?",
      options: [
        "Decreased plasma osmolarity",
        "Increased secretion of atrial natriuretic peptide (ANP)",
        "Increased sympathetic nerve activity to the kidneys",
        "Decreased urine osmolarity"
      ],
      correct: 2,
      explanation: "Severe dehydration causes a decrease in blood volume and pressure, stimulating baroreceptors and the renin-angiotensin-aldosterone system. This increases sympathetic nerve activity to the kidneys, prompting vasoconstriction and sodium/water retention."
    },
    {
      id: 301,
      question: "A 65-year-old male with a history of chronic obstructive pulmonary disease (COPD) has arterial blood gas values showing pH 7.35, PaCO2 50 mmHg, and HCO3- 27 mEq/L. What is the acid-base status?",
      options: [
        "Acute respiratory acidosis",
        "Compensated respiratory acidosis",
        "Metabolic acidosis",
        "Mixed metabolic and respiratory acidosis"
      ],
      correct: 1,
      explanation: "A PaCO2 of 50 mmHg suggests respiratory acidosis. Since the pH is in the normal range (compensated) and HCO3- is elevated to compensate, this indicates compensated respiratory acidosis."
    },
    {
      id: 302,
      question: "During skeletal muscle contraction, calcium ions bind to which of the following proteins to initiate cross-bridge cycling?",
      options: [
        "Tropomyosin",
        "Troponin C",
        "Actin",
        "Myosin light chain kinase"
      ],
      correct: 1,
      explanation: "Calcium ions bind to Troponin C, which causes a conformational change in tropomyosin, exposing the active myosin-binding sites on actin."
    }
  ],
  step1_pathology: [
    {
      id: 4,
      question: "A 60-year-old male smoker presents with cough and hemoptysis. Chest X-ray reveals a central lung mass. Biopsy shows nests of polygonal cells with keratin pearls and intercellular bridges. What is the most likely diagnosis?",
      options: [
        "Adenocarcinoma",
        "Squamous cell carcinoma",
        "Small cell carcinoma",
        "Large cell carcinoma"
      ],
      correct: 1,
      explanation: "Squamous cell carcinoma is centrally located, strongly associated with smoking, and histologically characterized by keratin pearls and intercellular bridges."
    },
    {
      id: 401,
      question: "A 9-month-old infant is brought to the pediatrician due to developmental regression and an exaggerated startle response to loud noises. Fundoscopic exam reveals a cherry-red spot on the macula. Which enzyme is deficient?",
      options: [
        "Hexosaminidase A",
        "Sphingomyelinase",
        "Galactocerebrosidase",
        "Glucocerebrosidase"
      ],
      correct: 0,
      explanation: "Tay-Sachs disease is caused by Hexosaminidase A deficiency, leading to GM2 ganglioside accumulation. It presents with developmental regression, startle response, and a cherry-red spot, without hepatosplenomegaly."
    },
    {
      id: 402,
      question: "A 35-year-old female presents with fatigue, cold intolerance, and weight gain. Physical exam reveals a diffuse, painless goiter. Biopsy shows dense lymphocytic infiltrate with germinal centers and Hurthle cells. Diagnosis?",
      options: [
        "Graves' disease",
        "Hashimoto's thyroiditis",
        "Subacute thyroiditis",
        "Riedel's thyroiditis"
      ],
      correct: 1,
      explanation: "Hashimoto's thyroiditis is the most common cause of hypothyroidism in the US. Biopsy features lymphocytic infiltration with germinal centers and Hurthle (oncocytic) cells."
    }
  ],
  step2_internal_medicine: [
    {
      id: 5,
      question: "A 68-year-old male with a history of hypertension presents to the emergency department with acute onset of severe, tearing chest pain radiating to his back. His blood pressure is 185/110 mmHg. What is the most appropriate next step in management?",
      options: [
        "Intravenous thrombolysis",
        "Emergent coronary angiography",
        "Intravenous beta-blocker therapy (e.g., esmolol)",
        "Aspirin and heparin administration"
      ],
      correct: 2,
      explanation: "The clinical presentation of tearing chest pain radiating to the back in a hypertensive male is highly suggestive of an acute aortic dissection. Initial medical management involves heart rate and blood pressure control using IV beta-blockers (like esmolol) to reduce shear stress on the aortic wall."
    },
    {
      id: 501,
      question: "A 55-year-old diabetic male presents with a painful, swollen left leg. On examination, the leg is erythematous, warm, and tender to touch with poorly demarcated borders. What is the most appropriate empiric antibiotic choice?",
      options: [
        "Ceftriaxone",
        "Cephalexin",
        "Cefazolin",
        "Piperacillin-tazobactam"
      ],
      correct: 2,
      explanation: "For non-purulent cellulitis, beta-hemolytic streptococci and MSSA are the primary targets. Intravenous Cefazolin (or oral Cephalexin) is the first-line therapy."
    },
    {
      id: 502,
      question: "A 42-year-old female presents with progressive fatigue, pruritus, and jaundice. Labs reveal elevated alkaline phosphatase and positive antimitochondrial antibodies (AMA). Diagnosis?",
      options: [
        "Primary biliary cholangitis",
        "Primary sclerosing cholangitis",
        "Autoimmune hepatitis",
        "Wilson's disease"
      ],
      correct: 0,
      explanation: "Primary Biliary Cholangitis (PBC) is characterized by autoimmune destruction of intrahepatic bile ducts. AMA is highly specific for PBC, which primarily affects middle-aged women."
    }
  ],
  step2_surgery: [
    {
      id: 6,
      question: "A 24-year-old female presents with acute right lower quadrant abdominal pain, nausea, and low-grade fever. On exam, she has rebound tenderness at McBurney's point. What is the most appropriate initial diagnostic imaging modality?",
      options: [
        "Abdominal X-ray",
        "Ultrasound of the abdomen/pelvis",
        "CT scan of the abdomen and pelvis",
        "Magnetic resonance imaging (MRI)"
      ],
      correct: 1,
      explanation: "In young female patients presenting with symptoms of acute appendicitis, pelvic ultrasound is the preferred initial imaging modality to rule out gynecological etiologies (such as ovarian cysts or ectopic pregnancy) and avoid ionizing radiation."
    },
    {
      id: 601,
      question: "A 50-year-old male is admitted with severe acute pancreatitis. On day 5 of admission, he develops acute shortness of breath. Chest X-ray reveals bilateral diffuse infiltrates, and PaO2/FiO2 ratio is < 200. What is the most likely diagnosis?",
      options: [
        "Pulmonary embolism",
        "Hospital-acquired pneumonia",
        "Acute respiratory distress syndrome (ARDS)",
        "Congestive heart failure"
      ],
      correct: 2,
      explanation: "Acute respiratory distress syndrome (ARDS) is a severe complication of acute pancreatitis. Pancreatic enzymes trigger systemic inflammation that damages the alveolar-capillary barrier."
    },
    {
      id: 602,
      question: "A 72-year-old male presents with abdominal distension, obstipation, and crampy pain. Abdominal plain film shows a massively dilated sigmoid colon with a 'coffee bean' appearance. Initial management?",
      options: [
        "Emergent sigmoid resection",
        "Flexible sigmoidoscopy for decompression",
        "Barium enema",
        "Intravenous neostigmine"
      ],
      correct: 1,
      explanation: "The 'coffee bean' sign indicates a sigmoid volvulus. In stable patients without signs of gangrene or perforation, the initial management of choice is flexible sigmoidoscopic decompression."
    }
  ],
  step2_pediatrics: [
    {
      id: 7,
      question: "A 4-year-old boy is brought to the clinic due to a 3-day history of high fever, barking cough, and inspiratory stridor. X-ray of the neck shows subglottic narrowing (steeple sign). What is the most likely causative organism?",
      options: [
        "Respiratory syncytial virus (RSV)",
        "Parainfluenza virus",
        "Haemophilus influenzae type b",
        "Corynebacterium diphtheriae"
      ],
      correct: 1,
      explanation: "Laryngotracheobronchitis (croup) is characterized by a barking cough, inspiratory stridor, and the subglottic 'steeple sign' on neck X-ray. It is most commonly caused by the Parainfluenza virus."
    },
    {
      id: 701,
      question: "A 6-year-old girl presents with a 2-day history of low-grade fever, joint pain, and a rash. On exam, she has palpable purpura on her lower extremities, abdominal tenderness, and microscopic hematuria. Diagnosis?",
      options: [
        "Henoch-Schönlein purpura (IgA vasculitis)",
        "Kawasaki disease",
        "Idiopathic thrombocytopenic purpura",
        "Post-streptococcal glomerulonephritis"
      ],
      correct: 0,
      explanation: "Henoch-Schönlein purpura is an IgA-mediated vasculitis characterized by the tetrad of palpable purpura, arthralgias, abdominal pain, and renal involvement (glomerulonephritis)."
    },
    {
      id: 702,
      question: "A 12-hour-old newborn is noted to be visibly jaundiced. Mother's blood type is O positive, and the baby is A positive with a positive direct Coombs test. What is the mechanism of this jaundice?",
      options: [
        "Biliary atresia",
        "Breast milk jaundice",
        "Immune-mediated hemolysis",
        "Physiological jaundice"
      ],
      correct: 2,
      explanation: "ABO incompatibility (maternal O, infant A/B) causes immune-mediated hemolysis leading to hyperbilirubinemia. It presents in the first 24 hours of life with a positive Coombs test."
    }
  ],
  step2_obgyn: [
    {
      id: 8,
      question: "A 32-year-old pregnant woman at 34 weeks gestation presents with sudden-onset painless vaginal bleeding. Ultrasound reveals the placenta is completely covering the internal cervical os. What is the most appropriate route of delivery?",
      options: [
        "Vaginal delivery",
        "Induction of labor",
        "Cesarean delivery",
        "Vacuum-assisted delivery"
      ],
      correct: 2,
      explanation: "A placenta covering the cervical os is placenta previa. Painless vaginal bleeding in the third trimester is a hallmark. To prevent catastrophic maternal/fetal hemorrhage during labor, delivery must be via Cesarean section."
    },
    {
      id: 801,
      question: "A 26-year-old female presents with severe pelvic pain and vaginal bleeding. Her last menstrual period was 7 weeks ago. Beta-hCG is 2,500 mIU/mL. Transvaginal ultrasound shows an empty uterus and a 3 cm adnexal mass. Next step?",
      options: [
        "Laparoscopic salpingectomy",
        "Intramuscular methotrexate",
        "Expectant management",
        "Repeat ultrasound in 48 hours"
      ],
      correct: 1,
      explanation: "In a hemodynamically stable patient with an ectopic pregnancy (hCG < 5,000, mass < 4 cm, no fetal heart rate), medical management with intramuscular Methotrexate is indicated."
    },
    {
      id: 802,
      question: "A 28-year-old G1P0 at 38 weeks gestation is in active labor. She is 6 cm dilated. Over the next 5 hours, there is no cervical change despite strong, regular uterine contractions every 2-3 minutes. Diagnosis?",
      options: [
        "Protracted active phase",
        "Active phase arrest",
        "Normal latent phase",
        "Secondary arrest of dilation"
      ],
      correct: 1,
      explanation: "Active phase arrest is defined as no cervical progression for 4 hours or more in the setting of adequate contractions (or 6 hours of inadequate contractions) during the active phase."
    }
  ],
  step2_psychiatry: [
    {
      id: 9,
      question: "A 19-year-old college student is brought to the clinic by his roommate. The roommate reports that the patient has been hearing voices whispering to him for the past 7 months, has become socially isolated, and believes the government is tracking him through his computer. What is the most likely diagnosis?",
      options: [
        "Schizophreniform disorder",
        "Schizophrenia",
        "Brief psychotic disorder",
        "Delusional disorder"
      ],
      correct: 1,
      explanation: "Schizophrenia is diagnosed when a patient has active-phase psychotic symptoms (like hallucinations and delusions) along with social/occupational dysfunction persisting for a duration of at least 6 months."
    },
    {
      id: 901,
      question: "A 28-year-old female presents with a 3-week history of depressed mood, insomnia, weight loss, and feelings of worthlessness. She reports she has had no energy to work. What is the minimum duration of symptoms required to diagnose major depressive disorder?",
      options: [
        "1 week",
        "2 weeks",
        "1 month",
        "2 months"
      ],
      correct: 1,
      explanation: "Major Depressive Disorder (MDD) requires a patient to experience 5 or more depressive symptoms (including depressed mood or anhedonia) for a minimum duration of 2 consecutive weeks."
    },
    {
      id: 902,
      question: "A 34-year-old male with bipolar I disorder is brought to the clinic for a routine visit. He has been taking lithium for 3 years. Which of the following laboratory values should be monitored regularly in this patient?",
      options: [
        "Liver function tests",
        "Serum creatinine and thyroid-stimulating hormone (TSH)",
        "Serum amylase",
        "Complete blood count"
      ],
      correct: 1,
      explanation: "Lithium has a narrow therapeutic index and long-term renal and thyroid toxicities. Serum creatinine and TSH must be monitored periodically."
    }
  ],
  default: [
    {
      id: 101,
      question: "A 55-year-old woman presents with classic crushing chest pressure radiating to her left jaw. ECG shows ST-elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
      options: [
        "Left anterior descending artery (LAD)",
        "Right coronary artery (RCA)",
        "Left circumflex artery (LCx)",
        "Left main coronary artery"
      ],
      correct: 1,
      explanation: "Inferior wall myocardial infarction (ST elevation in II, III, aVF) is most commonly caused by occlusion of the Right Coronary Artery (RCA)."
    }
  ]
};


// Templates for the 40-question Specialty generator
const categoryTemplates = {
  step1_anatomy: [
    {
      question: "A {age}-year-old {gender} is involved in a motor vehicle accident and suffers a humerus fracture. Physical exam reveals inability to extend the wrist (wrist drop). Which nerve is injured?",
      options: ["Ulnar nerve", "Median nerve", "Radial nerve", "Axillary nerve"],
      correct: 2,
      explanation: "The radial nerve runs in the spiral groove of the humerus. Midshaft humerus fractures frequently damage this nerve, leading to wrist drop (loss of wrist extension) and sensory loss on the dorsal hand."
    },
    {
      question: "A {age}-year-old {gender} presents with progressive numbness in the lateral 3 and a half digits of {possessive} hand. Tapping on the volar aspect of the wrist reproduces the symptoms. Which nerve is compressed?",
      options: ["Ulnar nerve", "Median nerve", "Radial nerve", "Musculocutaneous nerve"],
      correct: 1,
      explanation: "Carpal tunnel syndrome involves compression of the median nerve as it passes under the flexor retinaculum, causing paresthesias in the thumb, index, middle, and radial side of the ring fingers."
    }
  ],
  step1_physiology: [
    {
      question: "A {age}-year-old {gender} is found to have a plasma aldosterone concentration of 40 ng/dL (elevated). Which of the following renal physiological changes is expected in this patient?",
      options: [
        "Decreased potassium excretion",
        "Increased sodium reabsorption in the collecting duct",
        "Decreased bicarbonate reabsorption",
        "Increased renin secretion"
      ],
      correct: 1,
      explanation: "Aldosterone acts on the principal cells of the collecting duct to increase sodium reabsorption and potassium secretion, leading to expansion of extracellular fluid volume and hypertension."
    },
    {
      question: "A {age}-year-old {gender} is breathing 100% oxygen. Which of the following vascular changes will occur in the pulmonary vasculature?",
      options: ["Vasodilation", "Vasoconstriction", "No change", "Shunting of blood to lower-perfused zones"],
      correct: 0,
      explanation: "Pulmonary vessels dilate in response to high alveolar oxygen tension (reducing pulmonary vascular resistance), in contrast to systemic vessels which constrict."
    }
  ],
  step1_pathology: [
    {
      question: "A {age}-year-old {gender} presents with progressive muscle weakness and dark urine. Serum creatine kinase is markedly elevated. Biopsy reveals muscle fiber necrosis. What is the most likely diagnosis?",
      options: ["Rhabdomyolysis", "Polymyositis", "Duchenne muscular dystrophy", "Myasthenia gravis"],
      correct: 0,
      explanation: "Markedly elevated CK and myoglobinuria (dark urine) point to rhabdomyolysis. It can be triggered by extreme exercise, trauma, or drugs."
    },
    {
      question: "A {age}-year-old {gender} is diagnosed with a genetic disease. Genetic analysis reveals a mutation causing defective fibrillin-1. Which of the following cardiovascular complications is this patient at highest risk of developing?",
      options: ["Mitral stenosis", "Aortic aneurysm or dissection", "Coarctation of the aorta", "Coronary artery disease"],
      correct: 1,
      explanation: "Marfan syndrome is caused by an autosomal dominant mutation in the FBN1 gene encoding fibrillin-1, predisposing patients to cystic medial necrosis and aortic root dilation or dissection."
    }
  ],
  step2_internal_medicine: [
    {
      question: "A {age}-year-old {gender} with a history of heart failure presents with worsening shortness of breath and pedal edema. What is the most appropriate initial intravenous medication to administer?",
      options: ["Furosemide", "Metoprolol", "Lisinopril", "Amlodipine"],
      correct: 0,
      explanation: "Intravenous loop diuretics (like furosemide) are the mainstay of initial therapy for acute decompensated heart failure to reduce volume overload."
    },
    {
      question: "A {age}-year-old {gender} presents with joint pain, dry eyes, and dry mouth. Laboratory testing is positive for anti-SSA (Ro) and anti-SSB (La) antibodies. What is the most likely diagnosis?",
      options: ["Systemic lupus erythematosus", "Rheumatoid arthritis", "Sjögren syndrome", "Systemic sclerosis"],
      correct: 2,
      explanation: "Sjögren syndrome is an autoimmune disease targeting exocrine glands, presenting with dry eyes (keratoconjunctivitis sicca) and dry mouth (xerostomia), associated with anti-SSA and anti-SSB antibodies."
    }
  ],
  step2_surgery: [
    {
      question: "A {age}-year-old {gender} presents to the emergency department with abdominal pain, distension, and high-pitched bowel sounds. Abdominal X-ray shows dilated loops of small bowel with air-fluid levels. What is the most likely etiology?",
      options: ["Adhesions from prior surgery", "Hernia", "Volvulus", "Colon cancer"],
      correct: 0,
      explanation: "Small bowel obstruction is most commonly caused by post-surgical adhesions, followed by hernias."
    },
    {
      question: "A {age}-year-old {gender} is brought to the trauma bay after a motorcycle crash. {pronoun} is hypotensive and tachycardic. Trachea is deviated to the left, and breath sounds are absent on the right. Next step?",
      options: ["Obtain chest CT", "Perform needle decompression of the right chest", "Perform endotracheal intubation", "Obtain urgent chest X-ray"],
      correct: 1,
      explanation: "Tension pneumothorax is a clinical diagnosis requiring immediate needle decompression (followed by chest tube insertion) to restore venous return and cardiac output."
    }
  ],
  step2_pediatrics: [
    {
      question: "A {age}-week-old infant is brought in due to projectile, non-bilious vomiting after feeding. On exam, a small, olive-shaped mass is felt in the epigastrium. What is the diagnostic test of choice?",
      options: ["Abdominal ultrasound", "Barium swallow", "Upper endoscopy", "Abdominal X-ray"],
      correct: 0,
      explanation: "Pyloric stenosis is diagnosed via abdominal ultrasound, showing thickening and elongation of the pyloric muscle."
    },
    {
      question: "A {age}-year-old boy presents with a 2-day history of intermittent severe abdominal pain. During pain episodes, he draws his knees to his chest. Ultrasound shows a target sign in the right upper quadrant. What is the first-line treatment?",
      options: ["Surgical resection", "Air or contrast enema", "Intravenous antibiotics", "Observation"],
      correct: 1,
      explanation: "Intussusception is diagnosed and treated initially with an air or pneumatic/contrast enema under fluoroscopic/ultrasonographic guidance."
    }
  ],
  step2_obgyn: [
    {
      question: "A {age}-year-old G1P0 at 36 weeks gestation presents with a blood pressure of 165/105 mmHg and severe headache. Urinalysis shows 3+ protein. What is the most appropriate management to prevent seizures?",
      options: ["Intravenous magnesium sulfate", "Oral labetalol", "Intravenous hydralazine", "Phenytoin"],
      correct: 0,
      explanation: "Intravenous magnesium sulfate is the first-line agent for seizure prophylaxis in patients with preeclampsia with severe features."
    },
    {
      question: "A {age}-year-old female presents with acute-onset severe unilateral pelvic pain and nausea. Ultrasound shows an enlarged ovary with decreased blood flow. What is the most likely diagnosis?",
      options: ["Ruptured ovarian cyst", "Ectopic pregnancy", "Ovarian torsion", "Endometriosis"],
      correct: 2,
      explanation: "Ovarian torsion is caused by partial or complete rotation of the ovary on its ligamentous supports, causing ischemia. Urgent laparoscopy is required."
    }
  ],
  step2_psychiatry: [
    {
      question: "A {age}-year-old {gender} is brought to the clinic because of sudden episodes of intense fear, sweating, palpitations, and shortness of breath. The episodes occur randomly. What is the first-line long-term pharmacotherapy?",
      options: ["Alprazolam", "Sertraline (SSRI)", "Propranolol", "Buspirone"],
      correct: 1,
      explanation: "Panic disorder is treated long-term with selective serotonin reuptake inhibitors (SSRIs like sertraline) combined with cognitive behavioral therapy."
    },
    {
      question: "A {age}-year-old {gender} is evaluated for a 1-year history of checking the stove 15 times before leaving the house, which causes severe distress and makes {objective} late for work. First-line therapy?",
      options: ["Exposure and response prevention (CBT)", "Atypical antipsychotics", "Diazepam", "Electroconvulsive therapy"],
      correct: 0,
      explanation: "Obsessive-compulsive disorder is treated with cognitive behavioral therapy focusing on exposure and response prevention, along with SSRIs."
    }
  ],
  default: [
    {
      question: "A {age}-year-old G1P0 at 28 weeks gestation presents with gestational diabetes. What is the primary fetal complication associated with uncontrolled maternal hyperglycemia?",
      options: ["Fetal macrosomia", "Intrauterine growth restriction", "Congenital heart blocks", "Microcephaly"],
      correct: 0,
      explanation: "Maternal hyperglycemia leads to fetal hyperglycemia and hyperinsulinemia. Since insulin is an anabolic growth factor, this results in fetal macrosomia."
    }
  ]
};

// Generates 40 questions deterministically per category
const generateCategoryQuestions = (categoryId, baseQuestions) => {
  const generated = [...baseQuestions];
  const templates = categoryTemplates[categoryId] || categoryTemplates.default;
  
  // Fill the list up to 40 questions
  for (let i = baseQuestions.length; generated.length < 40; i++) {
    const template = templates[i % templates.length];
    
    // Deterministic parameters based on index
    const ages = [28, 35, 42, 54, 61, 72];
    const age = ages[i % ages.length];
    const gender = (i % 2 === 0) ? 'male' : 'female';
    const pronoun = gender === 'male' ? 'He' : 'She';
    const possessive = gender === 'male' ? 'his' : 'her';
    const objective = gender === 'male' ? 'him' : 'her';
    
    const questionText = template.question
      .replaceAll('{age}', age.toString())
      .replaceAll('{gender}', gender)
      .replaceAll('{pronoun}', pronoun)
      .replaceAll('{possessive}', possessive)
      .replaceAll('{objective}', objective);
      
    generated.push({
      id: 1000 + i + (categoryId.charCodeAt(3) * 7),
      question: `[Practice Q] ${questionText}`,
      options: template.options,
      correct: template.correct,
      explanation: template.explanation
    });
  }
  
  return generated;
};

const quizCategories = [
  {
    id: 'step1_anatomy',
    title: 'Step 1: Anatomy',
    questions: 75,
    difficulty: 'Medium',
    timeEstimate: '90 min'
  },
  {
    id: 'step1_physiology',
    title: 'Step 1: Physiology',
    questions: 100,
    difficulty: 'Hard',
    timeEstimate: '120 min'
  },
  {
    id: 'step1_pathology',
    title: 'Step 1: Pathology',
    questions: 125,
    difficulty: 'Hard',
    timeEstimate: '150 min'
  },
  {
    id: 'step2_internal_medicine',
    title: 'Step 2 CK: Internal Medicine',
    questions: 150,
    difficulty: 'Hard',
    timeEstimate: '180 min'
  },
  {
    id: 'step2_surgery',
    title: 'Step 2 CK: Surgery',
    questions: 100,
    difficulty: 'Medium',
    timeEstimate: '120 min'
  },
  {
    id: 'step2_pediatrics',
    title: 'Step 2 CK: Pediatrics',
    questions: 80,
    difficulty: 'Medium',
    timeEstimate: '100 min'
  },
  {
    id: 'step2_obgyn',
    title: 'Step 2 CK: OB/GYN',
    questions: 60,
    difficulty: 'Medium',
    timeEstimate: '75 min'
  },
  {
    id: 'step2_psychiatry',
    title: 'Step 2 CK: Psychiatry',
    questions: 50,
    difficulty: 'Easy',
    timeEstimate: '60 min'
  }
];

export default function USMLEQuizPack() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const { user } = useAuth();

  // Load user's purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      let dbPurchases = [];
      if (user?.id) {
        try {
          const { data } = await supabase.from('purchased_content').select('*').eq('user_id', user?.id);
          if (data) dbPurchases = data;
        } catch (e) {
          console.warn('Failed to fetch from DB', e);
        }
      }
      let localPurchases = [];
      try {
        localPurchases = JSON.parse(localStorage.getItem('matchamd_purchased_content') || '[]');
      } catch (e) {}
      return [...dbPurchases, ...localPurchases];
    }
  });

  // Query category progress statistics
  const { data: progressList = [], refetch: refetchProgress } = useQuery({
    queryKey: ['quiz_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const { data, error } = await supabase
          .from('quiz_progress')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn('Could not load quiz progress from DB', err);
        return [];
      }
    },
    enabled: !!user?.id
  });

  const hasPurchased = purchases.some(p => p.content_id === 'quiz_usmle');

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  const startQuiz = (category) => {
    setActiveCategory(category);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
  };

  // Sync completed quiz score to DB
  const handleFinishQuiz = async () => {
    if (user?.id && activeCategory) {
      try {
        const correctAnswers = score;
        const totalQs = activeQuestions.length;
        const existing = progressList.find(p => p.category_id === activeCategory.id);
        
        if (existing) {
          await supabase
            .from('quiz_progress')
            .update({
              questions_answered: existing.questions_answered + totalQs,
              questions_correct: existing.questions_correct + correctAnswers,
              last_updated: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('quiz_progress')
            .insert({
              user_id: user.id,
              category_id: activeCategory.id,
              questions_answered: totalQs,
              questions_correct: correctAnswers
            });
        }
        refetchProgress();
      } catch (err) {
        console.error('Error saving quiz progress:', err);
      }
    }
    setActiveCategory(null);
  };

  if (!hasPurchased) {
    return (
      <PremiumGate
        title="USMLE Quiz Pack"
        description="Access 500+ high-yield USMLE practice questions for Step 1 & 2 CK"
        price={4.99}
        features={[
          'Detailed explanations for every question',
          'Track your performance by category',
          'Timed practice mode',
          'Bookmark difficult questions',
          'Based on real exam patterns'
        ]}
        contentId="quiz_usmle"
      />
    );
  }

  // Generate 40 questions dynamically based on the specialty category
  const activeQuestions = activeCategory 
    ? generateCategoryQuestions(activeCategory.id, sampleQuestions[activeCategory.id] || sampleQuestions.default)
    : [];

  const currentQ = activeQuestions[currentQIndex];

  // Helper stats aggregates
  const totalAnswered = progressList.reduce((acc, curr) => acc + curr.questions_answered, 0);
  const totalCorrect = progressList.reduce((acc, curr) => acc + curr.questions_correct, 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pb-24">
      <Header title="USMLE Quiz Pack" showBack />

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Progress & Strengths Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    Strengths & Weaknesses
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Specialty progress is tracked in real-time
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAnswered}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total Answered</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallAccuracy}%</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Overall Accuracy</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {progressList.filter(p => p.questions_answered > 0).length} / 8
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Specialties Started</p>
                </div>
              </div>

              {/* Strengths List */}
              {progressList.length > 0 && (
                <div className="space-y-2 text-left">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {progressList.map((prog) => {
                      const catName = quizCategories.find(c => c.id === prog.category_id)?.title || prog.category_id;
                      const accuracy = prog.questions_answered > 0 ? Math.round((prog.questions_correct / prog.questions_answered) * 100) : 0;
                      let badgeColor = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
                      let badgeText = "Needs Focus";
                      if (accuracy >= 80) {
                        badgeColor = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                        badgeText = "Strength";
                      } else if (accuracy >= 60) {
                        badgeColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
                        badgeText = "Proficient";
                      }
                      
                      return (
                        <div key={prog.category_id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/40 dark:bg-slate-800/40">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{catName.replace('Step 1: ', '').replace('Step 2 CK: ', '')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">{accuracy}%</span>
                            <Badge className={`${badgeColor} text-[10px] px-1.5 py-0.5`}>{badgeText}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Categories */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Practice by Category (40 Qs each)</h3>
          
          {quizCategories.map((category, idx) => {
            const progress = progressList.find(p => p.category_id === category.id);
            const accuracy = progress && progress.questions_answered > 0 
              ? Math.round((progress.questions_correct / progress.questions_answered) * 100)
              : 0;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  onClick={() => startQuiz(category)}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {category.title}
                          </h4>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            40 questions block
                          </Badge>
                          <Badge className={difficultyColors[category.difficulty]}>
                            {category.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {category.timeEstimate}
                          </Badge>
                          {progress && (
                            <Badge variant="outline" className="bg-indigo-50/50 text-indigo-600 border-indigo-200">
                              Accuracy: {accuracy}%
                            </Badge>
                          )}
                        </div>

                        <Progress value={accuracy} className="h-2" />
                      </div>

                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        Start Quiz
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeCategory && currentQ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative border border-slate-200 dark:border-slate-800"
            >
              <button
                onClick={() => setActiveCategory(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200">
                  {activeCategory.title}
                </Badge>
                <span className="text-xs text-slate-500">Question {currentQIndex + 1} of {activeQuestions.length}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                {currentQ.question}
              </h3>

              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, oIdx) => {
                  let btnStyle = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700";
                  if (isSubmitted) {
                    if (oIdx === currentQ.correct) {
                      btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold";
                    } else if (selectedOption === oIdx) {
                      btnStyle = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300";
                    }
                  } else if (selectedOption === oIdx) {
                    btnStyle = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 font-semibold";
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(oIdx)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${btnStyle}`}
                    >
                      <span className="text-sm">{opt}</span>
                      {isSubmitted && oIdx === currentQ.correct && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                      {isSubmitted && selectedOption === oIdx && oIdx !== currentQ.correct && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 mb-6"
                >
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">Explanation:</h4>
                  <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}

              <div className="flex justify-end gap-3">
                {!isSubmitted ? (
                  <Button
                    disabled={selectedOption === null}
                    onClick={() => {
                      setIsSubmitted(true);
                      if (selectedOption === currentQ.correct) {
                        setScore(s => s + 1);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  currentQIndex < activeQuestions.length - 1 ? (
                    <Button
                      onClick={() => {
                        setCurrentQIndex(i => i + 1);
                        setSelectedOption(null);
                        setIsSubmitted(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinishQuiz}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Finish Quiz
                    </Button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}