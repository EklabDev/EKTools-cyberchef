export interface FormatPreset {
  id: string;
  label: string;
  luxonFormat: string;
}

export const FORMAT_PRESETS: FormatPreset[] = [
  { id: 'iso8601',        label: 'ISO 8601',              luxonFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSZZZ" },
  { id: 'iso-date',       label: 'ISO Date (YYYY-MM-DD)', luxonFormat: 'yyyy-MM-dd' },
  { id: 'us',             label: 'MM/DD/YYYY',            luxonFormat: 'MM/dd/yyyy' },
  { id: 'eu',             label: 'DD/MM/YYYY',            luxonFormat: 'dd/MM/yyyy' },
  { id: 'us-short',       label: 'MM/DD/YY',              luxonFormat: 'MM/dd/yy' },
  { id: 'eu-short',       label: 'DD/MM/YY',              luxonFormat: 'dd/MM/yy' },
  { id: 'long-month',     label: 'DD MMM YYYY',           luxonFormat: 'dd MMM yyyy' },
  { id: 'full-month',     label: 'MMMM DD, YYYY',        luxonFormat: 'MMMM dd, yyyy' },
  { id: 'datetime-24h',   label: 'DD/MM/YYYY HH:mm',     luxonFormat: 'dd/MM/yyyy HH:mm' },
  { id: 'datetime-12h',   label: 'MM/DD/YYYY hh:mm a',   luxonFormat: 'MM/dd/yyyy hh:mm a' },
  { id: 'sql',            label: 'SQL (YYYY-MM-DD HH:mm:ss)', luxonFormat: 'yyyy-MM-dd HH:mm:ss' },
];

export function resolveFormat(formatOrPresetId: string): string {
  const preset = FORMAT_PRESETS.find(p => p.id === formatOrPresetId);
  return preset ? preset.luxonFormat : formatOrPresetId;
}
