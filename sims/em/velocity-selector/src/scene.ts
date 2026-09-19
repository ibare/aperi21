// ========================================================================
// velocity-selector — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`):
//
//   ⊗ 무늬 · E 화살표 → 판 · 슬릿 벽 · 발사구 · 검출기 → 지난 궤적 → 지금 궤적
//   → 두 힘 화살표 → 전하 → 이름표
//
// 강조색(accent)은 한 뜻에만 쓴다 — 전하가 받는 힘. 두 힘은 같은 색이고 방향과 표식
// (`qE` · `qvB`)으로 가른다 (S-piece — 역할색을 범례로 쓰지 않는다). 지금 나는 전하와
// 그 궤적은 먹, 지나간 전하 · 궤적 · 장치는 회색이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { RUNS, flightAt, flightPath, forces, planFlight, readConstants, type Outcome, type RunId } from './physics';
import { SCENE_BOUNDS, text, type VelocitySelectorMessageKey } from './schema';
import type { VelocitySelectorState } from './state';

/** ⊗ 무늬 간격 · 고리 반지름 · 가위표 비(월드). */
const FIELD_MARK_STEP = 0.6;
const FIELD_MARK_RADIUS = 0.07;
const FIELD_MARK_ARM = 0.7;
/** ⊗ 고리 표본 수 (G28). */
const FIELD_MARK_SAMPLES = 16;
/** ⊗ 무늬 선 굵기(화면 px). */
const FIELD_MARK_WIDTH_PX = 1;
/** E 화살표 — 입구 쪽 위 칸, 아래로(월드). */
const E_ARROW_FROM: Vec2 = [0.3, 0.95];
const E_ARROW_LENGTH = 0.6;
const E_ARROW_WIDTH_PX = 2;
/** B 표식을 붙일 ⊗ 의 자리와 띄움(화면 px). */
const B_LABEL_AT: Vec2 = [0.9, -0.9];
const B_LABEL_OFFSET_PX: Vec2 = [14, 0];

/** 판 두께(월드). */
const PLATE_THICKNESS = 0.1;
/** 판 부호(+ · −)를 판 왼쪽 끝에서 띄우는 거리(화면 px). */
const PLATE_SIGN_OFFSET_PX: Vec2 = [-14, 0];
const PLATE_SIGN_PX = 20;
/** 슬릿 벽 굵기(화면 px). */
const WALL_WIDTH_PX = 3.5;
/** 발사구 · 검출기 크기(월드). */
const SOURCE_SIZE: Vec2 = [0.4, 0.44];
const DETECTOR_SIZE: Vec2 = [0.16, 1.3];

/** 궤적 굵기(화면 px) — 지금 궤적이 굵고, 지난 궤적은 가늘다. */
const PATH_WIDTH_PX = 2.5;
const PAST_PATH_WIDTH_PX = 1.8;
/** 지난 궤적 · 전하의 불투명도. */
const PAST_OPACITY = 0.85;

/** 힘 화살표 굵기(화면 px) · 화살촉(월드). */
const FORCE_WIDTH_PX = 3.5;
const FORCE_HEAD = 0.14;

/** 전하 원판 반지름 · 부호 획 반 길이(월드). */
const CHARGE_RADIUS = 0.1;
const SIGN_ARM = 0.055;

/** 끝자리 이름표 글자 크기 · 띄움(화면 px). */
const LABEL_PX = 13;
const LABEL_GAP_PX = 14;
/** 장 · 힘 기호 글자 크기(화면 px). */
const SYMBOL_PX = 15;

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const mutedSubtle = { colorRole: 'muted', emphasis: 'subtle' } as const;

const LABEL_OF: Record<RunId, VelocitySelectorMessageKey> = {
  slow: 'label.slow',
  fast: 'label.fast',
  match: 'label.match',
};

