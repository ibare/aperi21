// ========================================================================
// electron-diffraction — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 전자총 · 박막 · 옆모습 스크린
// (body rect) · 빔 속 전자(particleSystem) · 회절 원뿔(lineSet) · 정면 스크린(body circle,
// 빛 없음) · 잔광 점(particleSystem, 빛 + 더하기) · 처음 고리 자리(trajectory 점선) ·
// 이름표(readout)가 모두 표준 어휘다.
//
// 색은 뜻마다 하나다 — 장치는 먹색, 빔 속 전자와 회절 원뿔은 primary(같은 전자다),
// 스크린의 빛은 테마와 무관한 **빛 채널**(형광은 빛이다), 처음 자리 점선 · 잇는 선은 muted.
// 강조색은 쓰지 않는다 — 좁아지는 것은 색이 아니라 반지름으로 보인다.
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
import { beamTravel, readConstants, ringRadiiLow, ringRadiiNow, screenDots } from './physics';
import {
  BEAM_GAP,
  FACE_X,
  FOIL_H,
  FOIL_W,
  FOIL_X,
  GUN_H,
  GUN_W,
  GUN_X,
  SCENE_BOUNDS,
  SCREEN_R,
  SIDE_SCREEN_W,
  SIDE_SCREEN_X,
  text,
} from './schema';
import type { ElectronDiffractionState } from './state';

/** 처음 고리 자리 점선 원의 표본 수. */
const GUIDE_SAMPLES = 160;
/** 잔광 점의 반지름(화면 px). */
const DOT_PX = 1.5;
/** 빔 속 전자의 반지름(화면 px). */
const BEAM_DOT_PX = 2.2;
/** 회절 원뿔 선 굵기(화면 px) · 짙기. 스크린의 고리보다 뒤로 물러나 있어야 한다. */
const CONE_WIDTH_PX = 1.2;
const CONE_OPACITY = 0.5;
/** 빔 길(전자총 → 박막) 선 굵기 · 짙기. */
const BEAM_PATH_WIDTH_PX = 1;
const BEAM_PATH_OPACITY = 0.35;
/** 처음 고리 자리 점선 굵기 · 짙기. */
const GUIDE_WIDTH_PX = 1.2;
const GUIDE_OPACITY = 0.9;
/** 옆모습 스크린과 정면 스크린의 위아래 끝을 잇는 선의 굵기 · 짙기. */
const LINK_WIDTH_PX = 1;
const LINK_OPACITY = 0.45;
/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 13;
/** 이름표를 물체에서 띄우는 거리(월드). */
const LABEL_GAP = 0.42;

/** 원 한 바퀴 표본(G28). */
function circlePoints(center: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < GUIDE_SAMPLES; i++) {
    const a = (2 * Math.PI * i) / GUIDE_SAMPLES;
    pts.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)]);
  }
  return pts;
}

