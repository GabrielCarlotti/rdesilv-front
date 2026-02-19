import { CheckCircle, XCircle, Info } from 'lucide-react';
import type { LicenciementResult } from '../../types/licenciement';

const TYPE_LABELS = {
  licenciement: 'Licenciement',
  rupture_conventionnelle: 'Rupture conventionnelle',
};

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5"
      style={{ borderBottom: '1px solid rgb(var(--border))' }}
    >
      <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs">{label}</span>
      <span
        style={{ color: highlight ? 'rgb(var(--accent))' : 'rgb(var(--text))' }}
        className="text-xs font-semibold text-right"
      >
        {value}
      </span>
    </div>
  );
}

function fmt(val: string) {
  const n = parseFloat(val);
  return isNaN(n)
    ? val
    : n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function LicenciementResultPanel({ result }: { result: LicenciementResult }) {
  if (!result.eligible) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.25)',
        }}
        className="rounded-xl p-6 text-center space-y-3"
      >
        <XCircle size={36} style={{ color: 'rgb(var(--error))' }} className="mx-auto" />
        <p style={{ color: 'rgb(var(--text))' }} className="font-semibold">
          Non éligible à l'indemnité
        </p>
        {result.raison_ineligibilite && (
          <p style={{ color: 'rgb(var(--text-muted))' }} className="text-sm">
            {result.raison_ineligibilite}
          </p>
        )}
      </div>
    );
  }

  const isDoubled = parseFloat(result.multiplicateur) === 2;

  return (
    <div className="space-y-4">
      {/* Montant principal */}
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-surface))',
          border: '1px solid rgb(var(--border))',
        }}
        className="rounded-xl p-5 text-center space-y-1"
      >
        <div style={{ color: 'rgb(var(--text-muted))' }} className="text-xs uppercase tracking-wider">
          {TYPE_LABELS[result.type_rupture]} — Indemnité totale
        </div>
        <div
          style={{ color: 'rgb(var(--accent))' }}
          className="text-4xl font-bold tabular-nums"
        >
          {fmt(result.montant_indemnite)}
        </div>
        {result.montant_minimum !== result.montant_indemnite && (
          <div style={{ color: 'rgb(var(--text-muted))' }} className="text-xs">
            Minimum légal/conventionnel : {fmt(result.montant_minimum)}
          </div>
        )}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <CheckCircle size={13} style={{ color: 'rgb(var(--success))' }} />
          <span style={{ color: 'rgb(var(--success))' }} className="text-xs font-medium">
            Éligible
          </span>
          {isDoubled && (
            <span
              style={{ backgroundColor: 'rgba(var(--accent),0.12)', color: 'rgb(var(--accent))' }}
              className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold"
            >
              × 2 inaptitude pro
            </span>
          )}
        </div>
      </div>

      {/* Détails du calcul */}
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-surface))',
          border: '1px solid rgb(var(--border))',
        }}
        className="rounded-xl p-4 space-y-0"
      >
        <div style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px] font-semibold uppercase tracking-widest pb-2">
          Détail du calcul
        </div>
        <Row label="Salaire de référence" value={fmt(result.salaire_reference)} highlight />
        <Row label="Méthode salaire ref." value={result.methode_salaire_reference} />
        <Row
          label="Ancienneté retenue"
          value={`${result.anciennete_retenue_mois} mois (${result.anciennete_retenue_annees} ans)`}
        />
        {result.preavis_mois > 0 && (
          <Row label="Préavis inclus" value={`${result.preavis_mois} mois`} />
        )}
        <Row label="Indemnité légale" value={fmt(result.indemnite_legale)} />
        {result.indemnite_conventionnelle !== null && (
          <Row label="Indemnité conventionnelle" value={fmt(result.indemnite_conventionnelle)} />
        )}
        {parseFloat(result.multiplicateur) !== 1 && (
          <Row label="Multiplicateur" value={`× ${result.multiplicateur}`} />
        )}
        {parseFloat(result.indemnite_supralegale) > 0 && (
          <Row label="Supralégal négocié" value={fmt(result.indemnite_supralegale)} />
        )}
        {result.plafond_applique && result.plafond_description && (
          <Row label="Plafond appliqué" value={result.plafond_description} />
        )}
      </div>

      {/* Explication */}
      <div
        style={{
          backgroundColor: 'rgba(var(--accent),0.06)',
          border: '1px solid rgba(var(--accent),0.18)',
        }}
        className="rounded-xl p-4 flex gap-3"
      >
        <Info size={14} style={{ color: 'rgb(var(--accent))' }} className="mt-0.5 shrink-0" />
        <p style={{ color: 'rgb(var(--text-muted))' }} className="text-xs leading-relaxed">
          {result.explication}
        </p>
      </div>
    </div>
  );
}
