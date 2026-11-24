// A note in a pane: neutral (the note roles, never a colour of its own), with the action it leads to under it, such
// as "Rebuild now" after answers were saved.
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';

export function Notice({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-start gap-2 rounded-control border border-note-border bg-note-bg px-2.5 py-2 text-[12px] text-note', className)}>
      <div>{children}</div>
      {action}
    </div>
  );
}
