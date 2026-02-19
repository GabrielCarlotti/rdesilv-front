import { useRef, useState } from 'react';
import {
  Calculator, Loader2, Upload, FileText, X,
  CheckCircle, AlertCircle, HelpCircle, TriangleAlert, Download,
} from 'lucide-react';
import { LicenciementForm } from './LicenciementForm';
import { LicenciementResultPanel } from './LicenciementResult';
import { Modal } from '../Modal';
import { calculerLicenciement, extracterDepuisPdf } from '../../lib/licenciement';
import { exportLicenciementPdf } from '../../lib/exportLicenciement';
import type { LicenciementInput, LicenciementResult } from '../../types/licenciement';

const today = new Date().toISOString().slice(0, 10);

const DEFAULT_INPUT: LicenciementInput = {
  type_rupture: 'licenciement',
  date_entree: '',
  date_notification: null,
  date_fin_contrat: today,
  motif: 'personnel',
  indemnite_supralegale: null,
  convention_collective: 'aucune',
  salaires_12_derniers_mois: Array(3).fill(''),
  primes_annuelles_3_derniers_mois: '0',
  periodes_travail: [],
  mois_suspendus_non_comptes: 0,
  mois_conge_parental_temps_plein: 0,
  age_salarie: null,
  salaire_mensuel_actuel: null,
};

const DEFAULT_API_URL = 'http://localhost:8000/api/licenciement';
const DEFAULT_PDF_API_URL = 'http://localhost:8000/api/licenciementpdf';

interface ExtractionBanner {
  fichesCount: number;
  errors: string[];
  prefilled: string[];
}

