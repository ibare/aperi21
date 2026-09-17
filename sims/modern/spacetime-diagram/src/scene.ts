// ========================================================================
// spacetime-diagram — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 빛·세계선·지금 선은 `trajectory`, 기운 각은 `sector`(호만),
// 사건과 관찰자 점은 화면 px 크기의 `trace`, 이름표는 `readout` 이다. 겹침 순서가
// 원본의 그리는 순서와 같아야 해서 `drawOrder: 'scene'` 을 쓴다(선언 순서 = 원본 순서).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { autoSweep, eventReadings, manualSweep, observerAt } from './physics';
import { CT_HALF, PX_PER_CT, X_HALF, text, type SpacetimeDiagramMessageKey } from './schema';
import type { SpacetimeDiagramState } from './state';

/** 무한 직선을 화면 끝까지 긋는 가로 범위(월드). 캔버스가 자른다. */
const LINE_REACH = X_HALF * 3;
/** 이름표 글자 크기(화면 px). 원본 12px. */
const LABEL_PX = 12;
/** 사건 원 반지름 · 퍼지는 고리의 끝 반지름(화면 px). */
const EVENT_R_PX = 7;
const RING_END_PX = EVENT_R_PX + 0.5 * 40;
/** 퍼지는 고리가 사는 동안(지금 선이 지난 뒤 흐른 ct). */
const RING_LIFE = 0.5;
/** 'n번째' 글자를 사건 아래로 내리는 거리(화면 px) — 원본 기준선 py+30 의 가운데. */
const ORDER_OFFSET_PX = 23;
/** 관찰자 점 반지름(화면 px). */
const OBSERVER_R_PX = 6;
/** 기운 각 호 반지름 · 기준 점선 길이(원본 화면 px 를 월드로). */
const ARC_R = 44 / PX_PER_CT;
const REF_LEN = (44 + 14) / PX_PER_CT;

const ORDER_KEYS: readonly SpacetimeDiagramMessageKey[] = ['label.order1', 'label.order2', 'label.order3'];

/**
 * 도표 칸. 선은 이 안에서만 그린다 — 아래의 캡션 · 조작기 줄을 비운다(원본은 그 줄이
 * 캔버스 밖 DOM 이었다).
 */
const DIAGRAM_CLIP = { min: [-LINE_REACH, -CT_HALF] as Vec2, max: [LINE_REACH, CT_HALF + 1] as Vec2 };

/** 원본의 흐린 회색(빛 · 기준선 · 호 · 방향 글자). */
const FAINT = { colorRole: 'muted', emphasis: 'medium' } as const;

function line(id: string, points: Vec2[], style: Trajectory['style'], width: number): Trajectory {
  return { type: 'trajectory', id, points, style, width, clip: DIAGRAM_CLIP };
}

/** 원점 밖 한 점 (x0, ct0) 을 지나고 기울기 ct/x 가 `slope` 인 직선. */
function lineThrough(x0: number, ct0: number, slope: number): Vec2[] {
  return [
    [-LINE_REACH, ct0 + slope * (-LINE_REACH - x0)],
    [LINE_REACH, ct0 + slope * (LINE_REACH - x0)],
  ];
}

function label(
  id: string,
  key: SpacetimeDiagramMessageKey,
  anchor: Readout['anchor'],
  role: 'muted' | 'ink' | 'accent',
  align: Readout['align'],
): Readout {
  const emphasis = role === 'muted' ? FAINT.emphasis : 'strong';
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    style: { colorRole: role, emphasis },
  };
}

