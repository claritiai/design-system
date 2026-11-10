'use client';

import { cn } from '../shell/cn';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  /** Two or more options. Component renders flex, so width adapts to count. */
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Size variant */
  size?: 'sm' | 'default';
  disabled?: boolean;
  /** Names the choice; given, the control is announced as a radio group of its options. */
  'aria-label'?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'default',
  disabled,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  // Panel type scale: 12.5px body, 32px total height, as a small input and the panel select, so the three read at one
  // size side by side in a parameter panel.
  const sizeClasses = {
    sm: 'text-[11.5px] py-1 px-2',
    default: 'text-[12.5px] py-1 px-3',
  }[size];
  const containerHeight = size === 'default' ? 'h-8' : '';

  return (
    <div
      role={ariaLabel ? 'radiogroup' : undefined}
      aria-label={ariaLabel}
      className={cn(
        'flex items-stretch rounded-md bg-muted border border-border/50 p-0.5',
        containerHeight,
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role={ariaLabel ? 'radio' : undefined}
            aria-checked={ariaLabel ? isSelected : undefined}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-tight font-medium transition-all duration-150 whitespace-nowrap disabled:opacity-60',
              sizeClasses,
              isSelected
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
