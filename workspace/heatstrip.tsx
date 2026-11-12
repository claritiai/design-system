'use client';

/** Every check as a small cell in its utilisation colour, in a row, each naming itself and its percent on hover. */
import React, { memo } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { getUtilizationColor } from './utilization-colors';

interface HeatstripCheck {
  id: string;
  name: string;
  utilization: number;
  passed: boolean;
}

interface HeatstripProps {
  checks: HeatstripCheck[];
  onCheckClick?: (id: string) => void;
}

const HeatstripComponent = ({ checks, onCheckClick }: HeatstripProps) => {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground mb-1 block">
        Utilization Overview
      </span>
      <div className="flex flex-row gap-0.5">
        {checks.map((check) => (
          <Tooltip key={check.id}>
            <TooltipTrigger asChild>
              <div
                className={`w-5 h-2 rounded-sm cursor-pointer ${getUtilizationColor(check.utilization)}`}
                onClick={() => onCheckClick?.(check.id)}
              />
            </TooltipTrigger>
            <TooltipContent>
              {check.name}: {Math.round(check.utilization)}%
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export const Heatstrip = memo(HeatstripComponent);
