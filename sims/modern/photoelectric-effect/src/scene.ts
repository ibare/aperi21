// ========================================================================
// photoelectric-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침은 scene 에 쓴 순서(`drawOrder: 'scene'`) — 빛줄기 · 금속판 ·
// 전자 · 광자 · 램프 · 이름표.
//
// 색 — 빛은 빛 채널로만 칠한다(`light: { rgb }`, 파장에서 `wavelengthToLinearRgb`). 빛줄기 · 광자 ·
// 램프 구멍이 한 빛의 같은 색이다. 전자는 금속 안에 있든 튀어나갔든 같은 대상이라 먹색 하나,
// 금속판 · 이름표는 배경 정보라 `muted`. 강조색은 쓰지 않는다 — 나오느냐 마느냐는 색이 아니라
// 전자가 표면을 넘는 움직임으로 보인다 (S-piece).
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  Region,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  fadeAlpha,
  lampNow,
  lambdaOf,
  lightOf,
  photonEvOf,
  readConstants,
  schedule,
  siteX,
  snapshot,
  type FlyingPhoton,
  type LightKind,
} from './physics';
import { BEAM_SITES, LAMP, METAL, SCENE_BOUNDS, text } from './schema';
import type { PhotoelectricEffectState } from './state';

/** 광자 물결 뭉치의 길이 · 흔들림 폭(월드). 두 빛이 같은 길이라 물결 수가 파장을 말한다. */
const PACKET_LENGTH = 0.56;
const PACKET_AMPLITUDE = 0.075;
/** 물결 뭉치 한 개의 표본 수. */
const PACKET_SAMPLES = 36;
/** 광자 선 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2;

/** 빛줄기 채움 짙기 — 약하게 · 세게. 세기는 광자 수가 말하고 이것은 거드는 몫이다. */
const BEAM_FILL = { dim: 0.1, bright: 0.24 } as const;
/** 빛줄기가 램프 구멍에서 벌어져 나오는 반폭 · 표면에서 끝 자리 너머로 넘치는 폭(월드). */
const BEAM_APERTURE = 0.09;
const BEAM_SPILL = 0.22;

/** 금속판 채움 짙기. 전자가 비쳐 보여야 「안에 있다」 로 읽힌다. */
const METAL_FILL = 0.3;

/** 전자 점 반지름(화면 px). 금속 안이든 밖이든 같은 대상이라 같은 크기다. */
const ELECTRON_PX = 3.6;
/** 움직이는 전자의 꼬리 — 길이(초) · 짙기 · 굵기(화면 px). 튀어나간 전자들의 꼬리 길이가 같아 빠르기가 같다. */
const ELECTRON_TRAIL = { seconds: 0.22, opacity: 0.45, width: 2 } as const;
/**
 * 금속 안에서 튀어 오르는 전자의 꼬리 상한(화면 px). 출발 순간이 가장 빨라 꼬리가 금속판 아래로
 * 막대처럼 삐져나온다 — 오르내림만 보이면 되므로 짧게 자른다.
 */
const HOP_TRAIL = { ...ELECTRON_TRAIL, maxLength: 12 } as const;

/** 램프 몸통 크기 [길이, 폭](월드) · 구멍 반지름(월드). */
const LAMP_BODY: readonly [number, number] = [0.52, 0.34];
const LAMP_APERTURE = 0.1;
/** 램프 이름표 자리 — 램프 구멍에서 오른쪽 위로(월드). 몸통은 왼쪽 위로 뻗어 있어 반대쪽에 둔다. */
const LAMP_LABEL_SHIFT: Vec2 = [1.05, 0.3];
/** 금속 이름표 자리 — 판 안쪽 아래 모서리에서 들인 거리(월드) · 일함수 이름표의 판 오른쪽 끝에서 들인 거리. */
const METAL_LABEL_INSET = 0.25;
/** 「금속」 이름표를 판 왼쪽 끝에서 들이는 거리(월드). */
const METAL_NAME_INSET = 0.5;
const WORK_LABEL_INSET = 1.15;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;

/** 빛줄기 한가운데를 겨누는 방향(단위) — 램프 몸통이 이쪽을 본다. */
function beamAxis(): Vec2 {
  const mid = (siteX(BEAM_SITES.first) + siteX(BEAM_SITES.last)) / 2;
  const dx = mid - LAMP.x;
  const dy = METAL.top - LAMP.y;
  const len = Math.hypot(dx, dy);
  return [dx / len, dy / len];
}

/** 광자 하나의 물결 뭉치 — 나는 방향을 따라 파장 간격으로 흔들리고 양 끝으로 잦아든다. */
function packet(p: FlyingPhoton, lambdaWorld: number): Vec2[] {
  const [ux, uy] = p.dir;
  const nx = -uy;
  const ny = ux;
  const pts: Vec2[] = [];
  for (let i = 0; i <= PACKET_SAMPLES; i++) {
    const f = i / PACKET_SAMPLES;
    // 앞쪽 끝이 지금 자리다 — 뭉치는 그 뒤로 끌린다.
    const s = -f * PACKET_LENGTH;
    const env = Math.sin(Math.PI * f);
    const w = PACKET_AMPLITUDE * env * Math.sin((2 * Math.PI * s) / lambdaWorld);
    pts.push([p.pos[0] + ux * s + nx * w, p.pos[1] + uy * s + ny * w]);
  }
  return pts;
}

