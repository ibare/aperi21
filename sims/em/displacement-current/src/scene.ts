// ========================================================================
// displacement-current — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 비스듬히 옆에서 본 도선 — 원판 축전기 — 도선. 앞으로 나온 깊이 z 는 화면 오른쪽으로
// `depthSkew` 만큼 민다(비스듬한 투영). 그래서 원판과 고리는 납작한 타원이 된다.
//
// - 고리 셋: 뒤 반쪽 · 앞 반쪽을 `trajectory` 둘로 나눠 도선 · E 선 아래와 위에 긋는다
//   (`drawOrder: 'scene'`). 짙기와 앞쪽 B 화살표(`vector`) 길이가 그 고리의 자기장이다.
// - 판 사이 E 선: `vector` 가닥마다 하나. 전하가 쌓인 만큼 선다(마지막 가닥은 불투명도로
//   분수). 판의 +/− 표식(`lineSet`)도 같은 자리 · 같은 순번이다.
// - 도선 속 전자: `particleSystem`. 밀려간 거리가 옮겨 간 전하라, 전류가 크면 빨리 가고
//   멎으면 선다. 판 사이 틈에는 알갱이가 없다.
//
// 색은 뜻마다 하나다. 자기장(고리 · B)만 강조색, E 선은 secondary, 도선 · 판 · 전자 ·
// I 는 먹색. 전류와 변위 전류를 색으로 가르지 않는다 — 가르는 것은 도선이 있고 없음이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  appearanceRank,
  chargeAt,
  currentAt,
  gapRingField,
  readConstants,
  wireRingField,
  type DisplacementCurrentConstants,
} from './physics';
import {
  DOT_GAP,
  ELECTRON_LABEL,
  I_ARROW_X,
  I_ARROW_Y,
  SCENE_BOUNDS,
  WIRE_END,
  WIRE_RING_X,
  text,
  type DisplacementCurrentMessageKey,
} from './schema';
import type { DisplacementCurrentState } from './state';

// ------------------------------------------------------------------------
// 색
// ------------------------------------------------------------------------

