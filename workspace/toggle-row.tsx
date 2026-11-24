// One line with a check box: a layer of a model shown or hidden, say. A swatch can name the colour it is drawn in, and
// a count sits on the right. The check box is the shared one (controls.css); the whole row toggles it. An active row
// stands out: the layer of what is selected in the view, say.
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';

export function ToggleRow({ checked, onChange, label, swatch, count, active, disabled, className }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** A CSS colour: the square drawn before the label. */
  swatch?: string;
  count?: ReactNode;
  /** The row stands out (what is selected belongs to it). */
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label data-active={active || undefined} className={cn('grid cursor-pointer select-none items-center gap-2 rounded-tight px-1.5 py-1 text-[12.5px] text-foreground hover:bg-muted/60',
      active && 'bg-accent text-accent-foreground hover:bg-accent',
      swatch ? 'grid-cols-[auto_auto_minmax(0,1fr)_auto]' : 'grid-cols-[auto_minmax(0,1fr)_auto]', disabled && 'cursor-not-allowed opacity-50', className)}>
      <input type="checkbox" className="m-0 size-3.5" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {swatch ? <span aria-hidden className="size-3 rounded-[3px] border border-border" style={{ background: swatch }} /> : null}
      <span className="min-w-0">{label}</span>
      <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">{count}</span>
    </label>
  );
}
