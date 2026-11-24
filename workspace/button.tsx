// Clariti's button, as the Clariti app draws it: one primary action in ink, outline and ghost beside it, a destructive
// one for deleting, and `link` for a quiet text action. `buttonVariants` gives the same classes to a link that acts as
// a button (an `<a>` to another page).
import type { ComponentProps } from 'react';
import { cn } from '../shell/cn';

const BUTTON = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";
const BUTTON_VARIANT = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
  outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
  link: 'text-foreground underline-offset-4 hover:underline',
};
const BUTTON_SIZE = {
  default: 'h-9 px-4 py-2 has-[>svg]:px-3',
  xs: 'h-7 rounded-md gap-1 px-2.5 text-xs has-[>svg]:px-2',
  sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
  lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
  icon: 'size-9',
  'icon-sm': 'size-8',
  'icon-lg': 'size-10',
};
export type ButtonVariant = keyof typeof BUTTON_VARIANT;
export type ButtonSize = keyof typeof BUTTON_SIZE;

/** A button's classes (`default` variant and size when none is given). */
export function buttonVariants({ variant, size }: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return cn(BUTTON, BUTTON_VARIANT[variant || 'default'], BUTTON_SIZE[size || 'default']);
}

export function Button({ className, variant, size, type = 'button', ...props }: ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button data-slot="button" type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
