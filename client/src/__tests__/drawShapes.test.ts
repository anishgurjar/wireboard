import { describe, it, expect, vi } from 'vitest';
import { drawGrid, drawShape, drawConnectorArrow } from '../utils/drawShapes';
import type { ShapeElement, PathElement, Connector } from '../types';

function makeCtx(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
  } as unknown as CanvasRenderingContext2D;
}

const ALL_SHAPE_TYPES: ShapeElement['type'][] = [
  'server', 'database', 'api', 'queue', 'loadbalancer', 'client', 'cloud',
];

function makeShape(type: ShapeElement['type'], label = ''): ShapeElement {
  return { id: '1', type, x: 50, y: 50, w: 130, h: 72, label };
}

// ── drawGrid ──────────────────────────────────────────────────────────────

describe('drawGrid', () => {
  it('renders without throwing', () => {
    expect(() => drawGrid(makeCtx(), 800, 600)).not.toThrow();
  });

  it('calls fillRect for dot pixels', () => {
    const ctx = makeCtx();
    drawGrid(ctx, 300, 300);
    expect(ctx.fillRect).toHaveBeenCalled();
  });
});

// ── drawShape — all shape types ──────────────────────────────────────────

describe('drawShape', () => {
  ALL_SHAPE_TYPES.forEach((type) => {
    it(`renders "${type}" without throwing`, () => {
      expect(() => drawShape(makeCtx(), makeShape(type), false)).not.toThrow();
    });

    it(`renders selected "${type}" and draws selection ring`, () => {
      const ctx = makeCtx();
      drawShape(ctx, makeShape(type, 'My Label'), true);
      expect(ctx.setLineDash).toHaveBeenCalled();
    });
  });

  it('renders a path element without throwing', () => {
    const el: PathElement = {
      id: '2', type: 'path',
      points: [[0, 0], [10, 10], [20, 5]],
      color: '#a9b1d6', lineWidth: 2,
    };
    expect(() => drawShape(makeCtx(), el, false)).not.toThrow();
  });

  it('skips drawing path with fewer than 2 points', () => {
    const ctx = makeCtx();
    const el: PathElement = { id: '3', type: 'path', points: [[0, 0]], color: '#fff', lineWidth: 2 };
    drawShape(ctx, el, false);
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });
});

// ── drawConnectorArrow ────────────────────────────────────────────────────

describe('drawConnectorArrow', () => {
  it('draws an arrow between two shapes without throwing', () => {
    const from = makeShape('server');
    const to: ShapeElement = { ...makeShape('database'), id: '2', x: 300, y: 0 };
    const conn: Connector = { id: 'c1', from: 'a', to: 'b', label: '' };
    expect(() => drawConnectorArrow(makeCtx(), from, to, conn, false)).not.toThrow();
  });

  it('renders the connector label when present', () => {
    const ctx = makeCtx();
    const from = makeShape('api');
    const to: ShapeElement = { ...makeShape('server'), id: '2', x: 400, y: 150 };
    const conn: Connector = { id: 'c1', from: 'a', to: 'b', label: 'gRPC' };
    drawConnectorArrow(ctx, from, to, conn, true);
    expect(ctx.fillText).toHaveBeenCalledWith('gRPC', expect.any(Number), expect.any(Number));
  });

  it('draws as selected (uses accent color)', () => {
    const ctx = makeCtx();
    const from = makeShape('client');
    const to: ShapeElement = { ...makeShape('loadbalancer'), id: '2', x: 300, y: 200 };
    const conn: Connector = { id: 'c1', from: 'a', to: 'b', label: '' };
    drawConnectorArrow(ctx, from, to, conn, true);
    expect(ctx.strokeStyle).toBe('#60a5fa');
  });

  it('skips drawing when source and target are at the same center', () => {
    const ctx = makeCtx();
    const shape = makeShape('cloud');
    const conn: Connector = { id: 'c1', from: 'a', to: 'b', label: '' };
    expect(() => drawConnectorArrow(ctx, shape, shape, conn, false)).not.toThrow();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });
});
