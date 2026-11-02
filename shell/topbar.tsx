// The top bar a Clariti app can frame its pages with instead of the sidebar, GitHub-style: the mark and the app's
// name, the app's switch, its actions and the person on the right, and its pages as tabs underneath. It holds no
// data and no product wording: each app passes its tabs, its labels and what goes in each slot. The app serves
// brand/ at /brand/.
import Image from 'next/image';
import Link from 'next/link';

/** One of the app's pages. A disabled tab is greyed, with a short `tag` beside its label and `title` on hover. */
export type TopBarTab = { href?: string; label: string; active?: boolean; disabled?: boolean; tag?: string; title?: string };

/**
 * One line on top: the mark (and, from `sm`, the app's name) linking home, then `top` after a slash (the app's
 * switch, or the name of what is open), and `actions` on the right (the app's buttons and its account menu). The
 * tabs under it scroll sideways when they do not fit. It stacks above the page, so nothing on the page covers it.
 */
export function TopBar({ homeHref, homeLabel = 'Clariti home', product, top, actions, tabs = [], tabsLabel }: {
  homeHref: string;
  homeLabel?: string;
  product?: string;
  top?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: TopBarTab[];
  tabsLabel?: string;
}) {
  return (
    <header className="relative z-20 shrink-0 border-b border-border bg-card">
      <div className="flex min-h-14 items-center gap-2.5 px-4 py-2 sm:px-6">
        <Link href={homeHref} className="flex shrink-0 items-center gap-2 text-[15px] font-semibold" aria-label={homeLabel}>
          <Image src="/brand/clariti-mark.svg" alt="" width={24} height={24} className="size-6 dark:hidden" />
          <Image src="/brand/clariti-mark-paper.svg" alt="" width={24} height={24} className="hidden size-6 dark:block" />
          {product ? <span className="hidden sm:inline">{product}</span> : null}
        </Link>
        {top ? (
          <>
            <span aria-hidden className="text-muted-foreground">/</span>
            <div className="flex min-w-0 items-center gap-2.5">{top}</div>
          </>
        ) : null}
        <span className="flex-1" />
        {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
      </div>
      {tabs.length > 0 ? (
        <nav aria-label={tabsLabel} className="flex gap-1 overflow-x-auto px-2 sm:px-4">
          {/* Keyed by position, not label: two tabs may share a label, and a shared key would leave one stale. */}
          {tabs.map((tab, i) => tab.href && !tab.disabled ? (
            <Link
              key={i}
              href={tab.href}
              aria-current={tab.active ? 'page' : undefined}
              title={tab.title}
              className={`-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${
                tab.active ? 'border-foreground font-semibold text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ) : (
            <span
              key={i}
              title={tab.title}
              aria-disabled="true"
              className="-mb-px inline-flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground/60"
            >
              {tab.label}
              {tab.tag ? <span className="rounded-full border border-border px-1.5 text-[11px] leading-relaxed text-muted-foreground">{tab.tag}</span> : null}
            </span>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
