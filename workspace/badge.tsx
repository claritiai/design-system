import type { ComponentProps } from 'react';
import { cn } from '../shell/cn';

const BADGE = "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden";
const BADGE_VARIANT = {
  default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
  secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
  success: "border-success/30 bg-success/10 text-success [a&]:hover:bg-success/20",
  specified: "border-border bg-muted text-foreground [a&]:hover:bg-accent",
  outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
};
export type BadgeVariant = keyof typeof BADGE_VARIANT;

/** A badge's classes: the base and its variant (`default` when none is given, the base alone for null). */
export function badgeVariants({ variant }: { variant?: BadgeVariant | null } = {}) {
  return variant === null ? BADGE : `${BADGE} ${BADGE_VARIANT[variant || 'default']}`;
}

export function Badge({ className, variant, ...props }: ComponentProps<'span'> & { variant?: BadgeVariant | null }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
