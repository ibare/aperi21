// ========================================================================
// sound-through-materials — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 통(`trajectory` closed, 진공은 점선) ·
// 알갱이(`particleSystem`) · 흔들리는 알갱이(`particleSystem` + 알갱이별 `opacities`) · 판 · 망치 ·
// 듣는 곳(`body`) · 이름표(`readout`) 가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 알갱이 · 판은 먹색, 통 테두리 · 이름표는 배경 정보라 muted, 망치는 보조색.
// **강조색은 「소리(떨림)」 한 뜻에만** — 지금 흔들리는 알갱이와, 소리가 닿아 켜진 듣는 곳.
// 네 통은 색이 아니라 알갱이의 있고 없음 · 이름표로 갈린다.
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
  arrived,
  displacement,
  lanes,
  markOpacity,
  pulseCenter,
  readConstants,
  restPositions,
  travelTime,
  type Lane,
} from './physics';
import {
  EAR_GAP,
  EAR_LABEL_Y,
  EAR_R,
  LABEL_X,
  LANE_HALF,
  LANE_Y,
  MALLET_HANDLE,
  MALLET_HIT_Y,
  MALLET_R,
  MALLET_START,
  PLATE_OVERHANG,
  PLATE_W,
  SCENE_BOUNDS,
  text,
  type SoundThroughMaterialsMessageKey,
} from './schema';
import type { SoundThroughMaterialsState } from './state';

// ---- 크기(화면 px) ----
/** 알갱이 반지름. */
const PARTICLE_PX = 2.4;
/** 흔들리는 알갱이 — 먹색 알갱이 위에 조금 크게 얹어 강조색이 덮는다. */
const SHAKEN_PX = 3.2;
/** 통 테두리 · 망치 자루. */
const TUBE_WIDTH_PX = 1.5;
const MALLET_HANDLE_PX = 4;
/** 이름표 글자. */
const LABEL_PX = 13;
const EAR_LABEL_PX = 12;

// ---- 짙기 ----
/** 가만히 있는 알갱이. 흔들리는 강조색이 그 위에서 읽혀야 한다. */
const PARTICLE_OPACITY = 0.55;
/** 이 밀려남 몫(폭 대비) 아래는 강조하지 않는다 — 덩어리 가장자리의 옅은 꼬리를 자른다. */
const SHAKEN_FLOOR = 0.12;
/** 꺼진 듣는 곳 테두리. */
const EAR_OFF_OPACITY = 0.7;

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

function laneLabel(
  lane: Lane,
): { key: SoundThroughMaterialsMessageKey; vars?: Record<string, string> } {
  if (lane.id === 'vacuum' || lane.speed === null) return { key: 'label.vacuum' };
  return { key: `label.${lane.id}`, vars: { v: String(lane.speed) } };
}

