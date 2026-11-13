'use client';

/**
 * Closes an open popover or menu on a mousedown outside its container, or on Escape.
 *
 * `isInsideExtra` is for a popover rendered through a portal: a click in it does not land inside the container, so the
 * predicate keeps the menu open for clicks in that detached subtree.
 */
import { useEffect, type RefObject } from 'react';

export function useDismissOnOutsideClick(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  isInsideExtra?: (target: EventTarget | null) => boolean,
): void {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      if (isInsideExtra?.(e.target)) return;
      onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Marked as handled, so a dialog open over the page stays open: only this closes.
      e.preventDefault();
      onDismiss();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, ref, onDismiss, isInsideExtra]);
}
