// ========================================================================
// work-by-variable-force — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 축(vector) · 곡선과
// 기둥과 안내선(trajectory) · 쌓인 넓이와 지금 띠(region) · 띠 경계(lineSet) ·
// 바닥(surface) · 상자(body) · 미는 힘(vector) · 기호(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — **강조색은 「쌓인 일(넓이)」 한 뜻에만**. 미는 힘은 primary 이고,
// 그래프 속 지금 자리의 기둥도 같은 힘이라 같은 primary · 같은 길이다. 상자 · 곡선 ·
// 기호는 먹색, 축 · 바닥 · 안내선은 배경 정보라 muted.
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
import { forceAt, pushedTo, readConstants, sceneOpacity, type WorkByVariableForceConstants } from './physics';
import { ARROW_HEAD, BOX_SIZE, F_AXIS_TOP, SCENE_BOUNDS, TRACK_Y, X_AXIS_END, text } from './schema';
import type { WorkByVariableForceState } from './state';

/** 곡선 · 넓이 윗변을 표본하는 간격(월드 m). 띠 폭보다 훨씬 잘아야 윗변이 곡선과 겹친다. */
const SAMPLE_STEP = 0.05;
/** 이미 쌓인 넓이의 짙기. 곡선과 띠 경계가 그 위에서 읽혀야 한다. */
const AREA_FILL = 0.55;
/** 지금 쌓이는 띠의 짙기. 방금 더해지는 몫이 한 칸으로 도드라진다. */
const STRIP_FILL = 0.85;
/** 띠 경계선 굵기(화면 px) · 짙기. 칸을 나누는 금이지 그림의 주인이 아니다. */
const DIVIDER_WIDTH = 1;
const DIVIDER_OPACITY = 0.4;
/** 축 굵기(화면 px) · 머리 크기(월드 m). 곡선보다 가늘게 물러난다. */
const AXIS_WIDTH = 1.5;
const AXIS_HEAD = 0.14;
/** 곡선 굵기 · 지금 자리 기둥 굵기(화면 px). 기둥은 힘 화살표만큼 굵다 — 같은 힘이다. */
const CURVE_WIDTH = 2;
const COLUMN_WIDTH = 3;
/** 축 이름 · 일 기호 글자 크기(화면 px). */
const AXIS_LABEL_PX = 13;
const WORK_LABEL_PX = 18;
/** 다 쌓인 뒤 W 가 떠오르는 몫 — `hold` 진행도의 이 몫 안에 다 떠오른다. */
const WORK_LABEL_RISE = 0.15;

/** 0 에서 `to` 까지 곡선 위 점들. 끝점을 꼭 넣는다 — 넓이의 오른쪽 변이 정확히 `to` 에 선다. */
function curvePoints(from: number, to: number, c: WorkByVariableForceConstants): Vec2[] {
  const pts: Vec2[] = [];
  for (let x = from; x < to; x += SAMPLE_STEP) pts.push([x, forceAt(x, c)]);
  pts.push([to, forceAt(to, c)]);
  return pts;
}

/** [from, to] 구간의 곡선 아래 넓이 다각형. */
function areaUnder(from: number, to: number, c: WorkByVariableForceConstants): Vec2[] {
  return [[from, 0], ...curvePoints(from, to, c), [to, 0]];
}

