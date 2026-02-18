import { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface Props {
  file: File | null;
  onChange: (f: File | null) => void;
  disabled?: boolean;
}

export function FileUpload({ file, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handle = (f: File | null) => {
    if (f && f.type === 'application/pdf') onChange(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0] ?? null); }}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${drag ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
        backgroundColor: drag ? 'rgba(var(--accent), 0.05)' : 'rgb(var(--bg-subtle))',
        cursor: disabled ? 'default' : 'pointer',
      }}
      className="flex flex-col items-center justify-center gap-2 rounded-lg p-5 text-center transition-colors"
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => handle(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center gap-2">
          <FileText size={16} style={{ color: 'rgb(var(--accent))' }} />
          <span style={{ color: 'rgb(var(--text))' }} className="max-w-xs truncate text-sm font-medium">
            {file.name}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            style={{ color: 'rgb(var(--text-muted))' }}
            className="ml-1 rounded hover:opacity-70"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <Upload size={20} style={{ color: 'rgb(var(--text-muted))' }} />
          <span style={{ color: 'rgb(var(--text-muted))' }} className="text-sm">
            Déposer un PDF ou cliquer pour sélectionner
          </span>
        </>
      )}
    </div>
  );
}
