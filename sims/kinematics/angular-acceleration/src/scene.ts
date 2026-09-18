// ========================================================================
// angular-acceleration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 바퀴 테두리·바퀴살(trajectory) · 회전축과 끝점(body) · 0.5초 눈금(trace, `shape: 'tick'`
// 과 자국마다의 `direction`) · 이번 0.5초(sector). 캡션은 선언의 캡션 슬롯이 그린다.
//
// 자국 목록을 상태로 쌓지 않는다. 눈금 하나하나가 매 프레임 θ(0.5k) 로 다시 잡히므로
// 슬라이더를 움직이면 이미 찍힌 과거 눈금까지 새 값으로 즉시 다시 선다 (state.ts).
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  Sector,
  StageDef,
  Surface,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { pointAtClockAngle } from '@aperi21/plugin-mechanics';

import { angleAt } from './physics';
import {
  HUB_RADIUS,
  RADIUS,
  RIM_OPACITY,
  SCENE_BOUNDS,
  SECTOR_FILL_OPACITY,
  SECTOR_RIM_PX,
  SPOKE_TIP_RADIUS,
  SPOKE_WIDTH_PX,
  STAMP,
  TICK_LENGTH,
  TICK_MID_RADIUS,
  TICK_WIDTH_PX,
} from './schema';
import type { AngularAccelerationState } from './state';

/** 바퀴 중심. 회전축이자 부채꼴의 꼭짓점. */
const CENTER: Vec2 = [0, 0];
/** 기록이 이보다 옅으면 아무것도 그리지 않는다. 원본 `op <= 0.01`. */
const MIN_OPACITY = 0.01;

/** 12시에서 시계방향으로 잰 각의 바깥 방향 단위벡터. 눈금이 보는 쪽이다. */
function radial(theta: number): Vec2 {
  return pointAtClockAngle(CENTER, 1, theta);
}

/**
 * 시계각(12시 기준·시계방향)을 월드 각(x 축에서 반시계)으로 옮긴다.
 *
 * `sector` 의 `from`·`to` 가 월드 각이라 여기서 한 번만 환산한다. 각이 커질수록
 * 월드 각은 줄어들므로 `to < from` 이 되고, 그것이 곧 "시계방향으로 쓸었다" 다.
 */
function worldAngle(theta: number): number {
  return Math.PI / 2 - theta;
}

export function scene(params: {
  state: AngularAccelerationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('angular-acceleration: schema.timeline 이 선언되어야 한다');
  const { omega0, alpha } = params.state;
  const out: Primitive[] = [];

  // 나타났다 지워지는 기록의 불투명도. 단계 경계를 상수로 들고 있지 않는다.
  const op = tl.at('appear') * (1 - tl.at('erase'));
  // 기록이 멈추는 시각. `record` 가 끝나면 눈금이 더 찍히지 않고 바퀴살만 계속 돈다.
  const recorded = Math.min(tl.u, tl.end('record'));
  const kLast = Math.floor(recorded / STAMP + 1e-9);
  const thetaNow = angleAt(tl.u, omega0, alpha);

  // ---- 바퀴 테두리 ----
  // 눈금이 놓일 자리. 기록이 지워지는 동안에도 남아 화면이 비어 보이지 않는다.
  // 궤적이 아니라 구조물이다 — `surface` 원호로 두면 구조물 층(10)에 놓여 눈금 · 부채꼴 · 바퀴살이
  // 모두 그 위를 지난다. 온 원이라 각의 기준(시계 각 · 수학 각)은 상관없다.
  const rim: Surface = {
    type: 'surface',
    id: 'rim',
    geometry: { kind: 'arc', center: CENTER, radius: RADIUS, from: 0, to: Math.PI * 2 },
    opacity: RIM_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(rim);

  const hub: Body = {
    type: 'body',
    id: 'hub',
    pos: CENTER,
    shape: 'circle',
    size: HUB_RADIUS,
    outline: 'none',
    glow: false,
    opacity: RIM_OPACITY,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  };
  out.push(hub);

  if (op > MIN_OPACITY) {
    // ---- 이번 0.5초 부채꼴 ----
    // 마지막 눈금과 지금 바퀴살 사이. 0.5 초마다 폭 0 에서 다시 벌어지는데 매번 전보다
    // 크게 벌어진 채로 끝난다 — **동사가 여기서 반복해 일어난다.**
    //
    // 붉은색은 "진행 중인 0.5초" 한 뜻에만 쓴다. 눈금·바퀴살은 전부 같은 먹색이다.
    // `scale`(dial)로 대신하지 않는다 — 눈금이 붙으면 각도자로 읽혀 "간격이 벌어진다"
    // 가 "눈금이 원래 그렇게 생겼다" 로 뒤집힌다.
    const sector: Sector = {
      type: 'sector',
      id: 'swept',
      center: CENTER,
      radius: RADIUS,
      from: worldAngle(angleAt(kLast * STAMP, omega0, alpha)),
      to: worldAngle(thetaNow),
      fillOpacity: SECTOR_FILL_OPACITY,
      rimWidth: SECTOR_RIM_PX,
      opacity: op,
      style: { colorRole: 'accent', emphasis: 'strong' },
    };
    out.push(sector);

    // ---- 0.5초 눈금 ----
    // 주장 그 자체. **각도자가 아니라 시계다** — 눈금 사이의 거리가 그 0.5 초 동안
    // 바퀴가 돈 각이다. 자국마다 다른 쪽을 보는 방사 배치라 `marks[].direction` 을 쓴다.
    // 나이를 주지 않는다: 지나온 자리를 지우면 비교할 것이 사라진다.
    const marks = Array.from({ length: kLast + 1 }, (_, k) => {
      const theta = angleAt(k * STAMP, omega0, alpha);
      return { pos: pointAtClockAngle(CENTER, TICK_MID_RADIUS, theta), direction: radial(theta) };
    });
    const ticks: Trace = {
      type: 'trace',
      id: 'stamps',
      marks,
      shape: 'tick',
      size: TICK_LENGTH,
      width: TICK_WIDTH_PX,
      opacity: op,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(ticks);

    // ---- 회전하는 바퀴살 ----
    // 지금 어디를 도는지. 부채꼴의 앞선 모서리를 겸한다.
    const tip = pointAtClockAngle(CENTER, RADIUS, thetaNow);
    const spoke: Trajectory = {
      type: 'trajectory',
      id: 'spoke',
      points: [CENTER, tip],
      width: SPOKE_WIDTH_PX,
      opacity: op,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(spoke);

    const tipDot: Body = {
      type: 'body',
      id: 'spoke-tip',
      pos: tip,
      shape: 'circle',
      size: SPOKE_TIP_RADIUS,
      // 원본의 끝점은 번짐도 테두리도 없는 먹색 채움 원이다.
      outline: 'none',
      glow: false,
      opacity: op,
      style: { colorRole: 'ink', emphasis: 'strong' },
    };
    out.push(tipDot);
  }

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  // 고정 경계 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6).
  return { ...SCENE_BOUNDS };
}
