'use client';

/**
 * A typed number for a parameter panel, stated when the engineer leaves the field (or presses Enter), not on every
 * keystroke: a half-typed value is never checked. Cleared, it is not stated; a value that does not read as a positive
 * number is put back. Drawn as a dark well on the panel (`PANEL_FIELD`), so a value reads at full contrast.
 */
import { useEffect, useState, type RefObject } from 'react';
import { cn } from '../shell/cn';
import { Input } from './input';

/** A compact panel field: a dark well with the panel's border, in both themes (the shared select trigger takes it too). */
export const PANEL_FIELD = 'h-7 rounded-control border-border bg-background text-foreground shadow-none dark:bg-background dark:hover:bg-background';

export function NumberField({ value, label, placeholder, disabled, className, inputRef, onBlurEmpty, onChange }: {
  value: number | undefined;
  /** The field's accessible name. */
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Left empty while nothing was stated. */
  onBlurEmpty?: () => void;
  onChange: (value: number | undefined) => void;
}) {
  const [draft, setDraft] = useState(value === undefined ? '' : String(value));
  useEffect(() => setDraft(value === undefined ? '' : String(value)), [value]);
  const commit = () => {
    const text = draft.trim();
    if (text === '') { if (value !== undefined) onChange(undefined); else onBlurEmpty?.(); return; }
    const next = Number(text);
    if (Number.isFinite(next) && next > 0) { if (next !== value) onChange(next); }
    else setDraft(value === undefined ? '' : String(value));
  };
  return (
    <Input ref={inputRef} aria-label={label} inputMode="decimal" value={draft} placeholder={placeholder} disabled={disabled}
      className={cn(PANEL_FIELD, 'w-[84px] shrink-0 px-1.5 text-right font-mono !text-[12px] placeholder:font-sans placeholder:!text-[10.5px]', className)}
      onChange={event => setDraft(event.target.value)} onBlur={commit} onKeyDown={event => { if (event.key === 'Enter') commit(); }} />
  );
}