/** 도선 · 판 윤곽 · I · 글자. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 도선 속 전자 — 도선 위에서 읽히되 도선보다 한 단 옅게. */
const ELECTRON = { colorRole: 'ink', emphasis: 'medium' } as const;
/** 원판 면 — 배경 정보. */
const PLATE_FACE = { colorRole: 'muted', emphasis: 'subtle' } as const;
/** 자기장 — 강조색은 이 한 뜻에만 쓴다. */
const FIELD_B = { colorRole: 'accent', emphasis: 'strong' } as const;
/** 판 사이 전기장. */
const FIELD_E = { colorRole: 'secondary', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 반 고리 · 반 원판 하나를 이루는 점 개수. */
const HALF_ELLIPSE_SEGMENTS = 28;
/** 도선 굵기. */
const WIRE_WIDTH_PX = 2.4;
/** 원판 윤곽 굵기. */
const PLATE_WIDTH_PX = 1.6;
/** 원판 면의 채움 짙기 — 불투명하게 깔아 뒤로 지나는 도선을 가린다. */
const PLATE_FILL = 0.35;
/** 고리 굵기. */
const RING_WIDTH_PX = 2.4;
/** B 화살표 굵기. */
const B_ARROW_WIDTH_PX = 3;
/** I 화살표 굵기. */
const I_ARROW_WIDTH_PX = 2.6;
/** E 선 굵기. */
const E_WIDTH_PX = 1.6;
/** 화살촉 크기(월드). */
const B_HEAD = 0.2;
const I_HEAD = 0.2;
const E_HEAD = 0.13;
/** +/− 표식 반 길이(월드)와 굵기. */
const SIGN_HALF = 0.06;
const SIGN_WIDTH_PX = 1.6;
/** 전자 알갱이 크기(px). */
const DOT_PX = 2.6;
/** 기호 글자 크기(px). */
const SYMBOL_PX = 14;
const SMALL_SYMBOL_PX = 12;
/** 이름표를 화살표에서 띄우는 거리(월드). */
const I_LABEL_RISE = 0.28;
const B_LABEL_GAP = 0.22;
/** E 표식 — 가장 아래 E 선보다 이만큼 아래(월드). */
const E_LABEL_DROP = 0.24;
/** E 선이 차지하는 원판 높이의 몫 — 가장자리 선이 판 윤곽에 붙지 않게. */
const E_SPREAD = 0.8;
/** B 화살표가 놓이는 고리 위 자리 — 맨 위(0)에서 앞쪽으로 돈 각(라디안). 도선보다 위다. */
const B_ARROW_AT = 0.95;
/** 도선 속 알갱이가 원판 가장자리에서 떨어지는 틈(월드). 판 뒤로 숨는 자리까지 가지 않게. */
const DOT_PLATE_CLEAR = 0.08;

// ------------------------------------------------------------------------
// 투영 · 도형
// ------------------------------------------------------------------------

/** (x, y, z) → 월드 평면. 앞으로 나온 깊이 z 를 오른쪽으로 민다. */
function project(c: DisplacementCurrentConstants, x: number, y: number, z: number): Vec2 {
  return [x + c.depthSkew * z, y];
}

/**
 * 도선 축(x) 둘레의 원 — y-z 평면. `front` 이면 앞 반쪽(z ≥ 0), 아니면 뒤 반쪽.
 * 각 φ 는 맨 위(y = r)에서 0, 앞쪽으로 돌며 늘어난다.
 */
function halfCircle(c: DisplacementCurrentConstants, x: number, r: number, front: boolean): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= HALF_ELLIPSE_SEGMENTS; k++) {
    const phi = (front ? 0 : Math.PI) + (Math.PI * k) / HALF_ELLIPSE_SEGMENTS;
    pts.push(project(c, x, r * Math.cos(phi), r * Math.sin(phi)));
  }
  return pts;
}

function fullCircle(c: DisplacementCurrentConstants, x: number, r: number): Vec2[] {
  return [...halfCircle(c, x, r, true), ...halfCircle(c, x, r, false).slice(1)];
}

function symbol(
  id: string,
  key: DisplacementCurrentMessageKey,
  pos: Vec2,
  fontSize: number,
  style: Readout['style'],
  opacity: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    italic: true,
    align: 'center',
    fontSize,
    opacity,
    style,
  };
}

