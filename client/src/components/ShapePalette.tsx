import type { ShapeType } from '../types';

interface ShapeDef {
  type: ShapeType;
  label: string;
  icon: string;
  color: string;
}

const SHAPES: ShapeDef[] = [
  { type: 'server',       label: 'Server',        icon: '▬',  color: '#3b82f6' },
  { type: 'database',     label: 'Database',      icon: '⌭',  color: '#ea580c' },
  { type: 'api',          label: 'API',            icon: '⬡',  color: '#16a34a' },
  { type: 'queue',        label: 'Queue',          icon: '▱',  color: '#d97706' },
  { type: 'loadbalancer', label: 'Load Balancer',  icon: '◇',  color: '#7c3aed' },
  { type: 'client',       label: 'Client',         icon: '▭',  color: '#0ea5e9' },
  { type: 'cloud',        label: 'Cloud',          icon: '☁',  color: '#6b7280' },
];

interface Props {
  onAddShape: (type: ShapeType) => void;
}

export default function ShapePalette({ onAddShape }: Props) {
  return (
    <aside className="shape-palette">
      <p className="palette-title">Components</p>
      {SHAPES.map((s) => (
        <button
          key={s.type}
          className="shape-btn"
          onClick={() => onAddShape(s.type)}
          title={`Add ${s.label}`}
        >
          <span className="shape-icon" style={{ color: s.color }}>
            {s.icon}
          </span>
          <span className="shape-label">{s.label}</span>
        </button>
      ))}
    </aside>
  );
}
