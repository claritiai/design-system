'use client';

/**
 * The strip of quick-glance stats under the viewer while the right pane is open. It takes the stats the Results tab
 * shows above its checks, so the strip and the tab never disagree. While the pane is closed the frame shows its docked
 * pill instead.
 */
import { cn } from '../shell/cn';

export interface ResultsStat {
  label: string;
  /** Pre-formatted value, e.g. "11.73". Em dash when unknown. */
  value: string;
  unit?: string;
  tone?: 'pass' | 'fail' | 'neutral';
}

export function ViewerStatStrip({ stats }: { stats: ResultsStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="flex gap-2" data-testid="viewer-stat-strip">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex-1 min-w-0 flex items-center justify-between gap-2 bg-card border border-border/70 rounded-control px-3 py-2"
          data-testid={`viewer-stat-${stat.label}`}
        >
          <span className="text-[10.5px] text-muted-foreground truncate">{stat.label}</span>
          <span
            className={cn(
              'font-mono text-[12.5px] font-semibold whitespace-nowrap',
              stat.tone === 'fail' ? 'text-status-fail' : stat.tone === 'pass' ? 'text-status-pass' : 'text-foreground',
            )}
          >
            {stat.value}
            {stat.unit && <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{stat.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
