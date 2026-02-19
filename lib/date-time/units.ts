export const DURATION_UNITS = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds',
] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];
