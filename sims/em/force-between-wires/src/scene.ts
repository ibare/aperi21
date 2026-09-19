// ========================================================================
// force-between-wires — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 두 도선을 **세워 본 옆모습**이다. 도선은 위아래 끝이 받침에 묶여 있고, 힘을 받으면 가운데가
// 휜다. 전류 방향은 도선 바깥쪽의 화살표 `I` 로 보인다.
//
// 왼쪽 도선이 만든 자기장은 종이를 뚫는 방향이라 표식으로 보인다 — 도선 오른쪽은 ⊗(안으로),
// 왼쪽은 ⊙(밖으로). 오른쪽 도선은 ⊗ 속에 놓인다. 오른쪽 도선의 장은 그리지 않는다(NOTES (b)).
//
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`):
//
//   받침 → 장 표식 · B → 도선 → 전류 화살표 · I → 힘 · F
//
// 강조색(accent)은 한 뜻에만 쓴다 — 힘. 장은 배경 정보라 회색, 도선 · 받침 · 전류는 먹.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { derive, readConstants } from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { ForceBetweenWiresState } from './state';

// ---- 배치(월드) ----
/** 도선 하나를 긋는 표본 수(받침에서 받침까지). */
const WIRE_SAMPLES = 40;
/** 받침(도선 끝을 묶는 짧은 막대)의 반 길이. */
const CLAMP_HALF = 0.28;
/** 장 표식을 세우는 높이 — 가운데(힘 화살표 자리)는 비운다. */
const MARK_YS: readonly number[] = [-1.3, -0.65, 0.65, 1.3];
/** 장 표식 고리 반지름 · ⊗ 가위표 반 길이. */
const MARK_RADIUS = 0.13;
const MARK_ARM = 0.065;
/** 고리 표본 수. */
const RING_SAMPLES = 32;
/** 전류 화살표를 도선에서 바깥쪽으로 띄우는 거리 · 화살표가 걸치는 높이(아래 끝 · 위 끝). */
const CURRENT_ARROW_OUTSET = 0.42;
const CURRENT_ARROW_LOW = 0.45;
const CURRENT_ARROW_HIGH = 1.15;
/** 힘 화살표를 도선에서 띄우는 거리 — 도선 획과 화살표 꼬리가 붙지 않게. */
const FORCE_GAP = 0.06;
/** 화살촉 크기(월드). */
const HEAD_SIZE = 0.16;
const CURRENT_HEAD_SIZE = 0.13;

// ---- 모양(화면 px · 불투명도) ----
const WIRE_WIDTH_PX = 3.5;
const CLAMP_WIDTH_PX = 5;
const MARK_WIDTH_PX = 1.6;
/** ⊙ 가운데 점 반지름(화면 px — `particleSystem.sizes` 의 단위). */
const MARK_DOT_PX = 3;
const MARK_OPACITY = 0.85;
const CURRENT_WIDTH_PX = 2.2;
const FORCE_WIDTH_PX = 4.5;
/** 글자 크기 · 이름표 띄움(화면 px). */
const LABEL_FONT_PX = 16;
const FIELD_LABEL_OFFSET_PX: Vec2 = [10, 0];
const CURRENT_LABEL_GAP_PX = 10;
const FORCE_LABEL_RISE_PX = -16;
/** 이 아래의 힘 화면 길이(월드)면 화살표를 두지 않는다 — 머리만 남은 점이 방향처럼 읽힌다. */
const FORCE_VISIBLE = 0.02;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

function ring(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 받침에 두 끝이 묶인 도선 — 가운데가 `inward` 쪽으로 `bow` 만큼 휜 사인 반 파장. */
function wirePoints(x0: number, inward: number, bow: number, halfLength: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= WIRE_SAMPLES; i++) {
    const s = i / WIRE_SAMPLES;
    const y = -halfLength + 2 * halfLength * s;
    pts.push([x0 + inward * bow * Math.sin(Math.PI * s), y]);
  }
  return pts;
}

export function scene(params: {
  state: ForceBetweenWiresState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('force-between-wires: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const halfGap = (c.gap * c.worldPerMeter) / 2;
  const halfLength = (c.wireLength * c.worldPerMeter) / 2;
  /** 두 도선 — 자리와 안쪽(상대 도선 쪽) 방향, 지금 전류. */
  const wires = [
    { id: 'left', x0: -halfGap, inward: 1, current: r.left },
    { id: 'right', x0: halfGap, inward: -1, current: r.right },
  ] as const;
  const out: Primitive[] = [];

  // ---- 받침 — 도선 끝을 묶는 짧은 막대. 도선은 여기서 움직이지 않는다 ----
  for (const w of wires) {
    for (const y of [halfLength, -halfLength]) {
      out.push({
        type: 'trajectory',
        id: `clamp-${w.id}-${y > 0 ? 'top' : 'bottom'}`,
        points: [
          [w.x0 - CLAMP_HALF, y],
          [w.x0 + CLAMP_HALF, y],
        ],
        width: CLAMP_WIDTH_PX,
        opacity: op,
        style: ink,
      });
    }
  }

  // ---- 왼쪽 도선이 만든 자기장 — 오른쪽 ⊗ · 왼쪽 ⊙ (전류가 위로일 때) ----
  if (r.left !== 0) {
    const rightSide = Math.sign(r.left) > 0 ? 'in' : 'out';
    const leftSide = rightSide === 'in' ? 'out' : 'in';
    const columns: { x: number; dir: 'in' | 'out' }[] = [
      { x: -2 * halfGap, dir: leftSide },
      { x: 0, dir: rightSide },
      { x: 2 * halfGap, dir: rightSide },
    ];
    const rings: Vec2[][] = [];
    const crosses: [Vec2, Vec2][] = [];
    const dots: Vec2[] = [];
    for (const col of columns) {
      for (const y of MARK_YS) {
        const p: Vec2 = [col.x, y];
        rings.push(ring(p, MARK_RADIUS));
        if (col.dir === 'in') {
          const d = MARK_ARM;
          crosses.push(
            [
              [p[0] - d, p[1] - d],
              [p[0] + d, p[1] + d],
            ],
            [
              [p[0] - d, p[1] + d],
              [p[0] + d, p[1] - d],
            ],
          );
        } else {
          dots.push(p);
        }
      }
    }
    rings.forEach((pts, i) => {
      out.push({
        type: 'trajectory',
        id: `field-ring-${i}`,
        points: pts,
        closed: true,
        width: MARK_WIDTH_PX,
        opacity: op * MARK_OPACITY,
        style: muted,
      });
    });
    if (crosses.length > 0) {
      out.push({
        type: 'lineSet',
        id: 'field-in',
        lines: crosses,
        width: MARK_WIDTH_PX,
        opacity: op * MARK_OPACITY,
        style: muted,
      });
    }
    if (dots.length > 0) {
      out.push({
        type: 'particleSystem',
        id: 'field-out',
        positions: dots,
        sizes: MARK_DOT_PX,
        opacity: op * MARK_OPACITY,
        style: muted,
      });
    }
    // 이름 — 두 도선 사이 맨 위 표식 옆.
    const topY = MARK_YS[MARK_YS.length - 1] ?? 0;
    out.push({
      type: 'readout',
      id: 'field-label',
      anchor: { world: [MARK_RADIUS, topY], offset: FIELD_LABEL_OFFSET_PX },
      text: text('label.field'),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      italic: true,
      weight: 'bold',
      align: 'left',
      opacity: op,
      style: muted,
    });
  }

  // ---- 도선 ----
  for (const w of wires) {
    out.push({
      type: 'trajectory',
      id: `wire-${w.id}`,
      points: wirePoints(w.x0, w.inward, r.bow, halfLength),
      width: WIRE_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }

  // ---- 전류 — 도선 바깥쪽 화살표 I. 흐르지 않으면 없다 ----
  for (const w of wires) {
    if (w.current === 0) continue;
    const outward = -w.inward;
    const x = w.x0 + outward * CURRENT_ARROW_OUTSET;
    const up = w.current > 0;
    const from: Vec2 = [x, up ? CURRENT_ARROW_LOW : CURRENT_ARROW_HIGH];
    const dy = (CURRENT_ARROW_HIGH - CURRENT_ARROW_LOW) * (up ? 1 : -1);
    out.push({
      type: 'vector',
      id: `current-${w.id}`,
      from,
      delta: [0, dy],
      width: CURRENT_WIDTH_PX,
      headSize: CURRENT_HEAD_SIZE,
      opacity: op,
      style: ink,
    });
    out.push({
      type: 'readout',
      id: `current-label-${w.id}`,
      anchor: {
        world: [x, (CURRENT_ARROW_LOW + CURRENT_ARROW_HIGH) / 2],
        offset: [outward * CURRENT_LABEL_GAP_PX, 0],
      },
      text: text('label.current'),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      italic: true,
      weight: 'bold',
      align: outward < 0 ? 'right' : 'left',
      opacity: op,
      style: ink,
    });
  }

  // ---- 힘 — 두 도선 가운데에서. 크기가 같고 방향이 반대다 ----
  const len = r.force * c.forceScale;
  if (Math.abs(len) >= FORCE_VISIBLE) {
    for (const w of wires) {
      // + 는 당김 — 안쪽. − 는 밀어냄 — 바깥쪽.
      const dir = w.inward * Math.sign(len);
      const mid = w.x0 + w.inward * r.bow;
      const from: Vec2 = [mid + dir * FORCE_GAP, 0];
      const delta: Vec2 = [dir * Math.abs(len), 0];
      out.push({
        type: 'vector',
        id: `force-${w.id}`,
        from,
        delta,
        width: FORCE_WIDTH_PX,
        headSize: HEAD_SIZE,
        outline: 'background',
        opacity: op,
        style: accent,
      });
      out.push({
        type: 'readout',
        id: `force-label-${w.id}`,
        anchor: { world: [from[0] + delta[0] / 2, 0], offset: [0, FORCE_LABEL_RISE_PX] },
        text: text('label.force'),
        chip: false,
        font: 'text',
        fontSize: LABEL_FONT_PX,
        italic: true,
        weight: 'bold',
        align: 'center',
        opacity: op,
        style: accent,
      });
    }
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 가장 멀리 휜 순간의 힘 화살표 · 바깥 장 표식까지 들어간다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
