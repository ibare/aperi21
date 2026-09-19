// ========================================================================
// rayleigh-scattering — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 왼쪽 그래프 — 축(lineSet) · 1/λ⁴ 곡선(trajectory, 먹색) · 두 막대(region, 빛 채널로 그
// 파장의 색) · 곡선 위 점 둘(body) · 이름표(readout).
// 오른쪽 대기 단면 — 빛 없음 바탕(region `light: 0`) 위에 공기층(흩어진 빛의 옅은 색) ·
// 지면 · 해(흰빛) · 빛 줄기(선분마다 그 자리까지 남은 스펙트럼의 색) · 옆으로 흩어지는
// 획(그 자리에서 흩어진 스펙트럼의 색) · 눈에 닿은 빛 원판.
//
// 빛의 색은 테마 역할이 아니라 물리량이라 모두 `light` 채널이다 (C2). 흰빛이 라이트
// 바탕에서 사라지지 않도록 단면 전체를 빛 없음 바탕 위에 둔다 (G92).
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
  hash01,
  monoLight,
  OBSERVER,
  pathLength,
  readConstants,
  scatteredHue,
  scatteredPower,
  scatterRatio,
  shellY,
  skyLight,
  sunDirection,
  transmittedHue,
} from './physics';
import {
  AXIS_NM,
  BAR_W,
  EYE_DISC_DROP,
  EYE_DISC_R,
  GRAPH_TOP,
  GRAPH_X0,
  GRAPH_X1,
  GRAPH_Y0,
  PANEL_X0,
  PANEL_X1,
  PANEL_Y0,
  PANEL_Y1,
  RATIO_UNIT,
  SCENE_BOUNDS,
  SUN_GAP,
  SUN_R,
  text,
} from './schema';
import type { RayleighScatteringState } from './state';

/** 곡선 표본 간격(nm). */
const CURVE_STEP_NM = 5;
/** 공기층 경계 호의 표본 수. */
const ARC_SAMPLES = 64;
/**
 * 공기 속 빛 줄기를 나누는 선분 하나의 길이(공기층 두께 단위) — 선분마다 남은 빛의 색이 다르다.
 * 길이로 나누므로 긴 길일수록 선분 · 흩어지는 획이 많다.
 */
const SEGMENT_L = 0.34;
/** 선분 하나에서 옆으로 흩어지는 획 수. */
const STUBS_PER_SEGMENT = 2;
/** 흩어지는 획의 길이(월드)와 줄기에 수직인 방향에서 벗어나는 폭(라디안). */
const STUB_LEN = 0.34;
const STUB_SPREAD = 1.1;
/** 획 길이의 최소 몫 — 난수로 이 몫에서 1 사이. */
const STUB_MIN_FRACTION = 0.55;
/** 획 불투명도(들어온 자리 기준). 흩어질 빛이 줄면 함께 옅어진다. */
const STUB_OPACITY = 0.95;
/**
 * 흩어지는 세기 → 획 짙기의 지수. 긴 길 뒤쪽에서는 흩어질 빛이 들어온 자리의 몇 % 뿐이라
 * 그대로 옮기면 획이 사라져 그 색(주황)을 볼 수 없다. 제곱근으로 누그러뜨린다 (NOTES (b)).
 */
const STUB_POWER_EXP = 0.5;

/** 선 굵기(화면 px). */
const AXIS_PX = 1;
const CURVE_PX = 2;
const RAY_PX = 3.5;
const STUB_PX = 2;
/** 축 짙기 — 배경 정보라 물러난다. */
const AXIS_OPACITY = 0.7;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 이름표 띄움(월드). */
const NM_GAP = 0.26;
const RATIO_GAP = 0.3;
/** 파랑 배수 이름표 — 점 오른쪽으로 띄우는 거리 · 들어 올리는 높이(월드). */
const RATIO_SIDE = 0.2;
const RATIO_LIFT = 0.12;
const AXIS_LABEL_GAP = 0.22;
const EYE_LABEL_GAP = 0.3;
/** 곡선 위 점 · 관찰자 점 반지름(월드). */
const DOT_R = 0.08;
const OBSERVER_R = 0.07;
/** 관찰자 점의 빛 — 흰빛보다 한 단 낮춰 해와 구분한다. */
const OBSERVER_LIGHT = 0.85;
/** 지면 채움 짙기. 빛 없음 바탕 위에서 어두운 회색이 된다. */
const EARTH_FILL = 0.5;

const PANEL_CLIP = { min: [PANEL_X0, PANEL_Y0] as Vec2, max: [PANEL_X1, PANEL_Y1] as Vec2 };