export function scene(params: {
  state: SoundThroughMaterialsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('sound-through-materials: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tau = travelTime(tl);
  const alpha = markOpacity(tl);
  const L = c.laneLength;
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const tool = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const sound = { colorRole: 'accent', emphasis: 'strong' } as const;
  const out: Primitive[] = [];

  for (const lane of lanes(c)) {
    const y0 = LANE_Y[lane.id];

    // ---- 통 ----
    // 진공 통은 점선 — 벽은 있으나 속이 비었다.
    out.push({
      type: 'trajectory',
      id: `tube-${lane.id}`,
      points: [
        [0, y0 - LANE_HALF],
        [L, y0 - LANE_HALF],
        [L, y0 + LANE_HALF],
        [0, y0 + LANE_HALF],
      ],
      closed: true,
      width: TUBE_WIDTH_PX,
      style: { ...muted, lineStyle: lane.speed === null ? 'dashed' : 'solid' },
    });

    // ---- 알갱이 ----
    // 떨림 덩어리가 지나는 자리의 알갱이만 오른쪽으로 밀렸다 돌아온다. 흐려지는 단계에서는 밀림이 잦아든다.
    if (lane.speed !== null) {
      const xc = pulseCenter(lane.speed, tau, c);
      const rest = restPositions(lane, c);
      const pos: Vec2[] = [];
      const shaken: Vec2[] = [];
      const shakenOpacity: number[] = [];
      for (const [x, y] of rest) {
        const u = alpha * displacement(x, xc, c);
        pos.push([x + u, y]);
        const share = u / c.amplitude;
        if (share > SHAKEN_FLOOR) {
          shaken.push([x + u, y]);
          shakenOpacity.push(share);
        }
      }
      out.push({
        type: 'particleSystem',
        id: `particles-${lane.id}`,
        positions: pos,
        sizes: PARTICLE_PX,
        opacity: PARTICLE_OPACITY,
        style: ink,
      });
      // 강조색 — 지금 떨고 있는 알갱이. 떨림 덩어리가 통을 건너가는 것이 이 빛의 이동으로 보인다.
      out.push({
        type: 'particleSystem',
        id: `shaken-${lane.id}`,
        positions: shaken,
        sizes: SHAKEN_PX,
        opacities: shakenOpacity,
        style: sound,
      });
    }

    // ---- 듣는 곳 ----
    // 떨림이 통 끝에 닿으면 켜져서 결과 동안 켜진 채로 남는다. 진공 통의 것은 끝까지 꺼져 있다.
    const lit = arrived(lane, tau, c);
    const earPos: Vec2 = [L + EAR_GAP, y0];
    out.push({
      type: 'body',
      id: `ear-${lane.id}`,
      pos: earPos,
      shape: 'circle',
      size: EAR_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: EAR_OFF_OPACITY,
      style: muted,
    });
    if (lit && alpha > 0) {
      out.push({
        type: 'body',
        id: `ear-lit-${lane.id}`,
        pos: earPos,
        shape: 'circle',
        size: EAR_R,
        glow: false,
        outline: 'none',
        opacity: alpha,
        style: sound,
      });
    }

    // ---- 이름표 ----
    const label = laneLabel(lane);
    out.push({
      type: 'readout',
      id: `label-${lane.id}`,
      anchor: { world: [LABEL_X, y0] },
      text: text(label.key),
      ...(label.vars ? { vars: label.vars } : {}),
      chip: false,
      font: 'text',
      align: 'left',
      fontSize: LABEL_PX,
      style: muted,
    });
  }

  // ---- 「듣는 곳」 이름표 ----
  out.push({
    type: 'readout',
    id: 'ear-label',
    anchor: { world: [L + EAR_GAP, EAR_LABEL_Y] },
    text: text('label.ear'),
    chip: false,
    font: 'text',
    fontSize: EAR_LABEL_PX,
    style: muted,
  });

  // ---- 판 ----
  // 네 통의 왼쪽 끝이 모두 이 판에 붙어 있다 — 한 번 두드리면 넷이 같은 떨림을 받는다.
  const top = LANE_Y.steel + LANE_HALF + PLATE_OVERHANG;
  const bottom = LANE_Y.vacuum - LANE_HALF - PLATE_OVERHANG;
  out.push({
    type: 'body',
    id: 'plate',
    pos: [-PLATE_W / 2, (top + bottom) / 2],
    shape: 'rect',
    size: [PLATE_W, top - bottom],
    glow: false,
    style: ink,
  });

  // ---- 망치 ----
  // `strike` 동안 다가와 판을 치고, `recoil` 동안 출발 자리로 물러난다.
  const strike = tl.at('strike');
  const back = tl.at('recoil');
  const contact: Vec2 = [-PLATE_W - MALLET_R, MALLET_HIT_Y];
  const head: Vec2 =
    back > 0
      ? [lerp(contact[0], MALLET_START[0], back), lerp(contact[1], MALLET_START[1], back)]
      : [lerp(MALLET_START[0], contact[0], strike), lerp(MALLET_START[1], contact[1], strike)];
  const hl = Math.hypot(MALLET_HANDLE[0], MALLET_HANDLE[1]);
  out.push({
    type: 'trajectory',
    id: 'mallet-handle',
    points: [
      [head[0] + (MALLET_HANDLE[0] / hl) * MALLET_R, head[1] + (MALLET_HANDLE[1] / hl) * MALLET_R],
      [head[0] + MALLET_HANDLE[0], head[1] + MALLET_HANDLE[1]],
    ],
    width: MALLET_HANDLE_PX,
    style: tool,
  });
  out.push({
    type: 'body',
    id: 'mallet-head',
    pos: head,
    shape: 'circle',
    size: MALLET_R,
    glow: false,
    style: tool,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
