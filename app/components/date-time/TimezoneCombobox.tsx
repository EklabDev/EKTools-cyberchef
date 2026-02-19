"use client";

import { useState, useRef, useEffect } from 'react';
import { TIMEZONES, getTimezoneLabel } from '@/lib/date-time/timezones';

interface TimezoneComboboxProps {
  value: string;
  onChange: (iana: string) => void;
  label: string;
  required?: boolean;
}

export default function TimezoneCombobox({ value, onChange, label, required }: TimezoneComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayValue = value
    ? TIMEZONES.find(t => t.iana === value)
      ? getTimezoneLabel(TIMEZONES.find(t => t.iana === value)!)
      : value
    : '';

  const filtered = TIMEZONES.filter(tz => {
    const q = query.toLowerCase();
    return (
      tz.code.toLowerCase().includes(q) ||
      tz.name.toLowerCase().includes(q) ||
      tz.iana.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mb-4" ref={ref}>
      <label className="block text-sm font-medium text-slate-400 mb-1">
        {label} {required ? '*' : '(optional)'}
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Search timezone..."
          value={open ? query : displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(''); }}
        />
        {open && (
          <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded shadow-lg">
            {value && (
              <li
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-700 cursor-pointer"
                onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
              >
                Clear
              </li>
            )}
            {filtered.map(tz => (
              <li
                key={tz.iana}
                className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-slate-700 ${tz.iana === value ? 'text-blue-400' : 'text-slate-200'}`}
                onClick={() => { onChange(tz.iana); setOpen(false); setQuery(''); }}
              >
                {getTimezoneLabel(tz)}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-1.5 text-sm text-slate-500">No matches</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
