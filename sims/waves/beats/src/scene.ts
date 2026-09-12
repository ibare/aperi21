// ========================================================================
// beats — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 이 조각은 자유 렌더 계층을 쓰지 않는다. 기준선·파형(trajectory) · 벌어진
// 자리(region) · 마디(trace) · 지금의 원(body) · 울렁임 한 칸(dimension) 이
// 모두 표준 어휘로 있다.
//
// 판 오른쪽 끝이 '지금'(월드 x = 0)이고, 지나온 자리는 왼쪽으로 흘러 시간창의
// 시작(x = −TRACK_SPAN)에서 사라진다. 그 자리를 정하는 것은 `step` 이 쌓은
// 이력이고, 여기서는 그것을 점 목록으로 옮길 뿐이다.
// ========================================================================

import type {
  Body,
  Dimension,
  EnvironmentDef,
  Primitive,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { readConstants } from './physics';
import {
  BEAT_LABEL_MIN,
  BEAT_ROW_Y,
  GUIDE_LINE,
  NODE_MID,
  NODE_SPAN,
  SCENE_BOUNDS,
  SUM_DOT,
  SUM_LINE,
  SUM_Y,
  TONE_DOT,
  TONE_LINE,
  TONE_Y,
  TRACK_SPAN,
  text,
} from './schema';
import type { BeatsSample, BeatsState } from './state';

/**
 * 두 음은 **같은 색·같은 굵기**다.
 *
 * 이 조각의 핵심 결정이다. 색이 같아야 발맞춘 순간 완전히 포개져 하나로 보이고,
 * 그래야 갈라지는 것이 사건이 된다. 색을 나누면 둘은 처음부터 끝까지 둘이고
 * 포개짐이 사라진다 (S-piece: 색으로 설명하지 않는다).
 */
const TONE_STYLE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 강조색은 하나, 뜻도 하나 — **실제로 들리는 소리**. 합친 파형과 합친 원만 쓴다. */
const SUM_STYLE = { colorRole: 'primary', emphasis: 'strong' } as const;
/** 기준선·마디처럼 읽는 것을 돕기만 하는 자국. */
const GUIDE_STYLE = { colorRole: 'muted', emphasis: 'subtle' } as const;
/** 두 음이 벌어진 자리 · 울렁임 한 칸. */
const MEASURE_STYLE = { colorRole: 'muted', emphasis: 'strong' } as const;
/** 벌어진 자리의 채움 — 파형이 비쳐 보이지 않을 만큼만 짙다. */
const GAP_FILL = 0.35;

export function scene(params: {
  state: BeatsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const out: Primitive[] = [];

  /** 잔상이 왼쪽으로 흐르는 속도(월드/초). 오른쪽 끝이 '지금' 이다. */
  const speed = TRACK_SPAN / c.window;
  const xAt = (t: number): number => (t - state.clock) * speed;

  // ---- 흔들림의 기준선 ----
  // "지워졌다" 를 읽으려면 0 이 어디인지 있어야 한다. 합친 원이 이 선에 붙어
  // 멈추는 것이 마디의 판정이다. 격자가 아니고 트랙마다 선 하나씩이다.
  const baseline = (id: string, y: number): Trajectory => ({
    type: 'trajectory',
    id,
    points: [
      [-TRACK_SPAN, y],
      [0, y],
    ],
    width: GUIDE_LINE,
    style: GUIDE_STYLE,
  });
  out.push(baseline('baseline-tones', TONE_Y));
  out.push(baseline('baseline-sum', SUM_Y));

  // ---- 울렁임의 마디 ----
  // 합이 지워진 순간들. 잔상과 **같은 시간축** 위에서 같은 속도로 흘러가므로
  // 별도의 시간 척도를 들이지 않는다. 나이를 주지 않는다 — 이 자국은 옅어지는
  // 것이 아니라 화면 밖으로 나가면서 사라진다(그 판정은 `step` 이 한다).
  if (state.nodes.length > 0) {
    const nodes: Trace = {
      type: 'trace',
      id: 'nodes',
      marks: state.nodes.map((t) => ({ pos: [xAt(t), NODE_MID] as Vec2 })),
      shape: 'tick',
      direction: [0, 1],
      size: NODE_SPAN,
      width: GUIDE_LINE,
      style: GUIDE_STYLE,
    };
    out.push(nodes);
  }

  // ---- 두 음이 벌어진 자리 ----
  // 같은 순간 두 변위의 차이 — 어긋난 정도. 한 곡선을 따라가고 다른 곡선을 거슬러
  // 돌아오는 하나의 면이다. 파형보다 **먼저** 놓아 곡선을 가리지 않는다.
  if (state.samples.length >= 2) {
    const gap: Region = {
      type: 'region',
      id: 'gap',
      points: [
        ...state.samples.map((s): Vec2 => [xAt(s.t), TONE_Y + s.a]),
        ...[...state.samples].reverse().map((s): Vec2 => [xAt(s.t), TONE_Y + s.b]),
      ],
      // 겹쳐도 짙어지지 않게 불투명하게 깐다 — 원본도 이 자리를 단색으로 메웠다.
      opaque: true,
      fillOpacity: GAP_FILL,
      style: MEASURE_STYLE,
    };
    out.push(gap);
  }

  // ---- 파형 ----
  const wave = (
    id: string,
    at: (s: BeatsSample) => number,
    width: number,
    style: Trajectory['style'],
  ): Trajectory => ({
    type: 'trajectory',
    id,
    points: state.samples.map((s): Vec2 => [xAt(s.t), at(s)]),
    width,
    style,
  });
  if (state.samples.length >= 2) {
    out.push(wave('tone-1', (s) => TONE_Y + s.a, TONE_LINE, TONE_STYLE));
    out.push(wave('tone-2', (s) => TONE_Y + s.b, TONE_LINE, TONE_STYLE));
    // 합친 소리 — 두 변위의 합. 아래 트랙은 같은 자를 쓰므로 최대 진폭이 두 배다.
    out.push(wave('sum', (s) => SUM_Y + s.a + s.b, SUM_LINE, SUM_STYLE));
  }

  // ---- 울렁임 한 칸 ----
  // 마디 점선만으로는 "이 간격이 박자" 가 읽히지 않는다. 가장 최근 마디 둘을
  // 재어 보인다. 칸이 좁아지면 글자는 스스로 사라지고 선만 남는다.
  const n = state.nodes.length;
  if (n >= 2) {
    const from = xAt(state.nodes[n - 2]!);
    const to = xAt(state.nodes[n - 1]!);
    if (from >= -TRACK_SPAN && to <= 0) {
      const span: Dimension = {
        type: 'dimension',
        id: 'beat-span',
        from: [from, BEAT_ROW_Y],
        to: [to, BEAT_ROW_Y],
        ...(to - from >= BEAT_LABEL_MIN ? { text: text('label.beat') } : {}),
        style: MEASURE_STYLE,
      };
      out.push(span);
    }
  }

  // ---- 지금 ----
  // 판 오른쪽 끝(x = 0)에서 위아래로 흔들리는 원 셋. 동사가 일어나는 자리는 위
  // 트랙의 원 **두 개**다 — 발맞출 때 포개져 하나로 보이고, 기준선을 사이에 두고
  // 정반대 끝까지 벌어졌다가 다시 포개진다. 그동안 아래 원은 기준선에 붙어 멈춘다.
  const now = state.samples[state.samples.length - 1];
  if (now) {
    const dot = (id: string, pos: Vec2, size: number, style: Body['style']): Body => ({
      type: 'body',
      id,
      pos,
      shape: 'circle',
      size,
      // 후광 없는 짙은 원. 겹침을 읽어야 하는 그림이라 둘레가 번지면 안 된다.
      glow: false,
      style,
    });
    out.push(dot('tone-1-now', [0, TONE_Y + now.a], TONE_DOT, TONE_STYLE));
    out.push(dot('tone-2-now', [0, TONE_Y + now.b], TONE_DOT, TONE_STYLE));
    out.push(dot('sum-now', [0, SUM_Y + now.a + now.b], SUM_DOT, SUM_STYLE));
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). 여기에 id `caption` 을
  // 두지 않는다 — 엔진 예약이다 (S-piece).

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
