"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type ImageToolType = 'vectorize' | 'rasterize' | 'remove-background' | 'heic-to-jpg' | 'heic-to-png' | 'image-to-base64';

interface ToolDefinition {
  id: ImageToolType;
  name: string;
  description: string;
  accepts: string;
  params?: {
    name: string;
    label: string;
    type: 'number' | 'select';
    min?: number;
    max?: number;
    default?: any;
  }[];
}

const TOOLS: ToolDefinition[] = [
  {
    id: 'vectorize',
    name: 'Vectorize',
    description: 'Convert PNG to SVG with color quantization.',
    accepts: 'image/png',
    params: [
      { name: 'colors', label: 'Colors (2-20)', type: 'number', min: 2, max: 20, default: 5 }
    ]
  },
  {
    id: 'rasterize',
    name: 'Rasterize',
    description: 'Convert SVG to PNG.',
    accepts: 'image/svg+xml',
  },
  {
    id: 'remove-background',
    name: 'Remove Background',
    description: 'Remove background from JPEG or PNG.',
    accepts: 'image/png, image/jpeg',
  },
  {
    id: 'heic-to-jpg',
    name: 'HEIC to JPG',
    description: 'Convert HEIC image to JPG.',
    accepts: '.heic',
  },
  {
    id: 'heic-to-png',
    name: 'HEIC to PNG',
    description: 'Convert HEIC image to PNG.',
    accepts: '.heic',
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    description: 'Convert PNG or JPEG image to Base64 string.',
    accepts: 'image/png, image/jpeg',
  }
];

