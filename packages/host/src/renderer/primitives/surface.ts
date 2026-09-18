import type { PrimitiveRenderer, RenderContext, Surface, Vec2 } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/**
 * Surface 렌더러 — 움직이지 않는 구조물의 면.
 *
 * 모양(`geometry`) 넷:
 * - ground: 지평선 + 아래쪽 옅은 띠
 * - incline: 원점에서 각도로 뻗는 선 + 아래 삼각형 띠
 * - wall: 일반 선분
 * - arc: 원호 (띠 없음)
 *
 * 재질(`material`) 넷 — 선언만 있고 그리지 않던 것을 2026-09-18 에 구현했다 (장부 G119 · G138):
 * - solid(기본): 선 + 띠. 이전 그림 그대로다.
 * - smooth: 결 없는 면 — solid 와 같은 그림이다. `rough` 의 반대라 결을 긋지 않는다는 것이 뜻이다.
 * - rough: solid 위에 결 사선 — 면의 「안쪽」(ground · incline 은 아래, wall 은 from→to 의 오른쪽,
 *   arc 는 바깥)에 짧은 사선을 긋는다.
 * - transparent: 경계선을 옅은 점선으로 — 물면 · 유리처럼 비치는 경계. 띠는 그대로 깐다(띠가
 *   그 아래 매질이다 — pressure-isotropy 의 물).
 *
 * 색은 선언된 `style` 을 따르고, 선언이 없으면 이전처럼 `foreground` 다.
 */

/** 결 사선 사이 간격(화면 px). 결은 그림의 결이라 배율을 따라가지 않는다 (region 의 해칭과 같다). */
const ROUGH_SPACING_PX = 7;
/** 결 사선 한 획의 길이(화면 px). */
const ROUGH_LENGTH_PX = 6;
/** 결 사선의 짙기. */
const ROUGH_ALPHA = 0.55;
/** 투명한 면의 점선 무늬(화면 px)와 짙기. */
const TRANSPARENT_DASH_PX = [5, 4] as const;
const TRANSPARENT_ALPHA = 0.6;
/** ground · incline 의 옅은 띠 짙기. */
const GROUND_FILL_ALPHA = 0.15;
const INCLINE_FILL_ALPHA = 0.2;
/** ground 가 좌우로 뻗는 월드 길이 — 화면 밖까지. */
const GROUND_REACH = 1000;
/** incline 의 기본 길이(월드). */
const INCLINE_LENGTH_DEFAULT = 4;

type Material = NonNullable<Surface['material']>;

/**
 * 화면 선분 a→b 를 따라 결 사선을 긋는다. 사선은 선분의 한쪽(`side` = +1 이면 화면에서
 * 진행 방향의 오른쪽)으로 45° 기울어 뻗는다.
 */
function roughAlong(c: CanvasRenderingContext2D, a: Vec2, b: Vec2, side: 1 | -1): void {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < ROUGH_SPACING_PX) return;
  const ux = dx / len;
  const uy = dy / len;
  // 화면 좌표(y 아래)에서 진행 방향의 오른쪽 법선은 (-uy, ux).
  const nx = -uy * side;
  const ny = ux * side;
  const k = ROUGH_LENGTH_PX / Math.SQRT2;
  c.beginPath();
  for (let s = ROUGH_SPACING_PX / 2; s < len; s += ROUGH_SPACING_PX) {
    const px = a[0] + ux * s;
    const py = a[1] + uy * s;
    c.moveTo(px, py);
    c.lineTo(px + (nx - ux) * k, py + (ny - uy) * k);
  }
  c.stroke();
}

/** 지금 설정된 선 색으로 결 사선을 긋는다 — 옅게, 실선으로. */
function strokeRough(rc: RenderContext, draw: () => void): void {
  const c = rc.ctx;
  c.save();
  c.setLineDash([]);
  c.lineWidth = rc.theme.strokeWidth.thin;
  setAlpha(c, ROUGH_ALPHA);
  draw();
  setAlpha(c, 1);
  c.restore();
}

/** 재질에 맞춰 선 모양을 건다 — 투명한 면만 옅은 점선이다. */
function applyLine(rc: RenderContext, material: Material): void {
  const c = rc.ctx;
  if (material === 'transparent') {
    c.setLineDash([...TRANSPARENT_DASH_PX]);
    setAlpha(c, TRANSPARENT_ALPHA);
    return;
  }
  c.setLineDash([]);
  setAlpha(c, 1);
}