function ring(c: Vec2, r: number, n: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k <= n; k++) {
    const a = (2 * Math.PI * k) / n;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 종이 안으로 들어가는 균일한 자기장 — 판 사이를 같은 간격의 ⊗ 로 채운다. */
function fieldMarks(length: number, halfGap: number): Vec2[][] {
  const out: Vec2[][] = [];
  const d = FIELD_MARK_RADIUS * FIELD_MARK_ARM;
  const cols = Math.floor(length / FIELD_MARK_STEP);
  const rows = Math.floor((2 * halfGap) / FIELD_MARK_STEP);
  const x0 = (length - (cols - 1) * FIELD_MARK_STEP) / 2;
  const y0 = -((rows - 1) * FIELD_MARK_STEP) / 2;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const c: Vec2 = [x0 + i * FIELD_MARK_STEP, y0 + j * FIELD_MARK_STEP];
      out.push(ring(c, FIELD_MARK_RADIUS, FIELD_MARK_SAMPLES));
      out.push([
        [c[0] - d, c[1] + d],
        [c[0] + d, c[1] - d],
      ]);
      out.push([
        [c[0] + d, c[1] + d],
        [c[0] - d, c[1] - d],
      ]);
    }
  }
  return out;
}

/** 전하에 새긴 + — 바탕색 두 획(G07 근사). 좌표는 `pos` 기준 월드, y 위. */
function plusPath(): string {
  const a = SIGN_ARM;
  return `M ${-a} 0 L ${a} 0 M 0 ${-a} L 0 ${a}`;
}

/** 끝자리 이름표의 앵커 — 판에 닿았으면 판 바깥, 빠져나갔으면 출구와 검출기 사이 위. */
function endLabelAnchor(outcome: Outcome, end: Vec2, halfGap: number, midExit: number): { world: Vec2; offset: Vec2 } {
  if (outcome === 'upper') return { world: [end[0], halfGap + PLATE_THICKNESS], offset: [0, -LABEL_GAP_PX] };
  if (outcome === 'lower') return { world: [end[0], -halfGap - PLATE_THICKNESS], offset: [0, LABEL_GAP_PX] };
  if (outcome === 'detector') return { world: [midExit, end[1]], offset: [0, -LABEL_GAP_PX] };
  return { world: end, offset: [0, -LABEL_GAP_PX] };
}

