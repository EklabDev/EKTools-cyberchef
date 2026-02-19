"use client";

import { Copy, Download } from 'lucide-react';
import { SchemaFormat, FORMAT_EXTENSIONS } from '@/lib/schema-mapper/types';

interface OutputPanelProps {
  output: string;
  targetFormat: SchemaFormat;
}

export default function OutputPanel({ output, targetFormat }: OutputPanelProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const download = () => {
    const ext = FORMAT_EXTENSIONS[targetFormat];
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-1/3 flex flex-col bg-slate-950">
      <div className="p-3 bg-slate-900/50 border-b border-slate-800 font-semibold text-sm flex justify-between items-center">
        <span>Output</span>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!output}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed"
          >
            <Copy size={12} /> Copy
          </button>
          <button
            onClick={download}
            disabled={!output}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed"
          >
            <Download size={12} /> Download
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <textarea
          readOnly
          className="absolute inset-0 bg-transparent p-4 resize-none outline-none font-mono text-sm leading-relaxed text-green-400"
          placeholder="Result will appear here..."
          value={output}
        />
      </div>
      <div className="p-2 border-t border-slate-800 text-xs text-slate-500 text-right">
        {output.length} chars
      </div>
    </div>
  );
}
