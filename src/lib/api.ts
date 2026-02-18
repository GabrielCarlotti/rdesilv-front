import type { ApiParams, CheckReport } from '../types/api';

export async function checkPayslip(
  file: File,
  params: ApiParams,
  apiUrl: string,
): Promise<CheckReport> {
  const form = new FormData();
  form.append('file', file);
  form.append('smic_mensuel', String(params.smic_mensuel));
  form.append('effectif_50_et_plus', String(params.effectif_50_et_plus));
  form.append('plafond_ss', String(params.plafond_ss));
  form.append('include_frappe_check', String(params.include_frappe_check));

  console.group('[CEGI] POST', apiUrl);
  console.log('file:', file.name, file.size, 'bytes');
  console.log('params:', Object.fromEntries(form.entries()));

  let res: Response;
  try {
    res = await fetch(apiUrl, { method: 'POST', body: form });
  } catch (networkErr) {
    console.error('[CEGI] Network error (CORS / serveur injoignable):', networkErr);
    console.groupEnd();
    throw new Error(
      `Impossible de joindre l'API (${networkErr instanceof Error ? networkErr.message : 'Network error'}). Vérifiez que le serveur tourne et que CORS est activé.`,
    );
  }

  console.log('[CEGI] HTTP', res.status, res.statusText);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      console.error('[CEGI] Réponse erreur:', body);
      detail = body.detail ?? detail;
    } catch {
      console.error('[CEGI] Corps de la réponse illisible');
    }
    console.groupEnd();
    throw new Error(`HTTP ${res.status} — ${detail}`);
  }

  const data = await res.json() as CheckReport;
  console.log('[CEGI] Réponse OK:', data);
  console.groupEnd();
  return data;
}
