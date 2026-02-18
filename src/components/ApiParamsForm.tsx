import type { ApiParams } from '../types/api';

interface Props {
  params: ApiParams;
  onChange: (p: ApiParams) => void;
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
  disabled?: boolean;
}

const inputCls =
  'w-full rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus:ring-1';

export function ApiParamsForm({ params, onChange, apiUrl, onApiUrlChange, disabled }: Props) {
  const set = <K extends keyof ApiParams>(key: K, value: ApiParams[K]) =>
    onChange({ ...params, [key]: value });

  const inputStyle = {
    backgroundColor: 'rgb(var(--bg-subtle))',
    border: '1px solid rgb(var(--border))',
    color: 'rgb(var(--text))',
  };

  return (
    <div className="space-y-2">
      {/* API URL row */}
      <label className="flex items-center gap-2">
        <span
          style={{ color: 'rgb(var(--text-muted))' }}
          className="shrink-0 text-xs font-medium"
        >
          URL API
        </span>
        <input
          type="text"
          value={apiUrl}
          disabled={disabled}
          onChange={(e) => onApiUrlChange(e.target.value)}
          style={inputStyle}
          className={inputCls + ' font-mono text-xs'}
          placeholder="http://localhost:8000/check"
        />
      </label>

      {/* Params row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs font-medium">
            SMIC mensuel (€)
          </span>
          <input
            type="number"
            step="0.01"
            value={params.smic_mensuel}
            disabled={disabled}
            onChange={(e) => set('smic_mensuel', parseFloat(e.target.value) || 0)}
            style={inputStyle}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs font-medium">
            Plafond SS (€)
          </span>
          <input
            type="number"
            step="0.01"
            value={params.plafond_ss}
            disabled={disabled}
            onChange={(e) => set('plafond_ss', parseFloat(e.target.value) || 0)}
            style={inputStyle}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs font-medium">
            Effectif ≥ 50 salariés
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => set('effectif_50_et_plus', !params.effectif_50_et_plus)}
            style={{
              backgroundColor: params.effectif_50_et_plus
                ? 'rgb(var(--accent))'
                : 'rgb(var(--bg-subtle))',
              border: '1px solid rgb(var(--border))',
              color: params.effectif_50_et_plus ? '#fff' : 'rgb(var(--text))',
            }}
            className="flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors"
          >
            {params.effectif_50_et_plus ? 'Oui' : 'Non'}
          </button>
        </label>

        <label className="flex flex-col gap-1">
          <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs font-medium">
            Check fautes de frappe
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => set('include_frappe_check', !params.include_frappe_check)}
            style={{
              backgroundColor: params.include_frappe_check
                ? 'rgb(var(--accent))'
                : 'rgb(var(--bg-subtle))',
              border: '1px solid rgb(var(--border))',
              color: params.include_frappe_check ? '#fff' : 'rgb(var(--text))',
            }}
            className="flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors"
          >
            {params.include_frappe_check ? 'Activé' : 'Désactivé'}
          </button>
        </label>
      </div>
    </div>
  );
}
