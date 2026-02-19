"use client";

import { useState } from 'react';
import CyberChef from "./components/CyberChef";
import ImageTools from "./components/ImageTools";
import SchemaMapper from "./components/SchemaMapper";
import { Box, Type, Image as ImageIcon, ArrowLeftRight } from 'lucide-react';

export default function Page() {
  const [mode, setMode] = useState<'text' | 'image' | 'schema'>('text');

  return (
    <main className="h-screen bg-slate-950 text-slate-200 font-mono flex flex-col overflow-hidden">
      {/* Global Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 shadow-sm justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Box className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-bold tracking-tight">EK Tools <span className="text-slate-500 text-sm font-normal ml-2">Suite</span></h1>
        </div>
        
        <div className="flex bg-slate-800 rounded p-1 gap-1">
          <button 
            onClick={() => setMode('text')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-2 transition-colors ${
              mode === 'text' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Type size={14} /> Text Tools
          </button>
          <button 
            onClick={() => setMode('image')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-2 transition-colors ${
              mode === 'image' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <ImageIcon size={14} /> Image Tools
          </button>
          <button 
            onClick={() => setMode('schema')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-2 transition-colors ${
              mode === 'schema' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <ArrowLeftRight size={14} /> Schema Mapper
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'text' ? <CyberChef /> : mode === 'image' ? <ImageTools /> : <SchemaMapper />}
      </div>
    </main>
  );
}
