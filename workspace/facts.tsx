// What is known about something, as label and value pairs in two columns: the labels muted, the values in the data
// face so figures line up. A value may wrap anywhere (an id, a long name). `lead` puts the first value larger, as the
// name of what the list describes.
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';

export function Facts({ rows, lead, className }: {
  rows: readonly (readonly [string, ReactNode])[];
  lead?: boolean;
  className?: string;
}) {
  return (
    <dl className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-[12.5px]', className)}>
      {rows.map(([label, value], i) => (
        <div key={i} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={cn('m-0 min-w-0 [overflow-wrap:anywhere]', lead && i === 0 ? 'text-[14px] font-semibold text-foreground' : 'font-mono text-[12px] tabular-nums text-foreground')}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
