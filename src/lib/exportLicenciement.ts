import jsPDF from 'jspdf';
import type { LicenciementResult, LicenciementInput } from '../types/licenciement';

const TYPE_LABELS = {
  licenciement: 'Licenciement',
  rupture_conventionnelle: 'Rupture conventionnelle',
};

function fmtE(val: string) {
  const n = parseFloat(val);
  return isNaN(n) ? val : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export function exportLicenciementPdf(result: LicenciementResult, input: LicenciementInput) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 20;

  // ── Titre ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 35);
  doc.text('CEGI — Calcul d\'indemnité', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 120);
  doc.text(`Type : ${TYPE_LABELS[result.type_rupture]}   |   Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, y);
  y += 10;

  // ── Non éligible ────────────────────────────────
  if (!result.eligible) {
    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(margin, y, contentW, 22, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(185, 28, 28);
    doc.text('Non éligible à l\'indemnité', margin + 4, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 40, 40);
    const lines = doc.splitTextToSize(result.raison_ineligibilite ?? '', contentW - 8);
    doc.text(lines, margin + 4, y + 15);
    y += 28;
  } else {
    // ── Montant principal ──────────────────────────
    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(200, 205, 240);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 130);
    doc.text('Indemnité totale', margin + 4, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(80, 90, 200);
    doc.text(fmtE(result.montant_indemnite), margin + 4, y + 21);

    if (result.montant_minimum !== result.montant_indemnite) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 130);
      doc.text(`dont minimum légal/conv. : ${fmtE(result.montant_minimum)}`, pageW - margin - 4, y + 21, { align: 'right' });
    }
    y += 34;
  }

  // ── Dates ───────────────────────────────────────
  const dateRows: [string, string][] = [
    ['Date d\'entrée', fmtDate(input.date_entree)],
    ...(input.date_notification ? [['Date de notification', fmtDate(input.date_notification)] as [string,string]] : []),
    ['Date de fin de contrat', fmtDate(input.date_fin_contrat)],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 120);
  doc.text(dateRows.map(([l, v]) => `${l} : ${v}`).join('   |   '), margin, y);
  y += 8;

  // ── Détails ─────────────────────────────────────
  type Row = [string, string];
  const rows: Row[] = [
    ['Salaire de référence', fmtE(result.salaire_reference)],
    ['Méthode', result.methode_salaire_reference === 'moyenne_12_mois' ? 'Moyenne 12 derniers mois' : 'Moyenne 3 derniers mois'],
    ['Ancienneté retenue', `${result.anciennete_retenue_mois} mois (${result.anciennete_retenue_annees} ans)`],
    ...(result.preavis_mois > 0 ? [['Préavis inclus', `${result.preavis_mois} mois`] as Row] : []),
    ['Indemnité légale', fmtE(result.indemnite_legale)],
    ...(result.indemnite_conventionnelle !== null ? [['Indemnité conventionnelle', fmtE(result.indemnite_conventionnelle)] as Row] : []),
    ...(parseFloat(result.multiplicateur) !== 1 ? [['Multiplicateur', `× ${result.multiplicateur}`] as Row] : []),
    ...(parseFloat(result.indemnite_supralegale) > 0 ? [['Supralégal négocié', fmtE(result.indemnite_supralegale)] as Row] : []),
    ...(result.plafond_applique && result.plafond_description ? [['Plafond appliqué', result.plafond_description] as Row] : []),
  ];

  const tableH = 9 + rows.length * 7;
  doc.setFillColor(245, 245, 250);
  doc.setDrawColor(215, 215, 225);
  doc.roundedRect(margin, y, contentW, tableH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 50);
  doc.text('Détail du calcul', margin + 4, y + 6);
  y += 10;

  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 100);
    doc.text(label, margin + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 35);
    doc.text(value, pageW - margin - 4, y, { align: 'right' });
    y += 7;
  });

  y += 6;

  // ── Explication ──────────────────────────────────
  if (y > 250) { doc.addPage(); y = 20; }
  const explLines = doc.splitTextToSize(result.explication, contentW - 8);
  const explH = explLines.length * 4.5 + 12;
  doc.setFillColor(248, 248, 255);
  doc.setDrawColor(200, 205, 240);
  doc.roundedRect(margin, y, contentW, explH, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 90, 200);
  doc.text('Explication', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 80);
  doc.text(explLines, margin + 4, y + 11);
  y += explH + 8;

  // ── Disclaimer ───────────────────────────────────
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(155, 155, 165);
  const disc = 'Document généré par CEGI à titre indicatif uniquement. L\'utilisateur est invité à vérifier l\'ensemble des données saisies et des résultats obtenus avant toute décision. Ce document ne constitue pas un avis juridique.';
  doc.text(doc.splitTextToSize(disc, contentW), margin, y);

  doc.save(`indemnite-licenciement-${Date.now()}.pdf`);
}
