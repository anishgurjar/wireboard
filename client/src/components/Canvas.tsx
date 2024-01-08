import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { drawConnectorArrow, drawGrid, drawShape } from '../utils/drawShapes';
import { useBoard } from '../hooks/useBoard';
import type { Connector, Element, ShapeElement, ShapeType, Tool } from '../types';

const SHAPE_W = 130;
const SHAPE_H = 72;

interface MutableState {
  dragging: { id: string; offX: number; offY: number } | null;
  currentPath: [number, number][] | null;
  connecting: string | null;
}

export interface CanvasHandle {
  addShape: (type: ShapeType) => void;
  exportPNG: () => void;
  clearAll: () => void;
  cancelOperation: () => void;
}

interface Props {
  activeTool: Tool;
  onSaveStatusChange: (status: 'idle' | 'saving' | 'saved') => void;
}

const Canvas = forwardRef<CanvasHandle, Props>(({ activeTool, onSaveStatusChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mut = useRef<MutableState>({ dragging: null, currentPath: null, connecting: null });

  const [elements, setElements] = useState<Element[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pathPreview, setPathPreview] = useState<[number, number][] | null>(null);
  const [connectingDisplay, setConnectingDisplay] = useState<string | null>(null);
  const [labelEdit, setLabelEdit] = useState<{ id: string; x: number; y: number; value: string } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: window.innerWidth - 156, h: window.innerHeight - 52 });

  // Refs for reading current values inside event handlers (avoid stale closures)
  const elementsRef = useRef(elements);
  const connectorsRef = useRef(connectors);
  const selectedRef = useRef(selected);
  const activeToolRef = useRef(activeTool);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { connectorsRef.current = connectors; }, [connectors]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => {
    activeToolRef.current = activeTool;
    if (activeTool !== 'connector') {
      mut.current.connecting = null;
      setConnectingDisplay(null);
    }
  }, [activeTool]);

  // Board persistence
  const { saveBoard } = useBoard(setElements, setConnectors);

  useEffect(() => {
    onSaveStatusChange('saving');
    const timer = setTimeout(() => {
      saveBoard(elements, connectors);
      onSaveStatusChange('saved');
      setTimeout(() => onSaveStatusChange('idle'), 1500);
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, connectors]);

  // Canvas resize
  useEffect(() => {
    const resize = () => {
      const parent = canvasRef.current?.parentElement;
      if (!parent) return;
      setCanvasSize({ w: parent.clientWidth, h: parent.clientHeight });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    connectors.forEach((conn) => {
      const from = elements.find((e) => e.id === conn.from) as ShapeElement | undefined;
      const to = elements.find((e) => e.id === conn.to) as ShapeElement | undefined;
      if (from && to) drawConnectorArrow(ctx, from, to, conn, selected === conn.id);
    });

    elements.forEach((el) => drawShape(ctx, el, selected === el.id));

    if (pathPreview && pathPreview.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#a9b1d6';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pathPreview[0][0], pathPreview[0][1]);
      pathPreview.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
      ctx.stroke();
      ctx.restore();
    }

    if (connectingDisplay) {
      const el = elements.find((e) => e.id === connectingDisplay);
      if (el && el.type !== 'path') {
        const s = el as ShapeElement;
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(s.x - 5, s.y - 5, s.w + 10, s.h + 10);
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }, [elements, connectors, selected, pathPreview, connectingDisplay, canvasSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = selectedRef.current;
        if (!id) return;
        setElements((prev) => prev.filter((el) => el.id !== id));
        setConnectors((prev) => prev.filter((c) => c.from !== id && c.to !== id && c.id !== id));
        setSelected(null);
      }
      if (e.key === 'Escape') {
        mut.current.connecting = null;
        mut.current.currentPath = null;
        setConnectingDisplay(null);
        setPathPreview(null);
        setLabelEdit(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getPos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findElementAt = (x: number, y: number): ShapeElement | undefined =>
    ([...elementsRef.current].reverse() as Element[]).find((el): el is ShapeElement => {
      if (el.type === 'path') return false;
      return x >= el.x && x <= el.x + el.w && y >= el.y && y <= el.y + el.h;
    });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const { x, y } = getPos(e);
    const tool = activeToolRef.current;

    if (tool === 'select') {
      const el = findElementAt(x, y);
      if (el) {
        setSelected(el.id);
        mut.current.dragging = { id: el.id, offX: x - el.x, offY: y - el.y };
      } else {
        setSelected(null);
      }
    } else if (tool === 'draw') {
      mut.current.currentPath = [[x, y]];
    } else if (tool === 'connector') {
      const el = findElementAt(x, y);
      if (!el) {
        mut.current.connecting = null;
        setConnectingDisplay(null);
        return;
      }
      if (!mut.current.connecting) {
        mut.current.connecting = el.id;
        setConnectingDisplay(el.id);
      } else if (el.id !== mut.current.connecting) {
        const exists = connectorsRef.current.some(
          (c) =>
            (c.from === mut.current.connecting && c.to === el.id) ||
            (c.from === el.id && c.to === mut.current.connecting)
        );
        if (!exists) {
          setConnectors((prev) => [
            ...prev,
            { id: uuidv4(), from: mut.current.connecting!, to: el.id, label: '' },
          ]);
        }
        mut.current.connecting = null;
        setConnectingDisplay(null);
      }
    } else if (tool === 'eraser') {
      const el = findElementAt(x, y);
      if (el) {
        setElements((prev) => prev.filter((item) => item.id !== el.id));
        setConnectors((prev) => prev.filter((c) => c.from !== el.id && c.to !== el.id));
        if (selectedRef.current === el.id) setSelected(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getPos(e);

    if (mut.current.dragging) {
      const { id, offX, offY } = mut.current.dragging;
      setElements((prev) =>
        prev.map((el) =>
          el.id === id && el.type !== 'path' ? { ...el, x: x - offX, y: y - offY } : el
        )
      );
    } else if (mut.current.currentPath) {
      const next: [number, number][] = [...mut.current.currentPath, [x, y]];
      mut.current.currentPath = next;
      setPathPreview(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseUp = useCallback(() => {
    mut.current.dragging = null;

    if (mut.current.currentPath && mut.current.currentPath.length > 2) {
      const newPath: Element = {
        id: uuidv4(),
        type: 'path',
        points: [...mut.current.currentPath],
        color: '#a9b1d6',
        lineWidth: 2,
      };
      setElements((prev) => [...prev, newPath]);
    }
    mut.current.currentPath = null;
    setPathPreview(null);
  }, []);

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = getPos(e);
    const el = findElementAt(x, y);
    if (el) {
      setLabelEdit({
        id: el.id,
        x: el.x + el.w / 2,
        y: el.y + el.h + 5 + 10,
        value: el.label || '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitLabel = () => {
    if (labelEdit) {
      setElements((prev) =>
        prev.map((el) => (el.id === labelEdit.id ? { ...el, label: labelEdit.value } : el))
      );
      setLabelEdit(null);
    }
  };

  useImperativeHandle(ref, () => ({
    addShape: (type: ShapeType) => {
      const canvas = canvasRef.current;
      const cx = canvas ? canvas.width / 2 : 500;
      const cy = canvas ? canvas.height / 2 : 350;
      const count = elementsRef.current.filter((e) => e.type !== 'path').length;
      const offset = (count % 8) * 22;
      setElements((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type,
          x: cx - SHAPE_W / 2 + offset,
          y: cy - SHAPE_H / 2 + offset,
          w: SHAPE_W,
          h: SHAPE_H,
          label: '',
        },
      ]);
    },
    exportPNG: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'wireboard-diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    },
    clearAll: () => {
      setElements([]);
      setConnectors([]);
      setSelected(null);
    },
    cancelOperation: () => {
      mut.current.connecting = null;
      mut.current.currentPath = null;
      mut.current.dragging = null;
      setConnectingDisplay(null);
      setPathPreview(null);
    },
  }));

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className={`board-canvas tool-${activeTool}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      />
      {labelEdit && (
        <div
          className="label-edit-wrapper"
          style={{ left: labelEdit.x, top: labelEdit.y }}
        >
          <input
            autoFocus
            className="label-edit-input"
            value={labelEdit.value}
            placeholder="Label…"
            onChange={(e) => setLabelEdit((prev) => prev && { ...prev, value: e.target.value })}
            onBlur={submitLabel}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitLabel();
              if (e.key === 'Escape') setLabelEdit(null);
            }}
          />
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
