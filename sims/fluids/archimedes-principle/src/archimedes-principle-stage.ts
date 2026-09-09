// ========================================================================
// archimedes-principle — 자유 렌더 계층 (S-sim 「자유 렌더 계층」)
// ========================================================================
// 표준 8종(body·trajectory·vector·surface·marker·graph·event·gauge)으로는
// 이 조각의 동사가 화면에서 일어나지 않는다 (원칙 4).
//
//   "넘친다"              → 물은 담긴 그릇 모양대로 채워지고 수면이 오르내리며
//                           주둥이에서 줄기가 되어 떨어져야 한다.
//                           body/rect 는 잠긴 부분을 물빛으로 덮지 못하고,
//                           trajectory 는 선이지 물줄기가 아니다.
//   "두 저울이 마주 움직인다" → 두 눈금판이 같은 눈금을 쓰고, 각자 처음 자리에서
//                           지금 자리까지 자란 부채꼴이 매 순간 합동이어야 한다.
//                           gauge 는 화면 좌상단에 id 해시로 쌓이는 가로 막대라
//                           장치 옆에 붙지도, 마주 보지도 못한다.
//
// 여기 있는 것은 그리는 코드뿐이다. 무엇을 그릴지는 `scene.ts` 가 선언하고,
// 문안은 `schema.ts` 가 갖는다. 색은 전부 `theme` 경유다 (C2).
// 등록은 호스트가 한다 — NOTES.md 참고.
// ========================================================================

import type { ColorRole, Plugin, PrimitiveRenderer, RenderContext } from '@aperi21/schema';

import {
  ARCHIMEDES_PRIMITIVE_TYPES,
  ARCHIMEDES_Z_HINTS,
  text,
  type DialScalePrimitive,
  type WaterStreamPrimitive,
  type WaterVolumePrimitive,
} from './schema';

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function roleColor(
  rc: RenderContext,
  role: ColorRole | undefined,
  fallback: ColorRole,
  emphasis: 'strong' | 'medium' | 'subtle' = 'strong',
): string {
  return rc.theme.resolveColor(role ?? fallback, emphasis);
}

// ------------------------------------------------------------------------
// waterVolume — 그릇에 담긴 물
// ------------------------------------------------------------------------

/** 수면 일렁임. 두 성분을 겹쳐 주기가 눈에 띄지 않게 한다. 화면 픽셀 단위 오프셋. */
function waveOffset(t: number, time: number, ampPx: number): number {
  if (ampPx <= 0) return 0;
  return -(Math.sin(t * 9 + time * 2.2) * 0.62 + Math.sin(t * 15.7 - time * 1.4) * 0.38) * ampPx;
}

const SURFACE_STEPS = 28;

export const renderWaterVolume: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as unknown as WaterVolumePrimitive;
  const min = p.bounds.min;
  const max = p.bounds.max;
  if (p.level <= min[1]) return;

  const level = Math.min(p.level, max[1]);
  const c = rc.ctx;
  const [xL, yTop] = rc.toScreen([min[0], level]);
  const [xR, yBottom] = rc.toScreen([max[0], min[1]]);
  const ampPx = (p.ripple ?? 0) * rc.scale;
  const color = roleColor(rc, p.style?.colorRole, 'secondary');

  const surfaceY = (i: number): number =>
    yTop + waveOffset(i / SURFACE_STEPS, rc.time, ampPx);

  c.save();

  // 물통
  c.beginPath();
  for (let i = 0; i <= SURFACE_STEPS; i++) {
    const x = xL + ((xR - xL) * i) / SURFACE_STEPS;
    if (i === 0) c.moveTo(x, surfaceY(i));
    else c.lineTo(x, surfaceY(i));
  }
  c.lineTo(xR, yBottom);
  c.lineTo(xL, yBottom);
  c.closePath();
  // 반투명이라 잠긴 부분이 물빛 아래로 비쳐 보인다 — 이것이 "잠겼다" 로 읽힌다.
  c.globalAlpha = 0.42;
  c.fillStyle = color;
  c.fill();
  c.globalAlpha = 1;

  // 수면
  c.beginPath();
  for (let i = 0; i <= SURFACE_STEPS; i++) {
    const x = xL + ((xR - xL) * i) / SURFACE_STEPS;
    if (i === 0) c.moveTo(x, surfaceY(i));
    else c.lineTo(x, surfaceY(i));
  }
  c.strokeStyle = color;
  c.lineWidth = rc.theme.strokeWidth.thick;
  c.lineCap = 'round';
  c.stroke();

  c.restore();
};

// ------------------------------------------------------------------------
// waterStream — 주둥이에서 넘어가는 물줄기
// ------------------------------------------------------------------------

const STREAM_STEPS = 26;
/** 물방울 개수와 흐르는 속도 (주기/s). */
const DROPLETS = 4;
const DROPLET_SPEED = 1.35;

