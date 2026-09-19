// ========================================================================
// chromatic-aberration — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 두 테마 모두 같은 빛 없음 판(`region` `light: 0`)을 깐다. 흰 줄기는 라이트 바탕에서
//   사라지기 때문이다 (G92). 판 위 렌즈 · 광축 · 안내선도 빛 채널의 낮은 세기로 칠한다.
// - 흰 줄기는 빛 채널의 가득 찬 빛, 색 줄기는 파장의 빛 색(`wavelengthToLinearRgb`)이고
//   겹치는 곳에서 더해진다(`blend: 'add'`) — 렌즈 바로 뒤 세 색이 겹친 자리가 다시 희다.
//   색은 대상을 가르는 역할 색이 아니라 빛 자체의 색이다.
// - 렌즈는 `region` 다각형이다. plugin `opticalElement` 그림은 역할 색이라 어두운 판 위에서
//   라이트 테마에 묻힌다. 줄기는 얇은 렌즈의 근축 그림이라 `traceRay` 없이 초점을 지나는
//   직선으로 긋는다(점과 줄기 교점이 한 계산이다).
// - 스크린 정면 칸 — 스크린에 닿은 빛을 색마다 원판(`body` circle, 더하기)으로 둔다. 원판
//   반지름은 옆모습에서 가장 바깥 줄기가 스크린에 닿은 높이다.
// - 글자는 빛 채널이 없어 판 밖(위 · 아래)에 둔다 (G07).
// ========================================================================

import type { Bounds, EnvironmentDef, Primitive, Readout, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import { colourFoci, derive, heightAt, rayHeights, readConstants } from './physics';
import {
  AXIS_FROM_X,
  AXIS_TO_X,
  FACE_CENTER,
  FACE_HALF,
  FACE_MIN_R,
  FOCUS_DOT_R,
  LENS_HALF,
  LENS_THICKNESS,
  PANEL,
  RAY_START_X,
  SCENE_BOUNDS,
  SCREEN_HALF,
  SCREEN_HALF_WIDTH,
  text,
  type ChromaticAberrationMessageKey,
} from './schema';
import type { ChromaticAberrationState } from './state';

/** 선 굵기(화면 px) — 흰 줄기 · 색 줄기 · 렌즈 테 · 광축 · 초점 안내선. */
const WHITE_WIDTH_PX = 2.5;
const COLOUR_WIDTH_PX = 2;
const LENS_EDGE_WIDTH_PX = 1.5;
const AXIS_WIDTH_PX = 1;
const GUIDE_WIDTH_PX = 1;
/** 판 위 빛의 세기 — 렌즈 유리 · 렌즈 테 · 광축 · 초점 안내선 · 스크린 · 정면 칸. 판이 빛 없음이라 두 테마에서 같다. */
const LENS_FILL_LIGHT = 0.06;
const LENS_EDGE_LIGHT = 0.45;
const AXIS_LIGHT = 0.3;
const GUIDE_LIGHT = 0.35;
const SCREEN_LIGHT = 0.6;
const FACE_LIGHT = 0.012;
/** 글자 크기(화면 px) — 도식 이름표 · 과장 배율. */
const LABEL_PX = 12;
const NOTE_PX = 12;
/** 글자 띄움(화면 px) — 판 아래로 내림 · 판 위로 올림. */
const LABEL_DROP_PX = 14;
const LABEL_LIFT_PX = 12;
/** 렌즈 한쪽 면을 자르는 마디 수 (곡선 어휘가 없다 — G28). */
const LENS_SAMPLES = 24;

function rect(minX: number, maxX: number, minY: number, maxY: number): Vec2[] {
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ];
}

function label(
  id: string,
  key: ChromaticAberrationMessageKey,
  world: Vec2,
  opts: { offset: Vec2; align: Readout['align']; opacity?: number; vars?: Record<string, string>; size?: number; role?: 'ink' | 'muted' },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, offset: opts.offset },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: false,
    font: 'text',
    align: opts.align,
    fontSize: opts.size ?? LABEL_PX,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
  };
}

/** 얇은 양볼록 렌즈 윤곽 — 가운데 두께에서 가장자리 0 으로 줄어드는 두 면. */
function lensOutline(): Vec2[] {
  const half = LENS_THICKNESS / 2;
  const pts: Vec2[] = [];
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = LENS_HALF - (2 * LENS_HALF * i) / LENS_SAMPLES;
    pts.push([half * (1 - (y / LENS_HALF) ** 2), y]);
  }
  for (let i = 0; i <= LENS_SAMPLES; i++) {
    const y = -LENS_HALF + (2 * LENS_HALF * i) / LENS_SAMPLES;
    pts.push([-half * (1 - (y / LENS_HALF) ** 2), y]);
  }
  return pts;
}

