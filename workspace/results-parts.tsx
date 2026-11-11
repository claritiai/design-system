'use client';

/**
 * The parts a calculation's Results tab is built from, as the first calculation view drew them: the selected size on top (what
 * it is, its marks, how hard it works, its items as chips, why it does not pass), then two tabs: the other options that
 * pass, by family, and the requirements the engineer ticks group by group, with the conditions of the selected size.
 * Layout only: the family passes every word, value and tick, and keeps its own rules.
 */
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';
import { Badge } from './badge';
import { UtilizationBar } from './utilization-bar';

/** A mark beside a size: the proposed one (pass) or the lightest of a family. */
export function ResultMark({ children, tone }: { children: ReactNode; tone?: 'pass' }) {
  return <Badge variant={tone === 'pass' ? 'success' : 'secondary'} className="border-transparent px-1.5 py-px text-[9.5px]">{children}</Badge>;
}

/** Why the selected size is not a result yet: a fact still to state (`input`) or a size that does not pass (`fail`). */
export function ResultVerdict({ tone, children }: { tone: 'input' | 'fail'; children: ReactNode }) {
  return tone === 'input'
    ? <Badge variant="outline" className="border-transparent bg-assumed-bg text-[10.5px] text-assumed">{children}</Badge>
    : <Badge variant="destructive" className="border-transparent text-[10.5px]">{children}</Badge>;
}

/** Utilisation as a bar, coloured by whether the size passes: a high one is the lightest size working, not a warning. */
export function ResultBar({ value, className }: { value: number | null; className?: string }) {
  return <UtilizationBar className={cn('flex-1', className)} utilization={(value ?? 0) * 100} verdict={(value ?? 0) > 1 ? 'fail' : 'pass'} />;
}

export interface ResultCardProps {
  /** Over the size: its family, or the check's name while there is no size. */
  eyebrow: string;
  /** The size, or a dash. */
  title: string;
  /** Beside the size (ResultMark). */
  marks?: ReactNode;
  /** At the end of the size's line (ResultVerdict); nothing for a size that passes. */
  verdict?: ReactNode;
  /** The governing utilisation; undefined when the card has none to show (then `empty` says why). */
  utilisation?: number | null;
  /** Right of the utilisation: the load against the resistance, in the family's words. */
  detail?: ReactNode;
  /** Under the bar: a line about the arrangement (how many items carry load, say). */
  note?: ReactNode;
  /** In place of the utilisation when there is none: the question to answer first. */
  empty?: ReactNode;
  /** After the bar: the items as chips (ResultChips), the reasons and warnings (ResultMessages). */
  children?: ReactNode;
  testId?: string;
}

/** The selected size: what it is, whether it works and how hard it works. */
export function ResultCard({ eyebrow, title, marks, verdict, utilisation, detail, note, empty, children, testId = 'results-selected' }: ResultCardProps) {
  return (
    <section className="px-3 pb-3 pt-3" data-testid={testId}>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[17px] font-semibold text-foreground">{title}</span>
          {marks}
          <span className="ml-auto">{verdict}</span>
        </div>
        {utilisation !== undefined ? (
          <>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-[22px] font-semibold leading-none text-foreground">{utilisation !== null ? utilisation.toFixed(2) : '—'}</span>
              <span className="text-[11px] text-muted-foreground">utilisation</span>
              {detail !== undefined && <span className="ml-auto text-[11px] text-muted-foreground">{detail}</span>}
            </div>
            <div className="mt-1.5 flex"><ResultBar value={utilisation} /></div>
            {note && <div className="mt-1.5 text-[11px] text-muted-foreground">{note}</div>}
          </>
        ) : empty && <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{empty}</p>}
        {children}
      </div>
    </section>
  );
}

/** One item of the selected size (one of the products in a layout): its zone's colour, its name and its utilisation. */
export interface ResultChip { label: string; colour?: string; value?: number | null }

/** The selected size's items as chips; picking one selects it in the view too. */
export function ResultChips({ chips, selected, onSelect }: { chips: readonly ResultChip[]; selected: number | null; onSelect: (index: number | null) => void }) {
  if (!chips.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.map(({ label, colour, value }, i) => (
        <button key={i} type="button" onClick={() => onSelect(selected === i ? null : i)} aria-pressed={selected === i}
          className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]',
            selected === i ? 'border-foreground/60 bg-muted text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: colour ?? 'var(--border)' }} />
          {label}{value != null && <span className="font-mono">{value.toFixed(2)}</span>}
        </button>
      ))}
    </div>
  );
}

