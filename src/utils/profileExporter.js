/**
 * MatchaMD Profile Exporter Utility
 * Generates formatted print-ready CV summary, downloadable JSON, and clipboard text.
 */

export function generateProfileSummaryText(profile, user) {
  const name = profile?.display_name || user?.full_name || 'Medical Residency Applicant';
  const email = user?.email || 'N/A';
  const specialty = profile?.target_specialty || 'Not specified';
  const location = profile?.target_city 
    ? `${profile.target_city}, ${profile.target_state || ''}` 
    : (profile?.target_state || profile?.country || 'Not specified');
  const medSchool = profile?.medical_school 
    ? `${profile.medical_school} (${profile.medical_school_country || 'International'})`
    : 'Not specified';
  const wfmeStatus = profile?.wfme_certified === 'yes'
    ? 'Verified WFME / ECFMG Recognized'
    : profile?.wfme_certified === 'in_progress'
    ? 'In Progress'
    : profile?.wfme_certified === 'unsure'
    ? 'Needs Verification'
    : 'Unaccredited / Not Certified';
  const step1 = profile?.usmle_step1_score || profile?.usmle_step1_status || 'Not provided';
  const step2 = profile?.usmle_step2_score || profile?.usmle_step2_status || 'Not provided';
  const step3 = profile?.usmle_step3_result || profile?.usmle_step3_status || 'Not provided';
  const visa = profile?.visa_status === 'none' ? 'Needs Visa Sponsorship (J-1/H-1B)' : (profile?.visa_status || 'Not specified');
  const acgmeWaiver = profile?.acgme_waiver ? 'Yes' : 'No';
  const previousTraining = profile?.previous_training || 'None reported';
  const bio = profile?.bio || 'N/A';

  return `=====================================================
MATAMD RESIDENCY APPLICANT PROFILE SUMMARY
=====================================================
Candidate Name: ${name}
Email: ${email}
Target Specialty: ${specialty}
Target Location: ${location}

ACADEMIC BACKGROUND & ACCREDITATION
-----------------------------------------------------
Medical School: ${medSchool}
Graduation Year: ${profile?.graduation_year || 'Not specified'}
WFME / ECFMG Accreditation Status: ${wfmeStatus}
Undergraduate College: ${profile?.undergraduate_college || 'N/A'}

USMLE EXAMINATIONS & SCORES
-----------------------------------------------------
USMLE Step 1: ${step1}
USMLE Step 2 CK: ${step2}
USMLE Step 3: ${step3}
ECFMG Certified: ${profile?.ecfmg_certified ? 'Yes' : 'In Progress / Pending'}

VISA & ELIGIBILITY
-----------------------------------------------------
Visa Status: ${visa}
ACGME Waiver: ${acgmeWaiver}
Previous Clinical / Residency Training: ${previousTraining}

ABOUT & PERSONAL STATEMENT SUMMARY
-----------------------------------------------------
${bio}

=====================================================
Exported from MatchaMD (https://matchamd.com) on ${new Date().toLocaleDateString()}
`;
}

