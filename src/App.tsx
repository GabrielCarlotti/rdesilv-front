import { useState } from 'react';
import { Play, Download, Loader2 } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ApiParamsForm } from './components/ApiParamsForm';
import { PdfViewer } from './components/PdfViewer';
import { ErrorPanel } from './components/ErrorPanel';
import { checkPayslip } from './lib/api';
import { exportReport } from './lib/exportPdf';
import type { ApiParams, CheckReport } from './types/api';

const DEFAULT_PARAMS: ApiParams = {
  smic_mensuel: 1823.03,
  effectif_50_et_plus: true,
  plafond_ss: 4005,
  include_frappe_check: false,
};

const DEFAULT_API_URL = 'http://localhost:8000/api/check';

export default function App() {
  const { theme, toggle } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [params, setParams] = useState<ApiParams>(DEFAULT_PARAMS);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [report, setReport] = useState<CheckReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorLineNumbers: string[] = report
    ? report.checks
        .filter((c) => !c.valid && c.is_line_error && c.line_number)
        .map((c) => c.line_number!)
    : [];

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await checkPayslip(file, params, apiUrl);
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const canRun = !!file && !loading;

  return (
    <div
      style={{ backgroundColor: 'rgb(var(--bg))', minHeight: '100vh' }}
      className="flex flex-col"
    >
      <Header theme={theme} onToggle={toggle} />

      {/* Top bar: file + params + run */}
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-surface))',
          borderBottom: '1px solid rgb(var(--border))',
        }}
        className="px-6 py-4 space-y-3"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 min-w-0">
            <FileUpload
              file={file}
              onChange={(f) => {
                setFile(f);
                setReport(null);
                setError(null);
              }}
              disabled={loading}
            />
          </div>
          <button
            onClick={run}
            disabled={!canRun}
            style={{
              backgroundColor: canRun ? 'rgb(var(--accent))' : 'rgb(var(--bg-subtle))',
              color: canRun ? '#fff' : 'rgb(var(--text-muted))',
              border: '1px solid transparent',
            }}
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Analyse…
              </>
            ) : (
              <>
                <Play size={15} />
                Lancer l'analyse
              </>
            )}
          </button>
        </div>

        <ApiParamsForm
          params={params}
          onChange={setParams}
          apiUrl={apiUrl}
          onApiUrlChange={setApiUrl}
          disabled={loading}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-3 rounded-md border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main split layout */}
      <div className="flex flex-1 gap-0 overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
        {/* Left: PDF preview */}
        <div
          style={{ borderRight: '1px solid rgb(var(--border))' }}
          className="flex w-1/2 flex-col p-4 overflow-hidden"
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              style={{ color: 'rgb(var(--text-muted))' }}
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Aperçu PDF
            </span>
            {report && errorLineNumbers.length > 0 && (
              <span style={{ color: 'rgb(var(--error))' }} className="text-[10px]">
                {errorLineNumbers.length} ligne{errorLineNumbers.length > 1 ? 's' : ''} surlignée
                {errorLineNumbers.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <PdfViewer file={file} errorLineNumbers={errorLineNumbers} />
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex w-1/2 flex-col p-4 overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <span
              style={{ color: 'rgb(var(--text-muted))' }}
              className="text-xs font-semibold uppercase tracking-wider"
            >
              Résultats
            </span>
            {report && (
              <button
                onClick={() => exportReport(report)}
                style={{
                  backgroundColor: 'rgb(var(--bg-subtle))',
                  border: '1px solid rgb(var(--border))',
                  color: 'rgb(var(--text))',
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
              >
                <Download size={12} />
                Exporter le rapport
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {report ? (
              <ErrorPanel report={report} />
            ) : (
              <div
                style={{
                  backgroundColor: 'rgb(var(--bg-subtle))',
                  border: '1px solid rgb(var(--border))',
                  color: 'rgb(var(--text-muted))',
                }}
                className="flex h-full min-h-64 items-center justify-center rounded-lg text-sm"
              >
                {loading ? 'Analyse en cours…' : 'Lancez une analyse pour voir les résultats'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
