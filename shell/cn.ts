import { twMerge } from 'tailwind-merge';

/** Joins class names; a later class wins over an earlier one of the same kind. */
export const cn = (...classes: (string | false | null | undefined)[]) => twMerge(classes.filter(Boolean).join(' '));