export function scene(params: {
  state: WorkByVariableForceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('work-by-variable-force: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const x = pushedTo(timeline, c);
  const f = forceAt(x, c);
  // 미는 중인가 — 뒤 절반 밀기가 끝나면 손을 뗀다. 끝났는지는 선언의 진행도가 안다.
  const pushing = timeline.at('push-fall') < 1;
  // 지금 쌓이는 띠의 왼쪽 경계. 그 앞은 다 쌓인 띠들이다.
  const stripStart = Math.min(Math.floor(x / c.strip) * c.strip, x);
  const out: Primitive[] = [];

  // ---- 쌓인 넓이 · 지금 띠 ----
  // 곡선 아래에 깐다. 강조색 한 뜻 — 지금까지 한 일.
  if (stripStart > 0) {
    out.push({
      type: 'region',
      id: 'area-done',
      points: areaUnder(0, stripStart, c),
      fillOpacity: AREA_FILL,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
  if (x > stripStart) {
    out.push({
      type: 'region',
      id: 'area-strip',
      points: areaUnder(stripStart, x, c),
      fillOpacity: STRIP_FILL,
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 띠 경계 ----
  // 다 쌓인 띠 사이의 금. 이 금이 「조금씩 간 거리 Δx」 를 세는 눈금이고, 칸마다 높이가
  // 다르다는 것이 「힘이 자리마다 다르다」 를 보여 준다.
  const dividers: Vec2[][] = [];
  for (let k = 1; k * c.strip <= stripStart + 1e-9; k++) {
    const bx = k * c.strip;
    dividers.push([
      [bx, 0],
      [bx, forceAt(bx, c)],
    ]);
  }
  if (dividers.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'strip-dividers',
      lines: dividers,
      width: DIVIDER_WIDTH,
      opacity: DIVIDER_OPACITY * alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 축 ----
  out.push({
    type: 'vector',
    id: 'axis-x',
    from: [0, 0],
    delta: [X_AXIS_END, 0],
    width: AXIS_WIDTH,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'axis-f',
    from: [0, 0],
    delta: [0, F_AXIS_TOP],
    width: AXIS_WIDTH,
    headSize: AXIS_HEAD,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-x-label',
    anchor: { world: [X_AXIS_END, 0], offset: [12, 0] },
    text: text('label.axisX'),
    chip: false,
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-f-label',
    anchor: { world: [0, F_AXIS_TOP], offset: [-14, 0] },
    text: text('label.axisF'),
    chip: false,
    italic: true,
    fontSize: AXIS_LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ---- 힘 곡선 ----
  // 처음부터 끝까지 다 그려 둔다. 힘이 자리마다 어떤지는 미리 정해진 것이고, 쌓이는
  // 것은 그 아래 넓이다.
  out.push({
    type: 'trajectory',
    id: 'force-curve',
    points: curvePoints(0, c.length, c),
    width: CURVE_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 트랙 ----
  out.push({
    type: 'surface',
    id: 'floor',
    geometry: { kind: 'wall', from: [SCENE_BOUNDS.minX + 0.2, TRACK_Y], to: [X_AXIS_END, TRACK_Y] },
    material: 'solid',
  });

  if (pushing) {
    // 상자에서 그래프로 내려오는 안내선. 상자가 **그래프의 이 자리** 에 있다는 것을 잇는다.
    out.push({
      type: 'trajectory',
      id: 'guide',
      points: [
        [x, TRACK_Y],
        [x, f],
      ],
      width: 1,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    // 지금 자리의 힘 기둥. 위의 화살표와 **같은 길이 · 같은 색** 이다 — 누운 화살표를
    // 세우면 이 기둥이 된다. 지금 띠의 높이가 이 값이다.
    out.push({
      type: 'trajectory',
      id: 'force-column',
      points: [
        [x, 0],
        [x, f],
      ],
      width: COLUMN_WIDTH,
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 상자 ----
  out.push({
    type: 'body',
    id: 'box',
    pos: [x, TRACK_Y + BOX_SIZE[1] / 2],
    shape: 'rect',
    size: BOX_SIZE,
    outline: 'none',
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 미는 힘 ----
  // 상자 왼쪽 면을 민다. 길이가 곧 힘이라, 가운데로 갈수록 길어졌다 끝에서 다시 짧아진다.
  if (pushing) {
    out.push({
      type: 'vector',
      id: 'push',
      from: [x - BOX_SIZE[0] / 2 - f, TRACK_Y + BOX_SIZE[1] / 2],
      delta: [f, 0],
      headSize: ARROW_HEAD,
      label: text('label.force'),
      labelSide: 'ccw',
      opacity: alpha,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // ---- 다 쌓인 넓이의 이름 ----
  // 밀기가 끝난 뒤에만. 넓이 한가운데 — 넓이 자체가 W 라는 것을 자리로 말한다.
  // 가운데 띠 경계선이 글자를 꿰뚫지 않도록 경계가 아니라 띠 한가운데에 둔다.
  if (!pushing) {
    const rise = Math.min(1, timeline.at('hold') / WORK_LABEL_RISE);
    out.push({
      type: 'readout',
      id: 'work-label',
      anchor: { world: [c.length / 2 - c.strip / 2, (c.forceBase + c.forcePeak) * 0.42] },
      text: text('label.work'),
      chip: false,
      font: 'text',
      italic: true,
      weight: 'bold',
      fontSize: WORK_LABEL_PX,
      opacity: rise * alpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
