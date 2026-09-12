// ========================================================================
// gas-pressure — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 분자 280개와 그 자취는 `particleSystem` 하나, 벽 자국은 `trace` 하나다.
// **온도에 따라 분자 색을 바꾸지 않는다** — 분자는 언제나 같은 색이고 온도는
// 속력으로만 보인다. 강조색은 오직 "벽을 때린 두드림" 한 뜻에 쓴다. 벽 자국과
// 압력 막대가 같은 색인 것은 **같은 것**이기 때문이다 (S-piece).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  Surface,
  TimelineFrame,
  Trace,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { MAG_REF, speedAt } from './physics';
import {
  BAR,
  BOX,
  GAUGE_WALL_WIDTH,
  HIT_FADE,
  HIT_TICK_GAP,
  HIT_TICK_MAX,
  HIT_TICK_MIN,
  MOLECULE_RADIUS,
  STAGE,
  text,
} from './schema';
import type { GasPressureState } from './state';

/** 벽 자국의 획 굵기(화면 px). */
const HIT_TICK_WIDTH = 3;
/** 막대 채움의 진하기. 테두리 두 줄이 또렷하고 안은 옅다. */
const BAR_FILL_OPACITY = 0.22;
/** 막대가 벽 밖으로 삐져나오는 여유(월드). 원본이 벽 끝을 1 씩 넘겨 그었다. */
const WALL_OVERHANG = 1;
/** 이름표가 막대 바닥 아래로 내려오는 거리(화면 px). */
const LABEL_OFFSET: Vec2 = [0, 14];
/** 이름표 글자 크기(화면 px). */
const LABEL_FONT_PX = 13;

function wall(id: string, from: Vec2, to: Vec2): Surface {
  return { type: 'surface', id, geometry: { kind: 'wall', from, to }, material: 'solid' };
}

export function scene(params: {
  state: GasPressureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state } = params;
  const out: Primitive[] = [];

  // ---- 상자 ----
  // 가두기만 하는 세 벽.
  out.push(wall('wall-top', [BOX.left, BOX.top], [BOX.right, BOX.top]));
  out.push(wall('wall-left', [BOX.left, BOX.top], [BOX.left, BOX.bottom]));
  out.push(wall('wall-bottom', [BOX.left, BOX.bottom], [BOX.right, BOX.bottom]));

  // 압력을 재는 벽만 굵다. 네 벽이 다 같으면 압력 막대가 어느 벽 이야기인지 알 수
  // 없고, 색을 바꿔 가르면 색이 다른 일(두드림)을 하고 있으므로 쓸 수 없다.
  // `surface` 에는 굵기가 없어 선 어휘를 빌렸다 (NOTES.md 「어휘 부족」).
  const gaugeWall: Trajectory = {
    type: 'trajectory',
    id: 'wall-gauge',
    points: [
      [BOX.right, BOX.bottom - WALL_OVERHANG],
      [BOX.right, BOX.top + WALL_OVERHANG],
    ],
    width: GAUGE_WALL_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
  out.push(gaugeWall);

  // ---- 분자와 그 자취 ----
  // 자취는 장식이 아니다. 정지 프레임에서 속력을 읽을 수 있게 하는 유일한
  // 장치다 — 스크린샷에서는 아무것도 움직이지 않으므로 "빨라졌다" 가 사라진다.
  // 속도 반대 방향의 짧은 획이라 **길이가 곧 속력**이다.
  const v = speedAt(state.temperature);
  const molecules: ParticleSystem = {
    type: 'particleSystem',
    id: 'molecules',
    positions: state.molecules.map((m): Vec2 => [m.x, m.y]),
    velocities: state.molecules.map((m): Vec2 => [m.dx * m.c * v, m.dy * m.c * v]),
    sizes: MOLECULE_RADIUS,
    trail: true,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(molecules);

  // ---- 벽 두드림 ----
  // 충돌 하나가 두 곳에 동시에 간다. 여기는 **낱개** 쪽이다 — 맞은 자리에,
  // 세기만큼 길게, 나이 들어 사라진다. 자국의 밀도가 "더 자주" 를 말한다.
  //
  // `tick` 은 자리를 가운데로 잡으므로 벽에서 길이의 절반만큼 띄워 놓는다.
  const marks: Trace['marks'][number][] = [];
  for (const h of state.hits) {
    const age = state.t - h.t;
    if (age < 0 || age > HIT_FADE) continue;
    const bite = Math.min(1, h.mag / MAG_REF);
    const length = HIT_TICK_MIN + (HIT_TICK_MAX - HIT_TICK_MIN) * bite;
    marks.push({
      pos: [BOX.right + HIT_TICK_GAP + length / 2, h.y],
      age,
      strength: length / HIT_TICK_MAX,
    });
  }
  const knocks: Trace = {
    type: 'trace',
    id: 'wall-knocks',
    marks,
    life: HIT_FADE,
    shape: 'tick',
    direction: [1, 0],
    size: HIT_TICK_MAX,
    width: HIT_TICK_WIDTH,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(knocks);

  // ---- 압력 막대 ----
  // 같은 충돌의 **합** 쪽이다. 두드림이 도착하면 그만큼 툭 올라가고, 시간창
  // 밖으로 밀려나면 그만큼 내려간다. 그 들썩임을 평활하지 않는다 — 압력이
  // 매끈한 숫자로 보이는 것은 두드림이 많아서일 뿐이라는 것이, 뜨거워졌을 때
  // 막대가 높아지면서 동시에 잠잠해지는 것으로 따라 나온다.
  const top = BAR.bottom + state.pressure;
  const bar: Region = {
    type: 'region',
    id: 'pressure-bar',
    points: [
      [BAR.left, BAR.bottom],
      [BAR.right, BAR.bottom],
      [BAR.right, top],
      [BAR.left, top],
    ],
    fillOpacity: BAR_FILL_OPACITY,
    // 바닥선과 윗면만 긋는다. 옆선을 그으면 상자가 되어 눈금틀처럼 읽힌다.
    outline: [
      [0, 1],
      [2, 3],
    ],
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(bar);

  // ---- 압력 이름표 ----
  // 막대가 무엇인지 말하는 최소한. 범례나 축 이름이 아니다. 숫자는 두지
  // 않는다 — 압력은 임의 단위라 숫자로 쓰면 거짓 정밀이 된다.
  const label: Readout = {
    type: 'readout',
    id: 'pressure-label',
    anchor: { world: [(BAR.left + BAR.right) / 2, BAR.bottom], offset: LABEL_OFFSET },
    text: text('label.pressure'),
    chip: false,
    align: 'center',
    font: 'text',
    fontSize: LABEL_FONT_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(label);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). 여기 id 'caption' 을
  // 두지 않는다 — 엔진 예약이다.

  return out;
}

/**
 * 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (S-piece).
 *
 * 원본 캔버스의 틀 그대로다. 막대 오른쪽과 상자 위의 여백, 그리고 아래의 빈 띠가
 * 함께 들어와 캡션이 그림을 밟지 않는다.
 */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: STAGE.width, minY: 0, maxY: STAGE.height };
}
