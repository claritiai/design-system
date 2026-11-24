'use client';
// What a 3D view draws over itself, outside the scene: the cover while a model loads, the line of a state the view is in
// with the action that leaves it (an isolated part, hidden elements), the quiet line of how to move around, the outline
// while a file is dragged over the view, and a card in the middle of it for a question about a dropped file.
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';
import { Progress } from './progress';

/** The cover over the view while it loads: a progress bar and what is happening, or why it stopped. */
export function ViewerLoading({ message, value, failed }: { message: ReactNode; value?: number; failed?: boolean }) {
  return (
    <div role="status" className="absolute inset-0 z-30 grid place-content-center gap-3 bg-card text-center">
      <Progress value={value} failed={failed} className="w-72" />
      <p className={cn('m-0 font-mono text-[12px]', failed ? 'text-destructive' : 'text-muted-foreground')}>{message}</p>
    </div>
  );
}

/** Top left over the view: the states it is in, one line each (ViewerState). */
export function ViewerStates({ children }: { children: ReactNode }) {
  return <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-col items-start gap-1.5">{children}</div>;
}

/** One state of the view and the action that leaves it: "Wall (L00): 24 parts" and Show all, say. */
export function ViewerState({ children, action, onAction }: { children: ReactNode; action: string; onAction: () => void }) {
  return (
    <div role="status" className="flex items-center gap-2.5 rounded-control border border-border bg-card/95 py-1 pl-3 pr-1 text-[12.5px] text-foreground shadow-raised">
      <span className="min-w-0">{children}</span>
      <button type="button" onClick={onAction}
        className="rounded-tight px-2 py-1 text-[12px] font-medium text-foreground hover:bg-muted">{action}</button>
    </div>
  );
}

/** Bottom right over the view: how to move around and the keys, quiet, never in the way of a click. */
export function ViewerHint({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-10 max-w-[60%] rounded-tight bg-card/85 px-2 py-1 text-right text-[11.5px] text-muted-foreground max-md:hidden">
      {children}
    </div>
  );
}

/** The outline round the view while a file is dragged over it. */
export function ViewerDropTarget() {
  return <div aria-hidden className="pointer-events-none absolute inset-2 z-20 rounded-surface border-2 border-dashed border-foreground/50" />;
}

/** A card in the middle of the view, over a scrim: a question the view asks (what to do with a dropped file, say). */
export function ViewerDialog({ title, children, actions, className }: { title: ReactNode; children?: ReactNode; actions: ReactNode; className?: string }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-scrim p-4">
      <div role="dialog" aria-modal="true" className={cn('flex w-full max-w-[460px] flex-col gap-3 rounded-surface border border-border bg-card p-5 shadow-overlay', className)}>
        <div className="text-[15px] font-semibold text-foreground">{title}</div>
        {children}
        <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
      </div>
    </div>
  );
}
