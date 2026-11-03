'use client';
// A turn of Clariti's chat, as its chat has it (from AI Elements): the person's in a bubble on the right, the
// agent's across the thread. The app sets each surface's sizes and tint with `className`.
import type { HTMLAttributes } from 'react';
import { cn } from './ui';

export const Message = ({ className, from, ...props }: HTMLAttributes<HTMLDivElement> & { from: 'user' | 'assistant' | 'system' }) => (
  <div className={cn('group flex w-full max-w-[80%] flex-col gap-2', from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant', className)} {...props} />
);

export const MessageContent = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'is-user:dark flex flex-col gap-2 text-sm',
      'group-[.is-user]:w-fit group-[.is-user]:overflow-hidden group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground',
      'group-[.is-assistant]:w-full group-[.is-assistant]:min-w-0 group-[.is-assistant]:text-foreground',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
