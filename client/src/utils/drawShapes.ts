import type { Element, ShapeElement, PathElement, Connector } from '../types';

export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
  const spacing = 28;
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawShapeLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  ctx.fillStyle = '#c9d1d9';
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
}

// ── Individual shape renderers ──────────────────────────────────────────────

function drawServer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = '#1e3a6e';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  const lineCount = 3;
  for (let i = 0; i < lineCount; i++) {
    const lineY = y + (h / (lineCount + 1)) * (i + 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, lineY);
    ctx.lineTo(x + w - 22, lineY);
    ctx.stroke();

    ctx.fillStyle = i === 0 ? '#22c55e' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(x + w - 13, lineY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDatabase(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const cx = x + w / 2;
  const ry = Math.min(10, h * 0.18);

  ctx.fillStyle = '#431407';
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x, y + ry);
  ctx.lineTo(x, y + h - ry);
  ctx.ellipse(cx, y + h - ry, w / 2, ry, 0, Math.PI, 0, true);
  ctx.lineTo(x + w, y + ry);
  ctx.ellipse(cx, y + ry, w / 2, ry, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.ellipse(cx, y + ry, w / 2, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawAPI(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) / 2 - 3;

  ctx.fillStyle = '#052e16';
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(134, 239, 172, 0.65)';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('{ }', cx, cy);
}

function drawQueue(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const skew = 14;

  ctx.fillStyle = '#422006';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - skew, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const arrowY = y + h / 2;
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) {
    const ax = x + skew + ((w - skew * 2) / 3) * (i + 0.8);
    ctx.beginPath();
    ctx.moveTo(ax, arrowY - 4);
    ctx.lineTo(ax + 7, arrowY);
    ctx.lineTo(ax, arrowY + 4);
    ctx.stroke();
  }
}

function drawLoadBalancer(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.fillStyle = '#2e1065';
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(x + w, cy);
  ctx.lineTo(cx, y + h);
  ctx.lineTo(x, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(196, 181, 253, 0.35)';
  ctx.lineWidth = 1.5;
  [-10, 0, 10].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(cx + offset, cy - 9);
    ctx.lineTo(cx + offset, cy + 9);
    ctx.stroke();
  });
}

function drawClient(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const monH = h * 0.68;
  const baseW = w * 0.42;
  const baseX = x + (w - baseW) / 2;
  const standH = h * 0.12;
  const baseH = h * 0.1;

  ctx.fillStyle = '#0c2340';
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 1.5;

  roundRect(ctx, x + 2, y, w - 4, monH, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(14, 165, 233, 0.13)';
  roundRect(ctx, x + 8, y + 6, w - 16, monH - 18, 3);
  ctx.fill();

  ctx.fillStyle = '#0c2340';
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x + w / 2 - 3, y + monH, 6, standH);
  ctx.strokeRect(x + w / 2 - 3, y + monH, 6, standH);

  roundRect(ctx, baseX, y + monH + standH, baseW, baseH, 2);
  ctx.fill();
  ctx.stroke();
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const bumps: [number, number, number][] = [
    [x + w * 0.25, y + h * 0.62, h * 0.27],
    [x + w * 0.5,  y + h * 0.48, h * 0.33],
    [x + w * 0.75, y + h * 0.62, h * 0.27],
    [x + w * 0.37, y + h * 0.4,  h * 0.27],
    [x + w * 0.63, y + h * 0.4,  h * 0.25],
  ];

  ctx.fillStyle = '#1f2937';
  bumps.forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillRect(x + w * 0.1, y + h * 0.6, w * 0.8, h * 0.4);

  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 1.5;
  bumps.forEach(([cx, cy, r]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0, false);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, y + h);
  ctx.lineTo(x + w * 0.9, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, y + h);
  ctx.lineTo(bumps[0][0] - bumps[0][2] + 1, bumps[0][1]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.9, y + h);
  ctx.lineTo(bumps[2][0] + bumps[2][2] - 1, bumps[2][1]);
  ctx.stroke();
}

function drawPath(ctx: CanvasRenderingContext2D, el: PathElement, isSelected: boolean): void {
  if (!el.points || el.points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = isSelected ? '#7aa2f7' : (el.color || '#a9b1d6');
  ctx.lineWidth = el.lineWidth || 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(el.points[0][0], el.points[0][1]);
  el.points.slice(1).forEach(([px, py]) => ctx.lineTo(px, py));
  ctx.stroke();
  ctx.restore();
}

// ── Public exports ──────────────────────────────────────────────────────────

export function drawShape(ctx: CanvasRenderingContext2D, el: Element, isSelected: boolean): void {
  if (el.type === 'path') {
    drawPath(ctx, el as PathElement, isSelected);
    return;
  }

  ctx.save();
  const { x, y, w, h, type, label } = el as ShapeElement;

  switch (type) {
    case 'server':       drawServer(ctx, x, y, w, h);       break;
    case 'database':     drawDatabase(ctx, x, y, w, h);     break;
    case 'api':          drawAPI(ctx, x, y, w, h);           break;
    case 'queue':        drawQueue(ctx, x, y, w, h);         break;
    case 'loadbalancer': drawLoadBalancer(ctx, x, y, w, h); break;
    case 'client':       drawClient(ctx, x, y, w, h);       break;
    case 'cloud':        drawCloud(ctx, x, y, w, h);        break;
    default: {
      ctx.fillStyle = '#374151';
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1.5;
      roundRect(ctx, x, y, w, h, 6);
      ctx.fill();
      ctx.stroke();
    }
  }

  if (isSelected) {
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x - 5, y - 5, w + 10, h + 10);
    ctx.setLineDash([]);
  }

  const displayLabel = label || type.charAt(0).toUpperCase() + type.slice(1);
  drawShapeLabel(ctx, displayLabel, x + w / 2, y + h + 5);

  ctx.restore();
}

export function drawConnectorArrow(
  ctx: CanvasRenderingContext2D,
  from: ShapeElement,
  to: ShapeElement,
  conn: Connector,
  isSelected: boolean
): void {
  const x1 = from.x + from.w / 2;
  const y1 = from.y + from.h / 2;
  const x2 = to.x + to.w / 2;
  const y2 = to.y + to.h / 2;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const nx = -dy / dist;
  const ny = dx / dist;
  const cpOffset = Math.min(dist * 0.15, 40);
  const cpx = (x1 + x2) / 2 + nx * cpOffset;
  const cpy = (y1 + y2) / 2 + ny * cpOffset;

  const color = isSelected ? '#60a5fa' : '#4b5563';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = isSelected ? 2 : 1.5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();

  const endAngle = Math.atan2(y2 - cpy, x2 - cpx);
  const aLen = 11;
  const aAngle = Math.PI / 7;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - aLen * Math.cos(endAngle - aAngle), y2 - aLen * Math.sin(endAngle - aAngle));
  ctx.lineTo(x2 - aLen * Math.cos(endAngle + aAngle), y2 - aLen * Math.sin(endAngle + aAngle));
  ctx.closePath();
  ctx.fill();

  if (conn.label) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(conn.label, cpx, cpy - 12);
  }

  ctx.restore();
}
