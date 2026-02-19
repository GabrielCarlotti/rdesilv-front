import { Sun, Moon, FileSearch, Calculator } from 'lucide-react';

type Tab = 'analyse' | 'licenciement';

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'analyse', label: 'Analyse fiche de paie', icon: FileSearch },
  { id: 'licenciement', label: 'Calcul licenciement', icon: Calculator },
];

export function Header({ theme, onToggle, activeTab, onTabChange }: Props) {
  return (
    <header
      style={{
        backgroundColor: 'rgb(var(--bg-surface))',
        borderBottom: '1px solid rgb(var(--border))',
      }}
      className="sticky top-0 z-50 flex items-center gap-6 px-6"
    >
      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2.5 py-3">
        <span
          style={{ backgroundColor: 'rgb(var(--accent))' }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold tracking-widest"
        >
          C
        </span>
        <span style={{ color: 'rgb(var(--text))' }} className="text-sm font-semibold tracking-widest">
          CEGI
        </span>
      </div>

      {/* Onglets */}
      <nav className="flex flex-1 items-end gap-0 self-stretch">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                color: active ? 'rgb(var(--text))' : 'rgb(var(--text-muted))',
                borderBottom: active
                  ? '2px solid rgb(var(--accent))'
                  : '2px solid transparent',
              }}
              className="flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors hover:text-[rgb(var(--text))]"
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={onToggle}
        style={{
          backgroundColor: 'rgb(var(--bg-subtle))',
          border: '1px solid rgb(var(--border))',
          color: 'rgb(var(--text-muted))',
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:opacity-80"
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </header>
  );
}
