'use client';

/** A half-circle gauge of one utilisation in percent, with PASS or FAIL under it; the arc fills in as it appears. */
import React, { memo } from 'react';
import { motion } from 'motion/react';
import { getUtilizationStrokeColor } from './utilization-colors';

interface RadialGaugeProps {
  value: number;
  passed: boolean;
  label: string;
  size?: number;
}

const radius = 40;
const fullCirc = 2 * Math.PI * radius;
const halfCirc = Math.PI * radius;

const RadialGaugeComponent = ({ value, passed, label, size = 120 }: RadialGaugeProps) => {
  const filled = (value / 100) * halfCirc;
  const strokeColor = getUtilizationStrokeColor(value);

  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ width: size, height: size }}
      className="flex flex-col items-center justify-center"
    >
      <svg viewBox="0 0 100 100" width={size} height={size * 0.7}>
        {/* Background arc */}
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${halfCirc} ${fullCirc}`}
          transform="rotate(180 50 50)"
        />
        {/* Foreground arc */}
        <motion.circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          style={{ stroke: strokeColor }}
          strokeWidth={8}
          strokeLinecap="round"
          transform="rotate(180 50 50)"
          initial={{ strokeDasharray: `0 ${fullCirc}` }}
          animate={{ strokeDasharray: `${filled} ${fullCirc}` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Centre percentage */}
        <text
          x={50}
          y={52}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ fontSize: '16px', fontFamily: 'var(--font-mono)' }}
        >
          {Math.round(value)}%
        </text>
      </svg>
      <span
        className={`text-[10px] font-medium ${passed ? 'text-status-pass' : 'text-destructive'}`}
      >
        {passed ? 'PASS' : 'FAIL'}
      </span>
    </div>
  );
};

export const RadialGauge = memo(RadialGaugeComponent);
