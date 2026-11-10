import type { ReactNode } from 'react';

/** The chip beside the Results tab's label: the result's status, as the app has already checked it, and its summary. */
export function ResultsTabBadge({ tone, children }: { tone: 'pass' | 'fail' | 'pending'; children: ReactNode }) {
  const colour = tone === 'pass' ? 'text-status-pass bg-status-pass/10'
    : tone === 'fail' ? 'text-status-fail bg-status-fail/10' : 'text-status-warn bg-status-warn/10';
  return <span className={`text-[9px] font-semibold font-mono rounded-full px-[5px] py-px ${colour}`}>{children}</span>;
}