export function scene(params: {
  state: ElectronDiffractionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('electron-diffraction: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const out: Primitive[] = [];
  const face: Vec2 = [FACE_X, 0];

  // ---- 빔 길과 빔 속 전자 (전자총 → 박막) ----
  // 전자의 빠르기가 흐름의 빠르기로 보인다. 전압이 다섯 배면 √5 배로 흐른다.
  const beamStart = GUN_X + GUN_W / 2;
  const beamEnd = FOIL_X - FOIL_W / 2;
  out.push({
    type: 'trajectory',
    id: 'beam-path',
    points: [
      [beamStart, 0],
      [SIDE_SCREEN_X, 0],
    ],
    width: BEAM_PATH_WIDTH_PX,
    opacity: BEAM_PATH_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
  const beamLen = beamEnd - beamStart;
  const count = Math.floor(beamLen / BEAM_GAP);
  const wrap = count * BEAM_GAP;
  const shift = beamTravel(tl, c) * c.beamFlow;
  const beam: Vec2[] = [];
  for (let i = 0; i < count; i++) {
    const s = (((i * BEAM_GAP + shift) % wrap) + wrap) % wrap;
    beam.push([beamStart + s, 0]);
  }
  out.push({
    type: 'particleSystem',
    id: 'beam-electrons',
    positions: beam,
    sizes: BEAM_DOT_PX,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 회절 원뿔 (박막 → 옆모습 스크린) ----
  // 지금 전압의 두 고리 높이로 간다. 정면 스크린의 고리와 같은 높이에서 만난다.
  const [r1, r2] = ringRadiiNow(tl, c);
  const cone: Vec2[][] = [];
  for (const r of [r1, r2]) {
    if (!(r < SCREEN_R)) continue;
    cone.push([
      [FOIL_X, 0],
      [SIDE_SCREEN_X, r],
    ]);
    cone.push([
      [FOIL_X, 0],
      [SIDE_SCREEN_X, -r],
    ]);
  }
  out.push({
    type: 'lineSet',
    id: 'cones',
    lines: cone,
    width: CONE_WIDTH_PX,
    opacity: CONE_OPACITY,
    style: { colorRole: 'primary', emphasis: 'strong' },
  });

  // ---- 장치: 전자총 · 박막 · 옆모습 스크린 ----
  out.push({
    type: 'body',
    id: 'gun',
    pos: [GUN_X, 0],
    shape: 'rect',
    size: [GUN_W, GUN_H],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'foil',
    pos: [FOIL_X, 0],
    shape: 'rect',
    size: [FOIL_W, FOIL_H],
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'side-screen',
    pos: [SIDE_SCREEN_X, 0],
    shape: 'rect',
    size: [SIDE_SCREEN_W, SCREEN_R * 2],
    light: 0,
    outline: 'line',
  });

  // 옆모습 스크린의 위아래 끝과 정면 스크린의 위아래 끝을 잇는다 — 같은 스크린이다.
  for (const sgn of [1, -1]) {
    out.push({
      type: 'trajectory',
      id: `link-${sgn > 0 ? 'top' : 'bottom'}`,
      points: [
        [SIDE_SCREEN_X + SIDE_SCREEN_W / 2, sgn * SCREEN_R],
        [FACE_X, sgn * SCREEN_R],
      ],
      width: LINK_WIDTH_PX,
      opacity: LINK_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    });
  }

  // ---- 정면 스크린: 빛 없음 원판 위의 잔광 점 ----
  out.push({
    type: 'body',
    id: 'face-screen',
    pos: face,
    shape: 'circle',
    size: SCREEN_R,
    light: 0,
    glow: false,
    outline: 'line',
  });
  const dots = screenDots(tl, c, SCREEN_R);
  out.push({
    type: 'particleSystem',
    id: 'glow-dots',
    positions: dots.offsets.map(([x, y]) => [face[0] + x, face[1] + y] as Vec2),
    opacities: dots.opacities,
    sizes: DOT_PX,
    light: c.dotLight,
    blend: 'add',
  });

  // 처음 고리 자리. 전압을 올리기 시작한 뒤부터 둔다 — 처음에는 고리 그 자체라 겹쳐 가린다.
  if (tl.phase !== 'low') {
    const [g1, g2] = ringRadiiLow(c);
    for (const [i, r] of [g1, g2].entries()) {
      if (!(r < SCREEN_R)) continue;
      out.push({
        type: 'trajectory',
        id: `first-ring-${i}`,
        points: circlePoints(face, r),
        closed: true,
        width: GUIDE_WIDTH_PX,
        opacity: GUIDE_OPACITY,
        style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
      });
    }
  }

  // ---- 이름표 ----
  const label = (id: string, pos: Vec2, key: Parameters<typeof text>[0]): void => {
    out.push({
      type: 'readout',
      id,
      anchor: { world: pos },
      text: text(key),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  };
  label('gun-label', [GUN_X, -GUN_H / 2 - LABEL_GAP], 'label.gun');
  label('foil-label', [FOIL_X, FOIL_H / 2 + LABEL_GAP], 'label.foil');
  label('screen-label', [FACE_X, -SCREEN_R - LABEL_GAP], 'label.screen');

  // 가속 전압은 정박값에 있을 때만 쓴다 — 오르는 중에 `10 kV` 가 붙어 있으면 거짓이다.
  if (tl.phase === 'low' || tl.phase === 'high') {
    out.push({
      type: 'readout',
      id: 'voltage',
      anchor: { world: [GUN_X, GUN_H / 2 + LABEL_GAP] },
      text: text('label.voltage'),
      vars: { v: String(tl.phase === 'high' ? c.voltageHighKv : c.voltageLowKv) },
      chip: false,
      font: 'mono',
      fontSize: LABEL_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
