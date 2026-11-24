// One record in a list (a file, a model, a run): its name, a quiet line under it, small facts after that, and its
// actions on the right. The app may add what is under way under the facts (a Progress, an error line).
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';

export function RecordRow({ title, detail, facts = [], actions, children, failed, className }: {
  title: ReactNode;
  detail?: ReactNode;
  facts?: readonly ReactNode[];
  actions?: ReactNode;
  children?: ReactNode;
  /** Something about it went wrong: the row's edge in the destructive tone. */
  failed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 items-center gap-3 rounded-surface border bg-card px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]',
      failed ? 'border-destructive/50' : 'border-border', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="text-[14px] font-semibold text-foreground [overflow-wrap:anywhere]">{title}</div>
        {detail ? <div className="font-mono text-[11.5px] text-muted-foreground [overflow-wrap:anywhere]">{detail}</div> : null}
        {facts.length ? (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-muted-foreground">
            {facts.map((f, i) => <span key={i}>{f}</span>)}
          </div>
        ) : null}
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  );
}
