import { useCallback, useRef, useState } from 'react';
import Canvas, { type CanvasHandle } from './components/Canvas';
import ShapePalette from './components/ShapePalette';
import Toolbar from './components/Toolbar';
import type { ShapeType, Tool } from './types';

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const canvasRef = useRef<CanvasHandle>(null);

  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    canvasRef.current?.cancelOperation();
  }, []);

  const handleAddShape = useCallback((type: ShapeType) => {
    canvasRef.current?.addShape(type);
  }, []);

  const handleExport = useCallback(() => {
    canvasRef.current?.exportPNG();
  }, []);

  const handleClear = useCallback(() => {
    if (window.confirm('Clear the entire board? This cannot be undone.')) {
      canvasRef.current?.clearAll();
    }
  }, []);

  return (
    <div className="app">
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onExport={handleExport}
        onClear={handleClear}
        saveStatus={saveStatus}
      />
      <div className="workspace">
        <ShapePalette onAddShape={handleAddShape} />
        <Canvas
          ref={canvasRef}
          activeTool={activeTool}
          onSaveStatusChange={setSaveStatus}
        />
      </div>
    </div>
  );
}
