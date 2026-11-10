import type { ReactNode } from 'react';
import { cn } from '../shell/cn';
import { ASSUMED_FIELD, DefaultMark } from './default-mark';

export interface PropRowProps {
  label: string;
  required?: boolean;
  unit?: string;
  hasError?: boolean;
  /** Inline help text shown directly under the input (anchored to the field). */
  helperText?: ReactNode;
  /** Tone for the helper text — defaults to 'muted'. */
  helperTone?: 'muted' | 'warn' | 'error';
  /**
   * A value nobody stated (the engine's or the intake's default): the shared default mark beside the label, and the
   * field in the amber fill until the engineer reviews it.
   */
  assumed?: boolean;
  /** The default mark's hover when it says more than its kind (what was assumed, and why). */
  assumedHint?: string;
  /** A starter value still to be reviewed: the "to review" mark replaces any other mark. */
  review?: boolean;
  /** Any other mark beside the label, drawn by the app (where the value came from, say). */
  mark?: ReactNode;
  /**
   * 'stacked' (default): the label above the control. 'inline': one line, the label on the left and the control on
   * the right, for a compact panel. 'measure': one line, the label in a fixed column and the control filling the
   * rest (a slider beside its value).
   */
  layout?: 'stacked' | 'inline' | 'measure';
  /** The fact this row states, so a prompt elsewhere (over the 3D view, say) can bring the row into view. */
  fieldId?: string;
  children: ReactNode;
  className?: string;
}

/** The moment's ring a row wears when a prompt brings it into view. */
const ATTENTION = 'rounded-md transition-shadow data-[attention=on]:ring-2 data-[attention=on]:ring-destructive/50 data-[attention=on]:ring-offset-2 data-[attention=on]:ring-offset-background';

const HELPER_TONE_CLASSES: Record<NonNullable<PropRowProps['helperTone']>, string> = {
  muted: 'text-muted-foreground/80',
  warn: 'text-status-warn',
  error: 'text-destructive',
};

/** One parameter: its label (with its unit, a required star and its mark), its control, and a helper line under it. */
export function PropRow({
  label,
  required,
  unit,
  hasError,
  helperText,
  helperTone = 'muted',
  assumed,
  assumedHint,
  review,
  mark,
  layout = 'stacked',
  fieldId,
  children,
  className,
}: PropRowProps) {
  const shown = review
    ? <DefaultMark kind="review" className="ml-1.5 align-middle" />
    : assumed ? <DefaultMark title={assumedHint} className="ml-1.5 align-middle" /> : mark;
  const helper = helperText && (
    <span className={cn('text-[10.5px] leading-snug', HELPER_TONE_CLASSES[helperTone])}>
      {helperText}
    </span>
  );
  if (layout !== 'stacked') {
    return (
      <div data-field-id={fieldId} className={cn('flex flex-col gap-0.5 py-1', ATTENTION, className)}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[12px] leading-tight',
              layout === 'measure' ? 'w-[120px] shrink-0' : 'min-w-0 flex-1',
              hasError ? 'text-destructive' : 'text-foreground/85'
            )}
          >
            {label}
            {unit && <span className="text-muted-foreground/70 ml-1">{unit}</span>}
            {required && <span className="text-destructive font-bold ml-0.5">*</span>}
          </span>
          {shown}
          <div
            className={cn(
              'flex items-center justify-end gap-2',
              layout === 'measure' ? 'min-w-0 flex-1' : 'shrink-0',
              assumed && ASSUMED_FIELD
            )}
          >
            {children}
          </div>
        </div>
        {helper}
      </div>
    );
  }
  return (
    <div data-field-id={fieldId} className={cn('flex flex-col gap-1.5 mb-2.5', ATTENTION, className)}>
      <span
        className={cn(
          'text-[11px] leading-tight font-medium',
          hasError ? 'text-destructive' : 'text-foreground/70'
        )}
      >
        {label}
        {unit && <span className="text-muted-foreground/60 font-normal ml-1">{unit}</span>}
        {required && <span className="text-destructive font-bold ml-0.5">*</span>}
        {shown}
      </span>
      <div className={cn('w-full', assumed && ASSUMED_FIELD)}>{children}</div>
      {helper}
    </div>
  );
}
