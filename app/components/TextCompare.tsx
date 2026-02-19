"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';
import { computeDiff, DiffLine } from '@/lib/text-compare/diff-helper';

const MAX_INPUT_SIZE = 100_000;

export default function TextCompare() {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [sourceDiff, setSourceDiff] = useState<DiffLine[]>([]);
  const [targetDiff, setTargetDiff] = useState<DiffLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canCompare = source.trim().length > 0 && target.trim().length > 0;

  const handleCompare = () => {
    if (!canCompare) return;
    setError(null);
    if (source.length > MAX_INPUT_SIZE || target.length > MAX_INPUT_SIZE) {
      setError(`Input too large. Max ${MAX_INPUT_SIZE / 1000}K characters per side.`);
      setSourceDiff([]);
      setTargetDiff([]);
      return;
    }
    try {
      const result = computeDiff(source, target);
      setSourceDiff(result.sourcePerspective);
      setTargetDiff(result.targetPerspective);
    } catch (e: any) {
      setError(e.message);
      setSourceDiff([]);
      setTargetDiff([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Compare button bar */}
      <div className="shrink-0 px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-4">
        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          <Play size={14} /> Compare
        </button>
        {error && (
          <span className="text-red-400 text-xs">{error}</span>
        )}
      </div>

      {/* Four-quadrant grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 overflow-hidden">
        {/* Top-left: Source input */}
        <div className="flex flex-col border-r border-b border-slate-800 bg-slate-950 overflow-hidden">
          <div className="p-2 bg-slate-900/50 border-b border-slate-800 font-semibold text-xs flex justify-between items-center">
            <span>Source</span>
            <button onClick={() => setSource('')} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          <textarea
            className="flex-1 bg-transparent p-3 resize-none outline-none font-mono text-sm leading-relaxed"
            placeholder="Paste source text..."
            value={source}
            onChange={e => setSource(e.target.value)}
          />
          <div className="p-1.5 border-t border-slate-800 text-xs text-slate-500 text-right">
            {source.length} chars
          </div>
        </div>

        {/* Top-right: Target input */}
        <div className="flex flex-col border-b border-slate-800 bg-slate-950 overflow-hidden">
          <div className="p-2 bg-slate-900/50 border-b border-slate-800 font-semibold text-xs flex justify-between items-center">
            <span>Target</span>
            <button onClick={() => setTarget('')} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          <textarea
            className="flex-1 bg-transparent p-3 resize-none outline-none font-mono text-sm leading-relaxed"
            placeholder="Paste target text..."
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
          <div className="p-1.5 border-t border-slate-800 text-xs text-slate-500 text-right">
            {target.length} chars
          </div>
        </div>

        {/* Bottom-left: Source perspective diff */}
        <div className="flex flex-col border-r border-slate-800 bg-slate-950 overflow-hidden">
          <div className="p-2 bg-slate-900/50 border-b border-slate-800 font-semibold text-xs">
            Diff — Source Perspective
          </div>
          <DiffView lines={sourceDiff} perspective="source" />
        </div>

        {/* Bottom-right: Target perspective diff */}
        <div className="flex flex-col bg-slate-950 overflow-hidden">
          <div className="p-2 bg-slate-900/50 border-b border-slate-800 font-semibold text-xs">
            Diff — Target Perspective
          </div>
          <DiffView lines={targetDiff} perspective="target" />
        </div>
      </div>
    </div>
  );
}

function DiffView({ lines, perspective }: { lines: DiffLine[]; perspective: 'source' | 'target' }) {
  if (lines.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        {perspective === 'source' ? 'Source diff will appear here...' : 'Target diff will appear here...'}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto font-mono text-sm leading-relaxed p-3">
      {lines.map((line, i) => {
        let bgClass = '';
        let textClass = 'text-slate-300';
        let prefix = '  ';

        if (line.type === 'removed') {
          bgClass = 'bg-red-900/30';
          textClass = 'text-red-300';
          prefix = '- ';
        } else if (line.type === 'added') {
          bgClass = 'bg-green-900/30';
          textClass = 'text-green-300';
          prefix = '+ ';
        }

        return (
          <div key={i} className={`px-2 py-0.5 ${bgClass} ${textClass} whitespace-pre-wrap break-all`}>
            <span className="select-none opacity-50 mr-2">{prefix}</span>
            {line.text}
          </div>
        );
      })}
    </div>
  );
}
