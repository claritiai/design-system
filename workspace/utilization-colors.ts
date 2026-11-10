/** How near a utilisation (a percentage) is to its limit, as a fill, a text colour and an SVG stroke. */
export function getUtilizationColor(utilization: number): string {
  if (utilization <= 40) return 'bg-muted-foreground/30';
  if (utilization <= 80) return 'bg-status-pass';
  if (utilization <= 95) return 'bg-status-warn';
  return 'bg-status-fail';
}

export function getUtilizationTextColor(utilization: number): string {
  if (utilization <= 40) return 'text-muted-foreground';
  if (utilization <= 80) return 'text-status-pass';
  if (utilization <= 95) return 'text-status-warn';
  return 'text-status-fail';
}

// SVG stroke color for gauges, applied as a style so the token resolves
export function getUtilizationStrokeColor(utilization: number): string {
  if (utilization <= 40) return 'var(--muted-foreground)';
  if (utilization <= 80) return 'var(--status-pass)';
  if (utilization <= 95) return 'var(--status-warn)';
  return 'var(--status-fail)';
}
