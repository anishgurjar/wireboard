import type { Tool } from '../types';

interface ToolDef {
  id: Tool;
  label: string;
  shortcut: string;
  icon: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select',    label: 'Select & Move',  shortcut: 'V', icon: '↖' },
  { id: 'draw',      label: 'Freehand Draw',  shortcut: 'D', icon: '✏' },
  { id: 'connector', label: 'Connect Shapes', shortcut: 'C', icon: '⤳' },
  { id: 'eraser',    label: 'Erase',          shortcut: 'E', icon: '⊘' },
];

interface Props {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onExport: () => void;
  onClear: () => void;
  saveStatus: 'saved' | 'saving' | 'idle';
}

export default function Toolbar({ activeTool, onToolChange, onExport, onClear, saveStatus }: Props) {
  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">Wireboard</span>
        <span className="brand-tagline">Architecture Scratchpad</span>
      </div>

      <div className="toolbar-tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
            onClick={() => onToolChange(t.id)}
            title={`${t.label} (${t.shortcut})`}
          >
            <span className="tool-icon">{t.icon}</span>
            <span className="tool-label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-actions">
        <span className={`save-status save-status--${saveStatus}`}>
          {saveStatus === 'saving' ? '● Saving…' : saveStatus === 'saved' ? '✓ Saved' : ''}
        </span>
        <button className="action-btn" onClick={onExport} title="Export as PNG">
          Export PNG
        </button>
        <button className="action-btn action-btn--danger" onClick={onClear} title="Clear board">
          Clear
        </button>
      </div>
    </header>
  );
}
