'use client';

/** One check as a row (number, name, utilisation bar, Pass or Fail) that opens to show its working underneath. */
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Badge } from './badge';
import { UtilizationBar } from './utilization-bar';
import type { NormalizedCheck } from './check-types';

interface ExpandableCheckRowProps {
  check: NormalizedCheck;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const ExpandableCheckRowComponent = ({
  check,
  isExpanded,
  onToggle,
  children,
}: ExpandableCheckRowProps) => {
  return (
    <div>
      <div
        role="row"
        onClick={onToggle}
        className="grid grid-cols-[40px_1fr_140px_60px_24px] items-center px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border"
        aria-expanded={isExpanded}
      >
        <span className="text-xs font-mono text-muted-foreground">
          {check.number}
        </span>
        <span className="text-sm text-foreground">{check.name}</span>
        <UtilizationBar utilization={check.utilization} showLabel />
        <Badge variant={check.passed ? 'success' : 'destructive'}>
          {check.passed ? 'Pass' : 'Fail'}
        </Badge>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 py-3 bg-muted/10 border-b border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ExpandableCheckRow = memo(ExpandableCheckRowComponent);
