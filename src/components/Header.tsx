import { Sun, Moon } from 'lucide-react';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function Header({ theme, onToggle }: Props) {
  return (
    <header
      style={{
        backgroundColor: 'rgb(var(--bg-surface))',
        borderBottom: '1px solid rgb(var(--border))',
      }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
    >
      <div className="flex items-center gap-3">
        <span
          style={{ backgroundColor: 'rgb(var(--accent))' }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold tracking-widest"
        >
          C
        </span>
        <span
          style={{ color: 'rgb(var(--text))' }}
          className="text-base font-semibold tracking-widest"
        >
          CEGI
        </span>
        <span
          style={{ color: 'rgb(var(--text-muted))' }}
          className="hidden text-xs sm:inline"
        >
          Vérificateur de fiches de paie
        </span>
      </div>

      <button
        onClick={onToggle}
        style={{
          backgroundColor: 'rgb(var(--bg-subtle))',
          border: '1px solid rgb(var(--border))',
          color: 'rgb(var(--text-muted))',
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-80"
        title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  );
}
