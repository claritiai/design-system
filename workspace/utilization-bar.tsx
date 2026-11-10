'use client';

import { memo } from 'react';
import { cn } from '../shell/cn';
import { getUtilizationColor, getUtilizationTextColor } from './utilization-colors';

interface UtilizationBarProps {
  utilization: number;
  showLabel?: boolean;
  /**
   * Colour by the verdict instead of by how near the value is to the limit: for a list of options that each pass or
   * fail as a whole, where a high utilisation is the point (the lightest size that passes), not a warning.
   */
  verdict?: 'pass' | 'fail';
  className?: string;
}

const VERDICT_COLOR = { pass: 'bg-status-pass', fail: 'bg-status-fail' } as const;

const UtilizationBarComponent = ({ utilization, showLabel, verdict, className }: UtilizationBarProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${verdict ? VERDICT_COLOR[verdict] : getUtilizationColor(utilization)}`}
          style={{
            width: `${Math.min(utilization, 100)}%`,
            transition: 'width 300ms ease',
          }}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold min-w-[36px] text-right ${getUtilizationTextColor(utilization)}`}
        >
          {Math.round(utilization)}%
        </span>
      )}
    </div>
  );
};

export const UtilizationBar = memo(UtilizationBarComponent);
