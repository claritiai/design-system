'use client';
// The frame of a design workspace: the 3D view in the middle and, on the right, a pane with a Parameters tab and a
// Results tab. The pane has a handle on its header that hides it and, while it is hidden, a chip on the viewer's edge
// that brings it back, with a count when the app gives one. Hidden, the pane stays mounted, so a form keeps its state
// and both tabs keep theirs across a switch. While the pane is open a strip of stats can sit under the viewer; while it
// is hidden a pill over the viewer can carry a summary and the action that runs the check, so the page is never without
// one. Below the md width the open pane covers the viewer, and a window that narrows to it closes the pane.
//
// The frame knows nothing about the app around it: the app may put its header row above the body (`header`), dock a
// panel left of the viewer in the same row (`leftDock`, a chat say), and add its dialogs after the body (`children`).
// Without any of them it is the viewer and its pane alone. The app owns whether the pane is open and which tab shows;
// `useWorkspacePane` keeps the open state in the browser's storage.
import { PanelRightClose, Pencil } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../shell/cn';

export type WorkspaceTab = 'parameters' | 'results';

const NARROW = '(max-width: 767px)';

/** Whether the pane was left open under `key`; open when nothing was kept, or the storage cannot be read. */
export function readPaneOpen(key: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

/** Keeps whether the pane is open under `key`. Storage that cannot be written leaves the choice to this page. */
export function persistPaneOpen(key: string, open: boolean): void {
  try {
    window.localStorage.setItem(key, String(open));
  } catch {
    /* private mode and the like: the choice lasts this page */
  }
}

/**
 * Whether the right pane is open, and the call that opens or closes it and keeps the choice under `storageKey`. The
 * first view reads the kept choice (open when there is none), unless `initial` sets it: true opens the pane and false
 * closes it, without reading what was kept.
 */
export function useWorkspacePane(storageKey: string, initial?: boolean): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(initial ?? true);
  useEffect(() => {
    if (initial !== undefined) return;
    setOpen(readPaneOpen(storageKey));
  }, [initial, storageKey]);
  const change = useCallback((next: boolean) => {
    setOpen(next);
    persistPaneOpen(storageKey, next);
  }, [storageKey]);
  return [open, change];
}

export interface WorkspaceFrameProps {
  /** Above the body, across the frame: the app's header row and anything under it (a banner, say). */
  header?: ReactNode;
  /** Fills its container instead of the window's height. */
  embedded?: boolean;
  /** Left of the viewer, in the same row: a panel the app docks there (its chat, say). */
  leftDock?: ReactNode;
  /** The centre: the 3D view and whatever the page draws over it. */
  viewer: ReactNode;
  /** Nothing to show yet: the viewer and the pane stay mounted but hidden, and the left dock has the row. */
  empty?: boolean;
  /** Whether the right pane shows. */
  paneOpen: boolean;
  /** From the pane's hide handle, the edge chip, and a window that narrows below md. */
  onPaneOpenChange: (open: boolean) => void;
  tab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  parameters: ReactNode;
  results: ReactNode;
  /** Beside the Results tab's label (ResultsTabBadge). */
  resultsBadge?: ReactNode;
  /** A count on the edge chip that brings the pane back (values to review, say); none at zero. */
  paneBadgeCount?: number;
  /** Under the viewer while the pane is open (ViewerStatStrip). */
  statStrip?: ReactNode;
  /** In the pill over the viewer while the pane is hidden: a summary of the result. */
  dockedSummary?: ReactNode;
  /** In the same pill: the action that runs the check. */
  dockedAction?: ReactNode;
  /** After the body, inside the frame: the app's dialogs. */
  children?: ReactNode;
}