export const renderSurface: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Surface;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const g = p.geometry;
  const material: Material = p.material ?? 'solid';
  const line = p.style?.colorRole ? primitiveColor(rc, p) : rc.theme.foreground;
  const fillColor = rc.theme.muted;
  const rough = material === 'rough';

  if (g.kind === 'ground') {
    const y = typeof g.y === 'number' ? g.y : 0;
    const [x0s, ys] = rc.toScreen([-GROUND_REACH, y]);
    const [x1s] = rc.toScreen([GROUND_REACH, y]);
    // 선을 먼저, 띠를 나중에 — 이전 그림과 같은 순서라 solid 는 화소까지 같다.
    applyLine(rc, material);
    c.strokeStyle = line;
    c.lineWidth = rc.theme.strokeWidth.regular;
    c.beginPath();
    c.moveTo(x0s, ys);
    c.lineTo(x1s, ys);
    c.stroke();
    c.fillStyle = fillColor;
    setAlpha(c, GROUND_FILL_ALPHA);
    c.fillRect(0, ys, rc.viewport.width, rc.viewport.height - ys);
    setAlpha(c, 1);
    // 화면 폭 안에서만 결을 긋는다 — 월드 ±1000 을 다 그으면 사선이 수만 개다.
    if (rough) strokeRough(rc, () => roughAlong(c, [0, ys], [rc.viewport.width, ys], 1));
  } else if (g.kind === 'incline') {
    const [ox, oy] = rc.toScreen(g.origin);
    const length = typeof g.length === 'number' ? g.length : INCLINE_LENGTH_DEFAULT;
    const rad = -g.angle; // 수학 방향
    const tx = ox + Math.cos(rad) * length * rc.scale;
    const ty = oy - Math.sin(-g.angle) * length * rc.scale;
    c.fillStyle = fillColor;
    setAlpha(c, INCLINE_FILL_ALPHA);
    c.beginPath();
    c.moveTo(ox, oy);
    c.lineTo(tx, ty);
    c.lineTo(tx, oy);
    c.closePath();
    c.fill();
    applyLine(rc, material);
    c.strokeStyle = line;
    c.lineWidth = rc.theme.strokeWidth.regular;
    c.beginPath();
    c.moveTo(ox, oy);
    c.lineTo(tx, ty);
    c.stroke();
    // 경사면의 아래쪽 — 원점에서 뻗는 방향에 따라 오른쪽 · 왼쪽이 바뀐다.
    if (rough) strokeRough(rc, () => roughAlong(c, [ox, oy], [tx, ty], tx >= ox ? 1 : -1));
  } else if (g.kind === 'wall') {
    const a = rc.toScreen(g.from);
    const b = rc.toScreen(g.to);
    applyLine(rc, material);
    c.strokeStyle = line;
    c.lineWidth = rc.theme.strokeWidth.heavy;
    c.beginPath();
    c.moveTo(a[0], a[1]);
    c.lineTo(b[0], b[1]);
    c.stroke();
    // 월드에서 from→to 의 오른쪽 — y 가 뒤집혀도 진행 방향도 함께 뒤집혀 화면에서도 오른쪽이다.
    if (rough) strokeRough(rc, () => roughAlong(c, a, b, 1));
  } else if (g.kind === 'arc') {
    const [cx, cy] = rc.toScreen(g.center);
    const r = g.radius * rc.scale;
    applyLine(rc, material);
    c.strokeStyle = line;
    c.lineWidth = rc.theme.strokeWidth.regular;
    // 월드는 반시계가 + 인데 화면은 y 가 뒤집혀 있어, 각의 부호를 뒤집고 반시계로 긋는다.
    const anticlockwise = g.to >= g.from;
    c.beginPath();
    c.arc(cx, cy, r, -g.from, -g.to, anticlockwise);
    c.stroke();
    if (rough) {
      strokeRough(rc, () => {
        const span = g.to - g.from;
        const steps = Math.max(1, Math.floor((Math.abs(span) * r) / ROUGH_SPACING_PX));
        const k = ROUGH_LENGTH_PX / Math.SQRT2;
        c.beginPath();
        for (let i = 0; i < steps; i++) {
          const th = g.from + span * ((i + 0.5) / steps);
          // 화면 각 — 바깥 법선(cos, -sin)과 진행 접선을 섞어 45° 로 뻗는다.
          const ox = Math.cos(th);
          const oy = -Math.sin(th);
          const px = cx + ox * r;
          const py = cy + oy * r;
          const tx = -oy * Math.sign(span || 1);
          const ty = ox * Math.sign(span || 1);
          c.moveTo(px, py);
          c.lineTo(px + (ox - tx) * k, py + (oy - ty) * k);
        }
        c.stroke();
      });
    }
  }

  c.setLineDash([]);
  setAlpha(c, 1);
  finalizeBaseMeta(rc, p);
};
