/**
 * The mark for a value the engine or the intake assumed, a starter value still to be reviewed, or a value only the
 * engineer can state that nobody has stated yet. One component, so every Parameters panel, intake card and report marks
 * them the same way.
 *
 * A labelled pill rather than a dot: these are the states that ask the engineer to act, so they read without a legend.
 * A required value is the same pill in red, filled like the default, so it is at least as visible. Every kind shares
 * one box (a filled kind's border is transparent), so swapping one for another does not move the row.
 */
import type { HTMLAttributes } from 'react';
import { cn } from '../shell/cn';

const MARK = {
  default: { text: 'default', title: 'Default — review', className: 'border-transparent bg-assumed-bg text-assumed' },
  review: { text: 'to review', title: 'Starter value: review it', className: 'border-assumed-border text-assumed' },
  required: { text: 'required', title: 'Required: no default, state it', className: 'border-transparent bg-required-bg text-required' },
} as const;

export type DefaultMarkKind = keyof typeof MARK;

/** The default mark's word, for a surface that draws the mark itself (an SVG drawing, a 3D view). */
export const DEFAULT_MARK_TEXT = MARK.default.text;

/** The classes a parameter row's field wears while its value is a default to review: the amber fill and border. */
export const ASSUMED_FIELD = [
  '[&_[data-slot=input]]:bg-assumed-bg',
  '[&_[data-slot=input]]:border-assumed-border',
  '[&_[data-slot=select-trigger]]:bg-assumed-bg',
  '[&_[data-slot=select-trigger]]:border-assumed-border',
].join(' ');

/** The classes a parameter row's field wears while a value only the engineer can state is missing: the red fill and border. */
export const REQUIRED_FIELD = [
  '[&_[data-slot=input]]:bg-required-bg',
  '[&_[data-slot=input]]:border-required-border',
  '[&_[data-slot=select-trigger]]:bg-required-bg',
  '[&_[data-slot=select-trigger]]:border-required-border',
].join(' ');

/** `title` replaces the hover when the mark knows more than its kind: a default the intake card assumed names its value and basis. */
export function DefaultMark({ kind = 'default', title, className, ...rest }: {
  kind?: DefaultMarkKind; title?: string; className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'title' | 'children'>) {
  const mark = MARK[kind];
  return (
    <span
      {...rest}
      data-default-mark={kind}
      title={title ?? mark.title}
      aria-label={title ?? mark.title}
      className={cn('inline-flex shrink-0 items-center rounded-full border px-1.5 text-[10px] font-semibold leading-[14px]',
        mark.className, className)}
    >
      {mark.text}
    </span>
  );
}

/** A Parameters header's count of the values that ask the engineer to act ("1 required · 4 to review"); none at zero. */
export function MarkCount({ required = 0, review = 0, className }: { required?: number; review?: number; className?: string }) {
  if (required <= 0 && review <= 0) return null;
  return (
    <span data-mark-count className={cn('text-[10.5px]', className)}>
      {required > 0 && <span className="text-required">{required} required</span>}
      {required > 0 && review > 0 && <span className="text-muted-foreground"> · </span>}
      {review > 0 && <span className="text-assumed">{review} to review</span>}
    </span>
  );
}
