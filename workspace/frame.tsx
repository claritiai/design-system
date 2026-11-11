'use client';
// The frame of a design workspace: the 3D view in the middle and, on the right, a pane with a Parameters tab and a
// Results tab. The pane has a handle on its header that hides it and, while it is hidden, a chip on the viewer's edge
// that brings it back, with a count when the app gives one. Hidden, the pane stays mounted, so a form keeps its state
// and both tabs keep theirs across a switch. While the pane is open a strip of stats can sit under the viewer; while it
// is hidden a pill over the viewer can carry a summary and the action that runs the check, so the page is never without
// one. Below the md width the open pane covers the viewer, and a window that narrows to it closes the pane.
//
// Embedded with nothing docked left (a calculation beside a chat, say), the frame is a view on its own and follows its
// own width rather than the window's: narrower than 56rem, too narrow for the 3D beside the 380px pane, the pane goes
// under the viewer at the full width, the viewer keeps the upper 60%, and the stats under the viewer give way (they
// repeat the Results tab, which stays open). Anything else lays out by the window alone.
//
// The frame knows nothing about the app around it: the app may put its header row and a banner above the body
// (`header`, `banner`), dock panels left of the viewer in the same row (`leftDock`, a chat say), and add its dialogs
// after the body (`children`). Without any of them it is the viewer and its pane alone. The app owns whether the pane is open and which tab shows;
// `useWorkspacePane` keeps the open state in the browser's storage.
import { PanelBottomClose, PanelRightClose, Pencil } from 'lucide-react';
import { createElement, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../shell/cn';

export type WorkspaceTab = 'parameters' | 'results';

const NARROW = '(max-width: 767px)';

/**
 * A frame that follows its own width is the container the classes below ask about. Below 56rem the row stacks the pane
 * under the viewer, the stats give way and the handle's icon points down; from the md window up the pane takes the
 * lower 40%, and below md it covers the viewer as in any frame.
 */
const CONTAINER = '@container/workspace';
const STACKED = {
  row: '@max-4xl/workspace:flex-col',
  pane: '@max-4xl/workspace:w-full md:@max-4xl/workspace:h-[40%]',
  paneEdge: '@max-4xl/workspace:border-l-0 @max-4xl/workspace:border-t',
  stats: '@max-4xl/workspace:hidden',
  besideIcon: '@max-4xl/workspace:hidden',
  belowIcon: 'hidden @max-4xl/workspace:block',
} as const;

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
  /** Above the body, across the frame: the app's header row. */
  header?: ReactNode;
  /** Under the header, across the frame: a banner (an error, say). */
  banner?: ReactNode;
  /**
   * Fills its container instead of the window's height. With nothing docked left it also follows its container's width:
   * narrower than 56rem, the pane goes under the viewer and the stat strip gives way.
   */
  embedded?: boolean;
  /**
   * Left of the viewer, in the same row and in this order: what the app docks there (its chat panel, say), each with
   * its own key. They are the row's first children, as the viewer and the pane are its last.
   */
  leftDock?: readonly ReactNode[];
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
  banner,
  embedded,
  leftDock = [],
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
  // A view on its own, sized by its container: its layout follows the container's width (STACKED).
  const own = !!embedded && leftDock.length === 0;
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

  const centre = (
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
        <div className={cn('shrink-0 mt-2', own && STACKED.stats)}>
          {statStrip}
        </div>
      )}
    </div>
  );

  // The right pane: Parameters | Results, mounted while hidden.
  const pane = (
    <div
      className={cn('relative w-[380px] shrink-0 flex-col min-h-0', !empty && 'max-md:absolute max-md:inset-0 max-md:z-30 max-md:!w-full', own && STACKED.pane)}
      style={{ display: paneOpen && !empty ? 'flex' : 'none' }}
      data-testid="right-pane"
    >
      <div className={cn('flex-1 flex flex-col min-h-0 bg-card border-l border-border/50 overflow-hidden', own && STACKED.paneEdge)}>
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
            {own ? (
              <>
                <PanelRightClose className={cn('w-4 h-4', STACKED.besideIcon)} />
                <PanelBottomClose className={cn('w-4 h-4', STACKED.belowIcon)} />
              </>
            ) : <PanelRightClose className="w-4 h-4" />}
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
  );

  return (
    <div className={cn('flex flex-col bg-background overflow-hidden', embedded ? 'h-full' : 'h-dvh', own && CONTAINER)}>
      {header}
      {banner}
      {/* The row: what the app docks left, the viewer and the pane, siblings in one list. */}
      {createElement('div', { className: cn('relative flex-1 flex min-h-0', own && STACKED.row) }, ...leftDock, centre, pane)}
      {children}
    </div>
  );
}
