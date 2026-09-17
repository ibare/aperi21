// ========================================================================
// thin-film-interference — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 빛은 테마 역할이 아니라 **빛 채널**로 칠한다 — 색은 physics 가 계산한 선형광 세 성분.
//
// - 비누막 — `scalarField` `colors: 'lightRgb'`. 칸마다 그 자리 두께의 반사색.
// - 스펙트럼 채움 — 같은 어휘. 2 nm 띠마다 그 파장의 색, 곡선 위 칸은 `NaN`(투명) + 윤곽선.
// - 보이는 색 원판 — `body` 의 `light: { rgb }`, 막과 같은 표.
// ========================================================================

import type {
  Body,
  EnvironmentDef,
  Primitive,
  Readout,
  Region,
  ScalarField,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { filmAge, lightAt, probeYOf, R_MAX, reflectance, spectrumBandLight, thicknessAt, writeLightAt } from './physics';
import {
  CANVAS_H,
  FILM,
  LABEL_FONT,
  PROBE_X,
  SCENE_BOUNDS,
  SPEC,
  SWATCH,
  THICK,
  text,
  worldY,
} from './schema';
import type { ThinFilmInterferenceState } from './state';

/** 막 격자 — 원본은 막 190 × 246 px 를 픽셀마다 칠했다. 같은 칸 수. */
const COLS = FILM.w;
const ROWS = FILM.h;

/** 스펙트럼 채움 — 원본은 2 nm 띠마다 칠했다. 가로 칸 = 띠 수, 세로 칸 = 판 높이(화면 px). */
const BAND_NM = 2;
const SPEC_COLS = (SPEC.l1 - SPEC.l0) / BAND_NM;
const SPEC_ROWS = SPEC.bottom - SPEC.top;
/** 띠마다의 색은 파장만의 함수라 모듈 로드 때 한 번 만든다. 원본은 띠 가운데 파장(l + 1)의 색. */
const BAND_LIGHT = Array.from({ length: SPEC_COLS }, (_, i) => spectrumBandLight(SPEC.l0 + i * BAND_NM + BAND_NM / 2));

/** 두께 단면 표본 수. 원본 120 걸음. */
const PROFILE_STEPS = 120;

/** 원본 `fillText` 는 글자 기준선에, readout 은 가운데에 맞춘다 — 12px 글자의 차이(화면 px). */
const BASELINE_SHIFT: Vec2 = [0, -4];

const specX = (l: number): number => SPEC.x0 + ((l - SPEC.l0) / (SPEC.l1 - SPEC.l0)) * (SPEC.x1 - SPEC.x0);
/** 스펙트럼 세로(0~1) → 월드 y. */
const specY = (v: number): number => worldY(SPEC.bottom - v * (SPEC.bottom - SPEC.top));
const thickX = (d: number): number => THICK.x0 + (d / THICK.dMax) * (THICK.x1 - THICK.x0);
/** 막 높이의 비 → 월드 y. */
const filmY = (y: number): number => worldY(FILM.y + y * FILM.h);

/** 칩 없는 글자 한 줄. 원본 좌표는 화면 기준선 자리다. */
function label(
  id: string,
  x: number,
  screenY: number,
  align: 'left' | 'center' | 'right',
  body: Pick<Readout, 'text' | 'vars' | 'style'>,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: [x, worldY(screenY)], offset: BASELINE_SHIFT },
    chip: false,
    align,
    font: 'text',
    fontSize: LABEL_FONT,
    ...body,
  };
}

