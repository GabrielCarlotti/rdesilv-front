import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import type { CheckReport, CheckResult } from '../types/api';

/* ── Accordion primitif ── */
function Accordion({
  open,
  onToggle,
  header,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 text-left"
      >
        <ChevronRight
          size={12}
          style={{ color: 'rgb(var(--text-muted))' }}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        {header}
      </button>
      {open && <div className="mt-1.5 space-y-1.5 pl-4">{children}</div>}
    </div>
  );
}

/* ── Carte d'une vérification individuelle ── */
function CheckItem({ item }: { item: CheckResult }) {
  return (
    <div
      style={{
        backgroundColor: item.valid ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${item.valid ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.22)'}`,
      }}
      className="rounded-md p-2.5 text-xs"
    >
      <div className="flex items-center gap-1.5" style={{ color: 'rgb(var(--text))' }}>
        {item.valid ? (
          <CheckCircle size={11} style={{ color: 'rgb(var(--success))' }} className="shrink-0" />
        ) : (
          <XCircle size={11} style={{ color: 'rgb(var(--error))' }} className="shrink-0" />
        )}
        {item.line_number && (
          <span
            style={{ backgroundColor: 'rgba(var(--accent),0.12)', color: 'rgb(var(--accent))' }}
            className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
          >
            Ligne {item.line_number}
          </span>
        )}
      </div>

      {!item.valid && (item.obtained_value !== null || item.expected_value !== null) && (
        <div
          className="mt-1.5 grid grid-cols-3 gap-1 text-[10px]"
          style={{ color: 'rgb(var(--text-muted))' }}
        >
          {item.obtained_value !== null && (
            <div>
              <div className="font-medium" style={{ color: 'rgb(var(--text))' }}>Obtenu</div>
              <div>{item.obtained_value}</div>
            </div>
          )}
          {item.expected_value !== null && (
            <div>
              <div className="font-medium" style={{ color: 'rgb(var(--text))' }}>Attendu</div>
              <div>{item.expected_value}</div>
            </div>
          )}
          {item.difference !== null && (
            <div>
              <div className="font-medium" style={{ color: 'rgb(var(--text))' }}>Écart</div>
              <div style={{ color: 'rgb(var(--error))' }}>{item.difference}</div>
            </div>
          )}
        </div>
      )}

      <p className="mt-1.5 leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>
        {item.message}
      </p>
    </div>
  );
}

/* ── Groupe par test_name ── */
function TestGroup({
  testName,
  items,
  isError,
}: {
  testName: string;
  items: CheckResult[];
  isError: boolean;
}) {
  const [open, setOpen] = useState(true);
  const failCount = items.filter((i) => !i.valid).length;

  return (
    <Accordion
      open={open}
      onToggle={() => setOpen((o) => !o)}
      header={
        <div className="flex flex-1 items-center gap-2 py-0.5">
          <span
            style={{ color: 'rgb(var(--text))' }}
            className="text-xs font-semibold uppercase tracking-wide"
          >
            {testName}
          </span>
          {isError ? (
            <span
              style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: 'rgb(var(--error))' }}
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
            >
              {failCount} erreur{failCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span
              style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: 'rgb(var(--success))' }}
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
            >
              OK
            </span>
          )}
        </div>
      }
    >
      {items.map((item, i) => (
        <CheckItem key={i} item={item} />
      ))}
    </Accordion>
  );
}

/* ── Section principale (Erreurs / Réussies) ── */
function Section({
  label,
  count,
  icon,
  color,
  defaultOpen,
  children,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        backgroundColor: 'rgb(var(--bg-surface))',
        border: '1px solid rgb(var(--border))',
      }}
      className="rounded-lg overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        style={{ backgroundColor: 'rgb(var(--bg-subtle))' }}
      >
        <ChevronRight
          size={13}
          style={{ color: 'rgb(var(--text-muted))' }}
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        {icon}
        <span style={{ color: 'rgb(var(--text))' }} className="text-xs font-semibold">
          {label}
        </span>
        <span
          style={{ backgroundColor: color + '22', color }}
          className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold"
        >
          {count}
        </span>
      </button>

      {open && (
        <div className="space-y-2 p-3">
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Composant principal ── */
export function ErrorPanel({ report }: { report: CheckReport }) {
  // Grouper par test_name
  const groups = report.checks.reduce<Record<string, CheckResult[]>>((acc, c) => {
    (acc[c.test_name] ??= []).push(c);
    return acc;
  }, {});

  const errorGroups = Object.entries(groups).filter(([, items]) => items.some((i) => !i.valid));
  const validGroups = Object.entries(groups).filter(([, items]) => items.every((i) => i.valid));

  const errorColor = 'rgb(var(--error))';
  const successColor = 'rgb(var(--success))';

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Barre de résumé */}
      <div
        style={{
          backgroundColor: 'rgb(var(--bg-surface))',
          border: '1px solid rgb(var(--border))',
        }}
        className="flex shrink-0 items-center gap-4 rounded-lg px-4 py-2.5 text-xs"
      >
        <div className="flex items-center gap-1.5">
          <span style={{ color: 'rgb(var(--text-muted))' }}>Total</span>
          <span style={{ color: 'rgb(var(--text))' }} className="font-semibold">{report.total_checks}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={11} style={{ color: successColor }} />
          <span style={{ color: successColor }} className="font-semibold">{report.passed_checks}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle size={11} style={{ color: errorColor }} />
          <span style={{ color: errorColor }} className="font-semibold">{report.failed_checks}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {report.all_valid ? (
            <>
              <CheckCircle size={11} style={{ color: successColor }} />
              <span style={{ color: successColor }} className="font-medium">Valide</span>
            </>
          ) : (
            <>
              <AlertCircle size={11} style={{ color: errorColor }} />
              <span style={{ color: errorColor }} className="font-medium">Erreurs détectées</span>
            </>
          )}
        </div>
      </div>

      {/* Listes dépliables */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
        {errorGroups.length > 0 && (
          <Section
            label="Erreurs"
            count={report.failed_checks}
            icon={<XCircle size={13} style={{ color: errorColor }} />}
            color="rgb(var(--error))"
            defaultOpen={true}
          >
            {errorGroups.map(([testName, items]) => (
              <TestGroup key={testName} testName={testName} items={items} isError={true} />
            ))}
          </Section>
        )}

        {validGroups.length > 0 && (
          <Section
            label="Vérifications réussies"
            count={report.passed_checks}
            icon={<CheckCircle size={13} style={{ color: successColor }} />}
            color="rgb(var(--success))"
            defaultOpen={false}
          >
            {validGroups.map(([testName, items]) => (
              <TestGroup key={testName} testName={testName} items={items} isError={false} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
