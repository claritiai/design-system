'use client';

/**
 * The one range slider: a native range in the quiet style of controls.css (thin track, mid-grey fill, hollow thumb). It
 * sets `--range-fill` from the value so the track shows how far it is filled.
 */
import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '../shell/cn';

type SliderProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'min' | 'max'> & {
  value: number;
  min: number;
  max: number;
};

export function Slider({ value, min, max, className, style, ...props }: SliderProps) {
  const fill = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      className={cn('min-w-0', className)}
      style={{ '--range-fill': `${fill}%`, ...style } as CSSProperties}
      {...props}
    />
  );
}
