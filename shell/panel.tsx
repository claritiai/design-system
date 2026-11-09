'use client';
// The side panel a Clariti app docks its chat in: open beside the page while the window is wide, collapsed below that
// width, and over the page when opened there. Crossing the width hands it back to the screen, so it collapses on the
// way down and opens again on the way up. It stays mounted while hidden, so a chat keeps streaming. It knows nothing
// about the chat: the app passes the panel's title, its header buttons and its body, and opens it from its own button
// (useChatPanel) or from the edge chip. With nothing beside it yet (`fill`), the same panel takes the whole row. Docked,
// it can take a share of the row instead of a fixed width, and the person can drag that share.
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

// Docked with a share, the panel keeps at least this much, and leaves the page beside it at least this much.
const LEAST = 320;
const LEAST_PAGE = 360;
const STEP = 0.05;

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
 * Tailwind width from which the panel docks beside the page. With `startOpen={false}` the panel waits for the app's
 * button at every width: opened, it docks or covers the page as usual, and it still collapses on the way down, but it
 * does not open by itself on the way up.
 */
export function ChatPanelProvider({ dockAt = 'xl', startOpen = true, children }: {
  dockAt?: Wide;
  startOpen?: boolean;
  children: React.ReactNode;
}) {
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
  const [open, setOpen] = useState<boolean | null>(startOpen ? null : false);
  const was = useRef(docked);
  useEffect(() => {
    if (was.current === docked) return;
    was.current = docked;
    if (startOpen) setOpen(null);
    else if (!docked) setOpen(false);
  }, [docked, startOpen]);
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
 * (the chat open in it, say), the app's `actions` and the hide button. With `chip`, a hidden panel leaves a pill on
 * the page's edge that opens it again, `badge` beside its label (unread answers, say). The pill sits at the top of the
 * edge, or halfway down it with `chipAt="middle"`, clear of a page that keeps its own controls in the corner. Below the
 * docking width the panel covers the page, and a link clicked in it, Escape or a click on the page around it closes it.
 *
 * `share` docks the panel at that part of the row (0.5 for half) instead of `width`, never narrower than 320px and
 * leaving the page at least 360px. `resizable` puts a handle on the docked panel's inner edge: dragging it, or the
 * arrow keys on it, set the share, and a double click puts the app's back. A string names the browser storage the
 * person's share is kept under, so it lasts; a different string (another layout of the same row) keeps a share of its
 * own. Over the page, below the docking width, the panel keeps `width`.
 *
 * Opened over the page, the panel takes the focus, so a person can type straight away: the reply bar (a textarea named
 * `message`) takes it, or the panel's first button while an answer streams and the bar is disabled. Docked, the focus
 * stays where it was.
 *
 * `header={false}` leaves out the header row, for a body that brings its own: that header then hides the panel with
 * `useChatPanel().hide`. `fill` is for a row with no page beside the panel yet: the panel takes the whole row at every
 * width, with no chip, scrim or hide button. Turning `fill` on or off keeps the same element, so a chat streaming in
 * the panel carries on when a page appears beside it. `data-state` on the panel says whether it shows: `open` or
 * `closed`.
 */
export function ChatPanel({
  side = 'right', label, title, icon, actions, width = 400, share, resizable, hideLabel = 'Hide', chip, chipAt = 'top', badge, header = true,
  fill = false, children,
}: {
  side?: 'left' | 'right';
  label: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  width?: number;
  share?: number;
  resizable?: boolean | string;
  hideLabel?: string;
  chip?: string;
  chipAt?: 'top' | 'middle';
  badge?: React.ReactNode;
  header?: boolean;
  fill?: boolean;
  children: React.ReactNode;
}) {
  const { shown, open, docked, dockAt, show, hide } = useChatPanel();
  const Hide = side === 'right' ? PanelRightClose : PanelLeftClose;
  const panel = fill
    ? 'flex flex-1 min-w-0'
    : `max-w-full shrink-0 border-border ${side === 'right' ? 'right-0 border-l' : 'left-0 border-r'} ${
      open === null ? FOLLOW[dockAt].panel : open ? `flex ${OVER[dockAt].panel}` : 'hidden'
    }`;
  const chipShows = open === null ? FOLLOW[dockAt].chip : open ? 'hidden' : 'inline-flex';
  // Only a panel over the page closes on a link or Escape: docked or filling the row, it stays where it is. The chip
  // sits on the scrim's layer, above a page's own overlays; the two never show together.
  const over = !fill && !docked;
  const aside = useRef<HTMLElement>(null);
  const opened = useRef(shown);
  useEffect(() => {
    const now = shown && !opened.current;
    opened.current = shown;
    if (!now || docked || fill) return;
    const bar = aside.current?.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
    (bar && !bar.disabled ? bar : aside.current?.querySelector<HTMLElement>('button'))?.focus();
  }, [shown, docked, fill]);
  // The person's share of the row, once they have dragged it; kept under `resizable` when that names a storage key.
  const key = typeof resizable === 'string' ? resizable : null;
  const [mine, setMine] = useState<number | null>(null);
  const latest = useRef<number | null>(null);
  // A drag under way, ended here too if the handle goes mid-drag (the window narrows, the page changes), so the page
  // never keeps its text unselectable.
  const ending = useRef<(() => void) | null>(null);
  useEffect(() => {
    // A new key is a new layout (a third pane beside the page, say): its own kept share, or the app's.
    let kept: number | null = null;
    try {
      const value = key ? Number(window.localStorage.getItem(key)) : NaN;
      if (value > 0 && value < 1) kept = value;
    } catch { /* storage blocked: the app's share stands */ }
    setMine(kept);
  }, [key]);
  const part = mine ?? share ?? null;
  const docks = !fill && docked && shown;
  const grip = !!resizable && docks;
  const keep = (value: number | null) => {
    if (!key) return;
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value.toFixed(3));
    } catch { /* storage blocked: the share lasts this page */ }
  };
  // Within what both sides need on a row this wide.
  const within = (value: number, row: number) => Math.min(Math.max(value, LEAST / row, 0.15), 1 - LEAST_PAGE / row, 0.85);
  // The row the panel and the page share: the handle's wrapper's parent, or the first ancestor with a box of its own
  // when the app wraps the panel in an element with display: contents.
  const rowOf = (el: HTMLElement) => {
    let row = el.parentElement!.parentElement!;
    while (row.parentElement && getComputedStyle(row).display === 'contents') row = row.parentElement;
    return row.getBoundingClientRect();
  };
  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const edge = e.currentTarget;
    const row = rowOf(edge);
    if (!row.width) return;
    edge.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    const move = (ev: PointerEvent) => {
      const value = within((side === 'left' ? ev.clientX - row.left : row.right - ev.clientX) / row.width, row.width);
      latest.current = value;
      setMine(value);
    };
    const end = () => {
      ending.current = null;
      edge.removeEventListener('pointermove', move);
      edge.removeEventListener('pointerup', end);
      edge.removeEventListener('pointercancel', end);
      document.body.style.removeProperty('user-select');
      if (latest.current !== null) keep(latest.current);
    };
    ending.current = end;
    edge.addEventListener('pointermove', move);
    edge.addEventListener('pointerup', end);
    edge.addEventListener('pointercancel', end);
  };
  const nudge = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const by = e.key === 'ArrowLeft' ? -STEP : e.key === 'ArrowRight' ? STEP : 0;
    if (!by) return;
    e.preventDefault();
    const row = rowOf(e.currentTarget);
    if (!row.width) return;
    const now = aside.current ? aside.current.getBoundingClientRect().width / row.width : (part ?? 0.5);
    const value = within(now + (side === 'left' ? by : -by), row.width);
    setMine(value);
    keep(value);
  };
  useEffect(() => () => ending.current?.(), [grip]);
  const handle = grip ? (
    <div className="relative z-10 w-0 shrink-0">
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((part ?? 0) * 100) || undefined}
        tabIndex={0}
        onPointerDown={drag}
        onKeyDown={nudge}
        onDoubleClick={() => { setMine(null); keep(null); }}
        className="group absolute inset-y-0 -left-1.5 w-3 cursor-col-resize touch-none outline-none"
      >
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors group-hover:bg-foreground/25 group-focus-visible:bg-foreground/50 group-active:bg-foreground/50" />
      </div>
    </div>
  ) : null;
  // Over the page, Escape closes the panel when it comes from inside it or from nowhere: sending a message disables the
  // reply bar, which drops the focus to the body. A field elsewhere keeps its Escape. The check waits for every other
  // listener, the window's too, so a menu or question that answers Escape marks the key as handled and only it reacts.
  useEffect(() => {
    if (!over || !shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const from = e.target as Node;
      if (from !== document.body && from !== document.documentElement && !aside.current?.contains(from)) return;
      setTimeout(() => {
        if (!e.defaultPrevented) hide();
      });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [over, shown, hide]);
  return (
    <>
      {open && !fill ? <div aria-hidden onClick={hide} className={`absolute inset-0 z-20 bg-scrim ${OVER[dockAt].scrim}`} /> : null}
      {chip && !fill ? (
        <button
          onClick={show}
          title={chip}
          className={`absolute z-20 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 shadow-raised hover:bg-muted transition-colors ${
            chipAt === 'middle' ? 'top-1/2 -translate-y-1/2' : 'top-3'
          } ${side === 'right' ? 'right-3.5' : 'left-3.5'} ${chipShows}`}
        >
          {icon ? <span className="flex text-ai-accent [&>svg]:size-3.5">{icon}</span> : null}
          <span className="text-xs font-medium text-foreground">{chip}</span>
          {badge ? <span className="rounded-full bg-foreground px-1.5 py-px font-mono text-[9px] font-semibold text-background">{badge}</span> : null}
        </button>
      ) : null}
      {side === 'right' ? handle : null}
      <aside
        ref={aside}
        aria-label={label}
        data-state={fill || shown ? 'open' : 'closed'}
        style={fill ? undefined : docks && part ? { width: `${part * 100}%`, minWidth: LEAST, maxWidth: `calc(100% - ${LEAST_PAGE}px)` } : { width }}
        onClickCapture={(e) => {
          if (over && (e.target as HTMLElement).closest('a[href]')) hide();
        }}
        className={`flex-col min-h-0 bg-card ${panel}`}
      >
        {header ? (
          <div className="shrink-0 flex items-center gap-2 pl-4 pr-2 py-2 border-b border-border/50">
            {icon ? <span className="shrink-0 flex text-ai-accent [&>svg]:size-3.5">{icon}</span> : null}
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">{title}</span>
            {actions ? <span className="shrink-0 flex items-center gap-0.5">{actions}</span> : null}
            {fill ? null : (
              <button
                onClick={hide}
                title={hideLabel}
                aria-label={hideLabel}
                className="shrink-0 p-1.5 rounded-tight text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Hide className="size-4" />
              </button>
            )}
          </div>
        ) : null}
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </aside>
      {side === 'left' ? handle : null}
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
