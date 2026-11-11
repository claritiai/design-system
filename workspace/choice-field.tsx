'use client';

/**
 * A choice from a list in a parameter row, in the shared select: nothing chosen shows `placeholder` (what the check
 * uses instead, when it assumes one). `unset` names a first item that takes the choice back, so the engine assumes
 * it again. Every family's Parameters use it.
 */
import { cn } from '../shell/cn';
import { PANEL_FIELD } from './number-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const UNSET = '__unset__';

export function ChoiceField<T extends string>({ value, options, label, disabled, placeholder, unset, className, onChange }: {
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  /** The select's accessible name. */
  label: string;
  disabled?: boolean;
  placeholder?: string;
  unset?: string;
  className?: string;
  onChange: (value: T | undefined) => void;
}) {
  return (
    <Select value={value ?? ''} disabled={disabled} onValueChange={raw => onChange(raw === UNSET ? undefined : raw as T)}>
      <SelectTrigger size="xs" aria-label={label} className={cn(PANEL_FIELD, 'max-w-[170px] text-xs', className)}><SelectValue placeholder={placeholder ?? 'Choose'} /></SelectTrigger>
      <SelectContent>
        {unset && value !== undefined && <SelectItem value={UNSET}>{unset}</SelectItem>}
        {options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