export function exportProfileAsJSON(profile, user) {
  const data = {
    exportDate: new Date().toISOString(),
    candidate: {
      name: profile?.display_name || user?.full_name || 'Dr. Applicant',
      email: user?.email,
      targetSpecialty: profile?.target_specialty,
      targetCity: profile?.target_city,
      targetState: profile?.target_state,
      country: profile?.country,
      medicalSchool: profile?.medical_school,
      medicalSchoolCountry: profile?.medical_school_country,
      undergraduateCollege: profile?.undergraduate_college,
      graduationYear: profile?.graduation_year,
      wfmeAccreditation: profile?.wfme_certified,
      ecfmgCertified: profile?.ecfmg_certified,
      usmleStep1: profile?.usmle_step1_score || profile?.usmle_step1_status,
      usmleStep2CK: profile?.usmle_step2_score || profile?.usmle_step2_status,
      usmleStep3: profile?.usmle_step3_result || profile?.usmle_step3_status,
      visaStatus: profile?.visa_status,
      acgmeWaiver: profile?.acgme_waiver,
      previousTraining: profile?.previous_training,
      bio: profile?.bio,
      points: profile?.points || 0,
      badges: profile?.badges || []
    }
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const sanitizedName = (profile?.display_name || 'applicant').toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadAnchor.setAttribute('download', `MatchaMD_Profile_${sanitizedName}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function printProfileCV(profile, user) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print/export your profile.');
    return;
  }

  const name = profile?.display_name || user?.full_name || 'Residency Candidate';
  const email = user?.email || '';
  const specialty = profile?.target_specialty || 'General Residency';
  const medSchool = profile?.medical_school || 'Medical School';
  const medSchoolCountry = profile?.medical_school_country || '';
  const gradYear = profile?.graduation_year || 'N/A';
  const step1 = profile?.usmle_step1_score || profile?.usmle_step1_status || 'Pass';
  const step2 = profile?.usmle_step2_score || 'N/A';
  const step3 = profile?.usmle_step3_result || profile?.usmle_step3_status || 'N/A';
  const visa = profile?.visa_status === 'none' ? 'Requires Sponsorship (J-1 / H-1B)' : (profile?.visa_status || 'N/A');
  const wfme = profile?.wfme_certified === 'yes' ? 'Verified WFME / ECFMG Accredited' : (profile?.wfme_certified || 'In Process');
  const bio = profile?.bio || 'Candidate profile on MatchaMD.';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MatchaMD Profile CV - ${name}</title>
        <style>
          @page { size: letter; margin: 0.8in; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 18px; }
          .name { font-size: 24px; font-weight: bold; color: #0f766e; margin: 0; }
          .subtitle { font-size: 14px; color: #475569; margin-top: 4px; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f766e; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; letter-spacing: 0.5px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .field-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .field-value { font-size: 13px; font-weight: 500; color: #0f172a; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${name}</div>
          <div class="subtitle">Target Specialty: <strong>${specialty}</strong> &bull; Email: ${email}</div>
        </div>

        <div class="section-title">Academic & Medical Education</div>
        <div class="grid">
          <div>
            <div class="field-label">Medical School</div>
            <div class="field-value">${medSchool} ${medSchoolCountry ? `(${medSchoolCountry})` : ''}</div>
          </div>
          <div>
            <div class="field-label">Graduation Year</div>
            <div class="field-value">${gradYear}</div>
          </div>
          <div>
            <div class="field-label">WFME / ECFMG Status</div>
            <div class="field-value"><span class="badge">${wfme}</span></div>
          </div>
          <div>
            <div class="field-label">Undergraduate College</div>
            <div class="field-value">${profile?.undergraduate_college || 'N/A'}</div>
          </div>
        </div>

        <div class="section-title">USMLE Examination Scores</div>
        <div class="grid">
          <div>
            <div class="field-label">USMLE Step 1</div>
            <div class="field-value">${step1}</div>
          </div>
          <div>
            <div class="field-label">USMLE Step 2 CK</div>
            <div class="field-value"><strong>${step2}</strong></div>
          </div>
          <div>
            <div class="field-label">USMLE Step 3</div>
            <div class="field-value">${step3}</div>
          </div>
          <div>
            <div class="field-label">ECFMG Certification</div>
            <div class="field-value">${profile?.ecfmg_certified ? 'Certified' : 'In Progress'}</div>
          </div>
        </div>

        <div class="section-title">Clinical Background & Visa Status</div>
        <div class="grid">
          <div>
            <div class="field-label">Visa Status</div>
            <div class="field-value">${visa}</div>
          </div>
          <div>
            <div class="field-label">ACGME Waiver</div>
            <div class="field-value">${profile?.acgme_waiver ? 'Yes' : 'No'}</div>
          </div>
          <div style="grid-column: span 2;">
            <div class="field-label">Previous Clinical / Postgraduate Training</div>
            <div class="field-value">${profile?.previous_training || 'None reported'}</div>
          </div>
        </div>

        <div class="section-title">Candidate Statement / Profile Bio</div>
        <div class="field-value" style="margin-top: 6px;">${bio}</div>

        <div class="footer">
          Generated via MatchaMD Residency Navigator &bull; Confidential Candidate Dossier
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}