export const renderWaterStream: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as unknown as WaterStreamPrimitive;
  const flow = clamp(p.flow, 0, 1);
  if (flow <= 0.02) return;

  const c = rc.ctx;
  const [x0, y0] = rc.toScreen(p.from);
  const [x1, y1] = rc.toScreen(p.to);
  const widthPx = Math.max(1.2, p.width * flow * rc.scale);
  const color = roleColor(rc, p.style?.colorRole, 'secondary');

  // 수평 속도는 일정하고 낙하는 가속한다 — 포물선.
  const px = (t: number): number => x0 + (x1 - x0) * t;
  const py = (t: number): number => y0 + (y1 - y0) * t * t;
  // 떨어질수록 빨라지므로 가늘어진다 (연속 방정식).
  const halfWidth = (t: number): number => (widthPx * (1 - 0.34 * t)) / 2;

  const xs: number[] = [];
  const ys: number[] = [];
  const nx: number[] = [];
  const ny: number[] = [];
  for (let i = 0; i <= STREAM_STEPS; i++) {
    const t = i / STREAM_STEPS;
    xs.push(px(t));
    ys.push(py(t));
    const dt = 1 / STREAM_STEPS;
    const tx = px(Math.min(1, t + dt)) - px(Math.max(0, t - dt));
    const ty = py(Math.min(1, t + dt)) - py(Math.max(0, t - dt));
    const len = Math.hypot(tx, ty) || 1;
    nx.push(-ty / len);
    ny.push(tx / len);
  }

  c.save();

  c.beginPath();
  for (let i = 0; i <= STREAM_STEPS; i++) {
    const h = halfWidth(i / STREAM_STEPS);
    const x = (xs[i] ?? 0) + (nx[i] ?? 0) * h;
    const y = (ys[i] ?? 0) + (ny[i] ?? 0) * h;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  for (let i = STREAM_STEPS; i >= 0; i--) {
    const h = halfWidth(i / STREAM_STEPS);
    c.lineTo((xs[i] ?? 0) - (nx[i] ?? 0) * h, (ys[i] ?? 0) - (ny[i] ?? 0) * h);
  }
  c.closePath();
  c.globalAlpha = 0.55;
  c.fillStyle = color;
  c.fill();

  // 흘러가는 물방울 — 줄기가 멈춰 있지 않고 실제로 흐르는 것으로 읽히게.
  c.globalAlpha = 0.95;
  for (let d = 0; d < DROPLETS; d++) {
    const raw = rc.time * DROPLET_SPEED * (0.6 + flow) + d / DROPLETS;
    const t = raw - Math.floor(raw);
    const r = Math.max(1, halfWidth(t) * 0.85);
    c.beginPath();
    c.arc(px(t), py(t), r, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
};

// ------------------------------------------------------------------------
// dialScale — 눈금판 저울
// ------------------------------------------------------------------------

/** 눈금판 0 의 각도 (캔버스 좌표계, 왼쪽 아래) 와 시계 방향 총 각도. */
const DIAL_START = Math.PI * 0.75;
const DIAL_SWEEP = Math.PI * 1.5;
const DIAL_TICKS = 8;

export const renderDialScale: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as unknown as DialScalePrimitive;
  const c = rc.ctx;
  const [cx, cy] = rc.toScreen(p.pos);
  const R = Math.max(16, p.radius * rc.scale);
  const lo = p.range[0];
  const hi = p.range[1];
  const span = hi - lo || 1;
  const angleOf = (v: number): number =>
    DIAL_START + clamp((v - lo) / span, 0, 1) * DIAL_SWEEP;

  const accent = roleColor(rc, p.style?.colorRole, 'accent');
  const unit = p.unit ? rc.i18n.resolve(p.unit) : '';

  c.save();

  // 매달린 줄 — 이 저울이 무엇을 들고 있는지.
  if (p.tether) {
    const [tx, ty] = rc.toScreen(p.tether);
    c.strokeStyle = rc.theme.line;
    c.lineWidth = rc.theme.strokeWidth.thick;
    c.beginPath();
    c.moveTo(cx, cy + R);
    c.lineTo(tx, ty);
    c.stroke();
    c.fillStyle = rc.theme.line;
    c.beginPath();
    c.arc(tx, ty, Math.max(2, R * 0.07), 0, Math.PI * 2);
    c.fill();
  }

  // 판
  c.beginPath();
  c.arc(cx, cy, R, 0, Math.PI * 2);
  c.fillStyle = rc.theme.background;
  c.fill();
  c.strokeStyle = rc.theme.line;
  c.lineWidth = rc.theme.strokeWidth.thick;
  c.stroke();

  // 변화 부채꼴 — 처음 자리에서 지금 자리까지.
  // 두 저울이 같은 눈금을 쓰므로 이 부채꼴의 각도 폭이 곧 변화량이고,
  // 왼쪽 것과 오른쪽 것은 매 순간 합동이다. 그것이 이 그림이 하는 말이다.
  const a0 = angleOf(p.origin);
  const a1 = angleOf(p.value);
  if (Math.abs(a1 - a0) > 0.004) {
    const rSector = R * 0.72;
    c.beginPath();
    c.moveTo(cx, cy);
    c.arc(cx, cy, rSector, a0, a1, a1 < a0);
    c.closePath();
    c.globalAlpha = 0.3;
    c.fillStyle = accent;
    c.fill();
    c.globalAlpha = 1;

    c.beginPath();
    c.arc(cx, cy, rSector, a0, a1, a1 < a0);
    c.strokeStyle = accent;
    c.lineWidth = rc.theme.strokeWidth.thick;
    c.stroke();
  }

  // 눈금
  c.strokeStyle = rc.theme.muted;
  for (let i = 0; i <= DIAL_TICKS; i++) {
    const a = DIAL_START + (i / DIAL_TICKS) * DIAL_SWEEP;
    const major = i % 2 === 0;
    const inner = R * (major ? 0.8 : 0.87);
    c.lineWidth = major ? rc.theme.strokeWidth.regular : rc.theme.strokeWidth.thin;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    c.lineTo(cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94);
    c.stroke();
  }

  // 담그기 전 지침이 서 있던 자리
  c.strokeStyle = rc.theme.muted;
  c.lineWidth = rc.theme.strokeWidth.regular;
  c.setLineDash([3, 3]);
  c.beginPath();
  c.moveTo(cx, cy);
  c.lineTo(cx + Math.cos(a0) * R * 0.78, cy + Math.sin(a0) * R * 0.78);
  c.stroke();
  c.setLineDash([]);

  // 지침
  c.strokeStyle = rc.theme.foreground;
  c.lineWidth = rc.theme.strokeWidth.thick;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - Math.cos(a1) * R * 0.13, cy - Math.sin(a1) * R * 0.13);
  c.lineTo(cx + Math.cos(a1) * R * 0.8, cy + Math.sin(a1) * R * 0.8);
  c.stroke();
  c.beginPath();
  c.arc(cx, cy, Math.max(2, R * 0.08), 0, Math.PI * 2);
  c.fillStyle = rc.theme.foreground;
  c.fill();

  // 지금 눈금 (표식 — 수·단위라 번역 대상이 아니다, C1 판정 3)
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = `600 ${Math.round(R * 0.3)}px ${rc.theme.fontFamilyMono}`;
  c.fillStyle = rc.theme.foreground;
  c.fillText(`${p.value.toFixed(2)} ${unit}`.trim(), cx, cy + R * 0.4);

  // 처음 자리에서 얼마나 움직였는가 — 두 저울의 이 수가 언제나 같은 크기다.
  const delta = p.value - p.origin;
  if (Math.abs(delta) > 0.005) {
    // 눈금판 아래쪽은 0 과 최대값 사이가 비어 있는 자리라 여기 놓아도 눈금을 가리지 않는다.
    c.font = `600 ${Math.round(R * 0.26)}px ${rc.theme.fontFamilyMono}`;
    c.fillStyle = accent;
    c.fillText(
      `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)} ${unit}`.trim(),
      cx,
      cy + R * 0.76,
    );
  }

  // 이 저울의 이름 — 문안은 선언에서 온다 (C1).
  if (p.label) {
    c.font = `${Math.round(R * 0.26)}px ${rc.theme.fontFamily}`;
    c.fillStyle = rc.theme.muted;
    c.textBaseline = 'alphabetic';
    c.fillText(rc.i18n.resolve(p.label), cx, cy - R - R * 0.18);
  }

  c.restore();
};

// ------------------------------------------------------------------------
// 등록 꾸러미
// ------------------------------------------------------------------------

export const archimedesPrincipleRenderers: Record<string, PrimitiveRenderer> = {
  waterVolume: renderWaterVolume,
  waterStream: renderWaterStream,
  dialScale: renderDialScale,
};

/**
 * 호스트가 그대로 `host.pluginManager.register(...)` 에 넘길 수 있는 형태.
 * 레지스트리 경유가 유일한 통로이므로(원칙 3) 이 sim 은 렌더러를 스스로
 * 등록하지 않는다 — 꾸러미만 내놓고 배선은 호스트가 한다.
 */
export const archimedesPrincipleStagePlugin: Plugin = {
  id: '@aperi21/sim-archimedes-principle',
  version: '0.1.0',
  label: text('label.title'),
  primitiveTypes: [...ARCHIMEDES_PRIMITIVE_TYPES],
  renderers: archimedesPrincipleRenderers,
  zHints: ARCHIMEDES_Z_HINTS,
};
