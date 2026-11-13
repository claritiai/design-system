/** The shapes the Results parts read: one check as a gauge, a strip or a row draws it, and checks grouped by action. */

/** One check: its number and name, its utilisation in percent (0-100) and whether it passes. */
export interface NormalizedCheck {
  id: string;
  number: string;
  name: string;
  /** Utilisation in percent (74 = 74 %). */
  utilization: number;
  passed: boolean;
  keyValues?: Array<{ label: string; value: string }>;
}

/** A check with the demand and capacity it compares, for the bar that draws the one against the other. */
export interface DemandCapacityCheck extends NormalizedCheck {
  demand: { label: string; value: number; unit: string };
  capacity: { label: string; value: number; unit: string };
}

/** One row of the Results tab's check list. */
export interface ResultsCheckRow {
  id: string;
  name: string;
  /** Utilisation ratio (0.74 = 74 %). Undefined when the check ran without a ratio. */
  ratio?: number;
  passed: boolean;
  /** Skipped checks are listed greyed out and take no part in which check governs. */
  skipped?: boolean;
  /** On exactly one row: the check that is not skipped with the highest ratio. */
  governing?: boolean;
}

/** The checks of one action, under its label. */
export interface ResultsCheckGroup {
  label: string;
  checks: ResultsCheckRow[];
}

/** Every check grouped by action, with the counts and the governing check. */
export interface ResultsGroupsSummary {
  groups: ResultsCheckGroup[];
  totalChecks: number;
  passedChecks: number;
  allPassed: boolean;
  /** The highest utilisation ratio across the checks that are not skipped, if any. */
  governingRatio?: number;
  governingName?: string;
}
