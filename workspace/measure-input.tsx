'use client';

/**
 * A measure that may or may not be stated: a tick for "stated", a slider to explore and a typed value to be exact.
 * Unticked, the slider shows `ghost` greyed (what the calculation uses instead, when it has one) and the field says
 * what stands in. Ticking restores the last stated value, else `start` (a default the engine itself would use), else
 * waits for a typed value, so a value is never stated for the engineer. Moving the slider states the value it shows.
 * Sits in a `PropRow` with `layout="measure"`.
 */
import { useEffect, useRef, useState } from 'react';
import { cn } from '../shell/cn';
import { NumberField } from './number-field';
import { Slider } from './slider';

const fmt = (n: number) => Math.round(n).toLocaleString('en-GB');

export function MeasureInput({ label, value, ghost, start, min, max, step, notStated = 'not stated', disabled, onChange }: {
  /** The value's accessible name; the tick and the slider are named after it. */
  label: string;
  value: number | undefined;
  /** Shown, greyed, while the value is not stated. */
  ghost?: number;
  /** What ticking states when nothing was stated before. */
  start?: number;
  min: number;
  max: number;
  step: number;
  /** The field's placeholder while nothing stands in. */
  notStated?: string;
  disabled?: boolean;
  onChange: (value: number | undefined) => void;
}) {
  const last = useRef(value);
  useEffect(() => { if (value !== undefined) last.current = value; }, [value]);
  const [armed, setArmed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const stated = value !== undefined || armed;
  const state = (next: number | undefined) => { setArmed(false); if (next !== value) onChange(next); };
  const tick = (on: boolean) => {
    if (!on) { state(undefined); return; }
    const restore = last.current ?? start;
    if (restore !== undefined) state(restore);
    else { setArmed(true); input.current?.focus(); }
  };
  return (
    <>
      <input type="checkbox" className="size-3.5 shrink-0 cursor-pointer disabled:cursor-default" aria-label={`${label} stated`}
        title={stated ? 'Stated: untick if not known' : 'Not stated: tick to state it'} checked={stated} disabled={disabled}
        onChange={event => tick(event.target.checked)} />
      <Slider aria-label={`${label} slider`} className={cn('min-w-[48px] flex-1', value === undefined && 'opacity-50')}
        min={min} max={max} step={step} value={Math.min(max, Math.max(min, value ?? ghost ?? min))} disabled={disabled}
        onChange={event => state(Number(event.target.value))} />
      <NumberField inputRef={input} label={label} value={value} className="w-[62px]" disabled={disabled}
        placeholder={value === undefined && ghost !== undefined ? fmt(ghost) : notStated} onBlurEmpty={() => setArmed(false)} onChange={state} />
    </>
  );
}
