"use client";

import { SchemaFormat, FORMAT_LABELS } from '@/lib/schema-mapper/types';

const FORMATS: SchemaFormat[] = [
  'typescript',
  'java-lombok',
  'zod',
  'prisma',
  'go-struct',
  'pydantic',
  'json-schema',
];

interface FormatSelectProps {
  label: string;
  value: SchemaFormat;
  onChange: (format: SchemaFormat) => void;
}

export default function FormatSelect({ label, value, onChange }: FormatSelectProps) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
        {label}
      </label>
      <select
        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        value={value}
        onChange={e => onChange(e.target.value as SchemaFormat)}
      >
        {FORMATS.map(fmt => (
          <option key={fmt} value={fmt}>{FORMAT_LABELS[fmt]}</option>
        ))}
      </select>
    </div>
  );
}
