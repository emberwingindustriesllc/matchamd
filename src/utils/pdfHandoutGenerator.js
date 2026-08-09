import { jsPDF } from 'jspdf';

/**
 * Generate and download a formatted PDF handout for an Interview Course lesson.
 * @param {object} lesson
 * @param {string} moduleTitle
 * @param {object} lessonDetail
 * @param {string} userNotes
 */
export function generateLessonHandoutPDF(lesson, moduleTitle = '', lessonDetail = {}, userNotes = '') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Primary MatchaMD Colors
  const primaryColor = [40, 75, 30]; // #284b1e - Deep Matcha
  const secondaryColor = [110, 135, 30]; // #6e871e - Logo Green
  const textColor = [30, 41, 59]; // #1e293b - Slate 800
  const lightBg = [248, 250, 252]; // #f8fafc

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 55, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MATCHA MD', margin, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('IMG Residency Interview Course • Study Handout', pageWidth - margin, 32, { align: 'right' });

  y = 75;

  // Module Category Tag
  if (moduleTitle) {
    doc.setFillColor(240, 245, 235);
    doc.roundedRect(margin, y, Math.min(contentWidth, 240), 22, 4, 4, 'F');
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(moduleTitle.toUpperCase(), margin + 10, y + 14);
    y += 32;
  }

  // Lesson Title
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleText = `Lesson ${lesson.id}: ${lesson.title}`;
  const splitTitle = doc.splitTextToSize(titleText, contentWidth);
  doc.text(splitTitle, margin, y);
  y += splitTitle.length * 22 + 5;

  // Duration & Summary
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Estimated Study Duration: ${lesson.duration}`, margin, y);
  y += 18;

  if (lesson.summary) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    const splitSummary = doc.splitTextToSize(`" ${lesson.summary} "`, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 14 + 15;
  }

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // Key Takeaways Section
  if (lessonDetail.takeaways && lessonDetail.takeaways.length > 0) {
    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Key Takeaways & High-Yield Insights', margin + 10, y + 16);
    y += 34;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    for (const item of lessonDetail.takeaways) {
      const splitItem = doc.splitTextToSize(`• ${item}`, contentWidth - 15);
      
      // Page break check
      if (y + splitItem.length * 14 > pageHeight - margin - 30) {
        doc.addPage();
        y = margin;
      }
      
      doc.text(splitItem, margin + 8, y);
      y += splitItem.length * 14 + 6;
    }
    y += 10;
  }

  // Detailed Breakdown Section
  if (lessonDetail.details) {
    if (y + 100 > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Faculty Advice & Detailed Strategy', margin + 10, y + 16);
    y += 34;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    const splitDetails = doc.splitTextToSize(lessonDetail.details, contentWidth);

    for (let i = 0; i < splitDetails.length; i++) {
      if (y + 14 > pageHeight - margin - 30) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitDetails[i], margin, y);
      y += 14;
    }
    y += 15;
  }

  // Practice Prompt & User Notes Section
  if (lessonDetail.practicePrompt || userNotes) {
    if (y + 120 > pageHeight - margin - 30) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(203, 213, 225);
    const promptHeight = 80 + (userNotes ? Math.min(100, Math.ceil(userNotes.length / 70) * 14) : 0);
    doc.roundedRect(margin, y, contentWidth, promptHeight, 6, 6, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('Practice Exercise & Personal Response Notes', margin + 12, y + 20);

    y += 34;

    if (lessonDetail.practicePrompt) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const splitPrompt = doc.splitTextToSize(lessonDetail.practicePrompt, contentWidth - 24);
      doc.text(splitPrompt, margin + 12, y);
      y += splitPrompt.length * 13 + 10;
    }

    if (userNotes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const splitUserNotes = doc.splitTextToSize(`My Notes: ${userNotes}`, contentWidth - 24);
      doc.text(splitUserNotes, margin + 12, y);
      y += splitUserNotes.length * 13 + 10;
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('[ Use this space to write down your practice answer before interviewing ]', margin + 12, y);
      y += 20;
    }
  }

  // Page Numbers & Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('MatchaMD • Essential Medical Residency Match Intelligence', margin, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  // Save PDF
  const filename = `MatchaMD_Lesson_${lesson.id}_${lesson.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}
