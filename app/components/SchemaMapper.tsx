"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play } from 'lucide-react';
import { SchemaFormat } from '@/lib/schema-mapper/types';
import { validateInput } from '@/lib/schema-mapper/formats';
import { convert } from '@/lib/schema-mapper/pipeline';
import { FORMAT_NOTES } from '@/lib/schema-mapper/format-notes';
import FormatSelect from './schema-mapper/FormatSelect';
import OutputPanel from './schema-mapper/OutputPanel';

const DEBOUNCE_MS = 400;
const MAX_INPUT_SIZE = 500_000;

export default function SchemaMapper() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [sourceFormat, setSourceFormat] = useState<SchemaFormat>('typescript');
  const [targetFormat, setTargetFormat] = useState<SchemaFormat>('json-schema');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runValidation = useCallback((text: string, format: SchemaFormat) => {
    if (!text.trim()) {
      setIsValid(false);
      setValidationError(null);
      return;
    }
    if (text.length > MAX_INPUT_SIZE) {
      setIsValid(false);
      setValidationError(`Input too large (${(text.length / 1000).toFixed(0)}KB). Max: ${MAX_INPUT_SIZE / 1000}KB`);
      return;
    }
    const result = validateInput(format, text);
    setIsValid(result.valid);
    setValidationError(result.valid ? null : result.error ?? 'Validation failed');
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runValidation(input, sourceFormat);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, sourceFormat, runValidation]);

  const handleConvert = async () => {
    setConversionError(null);
    setIsConverting(true);
    try {
      const result = await convert(sourceFormat, targetFormat, input);
      if (result.error) {
        setConversionError(result.error);
        setOutput('');
      } else {
        setOutput(result.output ?? '');
      }
    } catch (e: any) {
      setConversionError(e.message);
      setOutput('');
    } finally {
      setIsConverting(false);
    }
  };

  const handleSourceFormatChange = (format: SchemaFormat) => {
    setSourceFormat(format);
    setConversionError(null);
  };

  const handleTargetFormatChange = (format: SchemaFormat) => {
    setTargetFormat(format);
    setConversionError(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Source Input */}
        <div className="w-1/3 flex flex-col border-r border-slate-800 bg-slate-950">
          <div className="p-3 bg-slate-900/50 border-b border-slate-800 font-semibold text-sm flex justify-between items-center">
            <span>Source</span>
            <button onClick={() => { setInput(''); setOutput(''); setConversionError(null); }} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          <textarea
            className="flex-1 bg-transparent p-4 resize-none outline-none font-mono text-sm leading-relaxed"
            placeholder="Paste your schema / type definition here..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="p-2 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>
              {validationError && input.trim() ? (
                <span className="text-red-400">{validationError}</span>
              ) : input.trim() && isValid ? (
                <span className="text-green-400">Valid</span>
              ) : null}
            </span>
            <span>{input.length} chars</span>
          </div>
        </div>

        {/* Middle: Controls */}
        <div className="w-1/3 flex flex-col bg-slate-900 border-r border-slate-800">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <FormatSelect
                label="Source Format"
                value={sourceFormat}
                onChange={handleSourceFormatChange}
              />
            </div>

            <div className="mb-6">
              <FormatSelect
                label="Target Format"
                value={targetFormat}
                onChange={handleTargetFormatChange}
              />
            </div>

            <div className="mb-6 p-3 bg-slate-800/50 rounded text-xs text-slate-400 leading-relaxed">
              <p className="mb-1"><span className="text-slate-300 font-semibold">Source:</span> {FORMAT_NOTES[sourceFormat]}</p>
              <p><span className="text-slate-300 font-semibold">Target:</span> {FORMAT_NOTES[targetFormat]}</p>
            </div>

            <button
              onClick={handleConvert}
              disabled={!isValid || isConverting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              <Play size={16} />
              {isConverting ? 'Converting...' : 'Transform'}
            </button>

            {conversionError && (
              <div className="mt-6 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm break-words">
                <strong>Conversion Error:</strong> {conversionError}
              </div>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <OutputPanel output={output} targetFormat={targetFormat} />
      </div>
    </div>
  );
}
