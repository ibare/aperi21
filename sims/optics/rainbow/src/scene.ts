// ========================================================================
// rainbow — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 왼쪽 — 빛 없음 판(`region` `light: 0`) 위의 큰 물방울 하나. 나란한 햇빛은 빛 채널의 흰빛, 물방울 속
// 경로와 나가는 줄기는 파장의 빛 색(`wavelengthToLinearRgb`)이다. 흰빛은 라이트 바탕에서 사라지므로(G92)
// 두 테마에서 같은 어두운 판을 깐다. 줄기는 겹치는 곳에서 더해진다(`blend: 'add'`) — 줄기가 몰린
// 42° · 40° 둘레가 더 짙게 보인다.
//
// 오른쪽 — 해를 등진 하늘의 옆모습. 눈에서 본 높이각이 빨강 · 보라가 몰리는 각 사이에 드는 물방울만
// 그 각에 몰리는 파장의 빛 색으로 빛나고, 그 색 선이 눈으로 모인다.
// 색은 대상을 가르는 역할 색이 아니라 빛 자체의 색이다(물리량).
// ========================================================================

import type { Bounds, EnvironmentDef, Primitive, Readout, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import {
  bowAngle,
  derive,
  descartesHeight,
  nmForBowAngle,
  partial,
  rayHeights,
  shownIndex,
  readConstants,
  skyDrops,
  toCircle,
  tracePath,
} from './physics';
import {
  ARC_R,
  EYE,
  IN_START_X,
  LABEL_BOTTOM_Y,
  LABEL_TOP_Y,
  PANEL_DROP,
  PANEL_SKY,
  SCENE_BOUNDS,
  SKY_CLOUD,
  text,
  type RainbowMessageKey,
} from './schema';
import type { RainbowState } from './state';

/** 선 굵기(화면 px) — 햇빛 줄기 · 색 경로 · 물방울 테 · 각 호 · 각 눈금 · 땅 · 기준선 · 짚은 줄기 · 띠 선. */
const SUN_WIDTH_PX = 1.6;
const PATH_WIDTH_PX = 1.4;
const RIM_WIDTH_PX = 1.5;
const ARC_WIDTH_PX = 1.2;
const TICK_WIDTH_PX = 3;
const GROUND_WIDTH_PX = 1.2;
const GUIDE_WIDTH_PX = 1;
const SKY_RAY_WIDTH_PX = 2.2;
const BAND_LINE_WIDTH_PX = 1;
/** 판 위 빛의 세기 — 물방울 속 · 물방울 테 · 기준선 · 땅 · 하늘 햇빛 · 눈 · 흐린 물방울. 판이 빛 없음이라 두 테마에서 같다. */
const DROP_FILL_LIGHT = 0.04;
const DROP_RIM_LIGHT = 0.4;
const GUIDE_LIGHT = 0.45;
const GROUND_LIGHT = 0.3;
const SKY_SUN_LIGHT = 0.35;
const EYE_LIGHT = 0.9;
const DIM_DROP_LIGHT = 0.22;
/** 불투명도 — 띠 선 · 보라가 자란 뒤 옅어진 빨강 줄기. */
const BAND_LINE_OPACITY = 0.45;
const RED_DIM_OPACITY = 0.3;
/** 글자 크기(화면 px) — 판 밖 이름표 · 판 위 각 칩. */
const LABEL_PX = 13;
const DEG_PX = 12;
/** 글자 띄움(화면 px) — 판 밖 이름표와 판 가장자리 사이. 짚은 물방울 옆 각 칩을 옆 · 위아래로 띄우는 거리. */
const LABEL_GAP_PX = 12;
const DEG_SIDE_PX = 26;
const DEG_LIFT_PX = 14;
/** 각 호 — 눈금의 반길이 · 칩을 호 바깥으로 띄우는 거리(월드), 두 칩이 겹치지 않게 호를 따라 비켜 두는 각(°). */
const TICK_HALF = 0.14;
const DEG_GAP_R = 0.36;
const DEG_SHIFT_DEG = 5;
/** 반지름(월드) — 호 위 줄기 끝 점 · 하늘 물방울 · 짚은 물방울 · 눈. */
const END_DOT_R = 0.045;
const SKY_DROP_R = 0.035;
const PICK_DROP_R = 0.06;
const EYE_R = 0.09;
/** 땅을 눈 아래로 내린 거리(월드). */
const GROUND_DROP = 0.14;
/** 물방울 테를 표본하는 점 수 (원 윤곽 어휘가 빛 채널로 없다 — G28). */
const RIM_SAMPLES = 72;

const WHITE = 1;

function rect(b: { minX: number; maxX: number; minY: number; maxY: number }): Vec2[] {
  return [
    [b.minX, b.minY],
    [b.maxX, b.minY],
    [b.maxX, b.maxY],
    [b.minX, b.maxY],
  ];
}

function circle(r: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < RIM_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / RIM_SAMPLES;
    out.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return out;
}

function label(
  id: string,
  key: RainbowMessageKey,
  world: Vec2,
  opts: { vars?: Record<string, string>; offset?: Vec2; align?: Readout['align']; size?: number; chip?: boolean; opacity?: number; role?: 'ink' | 'muted' },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, ...(opts.offset ? { offset: opts.offset } : {}) },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: opts.chip ?? false,
    font: 'text',
    align: opts.align ?? 'left',
    fontSize: opts.size ?? LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

const rgbOf = (nm: number) => ({ rgb: wavelengthToLinearRgb(nm) });

const DEG = Math.PI / 180;

/**
 * 호 위 눈금 하나 — 몰리는 각 자리에 그 색의 짧은 눈금, 호 바깥에 각 칩. `shift` 만큼 호를 따라 비켜
 * 칩끼리 겹치지 않게 한다(눈금은 제자리).
 */
function arcTick(
  g: Primitive[],
  tag: 'red' | 'violet',
  center: Vec2,
  theta: number,
  nm: number,
  degText: string,
  shift: number,
  opacity: number,
): void {
  if (opacity <= 0) return;
  const dir: Vec2 = [-Math.cos(theta), -Math.sin(theta)];
  const at = (rr: number): Vec2 => [center[0] + dir[0] * rr, center[1] + dir[1] * rr];
  g.push({
    type: 'trajectory',
    id: `tick-${tag}`,
    points: [at(ARC_R - TICK_HALF), at(ARC_R + TICK_HALF)],
    width: TICK_WIDTH_PX,
    light: rgbOf(nm),
    opacity,
  });
  const a = theta + shift;
  const rr = ARC_R + DEG_GAP_R;
  g.push(
    label(`deg-${tag}`, 'label.deg', [center[0] - Math.cos(a) * rr, center[1] - Math.sin(a) * rr], {
      vars: { d: degText },
      align: 'center',
      size: DEG_PX,
      chip: true,
      opacity,
    }),
  );
}

export function scene(params: {
  state: RainbowState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('rainbow: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline);
  const g: Primitive[] = [];
  const vis = r.visible;

  // ================= 왼쪽 — 물방울 하나 =================

  g.push({ type: 'region', id: 'panel-drop', points: rect(PANEL_DROP), fillOpacity: 1, light: 0 });
  g.push({ type: 'region', id: 'drop', points: circle(c.dropRadius), fillOpacity: 1, light: DROP_FILL_LIGHT });
  g.push({
    type: 'trajectory',
    id: 'drop-rim',
    points: circle(c.dropRadius),
    closed: true,
    width: RIM_WIDTH_PX,
    light: DROP_RIM_LIGHT,
  });

  const heights = rayHeights(c);
  // 보라가 자라는 동안 빨강 줄기가 옅어진다 — 더해진 두 색이 자홍 한 다발로 섞이지 않게.
  const colours: { tag: 'red' | 'violet'; nm: number; grow: number; mark: number; opacity: number }[] = [
    { tag: 'red', nm: c.nmRed, grow: r.redPath, mark: r.redMark, opacity: 1 - r.violetPath * (1 - RED_DIM_OPACITY) },
    { tag: 'violet', nm: c.nmViolet, grow: r.violetPath, mark: r.violetMark, opacity: 1 },
  ];
  // 각 호의 중심 — 빨강 데카르트 줄기가 나오는 점. 나가는 줄기는 이 호까지 긋는다.
  const arcCenter = tracePath(c, c.nRed, descartesHeight(c, c.nRed), IN_START_X).exit;

  // ---- 나란한 햇빛 — 물방울 표면까지 자란다 ----
  if (r.sunIn > 0 && vis > 0) {
    heights.forEach((b, k) => {
      const p = tracePath(c, c.nRed, b, IN_START_X);
      g.push({
        type: 'trajectory',
        id: `sun-${k}`,
        points: partial([p.points[0]!, p.points[1]!], r.sunIn),
        width: SUN_WIDTH_PX,
        light: WHITE,
        opacity: vis,
      });
    });
  }

  // ---- 물방울 속 경로와 나가는 줄기 — 빨강 먼저, 보라가 뒤따른다. 줄기 끝은 각 호 위에 쌓인다 ----
  for (const col of colours) {
    if (col.grow <= 0 || vis <= 0) continue;
    const n = shownIndex(c, col.nm);
    heights.forEach((b, k) => {
      const p = tracePath(c, n, b, IN_START_X);
      const end = toCircle(p.exit, p.out, arcCenter, ARC_R);
      g.push({
        type: 'trajectory',
        id: `path-${col.tag}-${k}`,
        points: partial([...p.points.slice(1), end], col.grow),
        width: PATH_WIDTH_PX,
        light: rgbOf(col.nm),
        blend: 'add',
        opacity: vis * col.opacity,
      });
      // 줄기 끝 — 호 위의 점. 몰린 자리에서 점이 겹겹이 쌓인다. 각 호가 설 때 함께 나타난다.
      if (col.mark > 0) {
        g.push({
          type: 'body',
          id: `end-${col.tag}-${k}`,
          pos: end,
          shape: 'circle',
          size: END_DOT_R,
          glow: false,
          outline: 'none',
          light: rgbOf(col.nm),
          opacity: vis * col.mark,
        });
      }
    });
  }

  // ---- 각 호 — 해 쪽 기준선에서 빨강이 몰린 방향까지 쓸고 나간다. 눈금 · 칩은 몰리는 각 자리 ----
  const thetaRed = bowAngle(shownIndex(c, c.nmRed));
  const thetaViolet = bowAngle(shownIndex(c, c.nmViolet));
  const markOpacity = r.redMark * vis;
  if (markOpacity > 0) {
    g.push({
      type: 'trajectory',
      id: 'sun-back',
      points: [arcCenter, [arcCenter[0] - ARC_R, arcCenter[1]]],
      width: GUIDE_WIDTH_PX,
      light: GUIDE_LIGHT,
      opacity: markOpacity,
      style: { lineStyle: 'dashed' },
    });
    g.push({
      type: 'sector',
      id: 'bow-arc',
      center: arcCenter,
      radius: ARC_R,
      from: Math.PI,
      to: Math.PI + thetaRed * r.redMark,
      fillOpacity: 0,
      rimWidth: ARC_WIDTH_PX,
      light: GUIDE_LIGHT,
      opacity: vis,
    });
  }
  arcTick(g, 'red', arcCenter, thetaRed, c.nmRed, state.redDegText, DEG_SHIFT_DEG * DEG, markOpacity);
  arcTick(g, 'violet', arcCenter, thetaViolet, c.nmViolet, state.violetDegText, -DEG_SHIFT_DEG * DEG, r.violetMark * vis);

  // ---- 판 밖 이름표 ----
  g.push(label('name-sun-drop', 'label.sunlight', [PANEL_DROP.minX, LABEL_TOP_Y], { offset: [0, -LABEL_GAP_PX], role: 'muted' }));
  g.push(
    label('name-drop', 'label.drop', [(PANEL_DROP.minX + PANEL_DROP.maxX) / 2, LABEL_BOTTOM_Y], {
      offset: [0, LABEL_GAP_PX],
      align: 'center',
      role: 'muted',
    }),
  );

  // ================= 오른쪽 — 해를 등진 하늘 =================

  g.push({ type: 'region', id: 'panel-sky', points: rect(PANEL_SKY), fillOpacity: 1, light: 0 });
  const eye: Vec2 = [EYE[0], EYE[1]];
  g.push({
    type: 'trajectory',
    id: 'ground',
    points: [
      [PANEL_SKY.minX, eye[1] - GROUND_DROP],
      [PANEL_SKY.maxX, eye[1] - GROUND_DROP],
    ],
    width: GROUND_WIDTH_PX,
    light: GROUND_LIGHT,
  });
  g.push({ type: 'body', id: 'eye', pos: eye, shape: 'circle', size: EYE_R, glow: false, outline: 'none', light: EYE_LIGHT });

  const skyOpacity = r.sky * vis;
  const pickAt = (theta: number): Vec2 => [eye[0] + c.skyDistance * Math.cos(theta), eye[1] + c.skyDistance * Math.sin(theta)];
  const picks: { tag: 'red' | 'violet'; nm: number; pos: Vec2; degText: string; side: Vec2 }[] = [
    { tag: 'red', nm: c.nmRed, pos: pickAt(thetaRed), degText: state.redDegText, side: [-DEG_SIDE_PX, -DEG_LIFT_PX] },
    { tag: 'violet', nm: c.nmViolet, pos: pickAt(thetaViolet), degText: state.violetDegText, side: [DEG_SIDE_PX, DEG_LIFT_PX] },
  ];

  if (skyOpacity > 0) {
    // ---- 해 쪽을 등진 방향 — 눈에서 수평으로 ----
    g.push({
      type: 'trajectory',
      id: 'anti-sun',
      points: [eye, [PANEL_SKY.maxX, eye[1]]],
      width: GUIDE_WIDTH_PX,
      light: GUIDE_LIGHT,
      opacity: skyOpacity,
      style: { lineStyle: 'dashed' },
    });

    // ---- 하늘 물방울 — 시드로 흩뿌린 자리. 햇빛을 받아 흐리게 보인다 ----
    const drops = skyDrops(c, SKY_CLOUD);
    drops.forEach((pos, k) => {
      g.push({ type: 'body', id: `sky-drop-${k}`, pos, shape: 'circle', size: SKY_DROP_R, glow: false, outline: 'none', light: DIM_DROP_LIGHT, opacity: skyOpacity });
    });

    // ---- 짚은 두 물방울에 닿는 햇빛 ----
    for (const pk of picks) {
      g.push({
        type: 'trajectory',
        id: `sky-sun-${pk.tag}`,
        points: [[PANEL_SKY.minX, pk.pos[1]], pk.pos],
        width: GUIDE_WIDTH_PX,
        light: SKY_SUN_LIGHT,
        opacity: skyOpacity,
      });
      g.push({ type: 'body', id: `pick-${pk.tag}`, pos: pk.pos, shape: 'circle', size: PICK_DROP_R, glow: false, outline: 'none', light: DIM_DROP_LIGHT, opacity: skyOpacity });
    }

    // ---- 띠 — 몰리는 각 사이 높이의 물방울이 그 각의 색으로 빛나고, 색 선이 눈으로 모인다 ----
    const bandOpacity = r.band * vis;
    if (bandOpacity > 0) {
      drops.forEach((pos, k) => {
        const elev = Math.atan2(pos[1] - eye[1], pos[0] - eye[0]);
        if (elev < thetaViolet || elev > thetaRed) return;
        const nm = nmForBowAngle(c, elev);
        g.push({
          type: 'trajectory',
          id: `band-line-${k}`,
          points: [pos, eye],
          width: BAND_LINE_WIDTH_PX,
          light: rgbOf(nm),
          blend: 'add',
          opacity: bandOpacity * BAND_LINE_OPACITY,
        });
        g.push({ type: 'body', id: `band-drop-${k}`, pos, shape: 'circle', size: SKY_DROP_R, glow: false, outline: 'none', light: rgbOf(nm), opacity: bandOpacity });
      });
    }

    // ---- 짚은 두 물방울 — 제 색으로 빛나고, 그 색 줄기가 눈까지 자란다 ----
    const rayOpacity = r.skyRays * vis;
    if (rayOpacity > 0) {
      for (const pk of picks) {
        g.push({
          type: 'trajectory',
          id: `sky-ray-${pk.tag}`,
          points: partial([pk.pos, eye], r.skyRays),
          width: SKY_RAY_WIDTH_PX,
          light: rgbOf(pk.nm),
          blend: 'add',
          opacity: vis,
        });
        g.push({ type: 'body', id: `pick-lit-${pk.tag}`, pos: pk.pos, shape: 'circle', size: PICK_DROP_R, glow: false, outline: 'none', light: rgbOf(pk.nm), opacity: rayOpacity });
        g.push(
          label(`sky-deg-${pk.tag}`, 'label.deg', pk.pos, {
            vars: { d: pk.degText },
            offset: pk.side,
            align: 'center',
            size: DEG_PX,
            chip: true,
            opacity: rayOpacity,
          }),
        );
      }
    }
  }

  // ---- 판 밖 이름표 ----
  g.push(label('name-sun-sky', 'label.sunlight', [PANEL_SKY.minX, LABEL_TOP_Y], { offset: [0, -LABEL_GAP_PX], role: 'muted' }));
  g.push(label('name-sky', 'label.sky', [PANEL_SKY.maxX, LABEL_TOP_Y], { offset: [0, -LABEL_GAP_PX], align: 'right', role: 'muted' }));
  g.push(
    label('gain', 'label.gain', [PANEL_SKY.maxX, LABEL_BOTTOM_Y], {
      vars: { k: state.gainText },
      offset: [0, LABEL_GAP_PX],
      align: 'right',
      role: 'muted',
    }),
  );
  g.push(label('name-eye', 'label.eye', [eye[0], LABEL_BOTTOM_Y], { offset: [0, LABEL_GAP_PX], align: 'center', role: 'muted' }));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