export function scene(params: {
  state: ThinFilmInterferenceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('thin-film-interference: schema.timeline 이 선언되어야 한다');
  const out: Primitive[] = [];

  // 새 막 경계 높이. 덮는 단계 전에는 0, 끝나면 1 — 경계 위는 새 막.
  const u = timeline.u;
  const wiping = timeline.phase === 'wipe';
  const wipe = wiping ? timeline.at('wipe') : 1;
  const thicknessHere = (x: number, y: number): number => thicknessAt(x, y, filmAge(y, u, wipe));

  // ---- 비누막 ----
  // 칸마다 그 자리 두께의 반사색 (두께 → 색 표). 빛 채널이라 라이트 · 다크 모두 두께 0 은 검다.
  const values = new Array<number>(COLS * ROWS * 3);
  for (let j = 0; j < ROWS; j++) {
    const y = (j + 0.5) / ROWS;
    const age = filmAge(y, u, wipe);
    for (let i = 0; i < COLS; i++) {
      writeLightAt(thicknessAt((i + 0.5) / COLS, y, age), values, (j * COLS + i) * 3);
    }
  }
  const film: ScalarField = {
    type: 'scalarField',
    id: 'film',
    min: [FILM.x, worldY(FILM.y + FILM.h)],
    max: [FILM.x + FILM.w, worldY(FILM.y)],
    cols: COLS,
    rows: ROWS,
    values,
    range: [0, 1],
    colors: 'lightRgb',
  };
  out.push(film);

  // ---- 철사 틀 ----
  const frame: Trajectory = {
    type: 'trajectory',
    id: 'frame',
    points: [
      [FILM.x - 1.5, worldY(FILM.y - 1.5)],
      [FILM.x + FILM.w + 1.5, worldY(FILM.y - 1.5)],
      [FILM.x + FILM.w + 1.5, worldY(FILM.y + FILM.h + 1.5)],
      [FILM.x - 1.5, worldY(FILM.y + FILM.h + 1.5)],
    ],
    closed: true,
    width: 3,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
  out.push(frame);

  // ---- 새 막 경계 ---- (덮는 1 초 동안만. 강조색이 아니다)
  if (wiping) {
    const yb = filmY(wipe);
    out.push({
      type: 'trajectory',
      id: 'wipe-edge',
      points: [
        [FILM.x, yb],
        [FILM.x + FILM.w, yb],
      ],
      width: 2,
      opacity: 0.8,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    });
  }

  // ---- 두께 단면 ----
  const profile: Vec2[] = [];
  for (let k = 0; k <= PROFILE_STEPS; k++) {
    const y = k / PROFILE_STEPS;
    profile.push([thickX(Math.min(THICK.dMax, thicknessHere(PROBE_X, y))), filmY(y)]);
  }
  const profileFill: Region = {
    type: 'region',
    id: 'profile-fill',
    points: [[THICK.x0, filmY(0)], ...profile, [THICK.x0, filmY(1)]],
    fillOpacity: 0.16,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
  out.push(profileFill);
  out.push({
    type: 'trajectory',
    id: 'profile-line',
    points: profile,
    width: 1.5,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'profile-axis',
    points: [
      [THICK.x0, filmY(0)],
      [THICK.x0, filmY(1)],
    ],
    width: 1,
    opacity: 0.35,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  const tickY = FILM.y + FILM.h + 16;
  out.push(label('profile-tick-0', THICK.x0 - 3, tickY, 'left', { text: text('label.tick'), vars: { v: 0 } }));
  out.push(label('profile-tick-1000', thickX(1000) + 18, tickY, 'right', { text: text('label.nm'), vars: { v: 1000 } }));
  out.push(label('profile-title', (THICK.x0 + THICK.x1) / 2, FILM.y - 8, 'center', { text: text('label.thickness') }));

  // ---- 되돌아오는 빛 스펙트럼 ----
  // 원본은 2 nm 띠마다 그 파장의 색으로 채웠다 — 띠 높이는 띠 가운데 파장의 반사율.
  const py = probeYOf(state);
  const dProbe = thicknessHere(PROBE_X, py);
  const curve: Vec2[] = [];
  for (let l: number = SPEC.l0; l <= SPEC.l1; l += 1) {
    curve.push([specX(l), specY(reflectance(dProbe, l) / R_MAX)]);
  }
  const base = worldY(SPEC.bottom);
  const specValues = new Array<number>(SPEC_COLS * SPEC_ROWS * 3).fill(Number.NaN);
  for (let i = 0; i < SPEC_COLS; i++) {
    const v = reflectance(dProbe, SPEC.l0 + i * BAND_NM + BAND_NM / 2) / R_MAX;
    const c = BAND_LIGHT[i]!;
    for (let j = 0; j < SPEC_ROWS; j++) {
      // 첫 행이 위. 칸 가운데 높이(0~1)가 띠 높이 아래면 칠한다.
      if (1 - (j + 0.5) / SPEC_ROWS > v) continue;
      const o = (j * SPEC_COLS + i) * 3;
      specValues[o] = c[0];
      specValues[o + 1] = c[1];
      specValues[o + 2] = c[2];
    }
  }
  const spectrumFill: ScalarField = {
    type: 'scalarField',
    id: 'spectrum-fill',
    min: [SPEC.x0, base],
    max: [SPEC.x1, worldY(SPEC.top)],
    cols: SPEC_COLS,
    rows: SPEC_ROWS,
    values: specValues,
    range: [0, 1],
    colors: 'lightRgb',
  };
  out.push(spectrumFill);
  out.push({
    type: 'trajectory',
    id: 'spectrum-line',
    points: curve,
    width: 1.5,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'spectrum-axis',
    points: [
      [SPEC.x0, base - 0.5],
      [SPEC.x1, base - 0.5],
    ],
    width: 1,
    opacity: 0.35,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  for (const l of [400, 500, 600, 700]) {
    out.push(label(`spectrum-tick-${l}`, specX(l), SPEC.bottom + 16, 'center', { text: text('label.tick'), vars: { v: l } }));
  }
  out.push(label('spectrum-axis-name', SPEC.x1, SPEC.bottom + 34, 'right', { text: text('label.wavelength') }));
  out.push(label('spectrum-title', SPEC.x0, SPEC.top - 16, 'left', { text: text('label.spectrum') }));

  // ---- 관찰점 ---- 강조색은 이 한 뜻에만: 고리 · 점선 · 점 · 두께 숫자 · 원판 테두리.
  const yw = filmY(py);
  const xPx = FILM.x + PROBE_X * FILM.w;
  const dx = thickX(Math.min(THICK.dMax, dProbe));
  out.push({
    type: 'trajectory',
    id: 'probe-guide',
    points: [
      [xPx + 9, yw],
      [dx, yw],
    ],
    width: 1,
    style: { colorRole: 'accent', emphasis: 'strong', lineStyle: 'dashed' },
  });
  const ring: Body = {
    type: 'body',
    id: 'probe-ring',
    pos: [xPx, yw],
    shape: 'circle',
    size: 8,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
  out.push(ring);
  out.push({
    type: 'body',
    id: 'probe-dot',
    pos: [dx, yw],
    shape: 'circle',
    size: 3.5,
    outline: 'none',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push(
    label('probe-thickness', Math.min(dx + 8, THICK.x1 + 4), CANVAS_H - yw - 7, 'left', {
      text: text('label.nm'),
      vars: { v: Math.round(dProbe) },
      style: { colorRole: 'accent', emphasis: 'strong' },
    }),
  );

  // ---- 관찰점의 색 ---- 막과 같은 표에서 읽은 반사색.
  const swatchPos: Vec2 = [SWATCH.x, worldY(SWATCH.y)];
  out.push({
    type: 'body',
    id: 'swatch',
    pos: swatchPos,
    shape: 'circle',
    size: SWATCH.r,
    outline: 'none',
    glow: false,
    light: { rgb: lightAt(dProbe) },
  });
  out.push({
    type: 'body',
    id: 'swatch-rim',
    pos: swatchPos,
    shape: 'circle',
    size: SWATCH.r,
    fill: 'none',
    outline: 'role',
    glow: false,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  out.push(label('swatch-name', SWATCH.x, SWATCH.y + SWATCH.r + 18, 'center', { text: text('label.seenColor') }));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 상태를 보지 않으므로 매 프레임 같다 — 카메라가 흔들리지 않는다. */
export function boundsHint(): { minX: number; maxX: number; minY: number; maxY: number } {
  return { ...SCENE_BOUNDS };
}