function HelpContent() {
  const manual = [
    { field: 'Date de notification', note: 'Date d\'envoi de la lettre recommandée de licenciement. Ne figure pas sur la fiche de paie.' },
    { field: 'Date de fin de contrat', note: 'Fin du préavis pour un licenciement (même si dispensé), ou date convenue pour une rupture conventionnelle.' },
    { field: 'Motif du licenciement', note: 'Cause réelle et sérieuse choisie par l\'employeur. Non disponible sur la fiche de paie.' },
    { field: 'Indemnité supralégale', note: 'Montant négocié au-delà du minimum légal (rupture conventionnelle uniquement). Résulte de la négociation entre les parties.' },
    { field: 'Mois suspendus', note: 'Congé sans solde, sabbatique, maladie non professionnelle, grève. Ces périodes sont à déduire de l\'ancienneté.' },
    { field: 'Congé parental temps plein', note: 'Nombre de mois de congé parental à temps plein — ces périodes comptent pour moitié dans l\'ancienneté.' },
    { field: 'Périodes temps partiel', note: 'Si le salarié a travaillé à temps partiel sur certaines périodes, indiquer la durée et le coefficient. Ces données peuvent figurer dans les contrats ou avenants.' },
    { field: 'Âge du salarié (CCN 1966)', note: 'Requis pour calculer le plafond jusqu\'à 65 ans. Non disponible sur la fiche de paie.' },
    { field: 'Salaire mensuel actuel (CCN 1966)', note: 'Requis pour le calcul du plafond CCN 1966. Peut être le salaire du dernier mois.' },
  ];

  const auto = [
    'Date d\'entrée dans l\'entreprise',
    'Convention collective',
    'Salaires bruts des 12 derniers mois',
  ];

  return (
    <div className="space-y-5">
      <div>
        <div style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px] font-semibold uppercase tracking-widest mb-2">
          Champs pré-remplis depuis les fiches de paie
        </div>
        <ul className="space-y-1">
          {auto.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs">
              <CheckCircle size={11} style={{ color: 'rgb(var(--success))' }} className="shrink-0" />
              <span style={{ color: 'rgb(var(--text))' }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px] font-semibold uppercase tracking-widest mb-2">
          Champs à saisir manuellement
        </div>
        <ul className="space-y-3">
          {manual.map(({ field, note }) => (
            <li key={field} className="text-xs">
              <div style={{ color: 'rgb(var(--text))' }} className="font-semibold mb-0.5">{field}</div>
              <div style={{ color: 'rgb(var(--text-muted))' }}>{note}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DisclaimerContent() {
  return (
    <div className="space-y-4 text-sm" style={{ color: 'rgb(var(--text))' }}>
      <div
        style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}
        className="rounded-lg p-3 text-xs"
      >
        <p className="font-semibold text-yellow-600 mb-1">À lire avant d'utiliser cet outil</p>
        <p style={{ color: 'rgb(var(--text-muted))' }}>
          Cet outil est fourni à titre indicatif uniquement et ne constitue pas un avis juridique.
        </p>
      </div>
      <ul className="space-y-3 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
        <li className="flex gap-2">
          <span className="shrink-0 font-bold" style={{ color: 'rgb(var(--text))' }}>Vérification obligatoire.</span>
          L'utilisateur est invité à vérifier l'intégralité des champs saisis ainsi que les résultats produits avant toute utilisation ou décision.
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 font-bold" style={{ color: 'rgb(var(--text))' }}>Règles incomplètes.</span>
          Le calcul implémente les règles de base du Code du travail et de la CCN 1966. Des conventions collectives spécifiques, des accords d'entreprise ou des jurisprudences particulières peuvent modifier le résultat.
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 font-bold" style={{ color: 'rgb(var(--text))' }}>Données manuelles.</span>
          Plusieurs champs (motif, dates, périodes suspendues, etc.) doivent être saisis manuellement. Une erreur de saisie impacte directement le résultat.
        </li>
        <li className="flex gap-2">
          <span className="shrink-0 font-bold" style={{ color: 'rgb(var(--text))' }}>Conseil juridique.</span>
          En cas de doute, consultez un avocat en droit du travail ou un conseiller prud'homal.
        </li>
      </ul>
    </div>
  );
}

export function LicenciementPanel() {
  const [input, setInput] = useState<LicenciementInput>(DEFAULT_INPUT);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [pdfApiUrl] = useState(DEFAULT_PDF_API_URL);
  const [result, setResult] = useState<LicenciementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [banner, setBanner] = useState<ExtractionBanner | null>(null);
  const [drag, setDrag] = useState(false);
  const [modal, setModal] = useState<'help' | 'disclaimer' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePdfFile = async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setPdfFile(file);
    setBanner(null);
    setExtracting(true);
    setError(null);
    try {
      const ext = await extracterDepuisPdf(file, pdfApiUrl);
      const prefilled: string[] = [];
      setInput((prev) => {
        const next = { ...prev };
        if (ext.date_entree) { next.date_entree = ext.date_entree; prefilled.push('Date d\'entrée'); }
        if (ext.convention_collective && ext.convention_collective !== 'aucune') {
          next.convention_collective = ext.convention_collective;
          prefilled.push('Convention collective');
        }
        if (ext.salaires_12_derniers_mois.length > 0) {
          next.salaires_12_derniers_mois = ext.salaires_12_derniers_mois.map(String);
          prefilled.push(`${ext.salaires_12_derniers_mois.length} salaire(s)`);
        }
        return next;
      });
      setBanner({ fichesCount: ext.nombre_fiches_extraites, errors: ext.extraction_errors, prefilled });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur extraction');
    } finally {
      setExtracting(false);
    }
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const cleaned: LicenciementInput = {
        ...input,
        salaires_12_derniers_mois: input.salaires_12_derniers_mois.filter((s) => s !== '' && parseFloat(s) > 0),
      };
      if (cleaned.salaires_12_derniers_mois.length === 0) throw new Error('Veuillez saisir au moins un salaire mensuel.');
      if (!cleaned.date_entree) throw new Error('La date d\'entrée est requise.');
      const r = await calculerLicenciement(cleaned, apiUrl);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const iconBtnStyle = {
    backgroundColor: 'rgb(var(--bg-subtle))',
    border: '1px solid rgb(var(--border))',
    color: 'rgb(var(--text-muted))',
  };

  return (
    <>
      {modal === 'help' && (
        <Modal title="Guide de saisie" onClose={() => setModal(null)} width={520}>
          <HelpContent />
        </Modal>
      )}
      {modal === 'disclaimer' && (
        <Modal title="Avertissement" onClose={() => setModal(null)} width={500}>
          <DisclaimerContent />
        </Modal>
      )}

      <div className="flex h-full gap-0 overflow-hidden">
        {/* ── Colonne gauche ── */}
        <div
          style={{ borderRight: '1px solid rgb(var(--border))', width: '50%' }}
          className="flex flex-col overflow-hidden"
        >
          {/* Header upload */}
          <div
            style={{ borderBottom: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--bg-surface))' }}
            className="shrink-0 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px] font-semibold uppercase tracking-widest">
                Pré-remplissage depuis les fiches de paie (optionnel)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setModal('help')}
                  style={iconBtnStyle}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:opacity-80"
                  title="Guide de saisie"
                >
                  <HelpCircle size={13} />
                </button>
                <button
                  onClick={() => setModal('disclaimer')}
                  style={{ ...iconBtnStyle, color: 'rgb(234,179,8)' }}
                  className="flex h-7 w-7 items-center justify-center rounded-md hover:opacity-80"
                  title="Avertissement"
                >
                  <TriangleAlert size={13} />
                </button>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handlePdfFile(f); }}
              onClick={() => !extracting && fileRef.current?.click()}
              style={{
                border: `1.5px dashed ${drag ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
                backgroundColor: drag ? 'rgba(var(--accent),0.04)' : 'rgb(var(--bg-subtle))',
                cursor: extracting ? 'default' : 'pointer',
              }}
              className="flex items-center rounded-lg px-4 py-2.5 transition-colors"
            >
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfFile(f); }} />
              {extracting ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} style={{ color: 'rgb(var(--accent))' }} className="animate-spin" />
                  <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs">Extraction en cours…</span>
                </div>
              ) : pdfFile ? (
                <div className="flex flex-1 items-center gap-2">
                  <FileText size={14} style={{ color: 'rgb(var(--accent))' }} />
                  <span style={{ color: 'rgb(var(--text))' }} className="flex-1 truncate text-xs font-medium">{pdfFile.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); setBanner(null); }}
                    style={{ color: 'rgb(var(--text-muted))' }} className="shrink-0 hover:opacity-70">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload size={14} style={{ color: 'rgb(var(--text-muted))' }} />
                  <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs">
                    Déposer un PDF avec les 12 dernières fiches de paie
                  </span>
                </div>
              )}
            </div>

            {banner && (
              <div
                style={{
                  backgroundColor: banner.errors.length > 0 ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)',
                  border: `1px solid ${banner.errors.length > 0 ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
                }}
                className="rounded-md px-3 py-2 text-xs space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  {banner.errors.length > 0
                    ? <AlertCircle size={12} className="text-yellow-500 shrink-0" />
                    : <CheckCircle size={12} style={{ color: 'rgb(var(--success))' }} className="shrink-0" />}
                  <span style={{ color: 'rgb(var(--text))' }} className="font-medium">
                    {banner.fichesCount} fiche{banner.fichesCount > 1 ? 's' : ''} extraite{banner.fichesCount > 1 ? 's' : ''}
                  </span>
                  {banner.prefilled.length > 0 && (
                    <span style={{ color: 'rgb(var(--text-muted))' }}>— pré-rempli : {banner.prefilled.join(', ')}</span>
                  )}
                </div>
                {banner.errors.map((e, i) => (
                  <div key={i} style={{ color: 'rgb(var(--text-muted))' }} className="text-[10px]">{e}</div>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire */}
          <div className="flex-1 overflow-y-auto p-5">
            <LicenciementForm
              value={input}
              onChange={setInput}
              apiUrl={apiUrl}
              onApiUrlChange={setApiUrl}
              disabled={loading || extracting}
            />
          </div>

          {/* Bouton calculer */}
          <div
            style={{ borderTop: '1px solid rgb(var(--border))', backgroundColor: 'rgb(var(--bg-surface))' }}
            className="shrink-0 p-4"
          >
            <button
              onClick={run}
              disabled={loading || extracting}
              style={{
                backgroundColor: loading || extracting ? 'rgb(var(--bg-subtle))' : 'rgb(var(--accent))',
                color: loading || extracting ? 'rgb(var(--text-muted))' : '#fff',
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Calcul en cours…</>
                : <><Calculator size={15} />Calculer l'indemnité</>}
            </button>
          </div>
        </div>

        {/* ── Colonne droite : résultat ── */}
        <div style={{ width: '50%' }} className="flex flex-col overflow-y-auto p-5">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs font-semibold uppercase tracking-wider">
              Résultat
            </span>
            {result && (
              <button
                onClick={() => exportLicenciementPdf(result, input)}
                style={iconBtnStyle}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium hover:opacity-80"
              >
                <Download size={12} />
                Exporter le rapport
              </button>
            )}
          </div>

          {error && (
            <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {result ? (
            <LicenciementResultPanel result={result} />
          ) : (
            <div
              style={{ backgroundColor: 'rgb(var(--bg-subtle))', border: '1px solid rgb(var(--border))', color: 'rgb(var(--text-muted))' }}
              className="flex flex-1 min-h-48 items-center justify-center rounded-xl text-sm"
            >
              {loading ? 'Calcul en cours…' : 'Remplissez le formulaire et lancez le calcul'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
