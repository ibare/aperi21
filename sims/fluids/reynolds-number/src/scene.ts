// ========================================================================
// reynolds-number — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 관 셋이 같은 어휘 묶음을 쓴다 — 벽 둘(`surface`) · 부유물(`stream`) · 보이지 않는
// 소용돌이 장(`vortexField`) · 염료 실(`filament`) · 왼쪽 이름표와 오른쪽 Re 칩(`readout`).
// 관마다 다른 것은 굵기 · 빠르기 · 그 둘이 정하는 성장률뿐이다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  Filament,
  Primitive,
  SceneGraph,
  StageDef,
  Stream,
  Surface,
  TimelineFrame,
  ViewDef,
  VortexField,
} from '@aperi21/schema';
import {
  growthRate,
  heldRe,
  PIPE_IDS,
  pipeRe,
  pipeSpeed,
  readConstants,
  referenceRe,
  type PipeId,
} from './physics';
import {
  HALF_WIDTH,
  INJECT_X,
  LABEL_GAP,
  PIPE_CENTER_Y,
  PIPE_LENGTH,
  PIPE_X0,
  SCENE_BOUNDS,
  text,
  type ReynoldsNumberMessageKey,
} from './schema';
import type { ReynoldsNumberState } from './state';

/** 관마다 왼쪽 이름표 키. 관이 늘면 여기서 타입이 막는다. */
const PIPE_LABELS: Record<PipeId, ReynoldsNumberMessageKey> = {
  top: 'label.pipeTop',
  mid: 'label.pipeMid',
  bottom: 'label.pipeBottom',
};

/** 부유물 줄 수. 이게 없으면 곧은 구간이 정지 화면처럼 보이고, 빠르기가 보이지 않는다. */
const MOTE_LANES = 5;
/** 주입하는 흔들림의 크기 — 관 반폭에 대한 비. 세 관이 같은 비라 무늬가 닮는다. */
const SEED_RATIO = 0.15;

function wall(id: string, y: number): Surface {
  return {
    type: 'surface',
    id,
    geometry: { kind: 'wall', from: [PIPE_X0, y], to: [PIPE_X0 + PIPE_LENGTH, y] },
    material: 'solid',
  };
}

export function scene(params: {
  state: ReynoldsNumberState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('reynolds-number: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const ref = referenceRe(timeline, c);
  const out: Primitive[] = [];

  for (const id of PIPE_IDS) {
    const s = c.pipes[id];
    const cy = PIPE_CENTER_Y[id];
    const hw = HALF_WIDTH * s.d;
    const speed = pipeSpeed(ref, s, c);
    const sigma = growthRate(pipeRe(ref, s), c);
    // 관 안쪽. 염료의 번짐 · 부유물이 벽 밖으로 넘지 않게 여기서 자른다.
    const inside = { min: [PIPE_X0, cy - hw] as const, max: [PIPE_X0 + PIPE_LENGTH, cy + hw] as const };

    // ---- 관 ---- 위아래 벽 두 줄. 굵기 차이가 곧 D 와 D/2 다.
    out.push(wall(`${id}-wall-top`, cy + hw));
    out.push(wall(`${id}-wall-bottom`, cy - hw));

    // ---- 부유물 ---- 빠르기를 보인다. 위와 아래는 같은 빠르기, 가운데는 두 배.
    for (let i = 0; i < MOTE_LANES; i++) {
      const u = (i + 0.5) / MOTE_LANES;
      const mote: Stream = {
        type: 'stream',
        id: `${id}-mote-${i}`,
        from: [PIPE_X0, cy - hw + u * 2 * hw],
        velocity: [speed * (1 - 0.45 * (2 * u - 1) ** 2), 0],
        rate: 7 * s.v,
        life: PIPE_LENGTH / Math.max(0.05, speed),
        width: 1,
        clip: inside,
        style: { colorRole: 'muted', emphasis: 'subtle' },
      };
      out.push(mote);
    }

    // ---- 소용돌이 장 ---- 보이지 않는다. 커진 흔들림에서만 실을 감고 접는다.
    // 크기는 관 굵기를 따른다 — 가는 관의 소용돌이는 그만큼 작다.
    const field: VortexField = {
      type: 'vortexField',
      id: `${id}-swirl`,
      bounds: { min: inside.min, max: inside.max },
      drift: [speed, 0],
      gain: 1,
      count: 34,
      radius: [hw * 0.28, hw * 0.62],
      span: [PIPE_LENGTH * 0.1, PIPE_LENGTH * 0.26],
    };
    out.push(field);

    // ---- 염료 실 ---- 셋이 한 색이다. 다른 것은 Re 하나라는 것이 요점이라, 흐트러진
    // 관을 다른 색으로 칠하면 색이 형태의 일을 가로챈다 (S-piece).
    const dye: Filament = {
      type: 'filament',
      id: `${id}-dye`,
      from: [PIPE_X0 + INJECT_X, cy],
      speed,
      length: PIPE_LENGTH - INJECT_X,
      halfWidth: hw,
      growth: sigma,
      // 흔들림을 거리 간격으로 넣는다 — 빠른 관은 그만큼 자주. 세 관의 무늬가 같은 자리에 놓인다.
      seed: { amplitude: hw * SEED_RATIO, period: c.seedSpacing / Math.max(1e-6, speed) },
      field: field.id,
      width: 2,
      spacing: 2,
      clip: inside,
      style: { colorRole: 'primary', emphasis: 'strong' },
    };
    out.push(dye);

    // ---- 왼쪽 이름표 ---- 굵기 · 빠르기의 배수. 위와 가운데는 둘 다 다르다.
    out.push({
      type: 'readout',
      id: `${id}-label`,
      anchor: { world: [PIPE_X0 - LABEL_GAP, cy] },
      text: text(PIPE_LABELS[id]),
      chip: false,
      align: 'right',
      font: 'mono',
      fontSize: 12,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });

    // ---- 오른쪽 Re 칩 ---- 정박값에 머무는 동안만. 강조색은 이 한 뜻(결을 정하는 수)에만 쓴다.
    const re = heldRe(timeline, s, c);
    if (re !== null) {
      out.push({
        type: 'readout',
        id: `${id}-re`,
        anchor: { world: [PIPE_X0 + PIPE_LENGTH + LABEL_GAP, cy] },
        text: text('label.re'),
        vars: { re },
        chip: false,
        align: 'left',
        font: 'mono',
        fontSize: 12,
        weight: 'bold',
        style: { colorRole: 'accent', emphasis: 'strong' },
      });
    }
  }

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