export function scene(params: {
  state: SpacetimeDiagramState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('spacetime-diagram: schema.timeline 이 선언되어야 한다');
  const s = state.manual ? manualSweep(state, timeline.duration('right-sweep')) : autoSweep(timeline);
  const { beta, c0 } = s;
  const out: Primitive[] = [];

  // ---- 시간과 공간 방향 ----
  // 도표 칸의 모서리에 붙인다(원본: 왼쪽 위 10,14 / 오른쪽 아래 W−10, H−12).
  out.push({ ...label('axis-time', 'label.timeAxis', { world: [-X_HALF, CT_HALF], offset: [10, 14] }, 'muted', 'left'), clamp: true });
  out.push({ ...label('axis-space', 'label.spaceAxis', { world: [X_HALF, -CT_HALF], offset: [-10, -12] }, 'muted', 'right'), clamp: true });

  // ---- 빛의 세계선 ----
  out.push(line('light-right', lineThrough(0, 0, 1), { ...FAINT, lineStyle: 'dashed' }, 1));
  out.push(line('light-left', lineThrough(0, 0, -1), { ...FAINT, lineStyle: 'dashed' }, 1));
  const lightAt = CT_HALF - 0.3;
  out.push(label('light-label-right', 'label.light', { world: [lightAt, lightAt], offset: [8, 0] }, 'muted', 'left'));
  out.push(label('light-label-left', 'label.light', { world: [-lightAt, lightAt], offset: [-8, 0] }, 'muted', 'right'));

  const o = observerAt(s);

  // ---- 기운 각 ----
  // 관찰자 점에서 세계선은 세로(아래)로부터, 동시선은 가로로부터 같은 각. 두 호가 같은
  // 사분면에 생겨 빛의 선을 가운데 두고 마주 접히는 것이 보인다.
  if (Math.abs(beta) >= 0.02 && Math.abs(o.ct) <= CT_HALF - 0.9) {
    const a = Math.atan(Math.abs(beta));
    const side = beta > 0 ? -1 : 1; // 오른쪽으로 가면 왼쪽 아래, 왼쪽으로 가면 오른쪽 아래
    const ref = { ...FAINT, lineStyle: 'dashed' } as const;
    out.push(line('angle-ref-down', [[o.x, o.ct], [o.x, o.ct - REF_LEN]], ref, 1));
    out.push(line('angle-ref-side', [[o.x, o.ct], [o.x + side * REF_LEN, o.ct]], ref, 1));
    const down = -Math.PI / 2;
    const arcs: [number, number][] =
      beta > 0
        ? [[down, down - a], [a - Math.PI, -Math.PI]]
        : [[down + a, down], [0, -a]];
    arcs.forEach(([from, to], i) => {
      out.push({
        type: 'sector',
        id: `angle-arc-${i}`,
        center: [o.x, o.ct],
        radius: ARC_R,
        from,
        to,
        fillOpacity: 0,
        rimWidth: 1.5,
        style: FAINT,
      });
    });
  }

  // ---- 관찰자의 세계선 ----
  // 관찰자 점 아래는 지나온 부분(실선), 위는 앞으로 지날 부분(점선).
  const top = CT_HALF + 1;
  const bot = -CT_HALF - 1;
  out.push(
    line('worldline-past', [[beta * bot, bot], [beta * o.ct, Math.min(o.ct, top)]], { colorRole: 'ink', emphasis: 'strong' }, 2.5),
  );
  if (o.ct < top) {
    out.push(
      line('worldline-future', [[o.x, o.ct], [beta * top, top]], { colorRole: 'ink', emphasis: 'strong', lineStyle: 'dashed' }, 1.2),
    );
  }
  const obsLabelCt = -CT_HALF + 0.35;
  out.push(label('observer-label', 'label.observer', { world: [beta * obsLabelCt, obsLabelCt], offset: [10, 0] }, 'ink', 'left'));

  // ---- 관찰자의 지금 ----
  out.push(line('now-line', lineThrough(0, c0, beta), { colorRole: 'accent', emphasis: 'strong' }, 2.5));
  // 이름표: 선이 올라가는 쪽 끝에, 위쪽 '빛' 이름표보다 낮게.
  const up = beta >= 0 ? 1 : -1;
  let lx = up * (X_HALF - 0.2);
  const lim = CT_HALF - 0.9;
  if (Math.abs(c0 + beta * lx) > lim && beta !== 0) {
    lx = (Math.sign(c0 + beta * lx) * lim - c0) / beta;
  }
  out.push({
    ...label('now-label', 'label.now', { world: [lx, c0 + beta * lx], offset: [-up * 4, -12] }, 'accent', up > 0 ? 'right' : 'left'),
    clamp: true,
  });
  if (Math.abs(o.ct) < CT_HALF + 0.2) {
    out.push({
      type: 'trace',
      id: 'observer-dot',
      marks: [{ pos: [o.x, o.ct] }],
      shape: 'dot',
      size: OBSERVER_R_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 사건 ----
  // 지금 선이 지나갔으면(관찰자에게 이미 일어났으면) 채운다.
  eventReadings(s).forEach((e, i) => {
    const pos: Vec2 = [e.x, 0];
    if (s.sweeping && e.lit && e.since < RING_LIFE) {
      out.push({
        type: 'trace',
        id: `event-${i}-pulse`,
        marks: [{ pos, age: e.since }],
        life: RING_LIFE,
        shape: 'ring',
        size: EVENT_R_PX,
        spreadTo: RING_END_PX,
        width: 1.5,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
    // 속: 채운 원은 먹, 빈 원은 바탕색(빛의 양 0)으로 아래 선을 가린다.
    out.push({
      type: 'trace',
      id: `event-${i}-fill`,
      marks: [{ pos }],
      shape: 'dot',
      size: EVENT_R_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
      ...(e.lit ? {} : { luminance: 0 }),
    });
    out.push({
      type: 'trace',
      id: `event-${i}-rim`,
      marks: [{ pos }],
      shape: 'ring',
      size: EVENT_R_PX,
      width: 2,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    if (e.lit) {
      out.push({
        type: 'readout',
        id: `event-${i}-order`,
        anchor: { world: pos, offset: [0, ORDER_OFFSET_PX] },
        text: text(ORDER_KEYS[e.order - 1]!),
        chip: false,
        font: 'text',
        weight: 'bold',
        fontSize: 13,
        align: 'center',
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계 — 원본 캔버스(860 × 340)가 담던 시공간 범위. 매 프레임 같아야 흔들리지 않는다. */
export function boundsHint(): Bounds {
  return { minX: -X_HALF, maxX: X_HALF, minY: -CT_HALF, maxY: CT_HALF };
}