/** Why the selected size does not pass (✕) and what to watch (!), in the family's words. */
export function ResultMessages({ blockers = [], warnings = [] }: { blockers?: readonly string[]; warnings?: readonly string[] }) {
  if (!blockers.length && !warnings.length) return null;
  return (
    <div className="mt-2 space-y-1 text-[11px] leading-snug">
      {blockers.map(text => <div key={text} className="text-destructive">✕ {text}</div>)}
      {warnings.map(text => <div key={text} className="text-assumed">! {text}</div>)}
    </div>
  );
}

/** The tabs under the selected size. */
export function ResultsSubTabs<T extends string>({ tabs, value, onChange }: { tabs: readonly { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="flex gap-1 border-b border-border/40 px-3" role="tablist">
      {tabs.map(({ id, label }) => (
        <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}
          className={cn('-mb-px border-b-2 px-2 py-1.5 text-[11.5px] font-medium', value === id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** One option in a family: its name, its mark and its utilisation. */
export interface ResultOption { key: string; label: string; mark?: ReactNode; utilisation: number | null; selected?: boolean }
export interface ResultOptionGroup { id: string; name: string; options: readonly ResultOption[] }

/** The options that pass, by family, each with its utilisation; picking one shows it as the selected size. */
export function ResultOptions({ groups, readOnly, onPick, footer, labelClassName = 'w-24 shrink-0', testId = 'results-options' }: {
  groups: readonly ResultOptionGroup[]; readOnly?: boolean; onPick: (key: string) => void;
  /** The name column's width (a family with longer codes widens it). */
  labelClassName?: string;
  /** Under the list: how many do not pass, the empty case, a way back to the proposal. */
  footer?: ReactNode; testId?: string;
}) {
  return (
    <section className="space-y-2 px-3 py-3 text-[12px]" data-testid={testId}>
      {groups.map(group => (
        <div key={group.id}>
          <div className="px-1.5 pb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{group.name}</div>
          {group.options.map(option => (
            <button key={option.key} type="button" disabled={readOnly} aria-pressed={!!option.selected} onClick={() => onPick(option.key)}
              className={cn('flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left hover:bg-muted disabled:cursor-default', option.selected && 'bg-muted font-medium')}>
              <span className={labelClassName}>{option.label}</span>
              <span className="w-[62px] shrink-0">{option.mark}</span>
              <ResultBar value={option.utilisation} />
              <span className="w-10 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{option.utilisation?.toFixed(2) ?? '—'}</span>
            </button>
          ))}
        </div>
      ))}
      {footer}
    </section>
  );
}

/** A line under the options (how many do not pass, none passes). */
export function ResultNote({ children }: { children: ReactNode }) {
  return <p className="px-1.5 text-[10.5px] text-muted-foreground">{children}</p>;
}

/** One group of requirements to tick, each item "label · detail". */
export interface RequirementGroup { id: string; label: string; items: readonly { id: string; label: string; detail: string }[] }

/** The requirements the engineer ticks, group by group; a group not ticked yet wears the required star. */
export function RequirementGroups({ hint, groups, ticked, readOnly, onToggle, children, testId = 'results-requirements' }: {
  hint?: string; groups: readonly RequirementGroup[]; ticked: readonly string[]; readOnly?: boolean;
  onToggle: (id: string, ticked: boolean) => void;
  /** After the groups: the conditions of the selected size (ResultConditions), what is not covered, its model. */
  children?: ReactNode; testId?: string;
}) {
  return (
    <section className="px-3 py-2 text-[11.5px]" data-testid={testId}>
      {hint && <p className="pb-2 text-[11px] text-muted-foreground">{hint}</p>}
      {groups.map(group => (
        <div key={group.id} className="border-b border-border/40 py-2 last:border-0">
          <label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" className="mt-0.5" checked={ticked.includes(group.id)} disabled={readOnly}
              onChange={event => onToggle(group.id, event.target.checked)} />
            <span className="font-medium text-foreground/90">{group.label}{!ticked.includes(group.id) && <span className="text-destructive"> *</span>}</span>
          </label>
          {group.items.length > 0 && (
            <ul className="mt-1 space-y-0.5 pl-6 text-[11px] text-muted-foreground">
              {group.items.map(item => <li key={item.id}><span className="text-foreground/80">{item.label}</span> · {item.detail}</li>)}
            </ul>
          )}
        </div>
      ))}
      {children}
    </section>
  );
}

/** The selected size's conditions as label and detail rows, under a title. */
export function ResultConditions({ title, rows }: { title: string; rows: readonly { label: string; detail: string }[] }) {
  if (!rows.length) return null;
  return (
    <div className="py-2">
      <div className="pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {rows.map(row => <div key={row.label} className="flex gap-3 py-0.5"><span className="w-28 shrink-0 text-muted-foreground">{row.label}</span><span>{row.detail}</span></div>)}
    </div>
  );
}
