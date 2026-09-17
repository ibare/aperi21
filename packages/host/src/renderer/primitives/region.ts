import type { PrimitiveRenderer, Region, RenderContext, Vec2 } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 물결의 마디 수. 한 변을 이만큼 잘라 그린다. */
const RIPPLE_STEPS = 28;
/** 채움 기본 불투명도 — 잠긴 것이 비쳐 보이는 정도. */
const DEFAULT_OPACITY = 0.42;

/**
 * 두 성분을 겹쳐 주기가 눈에 띄지 않게 한다. 반환은 **화면 픽셀** 오프셋이다 —
 * 일렁임은 물리량이 아니라 표현이라 배율을 따라가면 확대했을 때 파도가 된다.
 */
function waveOffset(u: number, time: number, amplitudePx: number): number {
  if (amplitudePx <= 0) return 0;
  return -(Math.sin(u * 9 + time * 2.2) * 0.62 + Math.sin(u * 15.7 - time * 1.4) * 0.38) * amplitudePx;
}

/** 한 변을 물결로 잘라 화면 점 목록으로. */
function rippleEdge(
  rc: RenderContext,
  a: Vec2,
  b: Vec2,
  amplitudePx: number,
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= RIPPLE_STEPS; i++) {
    const u = i / RIPPLE_STEPS;
    const [x, y] = rc.toScreen([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    out.push([x, y + waveOffset(u, rc.time, amplitudePx)]);
  }
  return out;
}

/**
 * 사선 사이 간격(화면 px). 결은 물리량이 아니라 그림의 결이라 배율을 따라가지 않는다 —
 * 월드로 잡으면 좁은 임베드에서 사선이 뭉쳐 채움처럼 보인다.
 */
const HATCH_SPACING_PX = 6;

/**
 * 방금 채운 경로 안에 바탕색 사선을 긋는다. 경로는 호출 시점에 열려 있어야 한다.
 *
 * clip 은 **따로 save/restore 로 가둔다.** `applyBaseMeta` 가 연 save 는
 * `finalizeBaseMeta` 에서야 닫히므로, 그 안에서 clip 을 걸면 뒤에 긋는 `outline`
 * 굵은 변이 폴리곤 밖 절반을 잃는다 — 예외 없이 선만 가늘어진다.
 */
function hatch(rc: RenderContext, p: Region, amplitudePx: number): void {
  const c = rc.ctx;
  const screen = p.points.map((pt) => rc.toScreen(pt));
  const pad = amplitudePx + rc.theme.strokeWidth.regular;
  const minX = Math.min(...screen.map((s) => s[0])) - pad;
  const maxX = Math.max(...screen.map((s) => s[0])) + pad;
  const minY = Math.min(...screen.map((s) => s[1])) - pad;
  const maxY = Math.max(...screen.map((s) => s[1])) + pad;

  c.save();
  c.clip();
  // 강조 상태의 그림자가 사선마다 번지면 결이 뭉개진다. 면은 이미 그림자를 받았다.
  c.shadowBlur = 0;
  c.strokeStyle = rc.theme.background;
  c.lineWidth = rc.theme.strokeWidth.regular;
  c.beginPath();
  // 45° 사선. 상자 높이만큼 왼쪽에서 출발해야 왼쪽 아래 모서리까지 덮인다.
  const h = maxY - minY;
  for (let x = minX - h; x <= maxX; x += HATCH_SPACING_PX) {
    c.moveTo(x, maxY);
    c.lineTo(x + h, minY);
  }
  c.stroke();
  c.restore();
}

/**
 * 자유 곡선 경계를 가진 채워진 영역.
 *
 * 반투명하게 채우는 것이 핵심이다 — 잠긴 것이 아래로 비쳐 보여야 "잠겼다" 로
 * 읽힌다. 불투명하게 덮으면 물체가 사라진다.
 */
export const renderRegion: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Region;
  if (p.points.length < 3) return;
  applyBaseMeta(rc, p);

  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'secondary', emphasis: 'medium' });
  const amplitudePx = p.ripple ? p.ripple.amplitude : 0;
  const rippleEdgeIdx = p.ripple?.edge;

  /** 변 하나를 경로에 잇는다. 물결 변이면 잘라서. */
  const traceEdge = (i: number, first: boolean): void => {
    const a = p.points[i]!;
    const b = p.points[(i + 1) % p.points.length]!;
    const isRipple =
      rippleEdgeIdx !== undefined &&
      ((rippleEdgeIdx[0] === i && rippleEdgeIdx[1] === (i + 1) % p.points.length) ||
        (rippleEdgeIdx[1] === i && rippleEdgeIdx[0] === (i + 1) % p.points.length));

    if (isRipple) {
      const pts = rippleEdge(rc, a, b, amplitudePx);
      pts.forEach(([x, y], k) => {
        if (first && k === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      });
    } else {
      const [ax, ay] = rc.toScreen(a);
      const [bx, by] = rc.toScreen(b);
      if (first) c.moveTo(ax, ay);
      c.lineTo(bx, by);
    }
  };

  c.beginPath();
  for (let i = 0; i < p.points.length; i++) traceEdge(i, i === 0);
  c.closePath();
  if (p.opaque) {
    // 바탕을 먼저 불투명하게 깐다. 그 위의 옅은 색은 겹쳐도 짙어지지 않는다 —
    // 두 번째 도형도 바탕부터 다시 깔기 때문이다.
    setAlpha(c, 1);
    c.fillStyle = rc.theme.background;
    c.fill();
  }
  setAlpha(c, p.fillOpacity ?? DEFAULT_OPACITY);
  c.fillStyle = color;
  c.fill();
  setAlpha(c, 1);

  if ((p.fill ?? 'solid') === 'hatch') hatch(rc, p, amplitudePx);

  // 굵게 그릴 변만 따로 긋는다. 수면처럼 한 변만 또렷해야 하는 경우가 흔하다.
  for (const [i, j] of p.outline ?? []) {
    const a = p.points[i];
    const b = p.points[j];
    if (!a || !b) continue;
    const isRipple =
      rippleEdgeIdx !== undefined &&
      ((rippleEdgeIdx[0] === i && rippleEdgeIdx[1] === j) ||
        (rippleEdgeIdx[1] === i && rippleEdgeIdx[0] === j));
    c.beginPath();
    if (isRipple) {
      rippleEdge(rc, a, b, amplitudePx).forEach(([x, y], k) =>
        k === 0 ? c.moveTo(x, y) : c.lineTo(x, y),
      );
    } else {
      const [ax, ay] = rc.toScreen(a);
      const [bx, by] = rc.toScreen(b);
      c.moveTo(ax, ay);
      c.lineTo(bx, by);
    }
    c.strokeStyle = color;
    c.lineWidth = rc.theme.strokeWidth.thick;
    c.lineCap = 'round';
    c.stroke();
  }

  finalizeBaseMeta(rc, p);
};
