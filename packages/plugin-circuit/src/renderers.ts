import type {
  CircuitElement,
  PrimitiveRenderer,
  Terminal,
  Vec2,
  Wire,
  SceneGraphRefs,
} from '@aperi21/schema';
import { manhattanRoute } from './routing';

/**
 * 소자 로컬 좌표계(−1..+1) 에서 월드 좌표로 변환. rotation(0/90/180/270) 고려.
 */
function localToWorld(el: CircuitElement, lx: number, ly: number): Vec2 {
  const cos = [1, 0, -1, 0][el.rotation / 90]!;
  const sin = [0, 1, 0, -1][el.rotation / 90]!;
  return [el.pos[0] + lx * cos - ly * sin, el.pos[1] + lx * sin + ly * cos];
}

export const renderCircuitElement: PrimitiveRenderer = (rc, p0) => {
  const el = p0 as CircuitElement;
  const c = rc.ctx;
  const [tx, ty] = rc.toScreen(el.pos);
  const scale = rc.scale;
  const unitLen = 1; // 월드 1 단위를 소자 전체 길이로 씀

  // 두 단자(−1, 0) → (+1, 0) (rotation 후 변환됨)
  const ta = localToWorld(el, -unitLen, 0);
  const tb = localToWorld(el, unitLen, 0);
  const [ax, ay] = rc.toScreen(ta);
  const [bx, by] = rc.toScreen(tb);

  c.save();
  c.strokeStyle = rc.theme.foreground;
  c.fillStyle = rc.theme.background;
  c.lineWidth = rc.theme.strokeWidth.thick;
  c.lineCap = 'round';

  // 단자까지의 리드선
  const leadFrac = 0.25;
  const leadAx = ax + (bx - ax) * leadFrac;
  const leadAy = ay + (by - ay) * leadFrac;
  const leadBx = bx - (bx - ax) * leadFrac;
  const leadBy = by - (by - ay) * leadFrac;

  c.beginPath();
  c.moveTo(ax, ay);
  c.lineTo(leadAx, leadAy);
  c.moveTo(leadBx, leadBy);
  c.lineTo(bx, by);
  c.stroke();

  switch (el.subtype) {
    case 'resistor': {
      drawZigzag(c, leadAx, leadAy, leadBx, leadBy, 6);
      break;
    }
    case 'battery': {
      drawBattery(c, leadAx, leadAy, leadBx, leadBy);
      break;
    }
    case 'capacitor': {
      drawCapacitor(c, leadAx, leadAy, leadBx, leadBy);
      break;
    }
    case 'inductor': {
      drawInductor(c, leadAx, leadAy, leadBx, leadBy);
      break;
    }
    case 'switch': {
      drawSwitch(c, leadAx, leadAy, leadBx, leadBy, el.state ?? 'open');
      break;
    }
    case 'ground': {
      drawGround(c, (ax + bx) / 2, (ay + by) / 2, rc.theme.foreground);
      break;
    }
    case 'lamp': {
      drawLamp(c, (leadAx + leadBx) / 2, (leadAy + leadBy) / 2, Math.hypot(leadBx - leadAx, leadBy - leadAy) / 2);
      break;
    }
    case 'ammeter':
    case 'voltmeter': {
      drawMeter(
        c,
        (leadAx + leadBx) / 2,
        (leadAy + leadBy) / 2,
        el.subtype === 'ammeter' ? 'A' : 'V',
        rc.theme.fontFamilyMono,
        rc.theme.fontSize.large,
        rc.theme.foreground,
      );
      break;
    }
  }

  // 값 라벨
  if (typeof el.value === 'number') {
    c.font = `${rc.theme.fontSize.small}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = rc.theme.muted;
    c.textAlign = 'center';
    c.textBaseline = 'top';
    c.fillText(`${el.value}${el.unit ?? ''}`, tx, ty + 14);
  }

  c.restore();
  void scale;
};

function drawZigzag(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, count: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  if (L < 1) return;
  const ux = dx / L;
  const uy = dy / L;
  const px = -uy; // perpendicular
  const py = ux;
  const amp = 4;
  c.beginPath();
  c.moveTo(x0, y0);
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const sign = i % 2 === 0 ? -1 : 1;
    const bx = x0 + dx * t + px * amp * sign;
    const by = y0 + dy * t + py * amp * sign;
    c.lineTo(bx, by);
  }
  c.lineTo(x1, y1);
  c.stroke();
}

function drawBattery(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  const px = -uy;
  const py = ux;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  // 긴 선(+) 앞쪽 5px, 짧은 선(−) 뒤쪽 5px
  const longHalf = 10;
  const shortHalf = 5;
  c.beginPath();
  c.moveTo(cx - ux * 3 + px * longHalf, cy - uy * 3 + py * longHalf);
  c.lineTo(cx - ux * 3 - px * longHalf, cy - uy * 3 - py * longHalf);
  c.moveTo(cx + ux * 3 + px * shortHalf, cy + uy * 3 + py * shortHalf);
  c.lineTo(cx + ux * 3 - px * shortHalf, cy + uy * 3 - py * shortHalf);
  c.stroke();
}

function drawCapacitor(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  const px = -uy;
  const py = ux;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const half = 8;
  c.beginPath();
  c.moveTo(cx - ux * 3 + px * half, cy - uy * 3 + py * half);
  c.lineTo(cx - ux * 3 - px * half, cy - uy * 3 - py * half);
  c.moveTo(cx + ux * 3 + px * half, cy + uy * 3 + py * half);
  c.lineTo(cx + ux * 3 - px * half, cy + uy * 3 - py * half);
  c.stroke();
}

function drawInductor(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.hypot(dx, dy);
  if (L < 4) return;
  const loops = 4;
  c.beginPath();
  for (let i = 0; i < loops; i++) {
    const t0 = i / loops;
    const t1 = (i + 1) / loops;
    const bx0 = x0 + dx * t0;
    const by0 = y0 + dy * t0;
    const bx1 = x0 + dx * t1;
    const by1 = y0 + dy * t1;
    c.moveTo(bx0, by0);
    c.arcTo(
      (bx0 + bx1) / 2 + ((y1 - y0) / L) * -6,
      (by0 + by1) / 2 + ((x1 - x0) / L) * 6,
      bx1,
      by1,
      8,
    );
    c.lineTo(bx1, by1);
  }
  c.stroke();
}

function drawSwitch(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, state: 'open' | 'closed') {
  const L = Math.hypot(x1 - x0, y1 - y0);
  if (L < 1) return;
  if (state === 'closed') {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
  } else {
    const ux = (x1 - x0) / L;
    const uy = (y1 - y0) / L;
    const swingLen = L;
    const angle = Math.PI / 6;
    const ex = x0 + ux * Math.cos(angle) * swingLen - uy * Math.sin(angle) * swingLen;
    const ey = y0 + uy * Math.cos(angle) * swingLen + ux * Math.sin(angle) * swingLen;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(ex, ey);
    c.stroke();
  }
  // 끝점 도트
  for (const [dx, dy] of [[x0, y0], [x1, y1]]) {
    c.beginPath();
    c.arc(dx!, dy!, 2.5, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
}

function drawGround(c: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  c.strokeStyle = color;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(cx, cy - 6);
  c.lineTo(cx, cy + 4);
  c.moveTo(cx - 10, cy + 4);
  c.lineTo(cx + 10, cy + 4);
  c.moveTo(cx - 7, cy + 8);
  c.lineTo(cx + 7, cy + 8);
  c.moveTo(cx - 4, cy + 12);
  c.lineTo(cx + 4, cy + 12);
  c.stroke();
}

function drawLamp(c: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.moveTo(cx - r * 0.7, cy - r * 0.7);
  c.lineTo(cx + r * 0.7, cy + r * 0.7);
  c.moveTo(cx + r * 0.7, cy - r * 0.7);
  c.lineTo(cx - r * 0.7, cy + r * 0.7);
  c.stroke();
}

function drawMeter(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  glyph: string,
  font: string,
  fontSize: number,
  color: string,
) {
  c.beginPath();
  c.arc(cx, cy, 12, 0, Math.PI * 2);
  c.stroke();
  c.font = `600 ${fontSize}px ${font}`;
  c.fillStyle = color;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(glyph, cx, cy + 1);
}

/** Wire 렌더: from/to terminal 을 scene refs 로 찾아 Manhattan 경로로 연결. */
export const renderWire: PrimitiveRenderer = (rc, p0, refs) => {
  const w = p0 as Wire;
  const fromPoint = resolveTerminal(w.from, refs);
  const toPoint = resolveTerminal(w.to, refs);
  if (!fromPoint || !toPoint) return;

  const path = w.path && w.path.length >= 2 ? [...w.path] : manhattanRoute(fromPoint, toPoint);

  const c = rc.ctx;
  c.save();
  c.strokeStyle = rc.theme.foreground;
  c.lineWidth = rc.theme.strokeWidth.regular;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  const [sx0, sy0] = rc.toScreen(path[0]!);
  c.moveTo(sx0, sy0);
  for (let i = 1; i < path.length; i++) {
    const [sx, sy] = rc.toScreen(path[i]!);
    c.lineTo(sx, sy);
  }
  c.stroke();
  c.restore();
};

/** Terminal 렌더: junction 은 꽉 찬 점, 일반 node 는 테두리. */
export const renderTerminal: PrimitiveRenderer = (rc, p0) => {
  const t = p0 as Terminal;
  const c = rc.ctx;
  const [sx, sy] = rc.toScreen(t.pos);
  c.save();
  c.strokeStyle = rc.theme.foreground;
  c.fillStyle = t.kind === 'junction' ? rc.theme.foreground : rc.theme.background;
  c.lineWidth = rc.theme.strokeWidth.regular;
  c.beginPath();
  c.arc(sx, sy, 3, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.restore();
};

/**
 * 'elementId.terminalName' 또는 'terminalId' 형태의 reference 를 SceneGraphRefs 에서
 * 해석하여 월드 좌표를 반환.
 */
function resolveTerminal(ref: string, refs: SceneGraphRefs): Vec2 | null {
  const direct = refs.byId(ref);
  if (direct && direct.type === 'terminal') {
    return (direct as Terminal).pos;
  }
  const dot = ref.indexOf('.');
  if (dot < 0) return null;
  const elementId = ref.slice(0, dot);
  const termName = ref.slice(dot + 1);
  const el = refs.byId(elementId);
  if (!el || el.type !== 'circuitElement') return null;
  const ce = el as CircuitElement;
  // terminal 규약: 'a' 는 −단자(왼쪽), 'b' 는 +단자(오른쪽)
  const sign = termName === 'b' ? 1 : -1;
  const cos = [1, 0, -1, 0][ce.rotation / 90]!;
  const sin = [0, 1, 0, -1][ce.rotation / 90]!;
  return [ce.pos[0] + sign * cos, ce.pos[1] + sign * sin];
}
