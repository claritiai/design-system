/**
 * The mark for a value the engine or the intake assumed, or a starter value still to be reviewed. One component, so
 * every Parameters panel, intake card and report marks a default the same way.
 *
 * A labelled pill rather than a dot: it is the one origin state that asks the engineer to act, so it is the one that
 * reads without a legend. Both kinds share one box (the default's border is transparent), so swapping one for the other
 * does not move the row.
 */
import type { HTMLAttributes } from 'react';
import { cn } from '../shell/cn';

const MARK = {
  default: { text: 'default', title: 'Default — review', className: 'border-transparent bg-assumed-bg text-assumed' },
  review: { text: 'to review', title: 'Starter value: review it', className: 'border-assumed-border text-assumed' },
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
