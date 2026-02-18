import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
  file: File | null;
  errorLineNumbers: string[];
}

export function PdfViewer({ file, errorLineNumbers }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);

  const onDocLoaded = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPage(1);
  };

  const customTextRenderer = useCallback(
    ({ str }: { str: string }) => {
      if (!errorLineNumbers.length) return str;
      // Check if the text token matches or contains any error line number
      const isError = errorLineNumbers.some((ln) => str.includes(ln) || ln.includes(str.trim()));
      if (isError && str.trim().length > 0) {
        return `<mark class="pdf-error-highlight" title="Erreur sur cette ligne">${str}</mark>`;
      }
      return str;
    },
    [errorLineNumbers],
  );

  if (!file) {
    return (
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-subtle))',
          border: '1px solid rgb(var(--border))',
          color: 'rgb(var(--text-muted))',
        }}
        className="flex h-full min-h-64 items-center justify-center rounded-lg text-sm"
      >
        Aucun fichier chargé
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-subtle))',
          border: '1px solid rgb(var(--border))',
        }}
        className="flex-1 overflow-auto rounded-lg"
      >
        <Document
          file={file}
          onLoadSuccess={onDocLoaded}
          loading={
            <div
              style={{ color: 'rgb(var(--text-muted))' }}
              className="flex h-32 items-center justify-center text-sm"
            >
              Chargement du PDF…
            </div>
          }
          error={
            <div className="flex h-32 items-center justify-center text-sm text-red-500">
              Impossible de lire le PDF.
            </div>
          }
        >
          <Page
            pageNumber={page}
            width={480}
            customTextRenderer={customTextRenderer}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              backgroundColor: 'rgb(var(--bg-subtle))',
              border: '1px solid rgb(var(--border))',
              color: 'rgb(var(--text))',
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ color: 'rgb(var(--text-muted))' }} className="text-xs">
            {page} / {numPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page === numPages}
            style={{
              backgroundColor: 'rgb(var(--bg-subtle))',
              border: '1px solid rgb(var(--border))',
              color: 'rgb(var(--text))',
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