export function scene(params: {
  state: RayleighScatteringState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline: tl } = params;
  if (!tl) throw new Error('rayleigh-scattering: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = 1 - tl.at('fade');
  const out: Primitive[] = [];

  // ======================= 왼쪽 — 파장마다 흩어지는 몫 =======================
  const xOf = (nm: number): number => GRAPH_X0 + ((nm - AXIS_NM[0]) / (AXIS_NM[1] - AXIS_NM[0])) * (GRAPH_X1 - GRAPH_X0);
  const yOf = (ratio: number): number => GRAPH_Y0 + ratio * RATIO_UNIT;

  out.push({
    type: 'lineSet',
    id: 'axes',
    lines: [
      [
        [GRAPH_X0, GRAPH_TOP],
        [GRAPH_X0, GRAPH_Y0],
        [GRAPH_X1, GRAPH_Y0],
      ],
    ],
    width: AXIS_PX,
    opacity: AXIS_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'axis-y-label',
    anchor: { world: [GRAPH_X0, GRAPH_TOP + AXIS_LABEL_GAP] },
    text: text('label.axisY'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const curve: Vec2[] = [];
  for (let nm = AXIS_NM[0]; nm <= AXIS_NM[1]; nm += CURVE_STEP_NM) curve.push([xOf(nm), yOf(scatterRatio(nm, c))]);
  out.push({ type: 'trajectory', id: 'curve', points: curve, width: CURVE_PX, style: { colorRole: 'ink', emphasis: 'strong' } });

  const grow = tl.at('grow');
  const bars: { id: string; nm: number; nmText: string; ratioKey: 'label.ratio' | 'label.ratioOne'; side: boolean }[] = [
    { id: 'blue', nm: c.lambdaBlue, nmText: state.blueNm, ratioKey: 'label.ratio', side: true },
    { id: 'red', nm: c.lambdaRed, nmText: state.redNm, ratioKey: 'label.ratioOne', side: false },
  ];
  for (const b of bars) {
    const x = xOf(b.nm);
    const full = scatterRatio(b.nm, c);
    const top = yOf(full * grow);
    if (grow > 0) {
      out.push({
        type: 'region',
        id: `bar-${b.id}`,
        points: [
          [x - BAR_W / 2, GRAPH_Y0],
          [x + BAR_W / 2, GRAPH_Y0],
          [x + BAR_W / 2, top],
          [x - BAR_W / 2, top],
        ],
        fillOpacity: 1,
        light: { rgb: monoLight(b.nm) },
        opacity: alpha,
      });
    }
    // 곡선 위 점 — 막대가 다 자라면 그 끝이 여기에 앉는다.
    out.push({
      type: 'body',
      id: `dot-${b.id}`,
      pos: [x, yOf(full)],
      shape: 'circle',
      size: DOT_R,
      glow: false,
      outline: 'background',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `nm-${b.id}`,
      anchor: { world: [x, GRAPH_Y0 - NM_GAP] },
      text: text('label.nm'),
      vars: { nm: b.nmText },
      chip: false,
      fontSize: LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    if (grow >= 1) {
      out.push({
        type: 'readout',
        id: `ratio-${b.id}`,
        // 파랑은 곡선이 왼쪽 위로 가파르게 솟아 점 바로 위가 곡선과 겹친다 — 점 오른쪽에 둔다.
        anchor: b.side
          ? { world: [x + RATIO_SIDE, yOf(full) + RATIO_LIFT] }
          : { world: [x, yOf(full) + RATIO_GAP] },
        text: text(b.ratioKey),
        vars: { x: state.blueRatio },
        chip: false,
        fontSize: LABEL_PX,
        align: b.side ? 'left' : 'center',
        weight: 'bold',
        opacity: alpha,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    }
  }

  // ======================= 오른쪽 — 대기 단면 =======================
  // 빛 없음 바탕.
  out.push({
    type: 'region',
    id: 'space',
    points: [
      [PANEL_X0, PANEL_Y0],
      [PANEL_X1, PANEL_Y0],
      [PANEL_X1, PANEL_Y1],
      [PANEL_X0, PANEL_Y1],
    ],
    fillOpacity: 1,
    light: 0,
  });

  const R = c.earthRadius;
  const arc = (radius: number): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= ARC_SAMPLES; i++) {
      const x = PANEL_X0 + ((PANEL_X1 - PANEL_X0) * i) / ARC_SAMPLES;
      pts.push([x, Math.max(PANEL_Y0, shellY(x, radius, c))]);
    }
    return pts;
  };
  const ground = arc(R);
  const airTop = arc(R + 1);

  // 공기층 — 흰 햇빛이 흩어진 색을 옅게 깐다. 머리 위 하늘의 색이다.
  out.push({
    type: 'region',
    id: 'air',
    points: [...airTop, ...[...ground].reverse()],
    fillOpacity: 1,
    light: { rgb: skyLight(c) },
  });
  // 지면.
  out.push({
    type: 'region',
    id: 'earth',
    points: [...ground, [PANEL_X1, PANEL_Y0], [PANEL_X0, PANEL_Y0]],
    fillOpacity: EARTH_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 해의 천정각 — 한낮 0 에서 해 질 녘까지 `sink` 진행도를 따라.
  const theta = ((c.sunsetDeg * Math.PI) / 180) * tl.at('sink');
  const d = sunDirection(theta);
  const s = pathLength(theta, c);
  // 관찰자에서 해 쪽으로 잰 **월드** 거리의 자리. 공기 속 길이 ℓ 은 공기층 두께 단위라 `airWorld` 를 곱한다.
  const W = c.airWorld;
  const at = (world: number): Vec2 => [OBSERVER[0] + d[0] * world, OBSERVER[1] + d[1] * world];
  const sunCenter = at(s * W + SUN_GAP + SUN_R);

  // 빛이 내려오는 앞머리 — 해 가장자리에서 잰 월드 거리. `travel` 이 끝나면 줄기 전체가 있다.
  const travel = tl.at('travel');
  const front = travel * (SUN_GAP + pathLength(0, c) * W);
  const whiteLen = Math.min(front, SUN_GAP);
  const airLen = travel >= 1 ? s : Math.max(0, Math.min(s, (front - SUN_GAP) / W));

  // 공기 밖 — 흰빛 그대로.
  if (whiteLen > 0) {
    out.push({
      type: 'trajectory',
      id: 'beam-space',
      points: [at(s * W + SUN_GAP), at(s * W + SUN_GAP - whiteLen)],
      width: RAY_PX,
      light: 1,
      opacity: alpha,
    });
  }

  // 공기 속 — 선분마다 그 자리까지 남은 빛의 색. ℓ 은 들어온 자리에서 잰 길이.
  const segments = Math.ceil(s / SEGMENT_L);
  const segLen = s / segments;
  for (let k = 0; k < segments; k++) {
    const l0 = k * segLen;
    if (l0 >= airLen) break;
    const l1 = Math.min(airLen, l0 + segLen);
    const mid = (l0 + l1) / 2;
    out.push({
      type: 'trajectory',
      id: `beam-${k}`,
      points: [at((s - l0) * W), at((s - l1) * W)],
      width: RAY_PX,
      light: { rgb: transmittedHue(mid, c) },
      opacity: alpha,
    });

    // 옆으로 흩어지는 획 — 앞머리가 지나간 선분에서만. 방향은 (시드, 번호)로 고정.
    if (l1 < l0 + segLen && travel < 1) continue;
    const lc = l0 + segLen / 2;
    const base = at((s - lc) * W);
    const across = Math.atan2(d[1], d[0]) + Math.PI / 2;
    const lines: Vec2[][] = [];
    for (let j = 0; j < STUBS_PER_SEGMENT; j++) {
      const n = k * STUBS_PER_SEGMENT + j;
      const side = j % 2 === 0 ? 0 : Math.PI;
      const ang = across + side + (hash01(c.seed, 2 * n) - 0.5) * STUB_SPREAD;
      const len = STUB_LEN * (STUB_MIN_FRACTION + (1 - STUB_MIN_FRACTION) * hash01(c.seed, 2 * n + 1));
      lines.push([base, [base[0] + Math.cos(ang) * len, base[1] + Math.sin(ang) * len]]);
    }
    out.push({
      type: 'lineSet',
      id: `scatter-${k}`,
      lines,
      width: STUB_PX,
      light: { rgb: scatteredHue(lc, c) },
      opacity: alpha * STUB_OPACITY * Math.pow(scatteredPower(lc, c), STUB_POWER_EXP),
      clip: PANEL_CLIP,
    });
  }

  // 해 — 공기 밖이라 흰빛.
  out.push({
    type: 'body',
    id: 'sun',
    pos: sunCenter,
    shape: 'circle',
    size: SUN_R,
    light: 1,
    glow: true,
    outline: 'none',
    opacity: alpha,
  });

  // 관찰자.
  out.push({
    type: 'body',
    id: 'observer',
    pos: OBSERVER,
    shape: 'circle',
    size: OBSERVER_R,
    light: OBSERVER_LIGHT,
    glow: false,
    outline: 'none',
  });

  // 눈에 닿은 빛 — 줄기가 관찰자에 닿은 뒤. 공기를 끝까지(ℓ = s) 지난 색.
  if (travel >= 1) {
    const disc: Vec2 = [OBSERVER[0], OBSERVER[1] - EYE_DISC_DROP];
    out.push({
      type: 'body',
      id: 'eye-light',
      pos: disc,
      shape: 'circle',
      size: EYE_DISC_R,
      light: { rgb: transmittedHue(s, c) },
      glow: false,
      outline: 'none',
      opacity: alpha,
    });
    out.push({
      type: 'readout',
      id: 'eye-label',
      anchor: { world: [disc[0], disc[1] - EYE_DISC_R - EYE_LABEL_GAP] },
      text: text('label.eye'),
      chip: true,
      font: 'text',
      fontSize: LABEL_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
