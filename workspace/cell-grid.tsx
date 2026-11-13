/** Inputs side by side in equal cells, each under its label and mark, every input in a row level with the others. */
import * as React from 'react';
import { cn } from '../shell/cn';
import { DefaultMark, REQUIRED_FIELD } from './default-mark';

interface CellGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

export function CellGrid({ columns = 3, children, className }: CellGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-2', gridCols[columns], className)}>
      {children}
    </div>
  );
}

export interface CellGridItemProps {
  label: string;
  /** A value only the engineer can state, not stated yet: the same red mark and field PropRow gives it. */
  required?: boolean;
  /** Reddens the label, as PropRow does, when this cell is what blocks Run. */
  hasError?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Any other mark beside the label, drawn by the app (where the value came from, say); `required` replaces it. */
  mark?: React.ReactNode;
}

export function CellGridItem({ label, required, hasError, children, className, mark }: CellGridItemProps) {
  return (
    <div className={cn('flex flex-col', required && REQUIRED_FIELD, className)}>
      {/* A narrow cell has no room for the label and the mark on one line: the mark wraps whole, and the
          label takes the row's spare height, so every input in the row stays level. */}
      <div
        className={cn(
          'text-[11.5px] mb-1.5 leading-tight flex flex-1 flex-wrap content-start items-center gap-1',
          hasError ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {label}
        {/* Per cell, because the values in one row can each come from somewhere else. */}
        {required ? <DefaultMark kind="required" /> : mark}
      </div>
      {children}
    </div>
  );
}
