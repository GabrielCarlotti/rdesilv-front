import type {
  LicenciementInput,
  LicenciementResult,
  LicenciementPdfExtraction,
} from '../types/licenciement';

export async function calculerLicenciement(
  data: LicenciementInput,
  apiUrl: string,
): Promise<LicenciementResult> {
  console.group('[CEGI] POST licenciement', apiUrl);
  console.log('payload:', data);

  let res: Response;
  try {
    res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (networkErr) {
    console.error('[CEGI] Network error:', networkErr);
    console.groupEnd();
    throw new Error(
      `Impossible de joindre l'API (${networkErr instanceof Error ? networkErr.message : 'Network error'}).`,
    );
  }

  console.log('[CEGI] HTTP', res.status);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      console.error('[CEGI] Erreur:', body);
      detail = body.detail ?? detail;
    } catch { /* */ }
    console.groupEnd();
    throw new Error(`HTTP ${res.status} — ${detail}`);
  }

  const result = await res.json() as LicenciementResult;
  console.log('[CEGI] Résultat:', result);
  console.groupEnd();
  return result;
}

export async function extracterDepuisPdf(
  file: File,
  apiUrl: string,
): Promise<LicenciementPdfExtraction> {
  console.group('[CEGI] POST licenciementpdf', apiUrl);
  console.log('file:', file.name, file.size, 'bytes');

  const form = new FormData();
  form.append('file', file);

  let res: Response;
  try {
    res = await fetch(apiUrl, { method: 'POST', body: form });
  } catch (networkErr) {
    console.error('[CEGI] Network error:', networkErr);
    console.groupEnd();
    throw new Error(
      `Impossible de joindre l'API (${networkErr instanceof Error ? networkErr.message : 'Network error'}).`,
    );
  }

  console.log('[CEGI] HTTP', res.status);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      console.error('[CEGI] Erreur:', body);
      detail = body.detail ?? detail;
    } catch { /* */ }
    console.groupEnd();
    throw new Error(`HTTP ${res.status} — ${detail}`);
  }

  const result = await res.json() as LicenciementPdfExtraction;
  console.log('[CEGI] Extraction:', result);
  console.groupEnd();
  return result;
}
