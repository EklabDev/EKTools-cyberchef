"use client";

import { useState } from 'react';
import { allTools } from '@/lib/all-tools';
import { Copy, Play, Box } from 'lucide-react';
import { z } from 'zod';

export default function CyberChef() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(allTools[0].category);
  const [selectedToolName, setSelectedToolName] = useState(allTools[0].name);
  const [params, setParams] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  const categories = Array.from(new Set(allTools.map(t => t.category)));
  const toolsByCategory = allTools.filter(t => t.category === selectedCategory);
  const currentTool = allTools.find(t => t.name === selectedToolName) || toolsByCategory[0];

  // Reset tool selection when category changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const firstTool = allTools.find(t => t.category === cat);
    if (firstTool) {
        setSelectedToolName(firstTool.name);
        setParams({});
        setError(null);
    }
  };

  const handleToolChange = (name: string) => {
    setSelectedToolName(name);
    setParams({});
    setError(null);
  };

  const handleRun = async () => {
    setError(null);
    try {
      // Construct arguments
      const args = { input, ...params };
      
      // Parse params? Some might be numbers.
      // The Zod schema will validate, but HTML inputs return strings.
      // We need to cast types based on schema.
      
      const schema = currentTool.inputSchema as z.ZodObject<any>;
      const shape = schema.shape;
      
      const typedArgs: any = { input };
      
      for (const [key, val] of Object.entries(params)) {
         const fieldSchema = shape[key];
         // Check if number
         let isNumber = false;
         let def = fieldSchema;
         if (def instanceof z.ZodOptional) def = def._def.innerType;
         if (def instanceof z.ZodNumber) isNumber = true;
         
         if (isNumber) {
             const num = parseFloat(val);
             if (!isNaN(num)) typedArgs[key] = num;
         } else {
             typedArgs[key] = val;
         }
      }
      
      // For arrays (datetime diff units), we might need special handling if we used checkboxes.
      // For now, we assume simple inputs.
      // Date diff units input might be tricky in UI. Let's assume comma separated string if we want to support it, 
      // or just default. The schema says array of strings. 
      // If the tool expects array, and we have string, we split.
      
      // Check for array types
       for (const key in shape) {
          let def = shape[key];
          if (def instanceof z.ZodOptional) def = def._def.innerType;
          if (def instanceof z.ZodArray) {
              if (typeof params[key] === 'string') {
                  typedArgs[key] = params[key].split(',').map((s: string) => s.trim()).filter((s: string) => s);
              }
          }
      }

      const result = await currentTool.handler(typedArgs);
      
      if ('error' in result) {
        setError(result.error);
        setOutput('');
      } else {
        setOutput(result.output);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Render form fields based on schema
  const renderParams = () => {
    const schema = currentTool.inputSchema as z.ZodObject<any>;
    const shape = schema.shape;
    
    return Object.keys(shape).map(key => {
      if (key === 'input') return null; // Input is global
      
      const fieldDef = shape[key];
      let type = 'text';
      let required = true;
      let options: string[] | null = null;
      
      let def = fieldDef;
      if (def instanceof z.ZodOptional) {
          required = false;
          def = def._def.innerType;
      }
      
      if (def instanceof z.ZodNumber) type = 'number';
      if (def instanceof z.ZodEnum) {
          options = def._def.values;
      }
      
      return (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-slate-400 mb-1">
            {key} {required ? '*' : '(optional)'}
          </label>
          {options ? (
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={params[key] || ''}
              onChange={e => setParams({ ...params, [key]: e.target.value })}
            >
              <option value="">Select...</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={params[key] || ''}
              onChange={e => setParams({ ...params, [key]: e.target.value })}
              placeholder={`Enter ${key}`}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 shadow-sm">
        <Box className="w-6 h-6 text-blue-500 mr-2" />
        <h1 className="text-lg font-bold tracking-tight">Mini CyberChef <span className="text-slate-500 text-sm font-normal ml-2">Next.js + MCP</span></h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Input */}
        <div className="w-1/3 flex flex-col border-r border-slate-800 bg-slate-950">
          <div className="p-3 bg-slate-900/50 border-b border-slate-800 font-semibold text-sm flex justify-between items-center">
            <span>Input</span>
            <button onClick={() => setInput('')} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          <textarea
            className="flex-1 bg-transparent p-4 resize-none outline-none font-mono text-sm leading-relaxed"
            placeholder="Paste your input here..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="p-2 border-t border-slate-800 text-xs text-slate-500 text-right">
            {input.length} chars
          </div>
        </div>

        {/* Middle: Controls */}
        <div className="w-1/3 flex flex-col bg-slate-900 border-r border-slate-800">
          <div className="p-6 flex-1 overflow-y-auto">
            
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Operation</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedToolName}
                onChange={e => handleToolChange(e.target.value)}
              >
                {toolsByCategory.map(tool => (
                  <option key={tool.name} value={tool.name}>{tool.name}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400 leading-snug">
                {currentTool?.description}
              </p>
            </div>

            {/* Dynamic Parameters */}
            <div className="mb-6">
               {renderParams()}
            </div>

            <button
              onClick={handleRun}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Play size={16} /> Run Operation
            </button>

            {error && (
              <div className="mt-6 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm break-words">
                <strong>Error:</strong> {error}
              </div>
            )}

          </div>
        </div>

        {/* Right: Output */}
        <div className="w-1/3 flex flex-col bg-slate-950">
          <div className="p-3 bg-slate-900/50 border-b border-slate-800 font-semibold text-sm flex justify-between items-center">
            <span>Output</span>
            <button 
              onClick={() => copyToClipboard(output)} 
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <Copy size={12} /> Copy
            </button>
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

      </div>
    </div>
  );
}

