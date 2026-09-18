// ========================================================================
// conservation-of-angular-momentum — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 방금 돈 각(`sector`) · 팔과 벌린 자리(`trajectory`) ·
// 몸통과 손의 추(`body`) · I–ω 판의 축(`trajectory`) · 직사각형(`region`) ·
// 「Iω 그대로」 곡선(`trajectory` 강조 점선) · 이름표(`readout`) 가 모두 표준 어휘다.
//
// 색: 회전체는 먹색(같은 장치), 부채꼴과 직사각형은 보조색(둘 다 「잰 양」),
// 강조색은 **그대로인 양(Iω)** 한 가지 뜻에만 쓴다.
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
import { derive, readConstants } from './physics';
import {
  CORE_RADIUS,
  HAND_RADIUS,
  PANEL_I_AXIS,
  PANEL_I_SCALE,
  PANEL_ORIGIN,
  PANEL_W_AXIS,
  PANEL_W_SCALE,
  SCENE_BOUNDS,
  SWEEP_RADIUS,
  text,
} from './schema';
import type { ConservationOfAngularMomentumState } from './state';

/** 벌린 자리 원 · 곡선을 표본하는 점 수. */
const RING_SAMPLES = 96;
const CURVE_SAMPLES = 72;
/**
 * 「Iω 그대로」 이름표는 곡선의 **위쪽 끝**(판 안 가장 큰 ω)에 붙인다. 모서리는 오므린
 * 때와 벌린 때 사이를 오가므로 그 사이 어디에 붙여도 모서리가 이름표를 지나간다.
 */
const KEPT_LABEL_OFFSET: Vec2 = [10, 4];
const AXIS_I_OFFSET: Vec2 = [10, 0];
const AXIS_W_OFFSET: Vec2 = [0, -12];
const REACH_LABEL_OFFSET: Vec2 = [0, 12];

