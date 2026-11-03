'use client';
// The side panel a Clariti app docks its chat in: open beside the page while the window is wide, collapsed below that
// width, and over the page when opened there. Crossing the width hands it back to the screen, so it collapses on the
// way down and opens again on the way up. It stays mounted while hidden, so a chat keeps streaming. It knows nothing
// about the chat: the app passes the panel's title, its header buttons and its body, and opens it from its own button
// (useChatPanel) or from the edge chip.
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';

type Wide = 'lg' | 'xl' | '2xl';
const WIDTH: Record<Wide, number> = { lg: 1024, xl: 1280, '2xl': 1536 };

// Written out per width so Tailwind finds every class. `open` null follows the screen; true and false are the
// person's choice until the window crosses the width.
const FOLLOW: Record<Wide, { panel: string; chip: string }> = {
  lg: { panel: 'hidden lg:flex', chip: 'inline-flex lg:hidden' },
  xl: { panel: 'hidden xl:flex', chip: 'inline-flex xl:hidden' },
  '2xl': { panel: 'hidden 2xl:flex', chip: 'inline-flex 2xl:hidden' },
};
const OVER: Record<Wide, { panel: string; scrim: string }> = {
  lg: { panel: 'absolute inset-y-0 z-30 shadow-overlay lg:static lg:z-auto lg:shadow-none', scrim: 'lg:hidden' },
  xl: { panel: 'absolute inset-y-0 z-30 shadow-overlay xl:static xl:z-auto xl:shadow-none', scrim: 'xl:hidden' },
  '2xl': { panel: 'absolute inset-y-0 z-30 shadow-overlay 2xl:static 2xl:z-auto 2xl:shadow-none', scrim: '2xl:hidden' },
};

type Panel = { shown: boolean; docked: boolean; open: boolean | null; dockAt: Wide; show: () => void; hide: () => void; toggle: () => void };
const PanelContext = createContext<Panel | null>(null);

/** Whether the panel shows and whether it is docked, and the calls an app's own button opens and closes it with. */
export function useChatPanel() {
  const panel = useContext(PanelContext);
  if (!panel) throw new Error('useChatPanel needs a ChatPanelProvider around it');
  return panel;
}

/**
 * Holds the panel's state for everything under it: the panel and the app's button that opens it. `dockAt` is the
 * Tailwind width from which the panel docks beside the page.
 */
export function ChatPanelProvider({ dockAt = 'xl', children }: { dockAt?: Wide; children: React.ReactNode }) {
  const query = `(min-width: ${WIDTH[dockAt]}px)`;
  const docked = useSyncExternalStore(
    (change) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', change);
      return () => media.removeEventListener('change', change);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
  const [open, setOpen] = useState<boolean | null>(null);
  const was = useRef(docked);
  useEffect(() => {
    if (was.current !== docked) { was.current = docked; setOpen(null); }
  }, [docked]);
  const shown = open ?? docked;
  const value: Panel = {
    shown, docked, open, dockAt,
    show: () => setOpen(true),
    hide: () => setOpen(false),
    toggle: () => setOpen(!shown),
  };
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
}

/**
 * The panel, on the `side` of a `relative flex` row that holds the page, named `label`. Its header has `icon`, `title`
 * (the chat open in it, say), the app's `actions` and the hide button. With `chip`, a hidden panel leaves a pill on the page's edge that opens it again,
 * `badge` beside its label (unread answers, say). Below the docking width the panel covers the page, a link clicked in
 * it or Escape closes it, and so does a click on the page around it.
 */
export function ChatPanel({ side = 'right', label, title, icon, actions, width = 400, hideLabel = 'Hide', chip, badge, children }: {
  side?: 'left' | 'right';
  label: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  width?: number;
  hideLabel?: string;
  chip?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { open, docked, dockAt, show, hide } = useChatPanel();
  const Hide = side === 'right' ? PanelRightClose : PanelLeftClose;
  const panel = open === null ? FOLLOW[dockAt].panel : open ? `flex ${OVER[dockAt].panel}` : 'hidden';
  const chipShows = open === null ? FOLLOW[dockAt].chip : open ? 'hidden' : 'inline-flex';
  return (
    <>
      {open ? <div aria-hidden onClick={hide} className={`absolute inset-0 z-20 bg-scrim ${OVER[dockAt].scrim}`} /> : null}
      {chip ? (
        <button
          onClick={show}
          title={chip}
          className={`absolute top-3 z-10 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 shadow-raised hover:bg-muted transition-colors ${
            side === 'right' ? 'right-3.5' : 'left-3.5'
          } ${chipShows}`}
        >
          {icon ? <span className="flex text-ai-accent [&>svg]:size-3.5">{icon}</span> : null}
          <span className="text-xs font-medium text-foreground">{chip}</span>
          {badge ? <span className="rounded-full bg-foreground px-1.5 py-px font-mono text-[9px] font-semibold text-background">{badge}</span> : null}
        </button>
      ) : null}
      <aside
        aria-label={label}
        style={{ width }}
        onClickCapture={(e) => {
          if (!docked && (e.target as HTMLElement).closest('a[href]')) hide();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !docked) hide();
        }}
        className={`max-w-full shrink-0 flex-col min-h-0 bg-card border-border ${side === 'right' ? 'right-0 border-l' : 'left-0 border-r'} ${panel}`}
      >
        <div className="shrink-0 flex items-center gap-2 pl-4 pr-2 py-2 border-b border-border/50">
          {icon ? <span className="shrink-0 flex text-ai-accent [&>svg]:size-3.5">{icon}</span> : null}
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">{title}</span>
          {actions ? <span className="shrink-0 flex items-center gap-0.5">{actions}</span> : null}
          <button
            onClick={hide}
            title={hideLabel}
            aria-label={hideLabel}
            className="shrink-0 p-1.5 rounded-tight text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Hide className="size-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </aside>
    </>
  );
}

/** A header button for `actions`: an icon with its label on hover. */
export function ChatPanelAction({ label, onClick, children, pressed }: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  pressed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      className={`p-1.5 rounded-tight transition-colors [&>svg]:size-4 ${pressed ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
    >
      {children}
    </button>
  );
}
