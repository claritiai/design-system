// The top of a pane that describes one thing (a model, a document): a small line above its name (where it is), the
// name, a quiet line under it (where it comes from), then whatever the app adds (its facts, say).
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';

export function PaneHeader({ eyebrow, title, detail, children, className }: {
  eyebrow?: ReactNode; title: ReactNode; detail?: ReactNode; children?: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1 border-b border-border/50 px-3 py-3', className)}>
      {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</div> : null}
      <h1 className="m-0 text-[17px] font-semibold leading-snug text-foreground [text-wrap:balance]">{title}</h1>
      {detail ? <div className="text-[12px] text-muted-foreground">{detail}</div> : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
