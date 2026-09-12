import type { Constraint, PrimitiveRenderer, SceneGraphRefs, Vec2 } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 매단 줄의 굵기(화면 px). 가늘다 — 줄은 보이되 추를 이기지 않는다. */
const STRING_WIDTH = 1;
/** 단단한 막대의 굵기(화면 px). */
const ROD_WIDTH = 3;
/** 용수철 코일의 기본 개수. */
const DEFAULT_COILS = 8;
/** 용수철이 옆으로 벌어지는 폭(화면 px). */
const COIL_SPREAD = 7;
/** 레일 두 줄 사이(화면 px). */
const RAIL_GAP = 4;
/** 줄은 매단 것이라 옅게 — 실 자체가 주장인 경우는 드물다. */
const STRING_ALPHA = 0.55;

/**
 * Constraint 렌더러 — 잡아 두는 것. 매단 줄 · 단단한 막대 · 용수철 · 레일.
 *
 * 선언만 있고 렌더러가 없던 어휘다. 01-broad 의 `pendulum-isochronism`(같은 피벗에
 * 겹쳐 매단 진자 다섯)이 이 자리를 밟아 구현했다. 진자 · 매단 추 · 용수철은 물리에서
 * 가장 흔한 그림인데 어휘가 비어 있었다.
 *
 * `from`·`to` 는 좌표이거나 **다른 프리미티브의 id** 다. id 면 그 프리미티브의 자리를
 * 따라간다 — 추가 움직이면 줄도 함께 움직인다.
 */
export const renderConstraint: PrimitiveRenderer = (rc, p0, refs) => {
  const p = p0 as Constraint;
  const a = resolveEnd(p.from, refs);
  const b = resolveEnd(p.to, refs);
  if (!a || !b) return;

  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'medium' });
  const [ax, ay] = rc.toScreen(a);
  const [bx, by] = rc.toScreen(b);

  c.strokeStyle = color;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  switch (p.subtype) {
    case 'spring': {
      c.lineWidth = STRING_WIDTH + 0.5;
      setAlpha(c, 1);
      drawSpring(c, ax, ay, bx, by, p.coils ?? DEFAULT_COILS);
      break;
    }
    case 'rail': {
      // 두 줄. 물체가 그 사이를 달린다.
      c.lineWidth = STRING_WIDTH;
      setAlpha(c, STRING_ALPHA);
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * (RAIL_GAP / 2);
      const ny = (dx / len) * (RAIL_GAP / 2);
      for (const s of [1, -1]) {
        c.beginPath();
        c.moveTo(ax + nx * s, ay + ny * s);
        c.lineTo(bx + nx * s, by + ny * s);
        c.stroke();
      }
      break;
    }
    case 'rigid_rod': {
      c.lineWidth = ROD_WIDTH;
      setAlpha(c, 1);
      line(c, ax, ay, bx, by);
      break;
    }
    default: {
      // string — 매단 줄.
      c.lineWidth = STRING_WIDTH;
      setAlpha(c, STRING_ALPHA);
      line(c, ax, ay, bx, by);
      break;
    }
  }

  finalizeBaseMeta(rc, p);
};

function line(c: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number): void {
  c.beginPath();
  c.moveTo(ax, ay);
  c.lineTo(bx, by);
  c.stroke();
}

/** 두 끝 사이를 지그재그로 감는다. 양 끝은 곧은 목으로 남겨 매단 자리가 분명하게. */
function drawSpring(
  c: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  coils: number,
): void {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const neck = Math.min(len * 0.15, 10);
  const bodyLen = len - neck * 2;
  const n = Math.max(1, Math.round(coils)) * 2;

  c.beginPath();
  c.moveTo(ax, ay);
  c.lineTo(ax + ux * neck, ay + uy * neck);
  for (let i = 1; i <= n; i++) {
    const t = neck + (bodyLen * i) / n;
    const side = i % 2 === 0 ? 0 : i % 4 === 1 ? 1 : -1;
    c.lineTo(ax + ux * t + nx * COIL_SPREAD * side, ay + uy * t + ny * COIL_SPREAD * side);
  }
  c.lineTo(bx, by);
  c.stroke();
}

/** 좌표면 그대로, id 면 그 프리미티브의 자리를 찾아서. */
function resolveEnd(end: Vec2 | string, refs: SceneGraphRefs): Vec2 | null {
  if (typeof end !== 'string') return end;
  const target = refs.byId(end);
  if (!target) return null;
  const pos = (target as { pos?: Vec2 }).pos;
  return Array.isArray(pos) ? pos : null;
}
