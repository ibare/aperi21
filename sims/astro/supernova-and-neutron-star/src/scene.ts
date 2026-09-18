// ========================================================================
// supernova-and-neutron-star — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 둘레 물질(particleSystem ·
// 속도 꼬리) · 철 핵과 중성자별(body 원) · 충격파와 처음 핵 크기(trajectory 닫힌 고리) ·
// 이름표(readout)가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 —
//   ink     철 핵 → 중성자별. 무너지는 것과 남는 것은 **같은 대상**이라 한 색이다
//   primary 핵을 둘러싼 바깥층 물질 — 쏟아져 들어왔다가 튕겨 나가는 것
//   accent  **충격파** 한 뜻에만 — 튕김이 만든 바깥으로 번지는 앞면
//   muted   무너지기 전 핵 크기의 점선 고리와 그 이름표, 크기 과장을 밝히는 이름표
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
import {
  appearProgress,
  coreRadius,
  parcelAt,
  parcels,
  readConstants,
  revealProgress,
  sceneOpacity,
  shockRadius,
} from './physics';
import { LAYOUT, SCENE_BOUNDS, text } from './schema';
import type { SupernovaAndNeutronStarState } from './state';

/** 물질 덩이의 반지름(화면 px). */
const PARCEL_PX = 2.2;
/** 덩이 꼬리 — 길이 = 화면 속도 × 이 시간(초), 상한(화면 px) · 굵기(화면 px) · 짙기. */
const TRAIL_SECONDS = 0.5;
const TRAIL_MAX_PX = 26;
const TRAIL_PX = 1.5;
const TRAIL_OPACITY = 0.55;
/** 덩이의 짙기. 핵 · 충격파보다 물러나는 배경 물질이다. */
const PARCEL_OPACITY = 0.75;
/** 충격파 고리 굵기(화면 px). */
const SHOCK_PX = 3;
/** 처음 핵 크기 점선 고리의 굵기(화면 px) · 짙기. */
const FORMER_RING_PX = 1.2;
const FORMER_RING_OPACITY = 0.7;
/** 고리를 표본하는 점 수 (장부 G28). */
const RING_SAMPLES = 96;
/** 이름표 글자 크기(화면 px) — 대상 이름 · 곁들이는 말. */
const NAME_PX = 13;
const NOTE_PX = 11;
/** 이름표를 대상에서 띄우는 거리(화면 px) · 여러 줄 이름표의 줄 간격(화면 px). */
const LABEL_GAP = 14;
const LINE_GAP = 16;
/** 바탕 칩을 깐 이름표를 대상에서 띄우는 거리(화면 px) — 칩 높이의 반을 더 띄운다. */
const CHIP_GAP = 22;

export function scene(params: {
  state: SupernovaAndNeutronStarState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('supernova-and-neutron-star: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const appear = appearProgress(tl);
  const alpha = sceneOpacity(tl);
  const center: Vec2 = LAYOUT.center;
  const out: Primitive[] = [];

  // ================= 둘레 물질 — 쏟아져 들어왔다가 튕겨 나간다 =================
  //
  // 핵 바로 바깥 덩이는 핵과 함께 쏟아지고, 먼 덩이는 거의 제자리다. 충격파 뒤 껍질이
  // 닿은 덩이는 떨어지다 말고 밖으로 밀려 나간다 — 꼬리가 안에서 밖으로 뒤집힌다.
  const readings = parcels(c).map((p) => parcelAt(p, tl, c));
  out.push({
    type: 'particleSystem',
    id: 'matter',
    positions: readings.map((r) => r.pos),
    velocities: readings.map((r) => r.vel),
    sizes: PARCEL_PX,
    trail: true,
    trailStyle: {
      seconds: TRAIL_SECONDS,
      maxLength: TRAIL_MAX_PX,
      width: TRAIL_PX,
      opacity: TRAIL_OPACITY,
    },
    opacity: PARCEL_OPACITY * appear,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ================= 무너지기 전 핵의 크기 =================
  //
  // 무너지기 시작하면 제자리에 점선으로 남는다 — 핵이 얼마나 줄었는지를 잴 기준이다.
  const collapse = tl.at('collapse');
  if (collapse > 0) {
    out.push({
      type: 'trajectory',
      id: 'former-core',
      points: circle(center, LAYOUT.coreRadius),
      closed: true,
      width: FORMER_RING_PX,
      opacity: FORMER_RING_OPACITY * collapse * alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ================= 철 핵 → 중성자별 =================
  out.push({
    type: 'body',
    id: 'core',
    pos: center,
    shape: 'circle',
    size: coreRadius(tl, c),
    outline: 'background',
    glow: false,
    opacity: appear * alpha,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ================= 충격파 =================
  //
  // 단단해진 핵 겉면에서 생겨 바깥으로 번진다. 화면을 벗어나면 그만 선언한다.
  const rs = shockRadius(tl, c);
  if (rs !== null && tl.at('blast') < 1) {
    out.push({
      type: 'trajectory',
      id: 'shock',
      points: circle(center, rs),
      closed: true,
      width: SHOCK_PX,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ================= 이름표 =================

  // 무너지기 전 — 핵 위에 핵의 이름과 크기. 무너지는 동안 흐려진다.
  const coreLabel = appear * (1 - collapse);
  if (coreLabel > 0) {
    out.push({
      type: 'readout',
      id: 'label-iron-core',
      anchor: { world: [center[0], center[1] + LAYOUT.coreRadius], offset: [0, -CHIP_GAP] },
      text: text('label.ironCore'),
      chip: true,
      font: 'text',
      fontSize: NAME_PX,
      weight: 'bold',
      opacity: coreLabel,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 남은 뒤 — 중성자별의 이름 · 크기 · 질량, 과장 배율, 처음 핵 크기 고리의 이름.
  // 수는 모두 스테이지 상수를 그대로 끼운다 (S-piece 유효숫자). 중성자별 이름표는 점선
  // 고리 **바깥** 오른쪽에 둔다 — 중성자별 바로 옆에 두었더니 글자가 고리를 가로질렀다.
  const reveal = revealProgress(tl) * alpha;
  if (reveal > 0) {
    const right: Vec2 = [center[0] + LAYOUT.coreRadius, center[1]];
    out.push({
      type: 'readout',
      id: 'label-neutron-star',
      anchor: { world: right, offset: [LABEL_GAP, -LINE_GAP] },
      text: text('label.neutronStar'),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: NAME_PX,
      weight: 'bold',
      opacity: reveal,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'label-neutron-star-size',
      anchor: { world: right, offset: [LABEL_GAP, 0] },
      text: text('label.neutronStarSize'),
      vars: { d: String(c.nsDiameterKm), m: String(c.nsMassSolar) },
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: NOTE_PX,
      opacity: reveal,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'label-neutron-star-scale',
      anchor: { world: right, offset: [LABEL_GAP, LINE_GAP] },
      text: text('label.neutronStarScale'),
      vars: { k: String(c.nsEnlarge) },
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: NOTE_PX,
      opacity: reveal,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'label-former-core',
      anchor: { world: [center[0], center[1] + LAYOUT.coreRadius], offset: [0, -LABEL_GAP] },
      text: text('label.formerCore'),
      chip: false,
      font: 'text',
      fontSize: NOTE_PX,
      opacity: reveal,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 원을 점으로 표본한다 — 굵기를 고를 수 있는 원 어휘가 없다 (장부 G28). */
function circle(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < RING_SAMPLES; k++) {
    const a = (2 * Math.PI * k) / RING_SAMPLES;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