function label(id: string, t: Readout['text'], pos: Vec2, vars?: Readout['vars']): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: t,
    vars,
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: PhotoelectricEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('photoelectric-effect: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = fadeAlpha(tl);
  const lamp = lampNow(tl);
  const lampRgb = lightOf(lamp.light, c);
  const snap = snapshot(schedule(tl, c), tl.u, c);
  const axis = beamAxis();
  const out: Primitive[] = [];

  // ── 빛줄기 — 램프 구멍에서 금속 표면까지. 세게 비추면 짙어진다 ──
  const ax = -axis[1] * BEAM_APERTURE;
  const ay = axis[0] * BEAM_APERTURE;
  out.push({
    type: 'region',
    id: 'beam',
    points: [
      [LAMP.x + ax, LAMP.y + ay],
      [LAMP.x - ax, LAMP.y - ay],
      [siteX(BEAM_SITES.last) + BEAM_SPILL, METAL.top],
      [siteX(BEAM_SITES.first) - BEAM_SPILL, METAL.top],
    ],
    fillOpacity: BEAM_FILL[lamp.level],
    opacity: alpha,
    light: { rgb: lampRgb },
  } satisfies Region);

  // ── 금속판 — 윗면이 전자가 넘어야 할 표면이다 ──
  out.push({
    type: 'region',
    id: 'metal',
    points: [
      [METAL.x0, METAL.top],
      [METAL.x1, METAL.top],
      [METAL.x1, METAL.bottom],
      [METAL.x0, METAL.bottom],
    ],
    fillOpacity: METAL_FILL,
    outline: [[0, 1]],
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Region);

  // ── 금속 안 전자 — 쉬는 것 · 튀어 오르다 되돌아가는 것 ──
  const resting = snap.bound.filter((b) => !b.vel);
  out.push({
    type: 'particleSystem',
    id: 'electrons-rest',
    positions: resting.map((b) => b.pos),
    opacities: resting.map((b) => b.alpha),
    sizes: ELECTRON_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);
  const hopping = snap.bound.filter((b) => b.vel);
  out.push({
    type: 'particleSystem',
    id: 'electrons-hop',
    positions: hopping.map((b) => b.pos),
    velocities: hopping.map((b) => b.vel!),
    trail: true,
    trailStyle: HOP_TRAIL,
    sizes: ELECTRON_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // ── 튀어나간 전자 — 표면을 넘어 같은 빠르기로 ──
  out.push({
    type: 'particleSystem',
    id: 'electrons-out',
    positions: snap.escaping.map((e) => e.pos),
    velocities: snap.escaping.map((e) => e.vel),
    trail: true,
    trailStyle: ELECTRON_TRAIL,
    sizes: ELECTRON_PX,
    opacity: alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // ── 광자 — 빛마다 한 선언(선언 하나에 빛 색 하나). 물결 간격이 파장이다 ──
  const kinds: readonly LightKind[] = ['red', 'violet'];
  for (const k of kinds) {
    const ps = snap.photons.filter((p) => p.light === k);
    if (ps.length === 0) continue;
    const lw = lambdaOf(k, c) * c.waveScale;
    out.push({
      type: 'lineSet',
      id: `photons-${k}`,
      lines: ps.map((p) => packet(p, lw)),
      width: PHOTON_WIDTH_PX,
      opacity: alpha,
      light: { rgb: lightOf(k, c) },
    } satisfies LineSet);
  }

  // ── 램프 — 몸통은 빛줄기를 겨누고, 구멍은 지금 빛의 색 ──
  const angle = Math.atan2(axis[1], axis[0]);
  out.push({
    type: 'body',
    id: 'lamp-body',
    pos: [LAMP.x - (axis[0] * LAMP_BODY[0]) / 2, LAMP.y - (axis[1] * LAMP_BODY[0]) / 2],
    shape: 'rect',
    size: LAMP_BODY,
    orientation: angle,
    outline: 'none',
    style: { colorRole: 'muted', emphasis: 'strong' },
  } satisfies Body);
  out.push({
    type: 'body',
    id: 'lamp-aperture',
    pos: [LAMP.x, LAMP.y],
    shape: 'circle',
    size: LAMP_APERTURE,
    outline: 'none',
    glow: false,
    light: { rgb: lampRgb },
  } satisfies Body);

  // ── 이름표 — 광자 하나의 에너지 · 표면을 넘는 데 드는 에너지 ──
  out.push(
    label('lamp-energy', text('label.photonEnergy'), [LAMP.x + LAMP_LABEL_SHIFT[0], LAMP.y + LAMP_LABEL_SHIFT[1]], {
      e: String(photonEvOf(lamp.light, c)),
    }),
  );
  out.push(
    label(
      'work-function',
      text('label.workFunction'),
      [METAL.x1 - WORK_LABEL_INSET, METAL.bottom + METAL_LABEL_INSET],
      { w: String(c.workFunction) },
    ),
  );
  out.push(label('metal', text('label.metal'), [METAL.x0 + METAL_NAME_INSET, METAL.bottom + METAL_LABEL_INSET]));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
