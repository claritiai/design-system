'use client';

/**
 * The Results tab of a design's right pane: every check grouped by action, the governing one flagged. A verdict strip
 * over the stats and the list (or none, read as one document), numerals in mono. The governing check is a status (the
 * one to check), so its row and chip are the warn amber; the brand accent never marks a status.
 */
import type { ReactNode } from 'react';
import { CircleCheckBig, AlertTriangle } from 'lucide-react';
import { cn } from '../shell/cn';
import type { ResultsStat } from './stat-strip';
import type { ResultsGroupsSummary } from './check-types';

function ratioPercent(ratio: number | undefined): string {
  if (ratio === undefined) return '—';
  return `${Math.round(ratio * 100)}%`;
}

function barColor(ratio: number | undefined, passed: boolean): string {
  if (!passed) return 'bg-status-fail';
  if (ratio !== undefined && ratio >= 0.7) return 'bg-status-warn';
  return 'bg-status-pass';
}

export type { ResultsStat };

export interface ResultsTabPanelProps {
  summary: ResultsGroupsSummary | null;
  /** Headline stats above the checks (weight, carbon, centres, deflection…). */
  stats?: ResultsStat[];
  /** e.g. "EN 1992-4", shown beside the pass count. */
  standardLabel?: string;
  /** A meta line, e.g. "v1 · run 12:41". */
  metaLabel?: string;
  /** Under the check list (an Export full report button, say). */
  footer?: ReactNode;
  /** The empty state's hint while there are no results. */
  emptyHint?: string;
  /** A strip above the stats (a notice that an assumption changed, say). */
  notice?: ReactNode;
  /** The verdict's own wording, for a check that is conditional or provisional. */
  summaryLabel?: ReactNode;
  summaryTone?: 'pass' | 'fail' | 'pending';
  /** Read as one document: no verdict strip (the stats and check rows carry the state), and
   *  the whole panel, footer included, scrolls as one instead of the check list under pinned stats. */
  asDocument?: boolean;
  /** Document mode only: an action held below the scrolling document, always in view. */
  pinnedAction?: ReactNode;
}

export function ResultsTabPanel({
  summary,
  stats,
  standardLabel,
  metaLabel,
  footer,
  emptyHint = 'Run the design to see verification checks',
  notice,
  summaryLabel,
  summaryTone,
  asDocument = false,
  pinnedAction,
}: ResultsTabPanelProps) {
  if (!summary) {
    return (
      <div className="flex-1 flex flex-col min-h-0" data-testid="results-tab-empty">
        {notice}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <span className="text-[12px] text-muted-foreground">{emptyHint}</span>
        </div>
      </div>
    );
  }

  const { groups, totalChecks, passedChecks, allPassed } = summary;

  const panel = (
    <div className={asDocument ? 'flex-1 min-h-0 overflow-y-auto' : 'flex-1 flex flex-col min-h-0'} data-testid="results-tab">
      {/* Verdict strip */}
      {!asDocument && <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-border/60">
        {(summaryTone ? summaryTone === 'pass' : allPassed) ? (
          <CircleCheckBig className="w-3.5 h-3.5 text-status-pass" />
        ) : (
          <AlertTriangle className={`w-3.5 h-3.5 ${summaryTone === 'pending' ? 'text-status-warn' : 'text-status-fail'}`} />
        )}
        <span className="text-[11.5px] text-foreground/80 flex-1">
          {summaryLabel ?? (allPassed
            ? <>All <span className="font-mono">{totalChecks}</span> checks pass{standardLabel ? ` · ${standardLabel}` : ''}</>
            : <><span className="font-mono">{totalChecks - passedChecks}</span> of <span className="font-mono">{totalChecks}</span> checks failing{standardLabel ? ` · ${standardLabel}` : ''}</>)}
        </span>
        {metaLabel && <span className="text-[10.5px] text-muted-foreground">{metaLabel}</span>}
      </div>}

      {notice}

      {/* Headline stats */}
      {stats && stats.length > 0 && (
        <div className="shrink-0 grid grid-cols-2 gap-px bg-border/40 border-b border-border/60" data-testid="results-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card px-3 py-2">
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              <div
                className={cn(
                  'font-mono text-[13.5px] leading-5',
                  stat.tone === 'fail' ? 'text-status-fail' : stat.tone === 'pass' ? 'text-status-pass' : 'text-foreground',
                )}
              >
                {stat.value}
                {stat.unit && <span className="text-[10.5px] text-muted-foreground ml-0.5">{stat.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grouped checks */}
      <div className={asDocument ? 'px-3 pb-2' : 'flex-1 overflow-y-auto px-3 pb-2'} data-testid="results-scroll-area">
        {groups.map((group) => (
          <div key={group.label} data-testid={`results-group-${group.label}`}>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-[.04em] uppercase pt-2.5 pb-1">
              {group.label}
            </div>
            {group.checks.map((check) => (
              <div
                key={check.id}
                data-testid={`results-check-${check.id}`}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-[7px]',
                  check.governing
                    ? 'bg-assumed-bg border border-assumed-border rounded-tight mb-1'
                    : 'border-b border-border/40 last:border-b-0',
                  check.skipped && 'opacity-50',
                )}
              >
                <span className={cn('text-[11.5px] flex-1 min-w-0 truncate', check.governing ? 'text-foreground font-medium' : 'text-foreground/80')} title={check.name}>
                  {check.name}
                  {check.governing && (
                    <span className="ml-1.5 text-[9px] font-semibold text-status-warn border border-status-warn-border rounded-tight px-[5px] py-px align-middle" data-testid="governing-flag">
                      governing
                    </span>
                  )}
                  {check.skipped && (
                    <span className="ml-1.5 text-[9px] font-medium text-muted-foreground align-middle">skipped</span>
                  )}
                </span>
                {!check.skipped && (
                  <span className="w-[64px] h-1 rounded-full bg-muted overflow-hidden shrink-0">
                    <span
                      className={cn('block h-full rounded-full', barColor(check.ratio, check.passed))}
                      style={{ width: `${Math.min(100, Math.max(0, Math.round((check.ratio ?? 0) * 100)))}%` }}
                    />
                  </span>
                )}
                <span className={cn('text-[11.5px] font-mono font-semibold w-9 text-right shrink-0', check.passed ? 'text-foreground' : 'text-status-fail')}>
                  {check.skipped ? '—' : ratioPercent(check.ratio)}
                </span>
              </div>
            ))}
          </div>
        ))}
        {asDocument && footer && <div className="pt-3 border-t border-border/60">{footer}</div>}
      </div>

      {!asDocument && footer && (
        <div className="shrink-0 px-3 py-2 border-t border-border/60">
          {footer}
        </div>
      )}
    </div>
  );
  if (!asDocument || !pinnedAction) return panel;
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {panel}
      <div className="shrink-0 px-3 py-2 border-t border-border/60" data-testid="results-pinned-action">
        {pinnedAction}
      </div>
    </div>
  );
}
