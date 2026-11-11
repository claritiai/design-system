'use client';

/**
 * A precast element with products cast into one face, in 3D: the shared page `/viewer-theme/cast-in-element.html` (served
 * by the host with the rest of viewer-theme) in a frame, sent the family's scene and listened to. The family builds the
 * scene from its engine's view entry; this part only carries it and reports what the engineer does: a product picked,
 * the group of products dragged on the face (by dx, dy mm, once, on release), an edge dragged (its distance to the
 * outermost product, once, on release). Words come from the family: the page draws names, values and the default mark.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_MARK_TEXT } from './default-mark';

export const ELEMENT_3D_URL = '/viewer-theme/cast-in-element.html';
const THEME_MESSAGE = 'clariti-viewer-theme';

export type Element3dSide = 'x_minus' | 'x_plus' | 'y_minus' | 'y_plus';

/** The scene in the face frame (mm): x to the right, y up, the face the products are cast into at z = 0. */
export interface Element3dScene {
  /** The element as drawn: to its stated or assumed edges, or this far past the products where a side is not known. */
  element: { x0: number; x1: number; y0: number; y1: number; thickness_mm: number };
  /** How each side is drawn: the element's outline, an assumed edge (the default tone and mark), not stated, or cut
   *  short because it is farther than the view shows (its dimension still the true distance). */
  sides: Record<Element3dSide, 'stated' | 'assumed' | 'open' | 'beyond'>;
  zones: { x0: number; x1: number; y0: number; y1: number; zone: 'red' | 'amber' | 'green' }[];
  /** Each product at its face position; `mesh` names its exact model in a catalogue the host serves. */
  products: { x: number; y: number; name: string; rotation_deg?: number; mesh: { base: string; id: string } | null; length_mm?: number; diameter_mm?: number }[];
  plate: { x0: number; x1: number; y0: number; y1: number; thickness_mm: number } | null;
  /** Tension out of the face, a shear on the face towards `dir`. */
  loads: { kind: 'tension' | 'shear'; at: [number, number]; dir?: [number, number]; text: string; assumed?: boolean }[];
  dims: { from: [number, number]; to: [number, number]; text: string; assumed?: boolean }[];
  caption: string;
  /** 'flat' (default): the element lies with the face on top, the products pointing down into it, as an element is
   *  cast; 'upright': the face towards the viewer. */
  orientation?: 'flat' | 'upright';
  /** The farthest an edge can be dragged (mm from the products): as far as the view draws an edge. */
  maxEdge_mm?: number;
  /** What the engineer may not state is shown, not dragged. */
  movable: boolean;
  selected: number | null;
  /** The words the page draws: the default mark and a side not stated. */
  words?: { open?: string };
}

type PageMessage =
  | { type: 'cast-in-element-ready' }
  | { type: 'cast-in-element-select'; index: number }
  | { type: 'cast-in-element-drop'; dx: number; dy: number }
  | { type: 'cast-in-element-edge'; side: Element3dSide; mm: number };

export interface Element3dProps {
  scene: Element3dScene;
  theme?: 'light' | 'dark';
  /** Where the host serves the page; the design system's own path by default. */
  src?: string;
  title?: string;
  onSelect?: (index: number | null) => void;
  /** The products moved together on the face by (dx, dy) mm. */
  onDrop?: (dx: number, dy: number) => void;
  /** An edge dragged: its distance to the outermost product on that side (mm). */
  onEdge?: (side: Element3dSide, mm: number) => void;
}

export function Element3d({ scene, theme = 'light', src = ELEMENT_3D_URL, title = 'Element in 3D', onSelect, onDrop, onEdge }: Element3dProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [bootTheme] = useState(theme);
  const json = JSON.stringify({ ...scene, words: { assumed: DEFAULT_MARK_TEXT, open: scene.words?.open ?? 'not stated' } });
  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'cast-in-element-scene', scene: JSON.parse(json) }, window.location.origin);
  }, [json]);
  const pushTheme = useCallback((next: 'light' | 'dark') => {
    frame.current?.contentWindow?.postMessage({ type: THEME_MESSAGE, theme: next }, window.location.origin);
  }, []);
  useEffect(() => { pushTheme(theme); }, [theme, pushTheme]);
  const latest = useRef({ onSelect, onDrop, onEdge });
  useEffect(() => { latest.current = { onSelect, onDrop, onEdge }; });
  useEffect(() => {
    const receive = (event: MessageEvent<PageMessage>) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data, now = latest.current;
      if (data?.type === 'cast-in-element-ready') send();
      else if (data?.type === 'cast-in-element-select') now.onSelect?.(data.index);
      else if (data?.type === 'cast-in-element-drop') now.onDrop?.(data.dx, data.dy);
      else if (data?.type === 'cast-in-element-edge') now.onEdge?.(data.side, data.mm);
    };
    window.addEventListener('message', receive);
    send();
    return () => window.removeEventListener('message', receive);
  }, [send]);
  return (
    <div className="relative h-full min-h-[280px] w-full" data-testid="element-3d">
      <iframe ref={frame} src={`${src}?theme=${bootTheme}`} title={title} onLoad={() => { pushTheme(theme); send(); }}
        className="absolute inset-0 h-full w-full border-0" />
    </div>
  );
}
