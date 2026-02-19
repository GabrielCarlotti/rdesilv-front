import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { LicenciementInput, MotifLicenciement, PeriodeTravail } from '../../types/licenciement';

interface Props {
  value: LicenciementInput;
  onChange: (v: LicenciementInput) => void;
  apiUrl: string;
  onApiUrlChange: (u: string) => void;
  disabled?: boolean;
}

const inputCls = 'w-full rounded-md px-3 py-1.5 text-sm outline-none transition-colors';
const inputStyle = {
  backgroundColor: 'rgb(var(--bg-subtle))',
  border: '1px solid rgb(var(--border))',
  color: 'rgb(var(--text))',
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs font-medium">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ borderBottom: '1px solid rgb(var(--border))', color: 'rgb(var(--text-muted))' }}
      className="pb-1 text-[10px] font-semibold uppercase tracking-widest"
    >
      {children}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: active ? 'rgb(var(--accent))' : 'rgb(var(--bg-subtle))',
        border: `1px solid ${active ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
        color: active ? '#fff' : 'rgb(var(--text))',
      }}
      className="flex-1 rounded-md py-1.5 text-sm font-medium transition-colors"
    >
      {children}
    </button>
  );
}

const MOTIFS: { value: MotifLicenciement; label: string }[] = [
  { value: 'personnel', label: 'Cause personnelle' },
  { value: 'economique', label: 'Cause économique' },
  { value: 'inaptitude_professionnelle', label: 'Inaptitude professionnelle' },
  { value: 'inaptitude_non_professionnelle', label: 'Inaptitude non professionnelle' },
  { value: 'faute_grave', label: 'Faute grave' },
  { value: 'faute_lourde', label: 'Faute lourde' },
];

export function LicenciementForm({ value: v, onChange, apiUrl, onApiUrlChange, disabled }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const set = <K extends keyof LicenciementInput>(key: K, val: LicenciementInput[K]) =>
    onChange({ ...v, [key]: val });

  const isLicenciement = v.type_rupture === 'licenciement';
  const isCCN1966 = v.convention_collective === 'ccn_1966';

  /* Salaires */
  const setSalaire = (i: number, val: string) => {
    const s = [...v.salaires_12_derniers_mois];
    s[i] = val;
    set('salaires_12_derniers_mois', s);
  };
  const addSalaire = () => {
    if (v.salaires_12_derniers_mois.length < 12)
      set('salaires_12_derniers_mois', [...v.salaires_12_derniers_mois, '']);
  };
  const removeSalaire = (i: number) => {
    const s = v.salaires_12_derniers_mois.filter((_, idx) => idx !== i);
    set('salaires_12_derniers_mois', s.length ? s : ['']);
  };

  /* Périodes */
  const setPeriode = (i: number, p: PeriodeTravail) => {
    const ps = [...v.periodes_travail];
    ps[i] = p;
    set('periodes_travail', ps);
  };
  const addPeriode = () =>
    set('periodes_travail', [...v.periodes_travail, { duree_mois: 12, coefficient_temps: 1.0 }]);
  const removePeriode = (i: number) =>
    set('periodes_travail', v.periodes_travail.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5 text-sm">
      {/* URL API */}
      <div className="space-y-1">
        <Label>URL API</Label>
        <input
          type="text"
          value={apiUrl}
          disabled={disabled}
          onChange={(e) => onApiUrlChange(e.target.value)}
          style={inputStyle}
          className={inputCls + ' font-mono text-xs'}
        />
      </div>

      {/* Type de rupture */}
      <div className="space-y-2">
        <SectionTitle>Type de rupture</SectionTitle>
        <div className="flex gap-2">
          <ToggleBtn active={isLicenciement} onClick={() => set('type_rupture', 'licenciement')}>
            Licenciement
          </ToggleBtn>
          <ToggleBtn
            active={!isLicenciement}
            onClick={() => set('type_rupture', 'rupture_conventionnelle')}
          >
            Rupture conventionnelle
          </ToggleBtn>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2">
        <SectionTitle>Dates</SectionTitle>
        <div className="grid gap-3" style={{ gridTemplateColumns: isLicenciement ? '1fr 1fr 1fr' : '1fr 1fr' }}>
          <label className="flex flex-col gap-1">
            <Label>Date d'entrée</Label>
            <input
              type="date"
              value={v.date_entree}
              disabled={disabled}
              onChange={(e) => set('date_entree', e.target.value)}
              style={inputStyle}
              className={inputCls}
            />
          </label>
          {isLicenciement && (
            <label className="flex flex-col gap-1">
              <Label>Date de notification</Label>
              <input
                type="date"
                value={v.date_notification ?? ''}
                disabled={disabled}
                onChange={(e) =>
                  set('date_notification', e.target.value === '' ? null : e.target.value)
                }
                style={inputStyle}
                className={inputCls}
              />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <Label>
              {isLicenciement ? 'Date de fin de contrat (fin préavis)' : 'Date de fin convenue'}
            </Label>
            <input
              type="date"
              value={v.date_fin_contrat}
              disabled={disabled}
              onChange={(e) => set('date_fin_contrat', e.target.value)}
              style={inputStyle}
              className={inputCls}
            />
          </label>
        </div>
      </div>

      {/* Motif (licenciement uniquement) */}
      {isLicenciement && (
        <div className="space-y-2">
          <SectionTitle>Motif du licenciement</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {MOTIFS.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={disabled}
                onClick={() => set('motif', m.value)}
                style={{
                  backgroundColor:
                    v.motif === m.value ? 'rgb(var(--accent))' : 'rgb(var(--bg-subtle))',
                  border: `1px solid ${v.motif === m.value ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
                  color: v.motif === m.value ? '#fff' : 'rgb(var(--text))',
                }}
                className="rounded-md px-3 py-2 text-xs font-medium text-left transition-colors"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Supralégal (rupture conv. uniquement) */}
      {!isLicenciement && (
        <div className="space-y-1">
          <SectionTitle>Indemnité supralégale (optionnel)</SectionTitle>
          <label className="flex flex-col gap-1 mt-2">
            <Label>Montant négocié en plus du minimum (€)</Label>
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder="0"
              value={v.indemnite_supralegale ?? ''}
              disabled={disabled}
              onChange={(e) =>
                set('indemnite_supralegale', e.target.value === '' ? null : e.target.value)
              }
              style={inputStyle}
              className={inputCls}
            />
          </label>
        </div>
      )}

      {/* Salaires */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionTitle>Salaires bruts mensuels</SectionTitle>
          <button
            type="button"
            onClick={addSalaire}
            disabled={disabled || v.salaires_12_derniers_mois.length >= 12}
            style={{ color: 'rgb(var(--accent))' }}
            className="flex items-center gap-1 text-xs font-medium disabled:opacity-40"
          >
            <Plus size={12} /> Ajouter
          </button>
        </div>
        <p style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px]">
          Du plus récent (M-1) au plus ancien · max 12 mois
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {v.salaires_12_derniers_mois.map((s, i) => (
            <div key={i} className="flex items-end gap-1">
              <div className="flex flex-col gap-0.5 flex-1">
                <span style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px]">
                  M-{i + 1}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  value={s}
                  disabled={disabled}
                  onChange={(e) => setSalaire(i, e.target.value)}
                  style={inputStyle}
                  className={inputCls + ' text-xs'}
                />
              </div>
              {v.salaires_12_derniers_mois.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSalaire(i)}
                  disabled={disabled}
                  style={{ color: 'rgb(var(--text-muted))' }}
                  className="mb-1.5 shrink-0 hover:opacity-70"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Primes */}
      <div className="space-y-1">
        <Label>Primes annuelles versées dans les 3 derniers mois (€)</Label>
        <input
          type="number"
          step="0.01"
          min={0}
          placeholder="0"
          value={v.primes_annuelles_3_derniers_mois}
          disabled={disabled}
          onChange={(e) => set('primes_annuelles_3_derniers_mois', e.target.value || '0')}
          style={inputStyle}
          className={inputCls}
        />
      </div>

      {/* Convention collective */}
      <div className="space-y-2">
        <SectionTitle>Convention collective</SectionTitle>
        <div className="flex gap-2">
          <ToggleBtn
            active={v.convention_collective === 'aucune'}
            onClick={() => set('convention_collective', 'aucune')}
          >
            Aucune (légale)
          </ToggleBtn>
          <ToggleBtn
            active={isCCN1966}
            onClick={() => set('convention_collective', 'ccn_1966')}
          >
            CCN 1966
          </ToggleBtn>
        </div>
        {isCCN1966 && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <label className="flex flex-col gap-1">
              <Label>Âge du salarié</Label>
              <input
                type="number"
                min={16}
                max={70}
                value={v.age_salarie ?? ''}
                disabled={disabled}
                onChange={(e) =>
                  set('age_salarie', e.target.value === '' ? null : parseInt(e.target.value))
                }
                style={inputStyle}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <Label>Salaire mensuel actuel (€)</Label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={v.salaire_mensuel_actuel ?? ''}
                disabled={disabled}
                onChange={(e) =>
                  set('salaire_mensuel_actuel', e.target.value === '' ? null : e.target.value)
                }
                style={inputStyle}
                className={inputCls}
              />
            </label>
          </div>
        )}
      </div>

      {/* Ajustements avancés */}
      <div style={{ border: '1px solid rgb(var(--border))', borderRadius: 8 }} className="overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          style={{ backgroundColor: 'rgb(var(--bg-subtle))', color: 'rgb(var(--text))' }}
          className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium"
        >
          Ajustements avancés
          <ChevronDown
            size={14}
            style={{ color: 'rgb(var(--text-muted))' }}
            className={`transition-transform duration-150 ${advancedOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {advancedOpen && (
          <div className="space-y-4 p-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <Label>Mois suspendus à déduire</Label>
                <input
                  type="number"
                  min={0}
                  value={v.mois_suspendus_non_comptes}
                  disabled={disabled}
                  onChange={(e) => set('mois_suspendus_non_comptes', parseInt(e.target.value) || 0)}
                  style={inputStyle}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1">
                <Label>Mois congé parental temps plein</Label>
                <input
                  type="number"
                  min={0}
                  value={v.mois_conge_parental_temps_plein}
                  disabled={disabled}
                  onChange={(e) =>
                    set('mois_conge_parental_temps_plein', parseInt(e.target.value) || 0)
                  }
                  style={inputStyle}
                  className={inputCls}
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Périodes de travail à temps partiel</Label>
                <button
                  type="button"
                  onClick={addPeriode}
                  disabled={disabled}
                  style={{ color: 'rgb(var(--accent))' }}
                  className="flex items-center gap-1 text-xs font-medium"
                >
                  <Plus size={12} /> Ajouter
                </button>
              </div>
              {v.periodes_travail.length === 0 && (
                <p style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px]">
                  Vide = temps plein sur toute la durée
                </p>
              )}
              {v.periodes_travail.map((p, i) => (
                <div key={i} className="flex items-end gap-2">
                  <label className="flex flex-col gap-1 flex-1">
                    <Label>Durée (mois)</Label>
                    <input
                      type="number"
                      min={1}
                      value={p.duree_mois}
                      disabled={disabled}
                      onChange={(e) =>
                        setPeriode(i, { ...p, duree_mois: parseInt(e.target.value) || 1 })
                      }
                      style={inputStyle}
                      className={inputCls}
                    />
                  </label>
                  <label className="flex flex-col gap-1 flex-1">
                    <Label>Coefficient (0–1)</Label>
                    <input
                      type="number"
                      step="0.05"
                      min={0}
                      max={1}
                      value={p.coefficient_temps}
                      disabled={disabled}
                      onChange={(e) =>
                        setPeriode(i, { ...p, coefficient_temps: parseFloat(e.target.value) || 0 })
                      }
                      style={inputStyle}
                      className={inputCls}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removePeriode(i)}
                    disabled={disabled}
                    style={{ color: 'rgb(var(--text-muted))' }}
                    className="mb-1.5 hover:opacity-70"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
