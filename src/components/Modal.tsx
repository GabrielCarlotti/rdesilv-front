import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ title, onClose, children, width = 500 }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-surface))',
          border: '1px solid rgb(var(--border))',
          width: '100%',
          maxWidth: width,
          maxHeight: '80vh',
        }}
        className="flex flex-col rounded-xl shadow-2xl"
      >
        <div
          style={{ borderBottom: '1px solid rgb(var(--border))' }}
          className="flex shrink-0 items-center justify-between px-5 py-3"
        >
          <span style={{ color: 'rgb(var(--text))' }} className="text-sm font-semibold">
            {title}
          </span>
          <button
            onClick={onClose}
            style={{ color: 'rgb(var(--text-muted))' }}
            className="rounded hover:opacity-70"
          >
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 text-sm leading-relaxed" style={{ color: 'rgb(var(--text))' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