export default function ImageTools() {
  const [selectedToolId, setSelectedToolId] = useState<ImageToolType>('vectorize');
  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [params, setParams] = useState<Record<string, any>>({ colors: 5 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<'image' | 'svg' | 'text'>('image');
  const [outputContent, setOutputContent] = useState<string | null>(null); // For SVG text

  // Viewport controls
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const outputContainerRef = useRef<HTMLDivElement>(null);

  const currentTool = TOOLS.find(t => t.id === selectedToolId) || TOOLS[0];
  const currentFile = inputFiles[selectedFileIndex];
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setInputPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setInputPreviewUrl(null);
    }
  }, [currentFile]);

  // Cleanup output URL
  useEffect(() => {
    return () => {
      if (outputUrl && outputUrl.startsWith('blob:')) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  // Reset params when tool changes
  useEffect(() => {
    const newParams: Record<string, any> = {};
    currentTool.params?.forEach(p => {
      newParams[p.name] = p.default;
    });
    setParams(newParams);
    setError(null);
    setOutputUrl(null);
    setOutputContent(null);
  }, [selectedToolId, currentTool]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInputFiles(Array.from(e.target.files));
      setSelectedFileIndex(0);
      setError(null);
    }
  };

  const handleRun = async () => {
    if (!currentFile) {
      setError("Please select a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOutputUrl(null);
    setOutputContent(null);

    try {
      const formData = new FormData();
      formData.append('file', currentFile);
      
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      let response;
      if (currentTool.id === 'image-to-base64') {
        // Client-side conversion
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Result is already base64 data URL
          // If we want just the base64 part, we can strip the prefix, but data URL is usually what's needed.
          // Let's output it as text content
          setOutputContent(result);
          setOutputType('text'); // New type for text display
          // Also create a blob for download as text file
          const blob = new Blob([result], { type: 'text/plain' });
          setOutputUrl(URL.createObjectURL(blob));
          setIsProcessing(false);
        };
        reader.onerror = () => {
           setError("Failed to read file");
           setIsProcessing(false);
        };
        reader.readAsDataURL(currentFile);
        return; // Early return for client-side tool
      } else if (currentTool.id === 'heic-to-jpg' || currentTool.id === 'heic-to-png') {
        formData.append('format', currentTool.id === 'heic-to-png' ? 'PNG' : 'JPEG');
        response = await fetch('/api/convert-heic', {
          method: 'POST',
          body: formData,
        });
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || 'https://eklab-image.eklab.xyz';
        response = await fetch(`${baseUrl}/${currentTool.id}`, {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      if (currentTool.id === 'vectorize') {
        const text = await response.text();
        setOutputContent(text);
        setOutputType('svg');
        // Create a blob URL for download purposes
        const blob = new Blob([text], { type: 'image/svg+xml' });
        setOutputUrl(URL.createObjectURL(blob));
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setOutputType('image');
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handlePan = (dx: number, dy: number) => {
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    let ext = 'png';
    if (outputType === 'svg') ext = 'svg';
    if (outputType === 'text') ext = 'txt';
    a.download = `result.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Input */}
        <div className="w-1/3 flex flex-col border-r border-slate-800 bg-slate-950">
          <div className="p-3 bg-slate-900/50 border-b border-slate-800 font-semibold text-sm flex justify-between items-center">
            <span>Input Image</span>
            <button onClick={() => setInputFiles([])} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          
          <div className="p-4 flex-1 flex flex-col overflow-y-auto">
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-colors relative mb-4">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm">Click or drop image here</span>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                accept={currentTool.accepts}
              />
            </div>

                {currentFile && inputPreviewUrl && (
                  <div className="flex flex-col items-center">
                    <div className="mb-2 text-xs text-slate-400 break-all text-center font-mono bg-slate-900 p-2 rounded w-full">
                      {currentFile.name} ({(currentFile.size / 1024).toFixed(1)} KB)
                    </div>
                    <div className="relative w-full aspect-square bg-slate-900 rounded overflow-hidden flex items-center justify-center border border-slate-800">
                       {currentFile.name.toLowerCase().endsWith('.heic') ? (
                          <div className="text-slate-500 flex flex-col items-center gap-2">
                             <ImageIcon className="w-12 h-12" />
                             <span className="text-xs">Preview not available for HEIC</span>
                          </div>
                       ) : (
                         <img 
                            src={inputPreviewUrl} 
                            alt="Input preview" 
                            className="max-w-full max-h-full object-contain"
                         />
                       )}
                    </div>
                  </div>
                )}
          </div>
        </div>

        {/* Middle: Controls */}
        <div className="w-1/3 flex flex-col bg-slate-900 border-r border-slate-800">
          <div className="p-6 flex-1 overflow-y-auto">
            
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Operation</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedToolId}
                onChange={e => setSelectedToolId(e.target.value as ImageToolType)}
              >
                {TOOLS.map(tool => (
                  <option key={tool.id} value={tool.id}>{tool.name}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400 leading-snug">
                {currentTool.description}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Accepts: {currentTool.accepts}
              </p>
            </div>

            {/* Parameters */}
            {currentTool.params && currentTool.params.length > 0 && (
              <div className="mb-6">
                {currentTool.params.map(p => (
                  <div key={p.name} className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      {p.label}
                    </label>
                    <input
                      type={p.type}
                      min={p.min}
                      max={p.max}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={params[p.name] || ''}
                      onChange={e => setParams({ ...params, [p.name]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={isProcessing || !currentFile}
              className={`w-full py-3 font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isProcessing || !currentFile 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isProcessing ? (
                 <span className="animate-pulse">Processing...</span>
              ) : (
                 <>
                   <Play size={16} /> Run Operation
                 </>
              )}
            </button>

            {error && (
              <div className="mt-6 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm break-words">
                <strong>Error:</strong> {error}
              </div>
            )}

          </div>
        </div>

        {/* Right: Output */}
        <div className="w-1/3 flex flex-col bg-slate-950 relative">
          <div className="p-3 bg-slate-900/50 border-b border-slate-800 font-semibold text-sm flex justify-between items-center z-10 relative">
            <span>Output Preview</span>
            {outputUrl && (
              <button 
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <Download size={12} /> Download
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden relative bg-[url('/transparent-bg.png')] bg-repeat">
             {/* Checkerboard background for transparency */}
             <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
             }}></div>

             {outputUrl ? (
               <div 
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  ref={outputContainerRef}
               >
                 <div style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    transition: 'transform 0.1s ease-out'
                 }}>
                   {outputType === 'svg' && outputContent ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: outputContent }} 
                        className="origin-center"
                      />
                   ) : outputType === 'text' && outputContent ? (
                      <textarea 
                        readOnly
                        value={outputContent}
                        className="w-full h-full bg-slate-900/90 text-slate-200 font-mono text-xs p-4 resize-none outline-none border border-slate-700 rounded"
                        style={{ minWidth: '300px', minHeight: '300px' }}
                      />
                   ) : (
                      <img 
                        src={outputUrl} 
                        alt="Result" 
                        className="max-w-none object-contain origin-center"
                      />
                   )}
                 </div>
               </div>
             ) : (
               <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                 <ImageIcon className="w-12 h-12 opacity-20" />
               </div>
             )}
             
             {/* Zoom/Pan Controls Overlay */}
             <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-slate-900/80 p-2 rounded-lg backdrop-blur border border-slate-700 shadow-xl">
               <div className="flex gap-1 justify-center">
                 <button onClick={() => handlePan(0, 50)} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Pan Up"><ArrowUp size={16} /></button>
               </div>
               <div className="flex gap-1">
                 <button onClick={() => handlePan(50, 0)} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Pan Left"><ArrowLeft size={16} /></button>
                 <button onClick={resetView} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Reset View"><RotateCcw size={16} /></button>
                 <button onClick={() => handlePan(-50, 0)} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Pan Right"><ArrowRight size={16} /></button>
               </div>
               <div className="flex gap-1 justify-center">
                 <button onClick={() => handlePan(0, -50)} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Pan Down"><ArrowDown size={16} /></button>
               </div>
               <div className="h-px bg-slate-700 my-1"></div>
               <div className="flex gap-1 justify-center">
                 <button onClick={() => handleZoom(0.1)} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Zoom In"><ZoomIn size={16} /></button>
                 <button onClick={() => handleZoom(-0.1)} className="p-1 hover:bg-slate-700 rounded text-slate-300" title="Zoom Out"><ZoomOut size={16} /></button>
               </div>
             </div>
          </div>

          <div className="p-2 border-t border-slate-800 text-xs text-slate-500 text-right">
            {outputUrl ? (outputType === 'svg' ? 'SVG Vector' : outputType === 'text' ? 'Base64 Text' : 'PNG Image') : 'No output'}
          </div>
        </div>

      </div>
    </div>
  );
}

