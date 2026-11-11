'use client';

/**
 * The SVG parts a host-element drawing is made of: text on a halo, the default mark, the selected item's name pill,
 * dimension chains and the hatch of a zone where nothing may sit. They draw in the drawing's palette
 * (`PANEL_DRAWING_PALETTE`, ./palette) and the theme's roles; the drawing is 1000 units wide.
 */
import type { ReactNode } from 'react';
import { DEFAULT_MARK_TEXT } from './default-mark';

/** Text sizes in viewBox units (the drawing is 1000 wide, about 0.7–1.1 px per unit on screen). */
export const T = { label: 21, value: 19, dim: 18, caption: 16 } as const;
export const fmt = (n: number) => Math.round(n).toLocaleString('en-GB');

/** Text that stays readable over lines and zones: a halo of the viewer's ground behind it. `align` sets where the text sits on x. */
export function Label({ x, y, size, align = 'start', weight, muted, fill, children }: {
  x: number; y: number; size: number; align?: 'start' | 'middle' | 'end'; weight?: number; muted?: boolean;
  /** A colour role other than the ink (an unstated fact the engineer must give). */
  fill?: string; children: ReactNode;
}) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor={align} fontWeight={weight} fill={fill ?? (muted ? 'var(--ink)' : 'var(--ink-strong)')}
      stroke="var(--card)" strokeWidth={size / 3.2} strokeLinejoin="round" paintOrder="stroke" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {children}
    </text>
  );
}

/** The engine's default, as the Parameters tab marks it. */
export function DefaultPill({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y - 15} width={62} height={20} rx={10} fill="var(--assumed-bg)" />
      <text x={x + 31} y={y} fontSize={13} textAnchor="middle" fill="var(--assumed)" fontWeight={600}>{DEFAULT_MARK_TEXT}</text>
    </g>
  );
}

/**
 * The selected item's name: the drawing's strongest ink as a pill, the name in the viewer's ground. Its width fits a
 * two-character name (44 units at the label size, padded each side).
 */
export function NamePill({ x, y, align, testId, children }: {
  x: number; y: number; align: 'start' | 'middle' | 'end'; testId?: string; children: ReactNode;
}) {
  const width = 44, height = 28, pad = 8;
  const left = align === 'start' ? x - pad : align === 'middle' ? x - width / 2 : x - width + pad;
  return (
    <g data-testid={testId}>
      <rect x={left} y={y - 21} width={width} height={height} rx={height / 2} fill="var(--ink-strong)" />
      <text x={x} y={y} fontSize={T.label} textAnchor={align} fontWeight={700} fill="var(--card)" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {children}
      </text>
    </g>
  );
}

/**
 * A dimension chain: one line with a tick at each position (in mm from the origin, drawn at `s` units per mm from `x0`)
 * and each length written over its gap.
 */
export function Dimensions({ x0, s, y, ticks, caption }: { x0: number; s: number; y: number; ticks: number[]; caption?: string }) {
  return (
    <g>
      <line x1={x0 + ticks[0] * s} y1={y} x2={x0 + ticks[ticks.length - 1] * s} y2={y} stroke="var(--ink)" strokeOpacity="0.7" />
      {ticks.map((u, i) => <line key={i} x1={x0 + u * s} y1={y - 7} x2={x0 + u * s} y2={y + 7} stroke="var(--ink)" />)}
      {ticks.slice(1).map((u, i) => {
        const from = ticks[i], length = u - from;
        return length > 0 ? <Label key={i} x={x0 + ((from + u) / 2) * s} y={y - 10} size={T.dim} align="middle">{fmt(length)}</Label> : null;
      })}
      {caption && <Label x={x0} y={y + 32} size={T.caption} muted>{caption}</Label>}
    </g>
  );
}

/** A dimension chain down the drawing at `x`: ticks in mm from the origin, drawn at `s` units per mm from `y0`, each
 *  length written to the left of its gap. */
export function DimensionsY({ y0, s, x, ticks }: { y0: number; s: number; x: number; ticks: number[] }) {
  return (
    <g>
      <line x1={x} y1={y0 + ticks[0] * s} x2={x} y2={y0 + ticks[ticks.length - 1] * s} stroke="var(--ink)" strokeOpacity="0.7" />
      {ticks.map((v, i) => <line key={i} x1={x - 7} y1={y0 + v * s} x2={x + 7} y2={y0 + v * s} stroke="var(--ink)" />)}
      {ticks.slice(1).map((v, i) => {
        const from = ticks[i], length = v - from;
        return length > 0 ? <Label key={i} x={x - 10} y={y0 + ((from + v) / 2) * s + 6} size={T.dim} align="end">{fmt(length)}</Label> : null;
      })}
    </g>
  );
}

/** The hatch of a zone where nothing may sit (zoneFill 'red'). */
export function Hatch({ id }: { id: string }) {
  return (
    <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="var(--zone-no-bg)" />
      <line x1="0" y1="0" x2="0" y2="10" stroke="var(--zone-no)" strokeWidth="2" strokeOpacity="0.45" />
    </pattern>
  );
}

/** A pointer position in the drawing's own units (the viewBox), or null when the drawing has no screen transform. */
export function pointInDrawing(svg: SVGSVGElement, event: { clientX: number; clientY: number }): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
  return { x: point.x, y: point.y };
}
