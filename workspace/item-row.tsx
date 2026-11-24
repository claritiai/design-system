// One item of a list that waits for an answer, which opens in place: a dot that says whether it is still open or
// answered, its title and a count on the right; open, the app's body under it.
import { cn } from '../shell/cn';
import type { ReactNode } from 'react';

export function ItemRow({ title, count, done, open, onToggle, children, className }: {
  title: ReactNode;
  count?: ReactNode;
  /** Answered: the dot is filled in the pass tone; open, in the warn tone. */
  done?: boolean;
  open?: boolean;
  onToggle: () => void;
  /** Shown while open. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div data-state={open ? 'open' : 'closed'} className={cn('rounded-control', open && 'bg-muted/50', className)}>
      <button type="button" aria-expanded={open} onClick={onToggle}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2 rounded-control px-2 py-1.5 text-left text-[12.5px] text-foreground hover:bg-muted/60">
        <span aria-hidden title={done ? 'answered' : 'open'}
          className={cn('size-2 self-center rounded-full', done ? 'bg-status-pass' : 'bg-status-warn')} />
        <span className="min-w-0">{title}</span>
        <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">{count}</span>
      </button>
      {open && children ? <div className="flex flex-col gap-2.5 px-2 pb-3 pt-1 text-[12.5px]">{children}</div> : null}
    </div>
  );
}
