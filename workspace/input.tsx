import type { ComponentProps } from 'react';
import { cn } from '../shell/cn';

const INPUT = "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground w-full min-w-0 rounded-md text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive [&[type='number']]:tabular-nums";
const INPUT_VARIANT = {
  default: "dark:bg-input/30 border-input h-9 border bg-transparent px-3 py-1 shadow-xs focus-visible:border-ring",
  filled: "bg-card border-border/60 h-8 border px-2.5 py-1.5 text-foreground focus-visible:border-ring",
};
export type InputVariant = keyof typeof INPUT_VARIANT;

/** An input's classes: the base and its variant (`default` when none is given, the base alone for null). */
export function inputVariants({ variant }: { variant?: InputVariant | null } = {}) {
  return variant === null ? INPUT : `${INPUT} ${INPUT_VARIANT[variant || 'default']}`;
}

export function Input({ className, type, variant, ...props }: ComponentProps<'input'> & { variant?: InputVariant | null }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}
