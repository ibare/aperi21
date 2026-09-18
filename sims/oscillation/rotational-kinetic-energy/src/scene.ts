// ========================================================================
// rotational-kinetic-energy — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 바닥 · 비탈 선(surface) ·
// 얼음 면과 거친 면(region) · 칸막이(lineSet) · 고리 테(trajectory closed) · 살
// (lineSet) · 축(body) · 속도(vector) · 오른 높이 막대(dimension) · 막대 글자(readout) ·
// 되돌아선 높이 안내선(trajectory dashed)이 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 고리는 먹색(둘이 같은 대상이라 같은 색), 속도 화살표와 높이
// 막대의 ½mv² 몫은 primary(병진), **강조색은 「회전에 담긴 몫」 한 가지 뜻에만**
// (½Iω² 막대와 그 글자). 바닥 · 비탈 결 · 안내선 · 칸막이는 배경 정보라 muted.
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
  readConstants,
  readHoop,
  sceneOpacity,
  slideHeight,
  type HoopKind,
  type HoopReading,
  type RotationalKineticEnergyConstants,
} from './physics';
import {
  ARROW_GAP,
  ARROW_SCALE,
  DIVIDER_TOP,
  FLOOR_DEPTH,
  FOOT_ROLL_X,
  FOOT_SLIDE_X,
  METER_X,
  PANEL_LEFT,
  PANEL_RIGHT,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { RotationalKineticEnergyState } from './state';

/** 고리 테 · 살 굵기(화면 px). 테가 고리의 질량이 있는 자리라 살보다 굵다. */
const RIM_PX = 3;
const SPOKE_PX = 1.5;
/** 축 원 반지름(월드 m). */
const HUB_R = 0.035;
/** 테를 표본하는 점 수. */
const RIM_POINTS = 72;
/** 살 수. 셋이면 도는 방향이 읽히고 서로 겹치지 않는다. */
const SPOKES = 3;
/** 정점 잔상의 짙기. 지나간 자리라 옅다. */
const GHOST_OPACITY = 0.3;
/** 얼음 면 짙기 · 거친 면 짙기. 바닥의 결이라 옅다. */
const ICE_FILL = 0.16;
const ROUGH_FILL = 0.3;
/** 안내선 · 칸막이 굵기(화면 px). 재는 선 · 경계선이라 가장 가늘게. */
const GUIDE_PX = 1;
/** 높이 막대 글자 크기(화면 px)와 막대에서 띄우는 거리(화면 px). */
const METER_LABEL_PX = 13;
const METER_LABEL_GAP = 8;
/**
 * ½mv² 글자를 그 몫 안 어디에 둘지(아래 끝 0 · 위 끝 1). 가운데보다 올린다 — 되돌아
 * 내려와 바닥을 거꾸로 달리는 고리가 막대 옆을 지나는데, 가운데에 두면 고리 윗부분이
 * 글자를 덮는다.
 */
const TRANSLATIONAL_LABEL_AT = 0.72;
/**
 * 이 아래 높이는 막대로 재지 않는다(m). 너무 짧은 치수선은 끝 표시 둘이 겹쳐 점 하나로
 * 보인다 (장부 G103).
 */
const METER_MIN = 0.05;
/** 속력이 이보다 작으면 화살표를 그리지 않는다(m/s) — 머리만 남은 점이 된다. */
const ARROW_MIN_SPEED = 1.2;

/** 한 판의 선언 — 발치 자리와 그 판의 고리 종류, 면의 결. */
interface Panel {
  kind: HoopKind;
  foot: number;
}

const TWO_PI = Math.PI * 2;

export function scene(params: {
  state: RotationalKineticEnergyState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('rotational-kinetic-energy: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const alpha = sceneOpacity(timeline);
  const h = slideHeight(c);
  const out: Primitive[] = [];

  const panels: Panel[] = [
    { kind: 'slide', foot: FOOT_SLIDE_X },
    { kind: 'roll', foot: FOOT_ROLL_X },
  ];
  const readings = panels.map((p) => readHoop(timeline, p.kind, c));
  const slideReading = readings[0]!;

  // ---- 판: 면의 결 · 바닥선 · 비탈선 ----
  for (const panel of panels) declarePanel(out, panel, c);

  // 두 판을 가르는 칸막이. 오른쪽 고리가 판 왼쪽 끝에서 나타날 때 왼쪽 비탈에서
  // 내려온 것으로 읽히지 않게 한다.
  const dividerX = (FOOT_SLIDE_X + PANEL_RIGHT + FOOT_ROLL_X + PANEL_LEFT) / 2;
  out.push({
    type: 'lineSet',
    id: 'divider',
    lines: [
      [
        [dividerX, -FLOOR_DEPTH],
        [dividerX, DIVIDER_TOP],
      ],
    ],
    width: GUIDE_PX,
    style: { colorRole: 'muted', emphasis: 'subtle' },
  });

  // ---- 미끄러지던 고리가 되돌아선 높이 ----
  // 두 판을 가로질러 긋는다. 바닥선이 하나라 이 선이 곧 「같은 높이」 이고, 구르는
  // 고리가 이 선을 넘어 더 오르는 것이 한눈에 보인다.
  if (slideReading.pastApex) {
    const y = c.radius + h;
    out.push({
      type: 'trajectory',
      id: 'guide-slide-apex',
      points: [
        [FOOT_SLIDE_X + METER_X, y],
        [FOOT_ROLL_X + PANEL_RIGHT, y],
      ],
      width: GUIDE_PX,
      opacity: alpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // ---- 판마다: 높이 막대 · 정점 잔상 · 고리 · 속도 ----
  panels.forEach((panel, i) => {
    const r = readings[i]!;
    declareMeter(out, panel, r, c, alpha);
    if (r.pastApex) {
      declareHoop(out, `${panel.kind}-ghost`, panel, r.apexCenter, r.apexSpin, c, alpha * GHOST_OPACITY);
    }
    declareHoop(out, `${panel.kind}-hoop`, panel, r.center, r.spin, c, alpha);
    declareSpeed(out, panel, r, c, timeline, alpha);
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

/** 판의 좌우 끝 — 움직이는 것은 이 사각형 안에만 그린다 (`clip`). */
function panelClip(panel: Panel): { min: Vec2; max: Vec2 } {
  return {
    min: [panel.foot + PANEL_LEFT, SCENE_BOUNDS.minY],
    max: [panel.foot + PANEL_RIGHT, SCENE_BOUNDS.maxY],
  };
}

/**
 * 면의 결 · 바닥선 · 비탈선. 두 판의 모양이 같다 — 같은 비탈이라는 것이 전제다.
 * 다른 것은 결뿐이다: 얼음(옅은 민 면)과 거친 면(사선). 색을 따로 주면 「다른 종류의
 * 비탈」 로 읽힌다 (S-piece — 색으로 설명하지 않는다).
 */
function declarePanel(out: Primitive[], panel: Panel, c: RotationalKineticEnergyConstants): void {
  const x0 = panel.foot + PANEL_LEFT;
  const xf = panel.foot;
  const x1 = panel.foot + PANEL_RIGHT;
  const top = PANEL_RIGHT * Math.tan(c.slope);
  const rough = panel.kind === 'roll';
  const surface = {
    fill: rough ? ('hatch' as const) : ('solid' as const),
    fillOpacity: rough ? ROUGH_FILL : ICE_FILL,
    style: { colorRole: 'muted' as const, emphasis: 'strong' as const },
  };
  out.push({
    type: 'region',
    id: `${panel.kind}-floor-band`,
    points: [
      [x0, 0],
      [xf, 0],
      [xf, -FLOOR_DEPTH],
      [x0, -FLOOR_DEPTH],
    ],
    ...surface,
  });
  out.push({
    type: 'region',
    id: `${panel.kind}-wedge`,
    points: [
      [xf, -FLOOR_DEPTH],
      [xf, 0],
      [x1, top],
      [x1, -FLOOR_DEPTH],
    ],
    ...surface,
  });
  out.push({
    type: 'surface',
    id: `${panel.kind}-floor`,
    geometry: { kind: 'wall', from: [x0, 0], to: [xf, 0] },
  });
  out.push({
    type: 'surface',
    id: `${panel.kind}-slope`,
    geometry: { kind: 'wall', from: [xf, 0], to: [x1, top] },
  });
}

/**
 * 오른 높이 막대. 바닥 위 중심 높이에서 지금까지 오른 가장 높은 자리까지 선다.
 *
 * 구르는 고리의 막대는 **두 몫으로 나뉘어 함께 자란다** — ½mv² 몫(primary)이 1/(1+k),
 * ½Iω² 몫(강조색)이 k/(1+k). 오르는 동안 속력과 각속도가 함께 줄기 때문이다. 병진 몫을
 * 먼저 다 쓰고 회전 몫을 나중에 쓰는 것처럼 차례로 채우면 없는 순서를 그리는 것이 된다.
 * 정점에서 두 몫은 h · kh 가 되고, 미끄러지던 고리의 막대(½mv² 하나, h)와 나란히 선다.
 */
function declareMeter(
  out: Primitive[],
  panel: Panel,
  r: HoopReading,
  c: RotationalKineticEnergyConstants,
  alpha: number,
): void {
  if (r.risen < METER_MIN) return;
  const x = panel.foot + METER_X;
  const base = c.radius;
  const lin = r.risen / (1 + r.share);
  const mid = base + lin;
  const topY = base + r.risen;

  out.push({
    type: 'dimension',
    id: `${panel.kind}-meter-translational`,
    from: [x, base],
    to: [x, mid],
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  if (r.share > 0 && topY - mid >= METER_MIN / 2) {
    out.push({
      type: 'dimension',
      id: `${panel.kind}-meter-rotational`,
      from: [x, mid],
      to: [x, topY],
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // 글자는 정점을 지난 뒤에만 — 자라는 막대에 붙이면 글자가 따라 미끄러진다.
  if (!r.pastApex) return;
  out.push({
    type: 'readout',
    id: `${panel.kind}-meter-translational-label`,
    anchor: { world: [x, base + lin * TRANSLATIONAL_LABEL_AT], offset: [-METER_LABEL_GAP, 0] },
    text: text('label.translational'),
    chip: false,
    font: 'text',
    italic: true,
    fontSize: METER_LABEL_PX,
    align: 'right',
    opacity: alpha,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  if (r.share > 0) {
    out.push({
      type: 'readout',
      id: `${panel.kind}-meter-rotational-label`,
      anchor: { world: [x, (mid + topY) / 2], offset: [-METER_LABEL_GAP, 0] },
      text: text('label.rotational'),
      chip: false,
      font: 'text',
      italic: true,
      fontSize: METER_LABEL_PX,
      align: 'right',
      opacity: alpha,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
}

/**
 * 고리 — 테 · 살 셋 · 축. 두 고리가 같은 크기 · 같은 색이다. 다른 것은 살이 도느냐
 * 하나뿐이다. 판 밖으로 나간 부분은 그리지 않는다.
 */
function declareHoop(
  out: Primitive[],
  id: string,
  panel: Panel,
  local: Vec2,
  spin: number,
  c: RotationalKineticEnergyConstants,
  opacity: number,
): void {
  const cx = panel.foot + local[0];
  const cy = local[1];
  const R = c.radius;
  const clip = panelClip(panel);
  const style = { colorRole: 'ink' as const, emphasis: 'strong' as const };
  out.push({
    type: 'trajectory',
    id: `${id}-rim`,
    points: Array.from({ length: RIM_POINTS }, (_, i): Vec2 => {
      const a = (i / RIM_POINTS) * TWO_PI;
      return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    }),
    closed: true,
    width: RIM_PX,
    opacity,
    clip,
    style,
  });
  out.push({
    type: 'lineSet',
    id: `${id}-spokes`,
    lines: Array.from({ length: SPOKES }, (_, i): Vec2[] => {
      const a = spin + Math.PI / 2 + (i * TWO_PI) / SPOKES;
      return [
        [cx, cy],
        [cx + R * Math.cos(a), cy + R * Math.sin(a)],
      ];
    }),
    width: SPOKE_PX,
    opacity,
    clip,
    style,
  });
  out.push({
    type: 'body',
    id: `${id}-hub`,
    pos: [cx, cy],
    shape: 'circle',
    size: HUB_R,
    outline: 'none',
    glow: false,
    opacity,
    clip,
    style,
  });
}

/**
 * 속도 화살표. 고리 윗면 위, 지금 있는 길의 방향으로 선다. 길이가 속력에 비례해,
 * 들어오는 동안 두 판의 화살표가 **같은 길이** 로 보이고 비탈에서는 미끄러지는 쪽이
 * 두 배 빨리 줄어든다. 되돌아 내려오는 동안에는 두지 않는다. 기호 `v` 는 속력이 변하지 않는 동안만 붙인다 — 줄어드는
 * 화살표에 `v` 가 남아 있으면 화면과 어긋난다.
 */
function declareSpeed(
  out: Primitive[],
  panel: Panel,
  r: HoopReading,
  c: RotationalKineticEnergyConstants,
  tl: TimelineFrame,
  alpha: number,
): void {
  // 오르는 동안만. 되돌아 내려오는 속도는 주장이 아니고, 그 시간은 막대 · 잔상을 읽는
  // 시간이다 — 거꾸로 달리는 화살표가 막대 글자 위를 지나간다.
  if (r.velocity < ARROW_MIN_SPEED) return;
  const [tx, ty] = r.tangent;
  const n: Vec2 = [-ty, tx];
  const lift = c.radius + ARROW_GAP;
  const len = r.velocity * ARROW_SCALE;
  // 속력이 그대로인 것은 들어오는 동안뿐이다 — 그때만 기호를 붙인다.
  const steady = tl.at('enter') < 1;
  out.push({
    type: 'vector',
    id: `${panel.kind}-speed`,
    from: [panel.foot + r.center[0] + n[0] * lift, r.center[1] + n[1] * lift],
    delta: [tx * len, ty * len],
    label: steady ? text('label.speed') : undefined,
    opacity: alpha,
    clip: panelClip(panel),
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
