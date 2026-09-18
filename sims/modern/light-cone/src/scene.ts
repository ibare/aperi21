// ========================================================================
// light-cone — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 원뿔 면은 투영한 볼록 껍질 `region`, 테와 시간 축 · 신호선 · 미끄러진 길은
// `trajectory`, 「지금」 단면 판은 `region`, 사건 점과 번쩍임은 화면 px 크기의 `trace`,
// 이름표는 `readout` 이다. 겹침이 판정 장치라 `drawOrder: 'scene'` — 먼저 쓴 것이 아래다.
//
// 색은 뜻마다 하나다 — 원뿔(미래 · 과거)은 secondary, 사건 · 신호는 먹색(ink),
// **강조색은 「빛의 앞면」 한 뜻에만** (E 의 번쩍임과 단면 위에서 퍼지는 빛의 고리).
// 축 · 단면 판 · 영역 이름표는 배경 정보라 muted.
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
  circleAt,
  coneOutline,
  frameBeta,
  markOpacity,
  project,
  readConstants,
  readEvents,
  sliceHeight,
  slidePath,
} from './physics';
import {
  FUTURE_HEIGHT,
  PAST_HEIGHT,
  RIM_SAMPLES,
  SCENE_BOUNDS,
  SLICE_HALF_X,
  SLICE_HALF_Y,
  text,
  type LightConeMessageKey,
} from './schema';
import type { LightConeState } from './state';

/** 원뿔 면 채움의 짙기. 안에 든 사건 · 신호선이 비쳐 보여야 한다. */
const FUTURE_FILL = 0.16;
/** 과거 원뿔은 이 조각의 주장 밖이라 한 단 옅게 — 면 · 테 모두. */
const PAST_FILL = 0.08;
const PAST_OPACITY = 0.6;
/** 원뿔 윤곽 · 테 굵기(화면 px). */
const CONE_LINE_PX = 1.5;
/** 시간 축 굵기. 안내선이라 가장 가늘게. */
const AXIS_LINE_PX = 1;
/** 「지금」 단면 판의 짙기. 판이 있다는 것만 보이면 된다. */
const SLICE_FILL = 0.1;
/** 빛의 고리 굵기 — 그림에서 가장 굵다. 지금 빛이 닿은 곳이 이 조각의 판정선이다. */
const RING_LINE_PX = 2.5;
/** 신호선 굵기와 미끄러진 길 굵기. */
const SIGNAL_LINE_PX = 1.5;
const SLIDE_LINE_PX = 1.5;
/** 사건 점 반지름 · 아직 일어나지 않은 사건의 짙기(화면 px · 0~1). */
const EVENT_R_PX = 5;
/** 닿지 못한 사건(빈 원)의 테 굵기(화면 px). */
const EVENT_RING_PX = 2;
const PENDING_OPACITY = 0.45;
/** 일어난 순간 퍼지는 고리의 끝 반지름(화면 px). 사는 동안은 스테이지 상수 `pulseLife`. */
const PULSE_END_PX = 18;
/** 신호의 머리 점 반지름(화면 px). */
const SIGNAL_HEAD_PX = 3;
/** E 의 번쩍임 끝 반지름(화면 px). */
const FLASH_END_PX = 30;
/** 이름표 글자 크기(화면 px) · 사건 판정 이름표를 점에서 띄우는 거리(화면 px). */
const LABEL_PX = 12;
const JUDGE_LABEL_PX = 11;
const JUDGE_GAP = 9;
/** 이 x(월드)보다 왼쪽 사건만 이름표를 왼쪽에 붙인다 — 축 가까운 사건은 오른쪽(축 점선을 피해). */
const JUDGE_LEFT_X = -0.5;
/** 판 이름표 · 시간 축 이름표를 판 끝 · 축 끝에서 띄우는 거리(화면 px). */
const PLANE_LABEL_GAP = 6;
/** E 이름표를 점 왼쪽으로 띄우는 거리(화면 px). */
const E_LABEL_GAP = 10;
/** 시간 축 끝(원뿔 테 위로 조금 더) · 과거 쪽 끝(원뿔 높이의 배수). */
const AXIS_OVERSHOOT = 1.22;
/** 「다른 곳」 이름표 자리(월드) — 두 원뿔 옆 빈 곳. */
const ELSEWHERE_AT: Vec2 = [-3.4, -0.9];

/** 이름표 하나. 문장이 아니라 도식 글자라 `text` 글꼴 · 칩 없음. */
function label(
  id: string,
  key: LightConeMessageKey,
  anchor: Readout['anchor'],
  role: 'muted' | 'ink' | 'accent' | 'secondary',
  align: Readout['align'],
  fontSize: number,
  opacity?: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor,
    text: text(key),
    chip: false,
    font: 'text',
    fontSize,
    align,
    ...(opacity === undefined ? {} : { opacity }),
    style: { colorRole: role, emphasis: 'strong' },
  };
}