export function scene(params: {
  state: ChromaticAberrationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('chromatic-aberration: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const foci = colourFoci(c);
  const heights = rayHeights(c);
  const g: Primitive[] = [];

  // ---- 빛 없음 판 · 광축 · 렌즈 ----
  g.push({ type: 'region', id: 'panel', points: rect(PANEL.minX, PANEL.maxX, PANEL.minY, PANEL.maxY), fillOpacity: 1, light: 0 });
  g.push({
    type: 'trajectory',
    id: 'axis',
    points: [
      [AXIS_FROM_X, 0],
      [AXIS_TO_X, 0],
    ],
    width: AXIS_WIDTH_PX,
    light: AXIS_LIGHT,
    style: { lineStyle: 'dashed' },
  });
  const outline = lensOutline();
  g.push({ type: 'region', id: 'lens', points: outline, fillOpacity: 1, light: LENS_FILL_LIGHT });
  g.push({ type: 'trajectory', id: 'lens-edge', points: outline, closed: true, width: LENS_EDGE_WIDTH_PX, light: LENS_EDGE_LIGHT });

  // ---- 흰 줄기 — 렌즈까지 ----
  if (r.whiteFront > RAY_START_X && r.visible > 0) {
    for (const [i, h] of heights.entries()) {
      for (const sign of [1, -1] as const) {
        g.push({
          type: 'trajectory',
          id: `white-${i}-${sign > 0 ? 'up' : 'down'}`,
          points: [
            [RAY_START_X, h * sign],
            [r.whiteFront, h * sign],
          ],
          width: WHITE_WIDTH_PX,
          light: 1,
          opacity: r.visible,
        });
      }
    }
  }

  // ---- 색 줄기 — 렌즈에서 각자 초점을 지나 나간다. 스크린이 서면 그 뒤는 옅어진다. ----
  const front = r.colourFront;
  const cut = r.screen > 0 ? Math.min(front, r.screenX) : front;
  const behind = r.visible * (1 - r.screen);
  if (front > 0 && r.visible > 0) {
    for (const f of foci) {
      const light = { rgb: wavelengthToLinearRgb(f.nm) };
      for (const [i, h] of heights.entries()) {
        for (const sign of [1, -1] as const) {
          const y = (x: number): Vec2 => [x, heightAt(h * sign, f.focal, x)];
          const base = `ray-${f.id}-${i}-${sign > 0 ? 'up' : 'down'}`;
          if (cut > 0) {
            g.push({ type: 'trajectory', id: base, points: [y(0), y(cut)], width: COLOUR_WIDTH_PX, light, blend: 'add', opacity: r.visible });
          }
          if (r.screen > 0 && front > r.screenX && behind > 0) {
            g.push({
              type: 'trajectory',
              id: `${base}-behind`,
              points: [y(r.screenX), y(front)],
              width: COLOUR_WIDTH_PX,
              light,
              blend: 'add',
              opacity: behind,
            });
          }
        }
      }
    }
  }

  // ---- 초점 — 파랑 · 빨강 점과 판 아래까지 안내선, 판 밖 이름표 ----
  if (r.mark > 0) {
    const marked: { id: 'blue' | 'red'; key: ChromaticAberrationMessageKey; align: Readout['align'] }[] = [
      { id: 'blue', key: 'label.focusBlue', align: 'right' },
      { id: 'red', key: 'label.focusRed', align: 'left' },
    ];
    for (const m of marked) {
      const f = foci.find((x) => x.id === m.id)!;
      g.push({
        type: 'trajectory',
        id: `guide-${m.id}`,
        points: [
          [f.focal, 0],
          [f.focal, PANEL.minY],
        ],
        width: GUIDE_WIDTH_PX,
        light: GUIDE_LIGHT,
        opacity: r.mark,
        style: { lineStyle: 'dotted' },
      });
      g.push({
        type: 'body',
        id: `focus-${m.id}`,
        shape: 'circle',
        pos: [f.focal, 0],
        size: FOCUS_DOT_R,
        outline: 'none',
        glow: false,
        light: { rgb: wavelengthToLinearRgb(f.nm) },
        opacity: r.mark,
      });
      g.push(label(`name-${m.id}`, m.key, [f.focal, PANEL.minY], { offset: [0, LABEL_DROP_PX], align: m.align, opacity: r.mark }));
    }
  }

  // ---- 스크린(옆모습) ----
  if (r.screen > 0) {
    g.push({
      type: 'region',
      id: 'screen',
      points: rect(r.screenX - SCREEN_HALF_WIDTH, r.screenX + SCREEN_HALF_WIDTH, -SCREEN_HALF, SCREEN_HALF),
      fillOpacity: 1,
      light: SCREEN_LIGHT,
      opacity: r.screen,
    });
    g.push(label('name-screen', 'label.screen', [r.screenX, PANEL.maxY], { offset: [0, -LABEL_LIFT_PX], align: 'center', opacity: r.screen }));

    // ---- 스크린 정면 — 색마다 스크린에 닿은 빛의 원판. 겹친 곳은 더해진다. ----
    const [cx, cy] = FACE_CENTER;
    g.push({
      type: 'region',
      id: 'face',
      points: rect(cx - FACE_HALF, cx + FACE_HALF, cy - FACE_HALF, cy + FACE_HALF),
      fillOpacity: 1,
      light: FACE_LIGHT,
      opacity: r.screen,
    });
    for (const f of foci) {
      const spread = Math.abs(heightAt(c.beamHalf, f.focal, r.screenX));
      g.push({
        type: 'body',
        id: `disc-${f.id}`,
        shape: 'circle',
        pos: [cx, cy],
        size: Math.max(FACE_MIN_R, c.faceScale * spread),
        outline: 'none',
        glow: false,
        light: { rgb: wavelengthToLinearRgb(f.nm) },
        blend: 'add',
        opacity: r.screen,
      });
    }
    g.push(label('name-face', 'label.face', [cx, PANEL.maxY], { offset: [0, -LABEL_LIFT_PX], align: 'center', opacity: r.screen }));
  }

  // ---- 과장 배율 — 판 아래 오른쪽 ----
  g.push(
    label('gain', 'label.gain', [PANEL.maxX, PANEL.minY], {
      offset: [0, LABEL_DROP_PX],
      align: 'right',
      vars: { k: state.gainText },
      size: NOTE_PX,
      role: 'muted',
    }),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
