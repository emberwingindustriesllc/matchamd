/**
 * Export array of residency/fellowship/observership programs to a downloadable CSV file.
 * @param {Array} programs
 * @param {string} filename
 */
export function exportProgramsToCSV(programs = [], filename = 'MatchaMD_Residency_Programs.csv') {
  if (!programs || programs.length === 0) {
    return false;
  }

  const headers = [
    'Program Name',
    'Specialty',
    'Type',
    'City',
    'State',
    'ACGME Accredited',
    'IMG Friendly',
    'J1 Visa',
    'H1B Visa',
    'Min Step 2 Score',
    'YOG Cutoff (Years)',
    'Community Notes',
    'Website / Info Link'
  ];

  const rows = programs.map((p) => {
    const specialtyText = Array.isArray(p.specialty) 
      ? p.specialty.join('; ') 
      : p.specialty || '';
      
    return [
      p.name || p.program_name || '',
      specialtyText,
      p.program_type || p.type || 'residency',
      p.city || '',
      p.state || '',
      p.is_acgme_accredited || p.acgme_accredited ? 'Yes' : 'No',
      p.img_friendly || p.is_img_friendly ? 'Yes' : 'No',
      p.sponsors_j1 ? 'Yes' : 'No',
      p.sponsors_h1b ? 'Yes' : 'No',
      p.min_step2_score || p.step2_cutoff || 'N/A',
      p.yog_cutoff_years || p.max_yog || 'N/A',
      p.notes_count || p.community_notes_count || 0,
      p.website_url || p.link || ''
    ];
  });

  const escapeCSV = (field) => {
    const stringified = String(field ?? '');
    if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