export function WorkspaceFrame({
  header,
  embedded,
  leftDock,
  viewer,
  empty,
  paneOpen,
  onPaneOpenChange,
  tab,
  onTabChange,
  parameters,
  results,
  resultsBadge,
  paneBadgeCount = 0,
  statStrip,
  dockedSummary,
  dockedAction,
  children,
}: WorkspaceFrameProps) {
  const change = useRef(onPaneOpenChange);
  change.current = onPaneOpenChange;
  useEffect(() => {
    if (empty) return;
    const narrow = window.matchMedia(NARROW);
    const update = () => {
      if (narrow.matches) change.current(false);
    };
    update();
    narrow.addEventListener('change', update);
    return () => narrow.removeEventListener('change', update);
  }, [empty]);

  return (
    <div className={cn('flex flex-col bg-background overflow-hidden', embedded ? 'h-full' : 'h-dvh')}>
      {header}

      <div className="relative flex-1 flex min-h-0">
        {leftDock}

        {/* Centre: the viewer */}
        <div className="flex-1 min-w-0 flex flex-col relative"
          style={empty ? { display: 'none' } : undefined}>
          <div className="flex-1 relative min-h-0 overflow-hidden bg-card">
            {viewer}

            {/* The edge chip that brings the pane back */}
            {!paneOpen && (
              <button
                onClick={() => onPaneOpenChange(true)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1.5 bg-card border border-border rounded-full px-3.5 py-2 shadow-raised hover:bg-muted/60 transition-colors"
                data-testid="reopen-params-chip"
                title="Show parameters"
              >
                <Pencil className="w-3 h-3 text-foreground" />
                <span className="text-xs font-medium text-foreground">Parameters</span>
                {paneBadgeCount > 0 && (
                  <span className="text-[9px] font-semibold text-assumed bg-assumed-bg rounded-full px-1.5 py-px font-mono" data-testid="params-assumed-badge">
                    {paneBadgeCount}
                  </span>
                )}
              </button>
            )}

            {/* The pill over the viewer while the pane is hidden */}
            {!paneOpen && (dockedSummary || dockedAction) && (
              <div
                // bottom-16 clears the viewer's own bottom-left toolbar pill
                className="absolute left-1/2 bottom-16 -translate-x-1/2 z-20 flex items-center gap-3.5 bg-card border border-border/80 rounded-surface py-2 pl-4 pr-2 shadow-overlay"
                data-testid="docked-run-pill"
              >
                {dockedSummary}
                {dockedSummary && dockedAction && <span className="w-px h-5 bg-border" />}
                {dockedAction}
              </div>
            )}
          </div>

          {/* The stats under the viewer, while the pane is open */}
          {paneOpen && statStrip && (
            <div className="shrink-0 mt-2">
              {statStrip}
            </div>
          )}
        </div>

        {/* The right pane: Parameters | Results, mounted while hidden */}
        <div
          className={cn('relative w-[380px] shrink-0 flex-col min-h-0', !empty && 'max-md:absolute max-md:inset-0 max-md:z-30 max-md:!w-full')}
          style={{ display: paneOpen && !empty ? 'flex' : 'none' }}
          data-testid="right-pane"
        >
          <div className="flex-1 flex flex-col min-h-0 bg-card border-l border-border/50 overflow-hidden">
            {/* The tabs and the handle that hides the pane */}
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 border-b border-border/50">
              <span className="inline-flex bg-muted rounded-control p-0.5 flex-1">
                {(['parameters', 'results'] as const).map((id) => (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    data-testid={`right-tab-${id}`}
                    aria-pressed={tab === id}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-tight transition-colors',
                      tab === id
                        ? 'text-foreground bg-card shadow-hairline'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {id === 'parameters' ? 'Parameters' : 'Results'}
                    {id === 'results' && resultsBadge}
                  </button>
                ))}
              </span>
              <button
                onClick={() => onPaneOpenChange(false)}
                className="p-1 rounded-tight text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                title="Hide parameters"
                aria-label="Hide parameters"
                data-testid="collapse-params"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Both tabs stay mounted: the form keeps its state across a switch */}
            <div className="flex-1 min-h-0 flex-col" style={{ display: tab === 'parameters' ? 'flex' : 'none' }}>
              {parameters}
            </div>
            <div className="flex-1 min-h-0 flex-col" style={{ display: tab === 'results' ? 'flex' : 'none' }}>
              {results}
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
