// ========================================================================
// laminar-vs-turbulent — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 원본은 엔진 없이 손으로 짠 607줄이었다. 거기서 발견한 두 어휘 —
// `vortexField`(수명 있는 소용돌이 다발)와 `filament`(교란이 증폭·감쇠하는 실) —
// 가 코어로 올라가면서 여기 남는 것은 선언뿐이다.
// ========================================================================

import type {
  EnvironmentDef,
  Filament,
  Primitive,
  SceneGraph,
  StageDef,
  Stream,
  Surface,
  ViewDef,
  VortexField,
} from '@aperi21/schema';
import {
  growthRate,
  readConstants,
  reynolds,
  formatReynolds,
} from './physics';
import {
  INJECT_X,
  PIPE,
  RE_RANGE,
  RE_TRACK,
  SCENE_BOUNDS,
  SPEED_SCALE,
  SPEED_STOPS,
  text,
} from './schema';
import type { LaminarVsTurbulentState } from './state';

/** 주입되는 흔들림의 크기(월드) — 관 반폭의 15 %. **늘 같다.** */
const SEED_AMPLITUDE = PIPE.halfWidth * 0.15;
/** 흔들림 주기(초). */
const SEED_PERIOD = 1.15;
/** 부유물 줄 수. 이게 없으면 층류 구간이 정지 화면처럼 보인다. */
const MOTE_LANES = 7;
/** 캡션이 아래에서 올라온 자리(화면 px). */
const CAPTION_OFFSET: readonly [number, number] = [0, -4];

function wall(id: string, y: number): Surface {
  return {
    type: 'surface',
    id,
    geometry: { kind: 'wall', from: [PIPE.x0, y], to: [PIPE.x0 + PIPE.length, y] },
    material: 'solid',
  };
}

export function scene(params: {
  state: LaminarVsTurbulentState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
}): SceneGraph {
  const { state, stage } = params;
  const c = readConstants(stage);
  const re = reynolds(state.v, c);
  const sigma = growthRate(re, c);
  const flowSpeed = state.v * SPEED_SCALE;
  const out: Primitive[] = [];

  // ---- 관 ----
  // 위아래 벽 두 줄뿐이다. 이 질문에 x·y 좌표는 아무 의미가 없다.
  out.push(wall('pipe-top', PIPE.centerY + PIPE.halfWidth));
  out.push(wall('pipe-bottom', PIPE.centerY - PIPE.halfWidth));

  // ---- 부유물 ----
  // 길이가 유속에 비례해서, 물이 지금 얼마나 빠른지도 같이 말한다.
  for (let i = 0; i < MOTE_LANES; i++) {
    const u = (i + 0.5) / MOTE_LANES;
    const mote: Stream = {
      type: 'stream',
      id: `mote-${i}`,
      from: [PIPE.x0, PIPE.centerY - PIPE.halfWidth + u * 2 * PIPE.halfWidth],
      velocity: [flowSpeed * (1 - 0.45 * (2 * u - 1) ** 2), 0],
      rate: 9,
      life: PIPE.length / Math.max(0.05, flowSpeed),
      width: 1,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    };
    out.push(mote);
  }

  // ---- 소용돌이 장 ----
  // 보이지 않는다. 하는 일은 실을 감고 접는 것이고, 화면에 나타나는 것은
  // 그 결과다.
  const vortices: VortexField = {
    type: 'vortexField',
    id: 'swirl',
    bounds: {
      min: [PIPE.x0, PIPE.centerY - PIPE.halfWidth],
      max: [PIPE.x0 + PIPE.length, PIPE.centerY + PIPE.halfWidth],
    },
    drift: [flowSpeed, 0],
    gain: 1,
    count: 34,
    radius: [PIPE.halfWidth * 0.28, PIPE.halfWidth * 0.62],
    span: [PIPE.length * 0.1, PIPE.length * 0.26],
  };
  out.push(vortices);

  // ---- 염료 실 ----
  // 염료는 처음부터 끝까지 한 색이다. 층류를 파랑, 난류를 빨강으로 칠하면
  // 색이 형태의 일을 가로챈다. 같은 물, 같은 염료, 같은 바늘 — 바뀐 것은
  // 수 하나뿐이라는 게 요점이다.
  const dye: Filament = {
    type: 'filament',
    id: 'dye',
    from: [PIPE.x0 + INJECT_X, PIPE.centerY],
    speed: flowSpeed,
    length: PIPE.length - INJECT_X,
    halfWidth: PIPE.halfWidth,
    growth: sigma,
    seed: { amplitude: SEED_AMPLITUDE, period: SEED_PERIOD },
    field: 'swirl',
    width: 2,
    // 실의 밀도(화면 px). 성기면 번짐이 점점이 흩어져 보이고 선이 자주 끊긴다.
    spacing: 2,
    style: { colorRole: 'primary', emphasis: 'strong' },
  };
  out.push(dye);

  // ---- Re 눈금 ----
  // 좌표계가 아니라 논거다. 매끄럽게 움직이는 입력을 눈에 보이게 두어야
  // 출력의 갑작스러움이 갑작스러워 보인다. 숫자 라벨은 2300 하나뿐이다 —
  // 이 조각의 핵심 숫자가 하나이기 때문이다.
  out.push({
    type: 'scale',
    id: 're-track',
    shape: 'linear',
    pos: [RE_TRACK.x0, RE_TRACK.y],
    size: RE_TRACK.length,
    direction: [1, 0],
    range: RE_RANGE,
    value: re,
    tickAt: SPEED_STOPS.map((v) => reynolds(v, c)),
    labelAt: [c.reCritical],
    digits: 0,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // ---- 캡션 ----
  // 슬롯 하나. 지금 화면에서 벌어지는 일만 말한다. "레이놀즈 수란" 으로
  // 시작하는 문장은 한 줄도 없다.
  out.push({
    type: 'readout',
    id: 'caption',
    anchor: { screen: 'bottom-center', offset: [...CAPTION_OFFSET] },
    text:
      re < c.reCritical - 60
        ? text('caption.damping')
        : re <= c.reCritical + 60
          ? text('caption.neutral')
          : re < c.reCritical * 1.5
            ? text('caption.growing')
            : text('caption.upstream'),
    chip: false,
    fontSize: 13,
    style: {
      colorRole: Math.abs(re - c.reCritical) <= 60 ? 'accent' : 'muted',
      emphasis: 'strong',
    },
  });

  // 지금 Re — 정박값 포매터를 거친다. 계산값을 그대로 반올림하면 표에 없는
  // 수를 화면이 말하게 된다.
  out.push({
    type: 'readout',
    id: 're-value',
    anchor: { screen: 'top-right', offset: [0, 36] },
    text: { ko: 'Re = {re}', en: 'Re = {re}' },
    vars: { re: formatReynolds(re, c) },
    chip: false,
    fontSize: 12,
    style: {
      colorRole: Math.abs(re - c.reCritical) <= 60 ? 'accent' : 'muted',
      emphasis: 'strong',
    },
  });

  return out;
}

export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
