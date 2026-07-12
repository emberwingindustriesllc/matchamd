const fellowshipDomains = [
  { label: 'pulmonology', aliases: ['pulmonology', 'pulmonary disease', 'pulmonary'] },
  { label: 'rheumatology', aliases: ['rheumatology'] },
  { label: 'nephrology', aliases: ['nephrology'] },
  { label: 'infectious disease', aliases: ['infectious disease'] },
  { label: 'cardiology', aliases: ['cardiology', 'cardiovascular disease', 'electrophysiology', 'heart failure'] },
  { label: 'hematology-oncology', aliases: ['hematology', 'oncology', 'hematology-oncology', 'medical oncology'] },
  { label: 'bone marrow transplant', aliases: ['bone marrow', 'transplant'] },
  { label: 'nicu', aliases: ['nicu', 'neonatal'] },
  { label: 'picu', aliases: ['picu', 'pediatric critical care'] },
  { label: 'pediatric surgery', aliases: ['pediatric surgery', 'spine surgery'] },
  { label: 'pediatrics', aliases: ['pediatrics'] },
  { label: 'adult', aliases: ['adult'] },
];

export function getProgramFitDetails(profile = {}, program = {}) {
  const reasons = [];
  let score = 100;
  let visaIssue = false;
  let meetsAll = true;

  const userNeedsVisa = profile.visa_status === 'none' || profile.visa_status === 'J1' || profile.visa_status === 'H1B';
  if (userNeedsVisa) {
    const programSponsorsJ1 = Boolean(program.visa_j1);
    const programSponsorsH1B = Boolean(program.visa_h1b);
    if (!programSponsorsJ1 && !programSponsorsH1B) {
      score -= 40;
      reasons.push('Does not sponsor J-1 or H-1B visas');
      visaIssue = true;
      meetsAll = false;
    }
  }

  const userScore = profile.usmle_step2_score ? Number(profile.usmle_step2_score) : null;
  if (userScore) {
    if (program.step2_score_min && userScore < program.step2_score_min) {
      score -= 25;
      reasons.push(`Your Step 2 CK (${userScore}) is below program minimum (${program.step2_score_min})`);
      meetsAll = false;
    } else if (program.step2_score_avg && userScore < program.step2_score_avg) {
      score -= 10;
      reasons.push(`Your Step 2 CK (${userScore}) is below program average (${program.step2_score_avg})`);
    } else {
      reasons.push('Step 2 CK score matches/exceeds average');
    }
  } else {
    score -= 10;
    reasons.push('Step 2 CK score not provided in profile');
    meetsAll = false;
  }

  const userHasUSCE = Boolean(profile.us_clinical_experience);
  if (program.min_usce_months && program.min_usce_months > 0) {
    if (!userHasUSCE) {
      score -= 20;
      reasons.push(`Requires US Clinical Experience (${program.min_usce_months} months)`);
      meetsAll = false;
    } else {
      reasons.push('Meets US Clinical Experience preference');
    }
  }

  const currentYear = new Date().getFullYear();
  const userGradYear = profile.graduation_year ? Number(profile.graduation_year) : null;
  if (userGradYear && program.grad_year_cutoff) {
    const yearsSinceGrad = currentYear - userGradYear;
    if (yearsSinceGrad > program.grad_year_cutoff) {
      score -= 15;
      reasons.push(`Graduation cutoff is ${program.grad_year_cutoff} years (You: ${yearsSinceGrad} years)`);
      meetsAll = false;
    } else {
      reasons.push('Within graduation year cutoff');
    }
  }

  const fellowshipChoice = (profile.fellowship_type || profile.target_specialty || '').toLowerCase();
  const programText = [program.program_name, program.institution, program.specialty, program.subspecialty, program.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const matchedDomain = fellowshipDomains.find(domain => domain.aliases.some(alias => fellowshipChoice.includes(alias)));
  const programMatchesDomain = matchedDomain && matchedDomain.aliases.some(alias => programText.includes(alias));

  if (matchedDomain && programMatchesDomain) {
    score += 12;
    reasons.push('Strong fellowship match for your selected subspecialty');
  } else if (profile.primary_goal === 'fellowship' && fellowshipChoice) {
    score -= 8;
    reasons.push('No direct fellowship match signal from your selected subspecialty');
  }

  score = Math.max(10, score);

  return { score, reasons, meetsAll, visaIssue };
}
