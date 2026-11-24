// A short line that says what just happened ("Deleted", "Copying the file…"), bottom centre over the page, in ink on
// the page's ground. The app decides how long it stays.
import type { ReactNode } from 'react';

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="fixed bottom-4 left-1/2 z-40 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-control bg-foreground px-3 py-2 text-[13px] text-background shadow-overlay">
      {children}
    </div>
  );
}
