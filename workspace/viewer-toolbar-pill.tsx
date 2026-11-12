'use client';

/**
 * A quiet pill inside the 3D view, bottom left: reset the view, the standard views (Top, Front, Iso…) and a Download
 * menu for the model's files. The calculation report is not in the menu (it is the page's Export report), and the
 * menu's footnote says so, with the design version the geometry belongs to.
 *
 * Presentational only: the viewer around it owns the camera and the exports.
 */

import { useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Download, Loader2, RotateCcw } from 'lucide-react';
import { cn } from '../shell/cn';
import { useDismissOnOutsideClick } from './use-dismiss-on-outside-click';

export interface ViewerPillView {
  id: string;
  label: string;
}

export interface ViewerDownloadItem {
  id: string;
  label: string;
  /** e.g. "2D drawing — AutoCAD". */
  description: string;
}

export interface ViewerToolbarPillProps {
  hideDownloads?: boolean;
  onResetView: () => void;
  views: ViewerPillView[];
  activeViewId?: string | null;
  onSelectView: (id: string) => void;
  downloadItems: ViewerDownloadItem[];
  onDownload: (id: string) => void | Promise<void>;
  downloadDisabled?: boolean;
  /** Item currently exporting — shows a spinner on its row. */
  downloadingId?: string | null;
  /** "vN" of the design version the geometry belongs to. */
  geometryVersionLabel?: string;
  /** Replaces the menu's footnote, for a viewer whose page has no Export report. */
  footnote?: ReactNode;
}

export function ViewerToolbarPill({
  hideDownloads = false,
  onResetView,
  views,
  activeViewId,
  onSelectView,
  downloadItems,
  onDownload,
  downloadDisabled = false,
  downloadingId = null,
  geometryVersionLabel,
  footnote,
}: ViewerToolbarPillProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Closes on a click outside or Escape.
  useDismissOnOutsideClick(menuOpen, rootRef, () => setMenuOpen(false));

  return (
    <div ref={rootRef} className="relative" data-testid="viewer-toolbar-pill">
      <div className="flex items-center gap-1 bg-card border border-border rounded-surface p-1 shadow-raised">
        <button
          type="button"
          onClick={onResetView}
          className="p-1.5 rounded-control text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          title="Reset view"
          aria-label="Reset view"
          data-testid="pill-reset-view"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-[18px] bg-border" />

        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelectView(view.id)}
            aria-pressed={activeViewId === view.id}
            data-testid={`pill-view-${view.id}`}
            className={cn(
              'text-[11.5px] font-medium px-2 py-1 rounded-control transition-colors',
              activeViewId === view.id
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {view.label}
          </button>
        ))}

        {!hideDownloads && <><span className="w-px h-[18px] bg-border" />

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          disabled={downloadDisabled}
          aria-expanded={menuOpen}
          data-testid="pill-download"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-foreground bg-muted rounded-control px-2.5 py-1 hover:bg-muted/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" />
          Download
          <ChevronDown className={cn('w-[11px] h-[11px] text-muted-foreground/60 transition-transform', menuOpen && 'rotate-180')} />
        </button></>}
      </div>

      {!hideDownloads && menuOpen && (
        <div
          className="absolute left-0 bottom-full mb-2 w-[280px] bg-card border border-border rounded-surface shadow-overlay overflow-hidden z-30"
          data-testid="download-menu"
        >
          <div className="px-3.5 py-2 text-[10px] font-semibold text-muted-foreground tracking-[.04em] border-b border-border/50">
            DOWNLOAD MODEL
          </div>
          {downloadItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`download-item-${item.id}`}
              disabled={downloadingId !== null}
              onClick={() => {
                void onDownload(item.id);
                // Keep the menu open while an item spins so the state is
                // visible; close on fire-and-forget items too once clicked.
                if (downloadingId === null) setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-muted/60 transition-colors disabled:opacity-60"
            >
              {downloadingId === item.id ? (
                <Loader2 className="w-3.5 h-3.5 text-foreground animate-spin shrink-0" />
              ) : (
                <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-medium text-foreground">{item.label}</span>
                <span className="block text-[10.5px] text-muted-foreground">{item.description}</span>
              </span>
            </button>
          ))}
          <div
            className="px-3.5 py-2 border-t border-border/50 text-[10.5px] text-muted-foreground"
            data-testid="download-menu-footnote"
          >
            {footnote ?? (geometryVersionLabel ? (
              <>Geometry of <span className="font-mono">{geometryVersionLabel}</span> · calculation report is under Export report</>
            ) : (
              <>Calculation report is under Export report</>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
