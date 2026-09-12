// ========================================================================
// ramp-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더 계층을 쓰지 않는다. 길(trajectory) · 낙차 점선(trajectory dashed) ·
// 지나온 자리(trace) · 벌어진 간격(trajectory 3점) · 공(body) 이 모두 표준
// 어휘로 있다. 손잡이는 조작기(`scale-drag`)가 그린다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { pathOf } from './physics';
import {
  BALL_RADIUS,
  DROP_X,
  LANES,
  MARK_CLIP_X,
  RAMP,
  RAMP_SAMPLES,
  SCENE_BOUNDS,
  STAGE_PX,
  mx,
} from './schema';
import type { RampEnergyState } from './state';

/** 길의 굵기(화면 px). */
const TRACK_WIDTH_PX = 2.5;
/** 낙차 점선의 굵기(화면 px). 안내선이라 가늘게 준다. */
const RULE_WIDTH_PX = 1;
/** 꺾인 선의 굵기(화면 px). */
const LINK_WIDTH_PX = 1.6;
/** 자국 하나의 반지름(화면 px). */
const MARK_SIZE_PX = 1.9;

/** 출발대 → 경사 → 활주로를 하나로 이은 폴리라인. 경사 구간은 72 등분한다. */
function trackPoints(lane: number, drop: number): Vec2[] {
  const at = pathOf(lane, drop);
  const baseY = LANES[lane]!.baseY;
  const startY = baseY + drop;
  const points: Vec2[] = [
    [RAMP.shelf, startY],
    [RAMP.x0, startY],
  ];
  for (let n = 1; n <= RAMP_SAMPLES; n++) points.push(at(n / RAMP_SAMPLES));
  points.push([mx(STAGE_PX.width), baseY]);
  return points;
}

export function scene(params: {
  state: RampEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state } = params;
  const drop = state.drop;
  const out: Primitive[] = [];

  // ---- 길 ----
  // 세 길의 모양이 곧 이름이다. 이름표를 두지 않는다 (원본 NOTES).
  LANES.forEach((lane, i) => {
    const track: Trajectory = {
      type: 'trajectory',
      id: `track-${lane.id}`,
      points: trackPoints(i, drop),
      width: TRACK_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    };
    out.push(track);
  });

  // ---- 출발 높이 ----
  // **세 점선의 길이가 같다는 것이 '같은 높이에서 출발한다' 는 말의 전부다.**
  // 장식이 아니라 주장의 근거로 쓰인 선이다. 위끝의 손잡이는 조작기가 그린다.
  LANES.forEach((lane) => {
    const rule: Trajectory = {
      type: 'trajectory',
      id: `rule-${lane.id}`,
      points: [
        [DROP_X, lane.baseY],
        [DROP_X, lane.baseY + drop],
      ],
      width: RULE_WIDTH_PX,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    };
    out.push(rule);
  });

  // ---- 지나온 자리 ----
  // 0.15 초마다 찍은 위치. **나이를 주지 않는다** — 늙어 지워지면 점 사이 간격이
  // 사라지고, 그 간격이 이 조각에서 속력을 읽는 유일한 장치다. 정지 스크린샷에서도
  // 속력이 읽히는 것은 이것 덕이다.
  LANES.forEach((lane, i) => {
    const ball = state.balls[i];
    if (!ball) return;
    const trace: Trace = {
      type: 'trace',
      id: `marks-${lane.id}`,
      marks: ball.marks.filter((pos) => pos[0] <= MARK_CLIP_X).map((pos) => ({ pos })),
      shape: 'dot',
      size: MARK_SIZE_PX,
      style: { colorRole: 'muted', emphasis: 'medium' },
    };
    out.push(trace);
  });

  const heads: Vec2[] = LANES.map((_, i) => pathOf(i, drop)(state.balls[i]?.u ?? 0));

  // ---- 벌어진 간격 ----
  // 세 공을 잇는 꺾인 선. 경사 구간에서는 모양이 매 프레임 변하고, 셋 다 내려선
  // 뒤에는 **모양이 그대로 오른쪽으로 미끄러진다** — t=1.7 과 t=3.5 가 합동이다.
  //
  // 강조색을 쓰는 곳은 여기 하나뿐이다. 뜻은 "세 공이 벌어진 정도" 하나다.
  const link: Trajectory = {
    type: 'trajectory',
    id: 'gap',
    points: heads,
    width: LINK_WIDTH_PX,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(link);

  // ---- 공 ----
  // 셋을 **같은 색**으로 둔다. 세 공은 같은 공이고 다른 것은 길뿐이다. 색으로
  // 구분하면 독자가 "빨간 공이 빠르다" 로 읽기 시작한다 (S-piece MUST NOT).
  LANES.forEach((lane, i) => {
    const ball: Body = {
      type: 'body',
      id: `ball-${lane.id}`,
      pos: heads[i]!,
      shape: 'circle',
      size: BALL_RADIUS,
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(ball);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption` · cases).

  return out;
}

/** 고정 경계. 프레이밍은 주장의 일부다 — 원본 캔버스 그대로 잡는다. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
