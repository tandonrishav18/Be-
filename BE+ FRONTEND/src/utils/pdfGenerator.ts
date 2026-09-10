import { jsPDF } from 'jspdf';
import { BloodGroupReport } from '../types';
import { StorageService } from '../services/storage';

interface PatientOverride {
  name?: string;
  age?: string | number;
  gender?: string;
}

/**
 * Generates and downloads the official PDF matching the exact report modal specification:
 * - Heading: BE⁺ BLOOD GROUP DETECTION USING FINGERPRINTS
 * - Box 1: Report ID, Name, Age, Gender, Date
 * - Box 2: DETECTED BLOOD PHENOTYPE & Blood Group (e.g., AB-)
 * - Box 3: Transfusion Compatibility (Can Donate Red Cells To & Can Receive From)
 */
export function generateBloodGroupReportPdf(
  report: BloodGroupReport,
  patientOverride?: PatientOverride
): void {
  const patientName = (patientOverride?.name || report.patientName || 'PATIENT RECORD').toUpperCase();
  const patientAge = patientOverride?.age || report.patientAge || '';
  const patientGender = patientOverride?.gender || report.patientGender || '';
  const reportId = StorageService.formatReportId5(report);
  const bloodGroup = report.predictedGroup || 'AB-';
  const dateStr = report.timestamp 
    ? new Date(report.timestamp).toLocaleDateString() 
    : new Date().toLocaleDateString();

  const canDonateText = (report.canDonateTo && report.canDonateTo.length > 0 
    ? report.canDonateTo 
    : ['AB+', 'AB-']).join(', ');

  const canReceiveText = (report.canReceiveFrom && report.canReceiveFrom.length > 0 
    ? report.canReceiveFrom 
    : ['AB-', 'A-', 'B-', 'O-']).join(', ');

  // Create A4 PDF in portrait orientation
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  // Use card width matching modal aspect ratio, centered on page
  const cardWidth = 148;
  const startX = (pageWidth - cardWidth) / 2; // ~31mm margin on each side
  let y = 28;

  // -------------------------------------------------------------
  // TOP HEADING: BE⁺ BLOOD GROUP DETECTION USING FINGERPRINTS
  // -------------------------------------------------------------
  doc.setFont('times', 'bold');
  const beFontSize = 15;
  doc.setFontSize(beFontSize);
  const wBe = doc.getTextWidth('BE');

  doc.setFontSize(11);
  const wPlus = doc.getTextWidth('+');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const restTitle = ' BLOOD GROUP DETECTION USING FINGERPRINTS';
  const wRest = doc.getTextWidth(restTitle);

  const totalTitleWidth = wBe + wPlus + wRest;
  let titleX = (pageWidth - totalTitleWidth) / 2;

  // Draw "BE"
  doc.setFont('times', 'bold');
  doc.setFontSize(beFontSize);
  doc.setTextColor(128, 21, 0); // #801500 Crimson brand
  doc.text('BE', titleX, y);
  titleX += wBe;

  // Draw superscript "+"
  doc.setFontSize(11);
  doc.text('+', titleX, y - 2.8);
  titleX += wPlus;

  // Draw " BLOOD GROUP DETECTION USING FINGERPRINTS"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(32, 26, 25); // #201A19 Dark neutral
  doc.text(restTitle, titleX, y);

  y += 14;

  // -------------------------------------------------------------
  // BOX 1: PATIENT INFORMATION
  // Report ID, Name, Age, Gender, Date
  // -------------------------------------------------------------
  const box1Height = 48;
  doc.setFillColor(250, 242, 240); // #FAF2F0
  doc.setDrawColor(233, 225, 223); // #E9E1DF
  doc.setLineWidth(0.4);
  doc.roundedRect(startX, y, cardWidth, box1Height, 4.5, 4.5, 'FD');

  const labelLeftX = startX + 7;
  const valueRightX = startX + cardWidth - 7;
  let rowY = y + 8;
  const rowSpacing = 7.5;

  const rows = [
    { label: 'Report ID:', value: reportId },
    { label: 'Name:', value: patientName },
    { label: 'Age:', value: `${patientAge} Yrs` },
    { label: 'Gender:', value: patientGender },
    { label: 'Date:', value: dateStr }
  ];

  rows.forEach((row) => {
    // Label on left
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(82, 68, 64); // #524440
    doc.text(row.label, labelLeftX, rowY);

    // Value on right in bold
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(32, 26, 25); // #201A19
    doc.text(row.value, valueRightX, rowY, { align: 'right' });

    rowY += rowSpacing;
  });

  y += box1Height + 8;

  // -------------------------------------------------------------
  // BOX 2: DETECTED BLOOD PHENOTYPE
  // Centered Title & Large Serif Blood Group Value (e.g., AB-)
  // -------------------------------------------------------------
  const box2Height = 48;
  doc.setFillColor(255, 248, 246); // #FFF8F6
  doc.setDrawColor(205, 140, 130); // Subtle reddish border #801500/25
  doc.setLineWidth(0.4);
  doc.roundedRect(startX, y, cardWidth, box2Height, 5, 5, 'FD');

  // Subheading: DETECTED BLOOD PHENOTYPE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(128, 21, 0); // #801500
  doc.text('DETECTED BLOOD PHENOTYPE', pageWidth / 2, y + 10, { align: 'center' });

  // Large Blood Group
  doc.setFont('times', 'bold');
  doc.setFontSize(50);
  doc.setTextColor(26, 26, 26); // #1A1A1A
  doc.text(bloodGroup, pageWidth / 2, y + 34, { align: 'center' });

  y += box2Height + 8;

  // -------------------------------------------------------------
  // BOX 3: TRANSFUSION COMPATIBILITY
  // Can Donate Red Cells To & Can Receive From with rounded pills
  // -------------------------------------------------------------
  const box3Height = 44;
  doc.setFillColor(250, 242, 240); // #FAF2F0
  doc.setDrawColor(233, 225, 223); // #E9E1DF
  doc.setLineWidth(0.4);
  doc.roundedRect(startX, y, cardWidth, box3Height, 4.5, 4.5, 'FD');

  const contentPadX = startX + 7;
  let compY = y + 7.5;

  // Section 1: Can Donate Red Cells To
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(32, 26, 25);
  doc.text('Can Donate Red Cells To:', contentPadX, compY);

  compY += 3;
  // Pill for Can Donate
  doc.setFont('helvetica', 'medium');
  doc.setFontSize(9);
  const donatePillTextWidth = doc.getTextWidth(canDonateText);
  const donatePillWidth = Math.max(donatePillTextWidth + 8, 26);
  const pillHeight = 6;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 195, 190); // #D4C3BE
  doc.setLineWidth(0.3);
  doc.roundedRect(contentPadX, compY, donatePillWidth, pillHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(82, 68, 64);
  doc.text(canDonateText, contentPadX + donatePillWidth / 2, compY + 4.2, { align: 'center' });

  compY += pillHeight + 3.5;

  // Divider line
  doc.setDrawColor(233, 225, 223);
  doc.setLineWidth(0.3);
  doc.line(contentPadX, compY, startX + cardWidth - 7, compY);

  compY += 4.5;

  // Section 2: Can Receive From
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(32, 26, 25);
  doc.text('Can Receive From:', contentPadX, compY);

  compY += 3;
  // Pill for Can Receive
  doc.setFont('helvetica', 'medium');
  doc.setFontSize(9);
  const receivePillTextWidth = doc.getTextWidth(canReceiveText);
  const receivePillWidth = Math.max(receivePillTextWidth + 8, 36);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 195, 190); // #D4C3BE
  doc.setLineWidth(0.3);
  doc.roundedRect(contentPadX, compY, receivePillWidth, pillHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(82, 68, 64);
  doc.text(canReceiveText, contentPadX + receivePillWidth / 2, compY + 4.2, { align: 'center' });

  // -------------------------------------------------------------
  // TRIGGER DOWNLOAD (LAPTOP & PHONE COMPATIBLE)
  // -------------------------------------------------------------
  const filename = `BE_BloodGroup_Report_${bloodGroup.replace('+', 'Pos').replace('-', 'Neg')}_${reportId}.pdf`;

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  downloadLink.setAttribute('target', '_blank');
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 12000);
}
