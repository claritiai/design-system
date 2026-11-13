/** The results summary and the Run control docked over the 3D view while the right pane is hidden. */
import { Loader2 } from 'lucide-react';

export interface DockedResultsSummaryValue {
  allPassed: boolean;
  governingRatio?: number;
  passedChecks: number;
  totalChecks: number;
}

export function DockedResultsSummary({
  summary,
}: {
  summary: DockedResultsSummaryValue | null | undefined;
}) {
  if (!summary) {
    return <span className="text-xs text-muted-foreground whitespace-nowrap">No results yet</span>;
  }

  const dotTone = summary.allPassed
    ? (summary.governingRatio ?? 0) >= 0.7 ? 'bg-status-warn' : 'bg-status-pass'
    : 'bg-status-fail';

  return (
    <>
      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/70 whitespace-nowrap">
        <span className={`w-[7px] h-[7px] rounded-full ${dotTone}`} />
        Governing{' '}
        <strong className="text-foreground font-mono">
          {summary.governingRatio !== undefined
            ? `${Math.round(summary.governingRatio * 100)}%`
            : '—'}
        </strong>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs text-foreground/70 whitespace-nowrap">
        Checks{' '}
        <strong className="text-foreground font-mono">
          {summary.passedChecks}/{summary.totalChecks}
        </strong>
      </span>
    </>
  );
}

export function DockedRunControl({
  label,
  busyLabel,
  onRun,
  busy,
  disabled,
}: {
  label: string;
  busyLabel?: string;
  onRun: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onRun}
      disabled={disabled || busy}
      className="inline-flex items-center gap-2 text-[13px] font-medium text-primary-foreground bg-primary rounded-control px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
    >
      {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {busy ? busyLabel ?? label : label}
    </button>
  );
}