/** 선분 [a, b] 위에 `offset` 부터 `DOT_GAP` 간격으로 알갱이 자리. */
function dotsAlong(a: number, b: number, offset: number): Vec2[] {
  const phase = ((offset % DOT_GAP) + DOT_GAP) % DOT_GAP;
  const out: Vec2[] = [];
  for (let x = a + phase; x <= b; x += DOT_GAP) out.push([x, 0]);
  return out;
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: DisplacementCurrentState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const q = chargeAt(tl, c);
  const i = currentAt(tl, c);
  const out: Primitive[] = [];

  const half = c.plateGap / 2;
  const rings = [
    { id: 'left', x: -WIRE_RING_X, b: wireRingField(i) },
    { id: 'gap', x: 0, b: gapRingField(i, c) },
    { id: 'right', x: WIRE_RING_X, b: wireRingField(i) },
  ];

  // ---- 1. 고리의 뒤 반쪽 — 도선 · E 선보다 먼저 ----
  for (const ring of rings) {
    out.push({
      type: 'trajectory',
      id: `ring-${ring.id}-back`,
      points: halfCircle(c, ring.x, c.ringRadius, false),
      width: RING_WIDTH_PX,
      opacity: Math.min(1, Math.abs(ring.b) * c.fadeGain),
      style: FIELD_B,
    });
  }

  // ---- 2. 왼쪽 도선 — 왼쪽 판의 바깥(뒤) 면에 붙으므로 판보다 먼저 ----
  out.push({ type: 'trajectory', id: 'wire-left', points: [[-WIRE_END, 0], [-half, 0]], width: WIRE_WIDTH_PX, style: INK });

  // ---- 3. 도선 속 전자 — 밀려간 거리 = 옮겨 간 전하. 전류(오른쪽 +)와 반대로 간다 ----
  const drift = -q * c.flowScale;
  const plateReach = c.depthSkew * c.plateRadius + DOT_PLATE_CLEAR;
  out.push({
    type: 'particleSystem',
    id: 'electrons-left',
    positions: dotsAlong(-WIRE_END, -half - plateReach, drift),
    sizes: DOT_PX,
    style: ELECTRON,
  });
  out.push(symbol('electron-label', 'label.electron', ELECTRON_LABEL, SMALL_SYMBOL_PX, INK, 1));

  // ---- 4. 왼쪽 판 — 안쪽 면이 보인다. + 표식이 그 위에 ----
  const plateLeft = fullCircle(c, -half, c.plateRadius);
  out.push({ type: 'region', id: 'plate-left-face', points: plateLeft, fillOpacity: PLATE_FILL, opaque: true, style: PLATE_FACE });
  out.push({ type: 'trajectory', id: 'plate-left-rim', points: plateLeft, closed: true, width: PLATE_WIDTH_PX, style: INK });

  // E 선 · 표식 자리(아래부터)와 순번. 쌓인 전하만큼 선다.
  const n = Math.max(1, Math.round(c.eLineCount));
  const rank = appearanceRank(n);
  const filled = q * n;
  const lanes = Array.from({ length: n }, (_, k) => {
    const y = n === 1 ? 0 : c.plateRadius * E_SPREAD * (-1 + (2 * k) / (n - 1));
    return { y, alpha: Math.max(0, Math.min(1, filled - rank[k]!)) };
  });

  const plus: Vec2[][] = [];
  const plusAlpha: number[] = [];
  for (const lane of lanes) {
    if (lane.alpha <= 0) continue;
    const [px, py] = project(c, -half, lane.y, 0);
    plus.push([[px - SIGN_HALF, py], [px + SIGN_HALF, py]], [[px, py - SIGN_HALF], [px, py + SIGN_HALF]]);
    plusAlpha.push(lane.alpha, lane.alpha);
  }
  out.push({ type: 'lineSet', id: 'plate-left-charge', lines: plus, opacities: plusAlpha, width: SIGN_WIDTH_PX, style: INK });

  // ---- 5. 판 사이 E 선 — 왼쪽 판 면에서 나와 오른쪽 판 뒤로 들어간다 ----
  lanes.forEach((lane, k) => {
    if (lane.alpha <= 0) return;
    // 오른쪽 판 타원의 왼쪽 가장자리 — 그 뒤로 들어가는 자리에 촉이 닿는다.
    const edge = half - c.depthSkew * Math.sqrt(Math.max(0, c.plateRadius ** 2 - lane.y ** 2));
    out.push({
      type: 'vector',
      id: `e-line-${k}`,
      from: [-half, lane.y],
      delta: [edge - -half, 0],
      headSize: E_HEAD,
      width: E_WIDTH_PX,
      opacity: lane.alpha,
      style: FIELD_E,
    });
  });
  const lowest = lanes[0]!;
  out.push(
    symbol('e-label', 'label.efield', [0, lowest.y - E_LABEL_DROP], SMALL_SYMBOL_PX, FIELD_E, Math.min(1, filled)),
  );

  // ---- 6. 오른쪽 판 — 바깥 면이 보인다. − 표식이 그 위에 ----
  const plateRight = fullCircle(c, half, c.plateRadius);
  out.push({ type: 'region', id: 'plate-right-face', points: plateRight, fillOpacity: PLATE_FILL, opaque: true, style: PLATE_FACE });
  out.push({ type: 'trajectory', id: 'plate-right-rim', points: plateRight, closed: true, width: PLATE_WIDTH_PX, style: INK });
  const minus: Vec2[][] = [];
  const minusAlpha: number[] = [];
  for (const lane of lanes) {
    if (lane.alpha <= 0) continue;
    const [px, py] = project(c, half, lane.y, 0);
    minus.push([[px - SIGN_HALF, py], [px + SIGN_HALF, py]]);
    minusAlpha.push(lane.alpha);
  }
  out.push({ type: 'lineSet', id: 'plate-right-charge', lines: minus, opacities: minusAlpha, width: SIGN_WIDTH_PX, style: INK });

  // ---- 7. 오른쪽 도선과 전자 ----
  out.push({ type: 'trajectory', id: 'wire-right', points: [[half, 0], [WIRE_END, 0]], width: WIRE_WIDTH_PX, style: INK });
  out.push({
    type: 'particleSystem',
    id: 'electrons-right',
    positions: dotsAlong(half + plateReach, WIRE_END, drift),
    sizes: DOT_PX,
    style: ELECTRON,
  });

  // ---- 8. 고리의 앞 반쪽과 B 화살표 — 도선 · E 선 위 ----
  for (const ring of rings) {
    const alpha = Math.min(1, Math.abs(ring.b) * c.fadeGain);
    out.push({
      type: 'trajectory',
      id: `ring-${ring.id}-front`,
      points: halfCircle(c, ring.x, c.ringRadius, true),
      width: RING_WIDTH_PX,
      opacity: alpha,
      style: FIELD_B,
    });
    // 고리 위 자리 φ(맨 위에서 앞쪽으로 돈 각)는 (y, z) = r(cos φ, sin φ). B 의 방향은
    // x̂ × r̂ = (−sin φ, cos φ) — 오른쪽으로 흐르면 앞쪽에서 아래로 돈다. 거꾸로면 뒤집힌다.
    const r = c.ringRadius;
    const phi = B_ARROW_AT;
    const centre = project(c, ring.x, r * Math.cos(phi), r * Math.sin(phi));
    const len = c.bArrowScale * Math.abs(ring.b);
    if (len > 0) {
      const sign = Math.sign(ring.b);
      const d = project(c, 0, -Math.sin(phi) * sign, Math.cos(phi) * sign);
      const norm = Math.hypot(d[0], d[1]);
      const ux = d[0] / norm;
      const uy = d[1] / norm;
      out.push({
        type: 'vector',
        id: `b-${ring.id}`,
        from: [centre[0] - (ux * len) / 2, centre[1] - (uy * len) / 2],
        delta: [ux * len, uy * len],
        headSize: B_HEAD,
        width: B_ARROW_WIDTH_PX,
        outline: 'background',
        opacity: alpha,
        style: FIELD_B,
      });
    }
    out.push(symbol(`b-label-${ring.id}`, 'label.field', [centre[0] + B_LABEL_GAP, centre[1]], SYMBOL_PX, FIELD_B, alpha));
  }

  // ---- 9. 도선 전류 I — 오른쪽으로 흐르면 오른쪽을 가리킨다. 길이 ∝ 전류 ----
  const iLen = c.iArrowScale * Math.abs(i);
  const iDir = Math.sign(i);
  const iAlpha = Math.min(1, Math.abs(i) * c.fadeGain);
  for (const [id, cx] of [['left', -I_ARROW_X], ['right', I_ARROW_X]] as const) {
    if (iLen > 0) {
      out.push({
        type: 'vector',
        id: `i-${id}`,
        from: [cx - (iDir * iLen) / 2, I_ARROW_Y],
        delta: [iDir * iLen, 0],
        headSize: I_HEAD,
        width: I_ARROW_WIDTH_PX,
        opacity: iAlpha,
        style: INK,
      });
    }
    out.push(symbol(`i-label-${id}`, 'label.current', [cx, I_ARROW_Y + I_LABEL_RISE], SYMBOL_PX, INK, iAlpha));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
