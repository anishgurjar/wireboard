export type ShapeType =
  | 'server'
  | 'database'
  | 'api'
  | 'queue'
  | 'loadbalancer'
  | 'client'
  | 'cloud';

export interface ShapeElement {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface PathElement {
  id: string;
  type: 'path';
  points: [number, number][];
  color: string;
  lineWidth: number;
}

export type Element = ShapeElement | PathElement;

export interface Connector {
  id: string;
  from: string;
  to: string;
  label: string;
}

export type Tool = 'select' | 'draw' | 'connector' | 'eraser';
