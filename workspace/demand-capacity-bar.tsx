'use client';

/** The demand drawn against the capacity it is checked against, both values named above the bar, the percent on it. */
import React, { memo } from 'react';
import { getUtilizationColor } from './utilization-colors';

interface DemandCapacityBarProps {
  demand: { label: string; value: number; unit: string };
  capacity: { label: string; value: number; unit: string };
  utilization: number;
}

const DemandCapacityBarComponent = ({
  demand,
  capacity,
  utilization,
}: DemandCapacityBarProps) => {
  const demandWidth = capacity.value > 0
    ? Math.min((demand.value / capacity.value) * 100, 100)
    : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="text-xs font-mono">
          {demand.label}: {demand.value} {demand.unit}
        </span>
        <span className="text-xs font-mono">
          {capacity.label}: {capacity.value} {capacity.unit}
        </span>
      </div>
      <div className="relative h-5 w-full rounded bg-muted overflow-hidden">
        {/* Capacity (the background) */}
        <div className="absolute inset-0 bg-status-pass-bg" />
        {/* Demand (the foreground) */}
        <div
          className={`absolute inset-y-0 left-0 ${getUtilizationColor(utilization)}`}
          style={{
            width: `${demandWidth}%`,
            transition: 'width 300ms ease',
          }}
        />
        {/* Utilisation */}
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground mix-blend-difference">
          {Math.round(utilization)}%
        </span>
      </div>
    </div>
  );
};

export const DemandCapacityBar = memo(DemandCapacityBarComponent);
