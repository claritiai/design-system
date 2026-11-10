'use client';

/**
 * What sits over a host-element drawing in the viewer: the switch between the element and the product in 3D, the line
 * of what the check still needs, and the legend of the zones (square swatches: they name the bands on the element, the
 * products are drawn neutral).
 */
import type { ReactNode } from 'react';
import { cn } from '../shell/cn';
import { ZONE_COLOUR, type DrawingZone } from './palette';

/** The element in 3D, the element drawn, the product in 3D. */
export type ViewMode = 'element3d' | 'panel' | 'product';

/** The element in 3D has the same name in every viewer that offers it. */
const ELEMENT_3D_LABEL = '3D';

/** `modes`: the views this viewer offers, in order (the element drawn and the product, unless it says otherwise). */
export function ViewSwitch({ mode, onChange, productDisabled, labels, modes = ['panel', 'product'] }: {
  mode: ViewMode; onChange: (mode: ViewMode) => void; productDisabled: boolean; labels: Partial<Record<ViewMode, string>>;
  modes?: readonly ViewMode[];
}) {
  return (
    <div role="radiogroup" aria-label="View" className="absolute left-3 top-3 z-10 inline-flex rounded-control border border-border bg-card/95 p-0.5 shadow-sm">
      {modes.map(value => (
        <button key={value} type="button" role="radio" aria-checked={mode === value} disabled={value === 'product' && productDisabled}
          onClick={() => onChange(value)}
          className={cn('rounded-tight px-2.5 py-1 text-[11.5px] disabled:opacity-40', mode === value ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          {value === 'element3d' ? ELEMENT_3D_LABEL : labels[value]}
        </button>
      ))}
    </div>
  );
}

/**
 * A line over the drawing, in the warn tone: what the check still needs (`lead` "Still to state"), or why it has none.
 * It sits below the view switch; a viewer without one (`noSwitch`) has it at the top.
 */
export function DrawingNotice({ lead, noSwitch, children }: { lead?: string; noSwitch?: boolean; children: ReactNode }) {
  return (
    <div role="status" className={cn('absolute inset-x-3 z-10 mx-auto', noSwitch ? 'top-3' : 'top-14', 'w-fit max-w-[520px] rounded-control border border-status-warn-border bg-status-warn-bg px-3 py-1.5 text-[11.5px] text-foreground')}>
      {lead && <span className="font-semibold text-status-warn">{lead} · </span>}{children}
    </div>
  );
}

/** The legend under the drawing: a note line (what is not stated), then one swatch per zone shown. */
export function ZoneLegend({ note, zones }: { note?: ReactNode; zones?: readonly { zone: DrawingZone; label: string }[] }) {
  const swatch = (colour: string) => <span className="inline-block h-2.5 w-2.5 rounded-xs" style={{ background: colour }} />;
  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1 text-[11.5px] text-muted-foreground">
      {note && <p className="rounded-control bg-card/95 px-2 py-1">{note}</p>}
      {zones && zones.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-control bg-card/95 px-2 py-1">
          {zones.map(z => <span key={z.zone} className="flex items-center gap-1.5">{swatch(ZONE_COLOUR[z.zone])} {z.label}</span>)}
        </div>
      )}
    </div>
  );
}
