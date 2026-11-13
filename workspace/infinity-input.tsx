'use client';

/** A number that may be left unbounded: empty reads as infinity, and the trailing ∞ clears the value back to it. */
import * as React from 'react';
import { cn } from '../shell/cn';

interface InfinityInputProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InfinityInput({
  value,
  onChange,
  placeholder = '∞',
  className,
}: InfinityInputProps) {
  const isInfinity = !value || value === '' || value === 'infinity';

  const handleSetInfinity = () => {
    onChange('');
  };

  return (
    <div
      className={cn(
        // The borderless filled surface of the panel's input: the fill carries the shape, the ring shows on focus.
        'flex items-stretch rounded-md bg-muted border border-transparent overflow-hidden h-8 focus-within:border-ring transition-colors',
        className
      )}
    >
      {/* The leading ∞ marks the unbounded state; with the trailing button the control reads ∞ … ∞. */}
      <span
        className={cn(
          'px-2 flex items-center text-xs select-none',
          isInfinity ? 'text-foreground' : 'text-muted-foreground/30'
        )}
        aria-hidden
      >
        ∞
      </span>
      <input
        type="number"
        value={isInfinity ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex-1 min-w-0 bg-transparent text-[12.5px] tabular-nums outline-none text-center',
          'placeholder:text-muted-foreground/40',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
      <button
        type="button"
        onClick={handleSetInfinity}
        className={cn(
          'px-2 text-xs font-medium transition-colors shrink-0',
          isInfinity
            ? 'text-foreground'
            : 'text-muted-foreground/60 hover:text-foreground'
        )}
        title="Set to infinity"
      >
        ∞
      </button>
    </div>
  );
}
