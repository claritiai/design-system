'use client';

import { ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '../shell/cn';

interface CollapsibleSectionProps {
  title: string;
  inlineSummary?: string;
  /** Accepted and not drawn. */
  badge?: 'default' | 'modified' | 'set';
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  indicator?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  inlineSummary,
  defaultOpen = false,
  open,
  onOpenChange,
  indicator,
  actions,
  children,
  className,
}: CollapsibleSectionProps) {
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const isOpen = open ?? localOpen;
  const setIsOpen = (next: boolean) => { setLocalOpen(next); onOpenChange?.(next); };

  return (
    <div className={cn('border-b border-border/50', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="group flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/40 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronRight
            className={cn(
              'w-3 h-3 text-muted-foreground/50 transition-transform duration-200 flex-shrink-0',
              isOpen && 'rotate-90'
            )}
          />
          <span className="text-[12px] font-semibold text-foreground">{title}</span>
          {!isOpen && inlineSummary && (
            <span className="text-[10.5px] text-muted-foreground/60 truncate ml-1">
              {inlineSummary}
            </span>
          )}
        </div>
        {indicator}
        {actions && (
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="px-3 pb-3 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}
