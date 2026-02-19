"use client";

import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import CyberChef from "../components/CyberChef";
import ImageTools from "../components/ImageTools";
import SchemaMapper from "../components/SchemaMapper";
import { Box, Type, Image as ImageIcon, ArrowLeftRight } from 'lucide-react';
import { parseUrlState, setUrlState, buildTitle, type AppMode, type UrlState } from '@/lib/url-state';
import { allTools } from '@/lib/all-tools';

function withDefaults(s: UrlState): UrlState {
  if (s.mode === 'text') {
    const categories = Array.from(new Set(allTools.map(t => t.category)));
    const cat = (s.category && categories.includes(s.category)) ? s.category : allTools[0].category;
    const toolsInCat = allTools.filter(t => t.category === cat);
    const tool = (s.tool && toolsInCat.some(t => t.name === s.tool)) ? s.tool : toolsInCat[0]?.name;
    return { ...s, category: cat, tool };
  }
  return s;
}

export default function Page() {
  const [state, setState] = useState<UrlState>({ mode: 'text' });
  const [urlKey, setUrlKey] = useState(0);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const urlState = withDefaults(parseUrlState());
    setState(urlState);
    setUrlState(urlState);
    document.title = buildTitle(urlState);
    setReady(true);
  }, []);

  useEffect(() => {
    document.title = buildTitle(state);
  }, [state]);

  useEffect(() => {
    const handler = () => {
      const newState = parseUrlState();
      setState(newState);
      document.title = buildTitle(newState);
      setUrlKey(k => k + 1);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleModeChange = (newMode: AppMode) => {
    const newState: UrlState = { mode: newMode };
    setState(newState);
    setUrlState(newState);
    document.title = buildTitle(newState);
    setUrlKey(k => k + 1);
  };

  const handleTextStateChange = useCallback((category: string, tool: string) => {
    const next: UrlState = { mode: 'text', category, tool };
    setState(next);
    setUrlState(next);
    document.title = buildTitle(next);
  }, []);

  const handleImageStateChange = useCallback((operation: string) => {
    const next: UrlState = { mode: 'image', operation };
    setState(next);
    setUrlState(next);
    document.title = buildTitle(next);
  }, []);

  const handleSchemaStateChange = useCallback((source: string, target: string) => {
    const next: UrlState = { mode: 'schema', source, target };
    setState(next);
    setUrlState(next);
    document.title = buildTitle(next);
  }, []);

  return (
    <main className="h-screen bg-slate-950 text-slate-200 font-mono flex flex-col overflow-hidden">
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 shadow-sm justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Box className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-bold tracking-tight">EK Tools <span className="text-slate-500 text-sm font-normal ml-2">Suite</span></h1>
        </div>

        <div className="flex bg-slate-800 rounded p-1 gap-1">
          <button
            onClick={() => handleModeChange('text')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-2 transition-colors ${
              state.mode === 'text'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Type size={14} /> Text Tools
          </button>
          <button
            onClick={() => handleModeChange('image')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-2 transition-colors ${
              state.mode === 'image'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <ImageIcon size={14} /> Image Tools
          </button>
          <button
            onClick={() => handleModeChange('schema')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-2 transition-colors ${
              state.mode === 'schema'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <ArrowLeftRight size={14} /> Schema Mapper
          </button>
        </div>
      </header>

      {ready && <div className="flex-1 overflow-hidden relative">
        {state.mode === 'text' ? (
          <CyberChef
            key={`text-${urlKey}`}
            initialCategory={state.category}
            initialTool={state.tool}
            onStateChange={handleTextStateChange}
          />
        ) : state.mode === 'image' ? (
          <ImageTools
            key={`image-${urlKey}`}
            initialOperation={state.operation}
            onStateChange={handleImageStateChange}
          />
        ) : (
          <SchemaMapper
            key={`schema-${urlKey}`}
            initialSource={state.source}
            initialTarget={state.target}
            onStateChange={handleSchemaStateChange}
          />
        )}
      </div>}
    </main>
  );
}