export function scene(params: {
  state: ConservationOfAngularMomentumState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('conservation-of-angular-momentum: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const measured = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
  const g: Primitive[] = [];

  // ================= 왼쪽 — 위에서 본 회전체 =================

  // 팔을 벌렸을 때 손이 돌던 자리. 오므린 뒤에 「모았다」 가 이 원과의 거리로 읽힌다.
  const ring: Vec2[] = [];
  for (let i = 0; i < RING_SAMPLES; i++) {
    const a = (i / RING_SAMPLES) * Math.PI * 2;
    ring.push([c.reachOut * Math.cos(a), c.reachOut * Math.sin(a)]);
  }
  g.push({
    type: 'trajectory',
    id: 'reach-ring',
    points: ring,
    closed: true,
    width: 1,
    opacity: 0.7,
    style: { ...muted, lineStyle: 'dashed' },
  });
  // 방금 돈 각 — 두 팔 모두. 반지름이 고정이라 넓이가 곧 각이고, 넓어지는 것이 곧
  // 「빨라진다」 다. 숫자로 대신하지 않는다 (S-piece).
  ([0, Math.PI] as const).forEach((shift, i) => {
    g.push({
      type: 'sector',
      id: `swept-${i}`,
      center: [0, 0],
      radius: SWEEP_RADIUS,
      from: r.angleBefore + shift,
      to: r.angle + shift,
      fillOpacity: 0.3,
      rimWidth: 2,
      style: measured,
    });
  });

  // 벌린 자리 이름표 — 부채꼴 테 바깥 아래. 안쪽에 두면 도는 테가 글자를 긋고 지나간다.
  g.push({
    type: 'readout',
    id: 'reach-name',
    anchor: { world: [0, -SWEEP_RADIUS], offset: REACH_LABEL_OFFSET },
    text: text('label.reach'),
    chip: false,
    font: 'text',
    fontSize: 12,
    align: 'center',
    style: muted,
  });

  // 팔 — 손에서 손까지 한 줄.
  const ux = Math.cos(r.angle);
  const uy = Math.sin(r.angle);
  const handA: Vec2 = [r.reach * ux, r.reach * uy];
  const handB: Vec2 = [-r.reach * ux, -r.reach * uy];
  g.push({
    type: 'trajectory',
    id: 'arms',
    points: [handA, handB],
    width: 3,
    style: ink,
  });
  g.push({
    type: 'body',
    id: 'core',
    pos: [0, 0],
    shape: 'circle',
    size: CORE_RADIUS,
    glow: false,
    style: ink,
  });
  [handA, handB].forEach((pos, i) => {
    g.push({
      type: 'body',
      id: `hand-${i}`,
      pos,
      shape: 'circle',
      size: HAND_RADIUS,
      glow: false,
      style: ink,
    });
  });

  // ================= 오른쪽 — I–ω 판 =================
  // 가로 I, 세로 ω 인 직사각형. 넓이가 곧 Iω 다. 눈금 · 수는 두지 않는다 — 재는 것은
  // 값이 아니라 넓이가 그대로인지다.
  const [ox, oy] = PANEL_ORIGIN;
  const toPanel = (I: number, w: number): Vec2 => [ox + I * PANEL_I_SCALE, oy + w * PANEL_W_SCALE];

  const corner = toPanel(r.inertia, r.omega);
  g.push({
    type: 'region',
    id: 'product',
    points: [
      [ox, oy],
      [corner[0], oy],
      corner,
      [ox, corner[1]],
    ],
    fillOpacity: 0.4,
    opaque: true,
    outline: [
      [1, 2],
      [2, 3],
    ],
    style: measured,
  });

  // 축 — 판 원점에서 두 방향.
  g.push({
    type: 'trajectory',
    id: 'axis-i',
    points: [
      [ox, oy],
      [ox + PANEL_I_AXIS, oy],
    ],
    width: 1,
    style: muted,
  });
  g.push({
    type: 'trajectory',
    id: 'axis-w',
    points: [
      [ox, oy],
      [ox, oy + PANEL_W_AXIS],
    ],
    width: 1,
    style: muted,
  });
  g.push({
    type: 'readout',
    id: 'axis-i-name',
    anchor: { world: [ox + PANEL_I_AXIS, oy], offset: AXIS_I_OFFSET },
    text: text('axis.inertia'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: 15,
    align: 'left',
    style: ink,
  });
  g.push({
    type: 'readout',
    id: 'axis-w-name',
    anchor: { world: [ox, oy + PANEL_W_AXIS], offset: AXIS_W_OFFSET },
    text: text('axis.omega'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: 15,
    align: 'center',
    style: ink,
  });

  // 그대로인 양 — Iω = L 곡선. 판 안에 드는 구간만 긋는다.
  const L = r.momentum;
  const iMin = L / (PANEL_W_AXIS / PANEL_W_SCALE);
  const iMax = PANEL_I_AXIS / PANEL_I_SCALE;
  const curve: Vec2[] = [];
  for (let k = 0; k <= CURVE_SAMPLES; k++) {
    // 곡선이 가파른 쪽에 점을 몰아 둔다 — I 를 로그 간격으로.
    const I = iMin * Math.pow(iMax / iMin, k / CURVE_SAMPLES);
    curve.push(toPanel(I, L / I));
  }
  g.push({
    type: 'trajectory',
    id: 'kept-curve',
    points: curve,
    width: 2,
    style: { ...accent, lineStyle: 'dashed' },
  });
  g.push({
    type: 'readout',
    id: 'kept-name',
    anchor: { world: curve[0]!, offset: KEPT_LABEL_OFFSET },
    text: text('label.kept'),
    chip: false,
    font: 'text',
    fontSize: 13,
    align: 'left',
    style: accent,
  });

  // 직사각형의 모서리 — 곡선에 올라탄 점.
  g.push({
    type: 'body',
    id: 'corner',
    pos: corner,
    shape: 'point',
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
