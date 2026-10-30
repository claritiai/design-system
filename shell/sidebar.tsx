'use client';
// The sidebar every Clariti app shares: the lockup and the collapse toggle, the app's switch, its links, the
// person's recent chats and the person. It holds no data and no product wording: each app passes its links
// (as SidebarNavItem children), its chats, its labels and its account menu. The app serves brand/ at /brand/.
import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
import { MessageSquare, PanelLeft, PanelLeftClose } from 'lucide-react';

type Icon = React.ComponentType<{ className?: string }>;

const SidebarContext = createContext<{ collapsed: boolean; onNavigate?: (href: string) => void }>({ collapsed: false });

/** Whether the sidebar is collapsed to its icon rail, for anything an app renders inside it. */
export const useSidebar = () => useContext(SidebarContext);

export function SidebarNavItem({ href, icon: Icon, label, active, disabled, indent = 0, title, onClick, external }: {
  href?: string;
  icon: Icon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  indent?: number;
  title?: string;
  onClick?: () => void;
  external?: boolean;
}) {
  const { collapsed, onNavigate } = useSidebar();
  const base = `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${collapsed ? 'justify-center' : ''}`;
  const style = !collapsed && indent > 0 ? { paddingLeft: `${12 + indent * 20}px` } : undefined;
  const tip = collapsed ? label : title;
  const content = (
    <>
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </>
  );

  if (disabled) {
    return <div className={`${base} text-muted-foreground/40 cursor-not-allowed`} style={style} title={tip}>{content}</div>;
  }
  if (onClick && !href) {
    return (
      <button onClick={onClick} className={`${base} w-full text-foreground/70 hover:bg-muted hover:text-foreground`} style={style} title={tip}>
        {content}
      </button>
    );
  }
  if (!href) {
    return <div className={`${base} text-foreground/70`} style={style} title={tip}>{content}</div>;
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} text-foreground/70 hover:bg-muted hover:text-foreground`} style={style} title={tip}>
        {content}
      </a>
    );
  }
  return (
    <Link
      href={href}
      onClick={() => { onNavigate?.(href); onClick?.(); }}
      className={`${base} ${active ? 'bg-muted text-foreground font-semibold' : 'text-foreground/70 hover:bg-muted hover:text-foreground'}`}
      style={style}
      title={tip}
    >
      {content}
    </Link>
  );
}

export type SidebarChat = { id: string; title: string; href: string; active?: boolean };

/** The person's chats, newest first, filling the space between the links and the person. */
export function SidebarChats({ chats, label = 'Recents', limit = 25 }: { chats: SidebarChat[]; label?: string; limit?: number }) {
  return (
    <div className="mt-6 flex-1 flex flex-col min-h-0">
      <div className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground/50">{label}</div>
      <div className="mt-1 flex-1 overflow-y-auto space-y-0.5">
        {chats.slice(0, limit).map((chat) => (
          <Link
            key={chat.id}
            href={chat.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              chat.active ? 'bg-muted text-foreground' : 'text-foreground/70 hover:bg-muted hover:text-foreground'
            }`}
          >
            <MessageSquare className={`w-4 h-4 shrink-0 ${chat.active ? 'text-foreground' : 'text-muted-foreground'}`} />
            <span className="truncate">{chat.title || 'Untitled chat'}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const COLLAPSED_KEY = 'clariti-sidebar-collapsed';

/**
 * Top to bottom: the lockup (and the app's name) with the collapse toggle, the app's switch (`top`, hidden
 * while collapsed), the app's links (`children`), the person's chats, and the person (`footer`).
 *
 * The person's collapse choice is remembered in the browser. `compact` collapses the rail for a page that needs
 * the width; expanding calls `onExpand` so the app can drop it. `onNavigate` hears every link click.
 */
export function Sidebar({ homeHref, homeLabel = 'Clariti home', product, top, chats = [], footer, compact = false, onExpand, onNavigate, children }: {
  homeHref: string;
  homeLabel?: string;
  product?: string;
  top?: React.ReactNode;
  chats?: SidebarChat[];
  footer?: React.ReactNode;
  compact?: boolean;
  onExpand?: () => void;
  onNavigate?: (href: string) => void;
  children?: React.ReactNode;
}) {
  const [chosen, setChosen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try { setChosen(localStorage.getItem(COLLAPSED_KEY) === 'true'); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) try { localStorage.setItem(COLLAPSED_KEY, String(chosen)); } catch {}
  }, [chosen, hydrated]);
  const collapsed = chosen || compact;

  return (
    <SidebarContext.Provider value={{ collapsed, onNavigate }}>
      <aside className={`${collapsed ? 'w-16' : 'w-64'} shrink-0 bg-background flex flex-col h-full transition-all duration-200`}>
        <div className={`h-14 flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Link href={homeHref} className={`flex min-h-8 items-center gap-2 ${collapsed ? 'min-w-8 justify-center' : ''}`} aria-label={homeLabel}>
            {collapsed ? (
              <>
                <Image src="/brand/clariti-mark.svg" alt="" width={28} height={11} className="h-[11px] w-7 dark:hidden" />
                <Image src="/brand/clariti-mark-paper.svg" alt="" width={28} height={11} className="hidden h-[11px] w-7 dark:block" />
              </>
            ) : (
              <>
                <Image src="/brand/clariti-lockup-ink.svg" alt="" width={59} height={20} className="h-5 w-[59px] dark:hidden" />
                <Image src="/brand/clariti-lockup-paper.svg" alt="" width={59} height={20} className="hidden h-5 w-[59px] dark:block" />
                {product ? <span className="text-[13px] font-medium text-muted-foreground">{product}</span> : null}
              </>
            )}
          </Link>
          {!collapsed && (
            <button onClick={() => setChosen(true)} className="p-1 hover:bg-muted rounded-md transition-colors" title="Collapse sidebar">
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="px-2 py-2">
            <button
              onClick={() => { setChosen(false); onExpand?.(); }}
              className="w-full p-2 hover:bg-muted rounded-md transition-colors flex items-center justify-center"
              title="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {!collapsed && top ? <div className="px-3 pb-3">{top}</div> : null}

        <div className="flex-1 overflow-hidden flex flex-col px-2 min-h-0">
          <div className="shrink-0">{children}</div>
          {!collapsed && chats.length > 0 ? <SidebarChats chats={chats} /> : null}
        </div>

        <div className={`${collapsed ? 'px-2 flex justify-center' : 'px-3'} py-4`}>{footer}</div>
      </aside>
    </SidebarContext.Provider>
  );
}