export function scene(params: {
  state: VelocitySelectorState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('velocity-selector: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const L = c.plateLength;
  const h = c.plateHalfGap;
  const out: Primitive[] = [];

  // ---- 장 — ⊗ 무늬(B, 종이 안) · 아래로 향한 E ----
  const marks: LineSet = {
    type: 'lineSet',
    id: 'field-b',
    lines: fieldMarks(L, h),
    width: FIELD_MARK_WIDTH_PX,
    style: mutedSubtle,
  };
  out.push(marks);
  out.push({
    type: 'readout',
    id: 'field-b-label',
    anchor: { world: B_LABEL_AT, offset: B_LABEL_OFFSET_PX },
    text: text('label.fieldB'),
    chip: false,
    font: 'text',
    fontSize: SYMBOL_PX,
    italic: true,
    weight: 'bold',
    style: muted,
  });
  out.push({
    type: 'vector',
    id: 'field-e',
    from: E_ARROW_FROM,
    delta: [0, -E_ARROW_LENGTH],
    width: E_ARROW_WIDTH_PX,
    label: text('label.fieldE'),
    labelSide: 'cw',
    style: muted,
  });

  // ---- 판 · 슬릿 벽 · 발사구 · 검출기 ----
  for (const [id, sign, key] of [
    ['plate-upper', 1, 'label.plus'],
    ['plate-lower', -1, 'label.minus'],
  ] as const) {
    const y = sign * (h + PLATE_THICKNESS / 2);
    out.push({
      type: 'body',
      id,
      pos: [L / 2, y],
      shape: 'rect',
      size: [L, PLATE_THICKNESS],
      outline: 'none',
      style: muted,
    });
    out.push({
      type: 'readout',
      id: `${id}-sign`,
      anchor: { world: [0, y], offset: PLATE_SIGN_OFFSET_PX },
      text: text(key),
      chip: false,
      font: 'text',
      fontSize: PLATE_SIGN_PX,
      weight: 'bold',
      style: muted,
    });
  }
  const top = h + PLATE_THICKNESS;
  out.push({
    type: 'lineSet',
    id: 'slit-walls',
    lines: [
      [[0, top], [0, c.slitHalf]],
      [[0, -c.slitHalf], [0, -top]],
      [[L, top], [L, c.slitHalf]],
      [[L, -c.slitHalf], [L, -top]],
    ],
    width: WALL_WIDTH_PX,
    style: ink,
  });
  out.push(
    {
      type: 'body',
      id: 'source',
      pos: [c.sourceX - SOURCE_SIZE[0] / 2, 0],
      shape: 'rect',
      size: SOURCE_SIZE,
      outline: 'none',
      style: muted,
    },
    {
      type: 'body',
      id: 'detector',
      pos: [c.detectorX + DETECTOR_SIZE[0] / 2, 0],
      shape: 'rect',
      size: DETECTOR_SIZE,
      outline: 'none',
      style: muted,
    },
  );

  // ---- 세 전하 — 지난 것부터, 지금 나는 것을 맨 위에 ----
  const fadeOp = 1 - tl.at('fade');
  const runs = RUNS.map((r) => {
    const flight = planFlight(c, r.speed(c));
    const tau = tl.at(r.id) * tl.duration(r.id);
    const current = tl.phase === r.id;
    const launched = current || tl.at(r.id) > 0;
    return { id: r.id, flight, tau, current, launched, now: flightAt(c, flight, tau) };
  }).filter((r) => r.launched);
  const ordered = [...runs.filter((r) => !r.current), ...runs.filter((r) => r.current)];
  const midExit = (L + c.detectorX) / 2;

  for (const r of ordered) {
    out.push({
      type: 'trajectory',
      id: `path-${r.id}`,
      points: flightPath(c, r.flight, r.tau),
      width: r.current ? PATH_WIDTH_PX : PAST_PATH_WIDTH_PX,
      opacity: r.current ? 1 : PAST_OPACITY * fadeOp,
      style: r.current ? ink : muted,
    });
  }

  for (const r of ordered) {
    const op = r.current ? 1 : PAST_OPACITY * fadeOp;
    // 두 힘 — 장 속에서 날고 있는 전하에만. 판에 닿거나 빠져나가면 사라진다.
    if (r.current && r.now.field) {
      const f = forces(c, r.now.field.vel);
      out.push(
        {
          type: 'vector',
          id: `force-e-${r.id}`,
          from: r.now.pos,
          delta: f.electric,
          width: FORCE_WIDTH_PX,
          headSize: FORCE_HEAD,
          outline: 'background',
          label: text('label.forceE'),
          style: accent,
        },
        {
          type: 'vector',
          id: `force-b-${r.id}`,
          from: r.now.pos,
          delta: f.magnetic,
          width: FORCE_WIDTH_PX,
          headSize: FORCE_HEAD,
          outline: 'background',
          label: text('label.forceB'),
          style: accent,
        },
      );
    }
    out.push(
      {
        type: 'body',
        id: `charge-${r.id}`,
        pos: r.now.pos,
        shape: 'circle',
        size: CHARGE_RADIUS,
        glow: false,
        outline: 'none',
        opacity: op,
        style: r.current ? ink : muted,
      },
      {
        type: 'body',
        id: `charge-sign-${r.id}`,
        pos: r.now.pos,
        shape: 'custom',
        customPath: plusPath(),
        fill: 'none',
        outline: 'background',
        opacity: op,
      },
    );
  }

  // ---- 끝자리 이름표 — 멈춘 전하에만 ----
  for (const r of ordered) {
    if (!r.now.stopped) continue;
    out.push({
      type: 'readout',
      id: `label-${r.id}`,
      anchor: endLabelAnchor(r.flight.outcome, r.now.pos, h, midExit),
      text: text(LABEL_OF[r.id]),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      weight: 'bold',
      opacity: r.current ? 1 : PAST_OPACITY * fadeOp,
      style: r.current ? ink : muted,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 발사구부터 검출기까지, 아래는 캡션 자리. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
