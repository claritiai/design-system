// A titled group of records on a page (the builds under way, the files opened before): a quiet heading and the
// records under it.
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';

export function ListSection({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <h2 className="m-0 text-[12px] font-semibold text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