/** 높이 ct 의 동시 판(투영하면 평행사변형)과 왼쪽 끝 이름표. */
function slicePlane(id: string, ct: number, key: LightConeMessageKey, opacity?: number): Primitive[] {
  const corners = [
    { x: -SLICE_HALF_X, y: -SLICE_HALF_Y, ct },
    { x: SLICE_HALF_X, y: -SLICE_HALF_Y, ct },
    { x: SLICE_HALF_X, y: SLICE_HALF_Y, ct },
    { x: -SLICE_HALF_X, y: SLICE_HALF_Y, ct },
  ].map(project);
  // 왼쪽 앞 모서리와 왼쪽 뒤 모서리의 가운데 — 판의 왼쪽 끝.
  const left: Vec2 = [(corners[0]![0] + corners[3]![0]) / 2, (corners[0]![1] + corners[3]![1]) / 2];
  return [
    {
      type: 'region',
      id,
      points: corners,
      fillOpacity: SLICE_FILL,
      ...(opacity === undefined ? {} : { opacity }),
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    label(`${id}-label`, key, { world: left, offset: [-PLANE_LABEL_GAP, 0] }, 'muted', 'right', LABEL_PX, opacity),
  ];
}

export function scene(params: {
  state: LightConeState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('light-cone: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const marks = markOpacity(tl);
  const out: Primitive[] = [];

  const secondary = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  // ---- 과거 원뿔 ----
  // 면 뒤로 가려진 테(윤곽 안쪽 구간)는 점선. 원뿔은 틀과 무관하다 — 선언이 매 프레임 같다.
  const past = coneOutline(-PAST_HEIGHT, RIM_SAMPLES);
  out.push({ type: 'region', id: 'past-cone', points: past.hull, fillOpacity: PAST_FILL, style: secondary });
  past.rimInner.forEach((pts, i) =>
    out.push({
      type: 'trajectory',
      id: `past-rim-back-${i}`,
      points: pts,
      width: CONE_LINE_PX,
      opacity: PAST_OPACITY,
      style: { ...secondary, lineStyle: 'dashed' },
    }),
  );
  out.push({
    type: 'trajectory',
    id: 'past-outline',
    points: past.hull,
    closed: true,
    width: CONE_LINE_PX,
    opacity: PAST_OPACITY,
    style: secondary,
  });

  // ---- 시간 축 ----
  const axisTop = FUTURE_HEIGHT * AXIS_OVERSHOOT;
  out.push({
    type: 'trajectory',
    id: 'time-axis',
    points: [
      [0, -PAST_HEIGHT * AXIS_OVERSHOOT],
      [0, axisTop],
    ],
    width: AXIS_LINE_PX,
    style: { ...muted, lineStyle: 'dashed' },
  });
  out.push(label('time-axis-label', 'label.timeAxis', { world: [0, axisTop], offset: [-PLANE_LABEL_GAP, 0] }, 'muted', 'right', LABEL_PX));

  // ---- 미래 원뿔 ----
  // 위에서 비스듬히 내려다보므로 열린 테 전체가 보인다 — 테는 끊지 않고 실선이다.
  const future = coneOutline(FUTURE_HEIGHT, RIM_SAMPLES);
  out.push({ type: 'region', id: 'future-cone', points: future.hull, fillOpacity: FUTURE_FILL, style: secondary });
  out.push({ type: 'trajectory', id: 'future-outline', points: future.hull, closed: true, width: CONE_LINE_PX, style: secondary });
  future.rimInner.forEach((pts, i) =>
    out.push({ type: 'trajectory', id: `future-rim-front-${i}`, points: pts, width: CONE_LINE_PX, style: secondary }),
  );

  // ---- 영역 이름표 ----
  out.push(label('future-label', 'label.future', { world: [0, FUTURE_HEIGHT] }, 'secondary', 'center', LABEL_PX));
  out.push(label('past-label', 'label.past', { world: [0, -PAST_HEIGHT] }, 'secondary', 'center', LABEL_PX));
  out.push(label('elsewhere-label', 'label.elsewhere', { world: ELSEWHERE_AT }, 'muted', 'center', LABEL_PX));

  // ---- 「지금」 단면과 빛의 고리 ----
  // 퍼지는 동안만. 단면 위 고리의 반지름이 곧 단면 높이다(빛의 속도 = 1) — 고리가
  // 쓸고 올라간 자리가 원뿔 면이다.
  const tau = sliceHeight(tl, FUTURE_HEIGHT);
  if (tl.phase === 'spread') {
    out.push(...slicePlane('now-slice', tau, 'label.now'));
    out.push({
      type: 'trajectory',
      id: 'light-ring',
      points: circleAt(tau, tau, RIM_SAMPLES).map(project),
      closed: true,
      width: RING_LINE_PX,
      style: accent,
    });
  }

  // ---- 바뀐 틀의 「E 와 같은 때」 판 ----
  // 틀을 바꾸는 동안 E 를 지나는 동시 판(ct′ = 0)을 깐다. 이 판 아래로 내려간 사건은
  // 그 틀에서 E 보다 먼저 일어난 것이다. 틀이 바뀌어도 판은 ct′ = 0 이라 선언이 같다.
  const beta = frameBeta(tl, c);
  if (Math.abs(beta) > 0) {
    out.push(...slicePlane('frame-slice', 0, 'label.withE', marks));
  }

  // ---- 사건 ----
  const events = readEvents(tl, c, FUTURE_HEIGHT);
  events.forEach((e, i) => {
    const pos = project(e.now);

    // 틀을 바꾸는 동안 미끄러진 길. 안쪽 사건은 원뿔 안의 쌍곡선을, 바깥 사건은 원뿔
    // 밖의 쌍곡선을 따라간다 — 어느 쪽도 원뿔 면을 넘지 않는다.
    if (Math.abs(beta) > 0) {
      out.push({
        type: 'trajectory',
        id: `slide-${i}`,
        points: slidePath(e.rest, beta),
        width: SLIDE_LINE_PX,
        opacity: marks,
        style: { ...muted, lineStyle: 'dotted' },
      });
    }

    // E 에서 온 신호. 안쪽 사건에만 있다 — 빛보다 느리므로 언제나 빛의 고리 안에 머문다.
    if (e.inside && e.signal > 0) {
      const head = project({ x: e.now.x * e.signal, y: e.now.y * e.signal, ct: e.now.ct * e.signal });
      out.push({
        type: 'trajectory',
        id: `signal-${i}`,
        points: [[0, 0], head],
        width: SIGNAL_LINE_PX,
        opacity: marks,
        style: ink,
      });
      if (e.signal < 1) {
        out.push({ type: 'trace', id: `signal-head-${i}`, marks: [{ pos: head }], shape: 'dot', size: SIGNAL_HEAD_PX, style: ink });
      }
    }

    // 일어난 순간의 번쩍임.
    if (tl.phase === 'spread' && e.happened && e.since < c.pulseLife) {
      out.push({
        type: 'trace',
        id: `event-${i}-pulse`,
        marks: [{ pos, age: e.since }],
        life: c.pulseLife,
        shape: 'ring',
        size: EVENT_R_PX,
        spreadTo: PULSE_END_PX,
        style: ink,
      });
    }

    // 사건 점. 아직 일어나지 않았으면 옅은 점, 닿는 사건은 채운 점, 닿지 못한 사건은 빈 원.
    if (!e.happened) {
      out.push({
        type: 'trace',
        id: `event-${i}`,
        marks: [{ pos }],
        shape: 'dot',
        size: EVENT_R_PX,
        opacity: PENDING_OPACITY,
        style: muted,
      });
      return;
    }
    out.push({
      type: 'trace',
      id: `event-${i}`,
      marks: [{ pos }],
      shape: e.inside ? 'dot' : 'ring',
      size: EVENT_R_PX,
      width: EVENT_RING_PX,
      style: ink,
    });
    // 판정 이름표는 원뿔 바깥쪽으로 붙인다 — 안쪽으로 붙이면 윤곽선 · 신호선과 겹친다.
    const side = pos[0] < JUDGE_LEFT_X ? -1 : 1;
    out.push(
      label(
        `event-${i}-judge`,
        e.inside ? 'label.reached' : 'label.unreached',
        { world: pos, offset: [side * JUDGE_GAP, 0] },
        'ink',
        side < 0 ? 'right' : 'left',
        JUDGE_LABEL_PX,
        marks,
      ),
    );
  });

  // ---- E ----
  if (tl.phase === 'emit') {
    out.push({
      type: 'trace',
      id: 'e-flash',
      marks: [{ pos: [0, 0], age: tl.progress }],
      life: 1,
      shape: 'ring',
      size: EVENT_R_PX,
      spreadTo: FLASH_END_PX,
      width: RING_LINE_PX,
      style: accent,
    });
  }
  out.push({ type: 'trace', id: 'e-dot', marks: [{ pos: [0, 0] }], shape: 'dot', size: EVENT_R_PX, style: ink });
  out.push({
    ...label('e-label', 'label.event', { world: [0, 0], offset: [-E_LABEL_GAP, 0] }, 'ink', 'right', LABEL_PX),
    weight: 'bold',
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
