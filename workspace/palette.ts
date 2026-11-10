/**
 * The palette of a host-element drawing (a precast element and the products cast into it): the platform's status roles
 * and neutral surfaces, read from the palette (they flip with the theme). Put on every surface that shows a zone colour
 * (the viewer, its legend, the chips in Results) so they agree.
 */
import { cn } from '../shell/cn';

/** Where a product may sit, as the engine's limits for the selected size say: not allowed, reduced, full capacity. */
export type DrawingZone = 'red' | 'amber' | 'green';

export const PANEL_DRAWING_PALETTE = cn(
  '[--zone-ok:var(--c-verified-icon)] [--zone-mid:var(--c-notcov-line)] [--zone-no:var(--c-error-icon)]',
  '[--zone-ok-bg:color-mix(in_srgb,var(--zone-ok)_16%,transparent)] [--zone-mid-bg:color-mix(in_srgb,var(--zone-mid)_16%,transparent)]',
  '[--zone-no-bg:color-mix(in_srgb,var(--zone-no)_9%,transparent)]',
  'dark:[--zone-ok-bg:color-mix(in_srgb,var(--zone-ok)_14%,transparent)] dark:[--zone-mid-bg:color-mix(in_srgb,var(--zone-mid)_12%,transparent)]',
  'dark:[--zone-no-bg:color-mix(in_srgb,var(--zone-no)_8%,transparent)]',
  '[--concrete:var(--c-muted)] [--concrete-top:var(--c-sunken)] [--concrete-side:var(--c-line)] [--frame:var(--c-line-strong)]',
  '[--ink:var(--c-ink-2)] [--ink-strong:var(--c-ink)]',
  // Dark: lighter than the viewer's ground, so the element reads as a solid body, not a hole.
  'dark:[--concrete:var(--c-line-strong)] dark:[--concrete-top:color-mix(in_srgb,var(--c-ink-2)_14%,var(--c-line-strong))]',
  'dark:[--concrete-side:color-mix(in_srgb,var(--c-line-strong)_25%,var(--c-line))] dark:[--frame:color-mix(in_srgb,var(--c-ink-2)_26%,var(--c-line-strong))]',
);

/** The worse of two zones (where two bands overlap). */
export const worseZone = (a: DrawingZone, b: DrawingZone): DrawingZone => (a === 'red' || b === 'red' ? 'red' : a === 'amber' || b === 'amber' ? 'amber' : 'green');

export const ZONE_COLOUR: Record<DrawingZone, string> = { red: 'var(--zone-no)', amber: 'var(--zone-mid)', green: 'var(--zone-ok)' };
const ZONE_TINT: Record<DrawingZone, string> = { red: 'var(--zone-no-bg)', amber: 'var(--zone-mid-bg)', green: 'var(--zone-ok-bg)' };
/** A zone's fill: red is hatched (the pattern whose id is `hatch`), the others tinted. */
export const zoneFill = (zone: DrawingZone, hatch: string) => (zone === 'red' ? `url(#${hatch})` : ZONE_TINT[zone]);
