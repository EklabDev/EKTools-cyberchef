"use client";

import { useState, useRef, useEffect } from 'react';
import { FORMAT_PRESETS, resolveFormat } from '@/lib/date-time/format-presets';
import { validateFormat } from '@/lib/transformers/date';

interface FormatPresetInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

export default function FormatPresetInput({ value, onChange, label, required }: FormatPresetInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedPreset = FORMAT_PRESETS.find(p => p.id === value);
  const displayValue = selectedPreset ? `${selectedPreset.label} (${selectedPreset.luxonFormat})` : value;

  const filtered = FORMAT_PRESETS.filter(p => {
    const q = query.toLowerCase();
    return p.label.toLowerCase().includes(q) || p.luxonFormat.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const handleCustomBlur = () => {
    if (value && !FORMAT_PRESETS.find(p => p.id === value)) {
      if (!validateFormat(value)) {
        setValidationError(`Invalid Luxon format: "${value}"`);
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  };

  return (
    <div className="mb-4" ref={ref}>
      <label className="block text-sm font-medium text-slate-400 mb-1">
        {label} {required ? '*' : '(optional)'}
      </label>
      <div className="relative">
        <input
          type="text"
          className={`w-full bg-slate-800 border rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${validationError ? 'border-red-500' : 'border-slate-700'}`}
          placeholder="Select preset or type Luxon format..."
          value={open ? query : displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
          onBlur={handleCustomBlur}
          onKeyDown={e => {
            if (e.key === 'Enter' && query) {
              onChange(query);
              setOpen(false);
            }
          }}
        />
        {open && (
          <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded shadow-lg">
            {value && (
              <li
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-700 cursor-pointer"
                onMouseDown={() => { onChange(''); setOpen(false); setQuery(''); setValidationError(''); }}
              >
                Clear
              </li>
            )}
            {filtered.map(p => (
              <li
                key={p.id}
                className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-700 ${p.id === value ? 'text-blue-400' : 'text-slate-200'}`}
                onMouseDown={() => { onChange(p.id); setOpen(false); setQuery(''); setValidationError(''); }}
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-slate-500 ml-2 text-xs">{p.luxonFormat}</span>
              </li>
            ))}
            {query && !filtered.length && (
              <li
                className="px-3 py-1.5 text-sm text-slate-400 cursor-pointer hover:bg-slate-700"
                onMouseDown={() => { onChange(query); setOpen(false); }}
              >
                Use custom: <span className="font-mono text-blue-400">{query}</span>
              </li>
            )}
            {query && filtered.length > 0 && (
              <li
                className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:bg-slate-700 border-t border-slate-700"
                onMouseDown={() => { onChange(query); setOpen(false); }}
              >
                Use custom: <span className="font-mono text-blue-400">{query}</span>
              </li>
            )}
          </ul>
        )}
      </div>
      {validationError && (
        <p className="text-xs text-red-400 mt-1">{validationError}</p>
      )}
    </div>
  );
}
