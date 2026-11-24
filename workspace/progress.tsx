// How far something under way has got (a build, a load): a thin bar in the primary ink on its own tint, as the
// Clariti app draws its progress. `failed` fills it in the destructive tone. Without `value` it shows no fill.
import { cn } from '../shell/cn';

export function Progress({ value, failed, label, className }: {
  /** 0 to 100. */
  value?: number;
  failed?: boolean;
  /** The bar's accessible name. */
  label?: string;
  className?: string;
}) {
  const v = failed ? 100 : Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={failed ? undefined : Math.round(v)}
      data-slot="progress"
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full', failed ? 'bg-destructive/20' : 'bg-primary/15', className)}
    >
      <div className={cn('h-full transition-[width] duration-300 motion-reduce:transition-none', failed ? 'bg-destructive' : 'bg-primary')} style={{ width: `${v}%` }} />
    </div>
  );
}
