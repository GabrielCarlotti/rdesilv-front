import jsPDF from 'jspdf';
import type { CheckReport, CheckResult } from '../types/api';

export function exportReport(report: CheckReport): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 20;

  const lineH = 6;
  const sectionGap = 8;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 35);
  doc.text('CEGI — Rapport de vérification', margin, y);
  y += lineH * 1.5;

  // Source file
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 120);
  doc.text(`Fichier : ${report.source_file ?? 'N/A'}`, margin, y);
  y += lineH;
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, margin, y);
  y += sectionGap;

  // Summary box
  const boxH = 22;
  doc.setFillColor(245, 245, 250);
  doc.setDrawColor(210, 210, 220);
  doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 35);
  doc.text('Résumé', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 70);
  doc.text(`Total : ${report.total_checks} vérifications`, margin + 4, y + 14);
  doc.setTextColor(22, 163, 74);
  doc.text(`Réussies : ${report.passed_checks}`, margin + 60, y + 14);
  doc.setTextColor(220, 38, 38);
  doc.text(`Échouées : ${report.failed_checks}`, margin + 110, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  if (report.all_valid) {
    doc.setTextColor(22, 163, 74);
    doc.text('Statut : VALIDE', margin + 4, y + 20);
  } else {
    doc.setTextColor(220, 38, 38);
    doc.text('Statut : ERREURS DÉTECTÉES', margin + 4, y + 20);
  }

  y += boxH + sectionGap;

  // Errors section
  const errors = report.checks.filter((c) => !c.valid);

  if (errors.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74);
    doc.text('Aucune erreur détectée.', margin, y);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 35);
    doc.text(`Erreurs détectées (${errors.length})`, margin, y);
    y += lineH + 2;

    errors.forEach((err: CheckResult, i: number) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const itemH = calcItemHeight(doc, err, contentW);
      doc.setFillColor(255, 245, 245);
      doc.setDrawColor(239, 68, 68);
      doc.roundedRect(margin, y, contentW, itemH, 2, 2, 'FD');

      let iy = y + 6;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(185, 28, 28);
      const header = `#${i + 1} — ${err.test_name.toUpperCase()}${err.line_number ? ` — Ligne ${err.line_number}` : ''}`;
      doc.text(header, margin + 4, iy);
      iy += 5;

      // Values
      if (err.obtained_value !== null || err.expected_value !== null) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 90);
        const vals = [
          err.obtained_value !== null ? `Obtenu : ${err.obtained_value}` : null,
          err.expected_value !== null ? `Attendu : ${err.expected_value}` : null,
          err.difference !== null ? `Écart : ${err.difference}` : null,
        ]
          .filter(Boolean)
          .join('   |   ');
        doc.text(vals, margin + 4, iy);
        iy += 5;
      }

      // Message
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 70);
      const lines = doc.splitTextToSize(err.message, contentW - 8);
      doc.text(lines, margin + 4, iy);
      y += itemH + 3;
    });
  }

  doc.save(`rapport-cegi-${Date.now()}.pdf`);
}

function calcItemHeight(doc: jsPDF, err: CheckResult, contentW: number): number {
  let h = 10;
  if (err.obtained_value !== null || err.expected_value !== null) h += 5;
  const lines = doc.splitTextToSize(err.message, contentW - 8);
  h += lines.length * 4 + 4;
  return Math.max(h, 16);
}
