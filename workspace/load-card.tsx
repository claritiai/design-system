'use client';

/** One applied load in a list of them: its numbered title, a remove button when there may be fewer, its fields. */
import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../shell/cn';

interface LoadCardProps {
  index: number;
  children: React.ReactNode;
  onDelete: () => void;
  canDelete: boolean;
  className?: string;
}

export function LoadCard({
  index,
  children,
  onDelete,
  canDelete,
  className,
}: LoadCardProps) {
  return (
    <div
      className={cn(
        // No card chrome: each load is a titled block over a thin divider, so the section reads as one column.
        'group/load pt-3 pb-3 border-b border-border/30 last:border-b-0',
        className
      )}
    >
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[13px] font-semibold text-foreground">
          Applied Load {index + 1}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-[22px] h-[22px] flex items-center justify-center rounded text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Remove load"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
