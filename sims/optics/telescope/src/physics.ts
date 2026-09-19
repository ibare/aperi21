// ========================================================================
// telescope — 순수 물리
// ========================================================================
// 두 렌즈를 이상적인 얇은 렌즈로 본다 — 대물렌즈에 θ 로 들어온 평행 줄기는 모두 초점면의
// 한 점 P = (f_o, f_o·tanθ) 를 지나고, 접안렌즈는 그 점에서 나온 줄기를 P 와 접안렌즈
// 가운데를 잇는 방향으로 평행하게 내보낸다. plugin-optics `traceRay` 의 얇은 렌즈는 비스듬한
// 줄기에 1/cosθ 오차가 있어 쓰지 않고 이 경로를 여기서 계산한다.
//
// 여기 있는 것은 스테이지 상수 읽기, 시간표 진행도를 접안렌즈 바꿈 몫 · 이름표 짙기로
// 옮기는 것, 줄기 경로 · 각 계산뿐이다. 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  CM_PER_UNIT,
  FOCAL_EYE_LONG_CM,
  FOCAL_EYE_SHORT_CM,
  FOCAL_OBJECTIVE_CM,
  IN_ANGLE_DEG,
  RAY_COUNT,
  RAY_SPACING,
  RAY_START_X,
  SHOWN_FOCAL_EYE_LONG_CM,
  SHOWN_FOCAL_EYE_SHORT_CM,
  SHOWN_FOCAL_OBJECTIVE_CM,
  SHOWN_GAP_LONG_CM,
  SHOWN_GAP_SHORT_CM,
  SHOWN_MAG_LONG,
  SHOWN_MAG_SHORT,
} from './schema';
import type { TelescopeState } from './state';

/** 나가는 각이 θ 의 정수배에 딱 떨어질 때 끝 눈금을 호 가장자리에 겹쳐 긋지 않으려는 여유(tan). */
const TICK_EPSILON = 1e-9;

export interface TelescopeConstants {
  /** 대물렌즈 초점 거리(cm). */
  focalObjectiveCm: number;
  /** 긴 · 짧은 접안렌즈 초점 거리(cm). */
  focalEyeLongCm: number;
  focalEyeShortCm: number;
  /** 평행 줄기가 광축과 이루는 각(도). */
  inAngleDeg: number;
  /** 화면에 띄우는 정박값. */
  shownFocalObjectiveCm: number;
  shownFocalEyeLongCm: number;
  shownFocalEyeShortCm: number;
  shownGapLongCm: number;
  shownGapShortCm: number;
  shownMagLong: number;
  shownMagShort: number;
  /** 월드 1 단위가 나타내는 cm. */
  cmPerUnit: number;
  /** 평행 줄기 수. */
  rayCount: number;
  /** 대물렌즈에서 이웃 줄기 사이 간격(월드). */
  raySpacing: number;
}

export function readConstants(stage: StageDef): TelescopeConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    focalObjectiveCm: c.focalObjectiveCm ?? FOCAL_OBJECTIVE_CM,
    focalEyeLongCm: c.focalEyeLongCm ?? FOCAL_EYE_LONG_CM,
    focalEyeShortCm: c.focalEyeShortCm ?? FOCAL_EYE_SHORT_CM,
    inAngleDeg: c.inAngleDeg ?? IN_ANGLE_DEG,
    shownFocalObjectiveCm: c.shownFocalObjectiveCm ?? SHOWN_FOCAL_OBJECTIVE_CM,
    shownFocalEyeLongCm: c.shownFocalEyeLongCm ?? SHOWN_FOCAL_EYE_LONG_CM,
    shownFocalEyeShortCm: c.shownFocalEyeShortCm ?? SHOWN_FOCAL_EYE_SHORT_CM,
    shownGapLongCm: c.shownGapLongCm ?? SHOWN_GAP_LONG_CM,
    shownGapShortCm: c.shownGapShortCm ?? SHOWN_GAP_SHORT_CM,
    shownMagLong: c.shownMagLong ?? SHOWN_MAG_LONG,
    shownMagShort: c.shownMagShort ?? SHOWN_MAG_SHORT,
    cmPerUnit: c.cmPerUnit ?? CM_PER_UNIT,
    rayCount: c.rayCount ?? RAY_COUNT,
    raySpacing: c.raySpacing ?? RAY_SPACING,
  };
}

// ------------------------------------------------------------------------
// 시간표 → 몫
// ------------------------------------------------------------------------

/** 짧은 접안렌즈로 바뀐 몫 0~1 — `to-short` 에서 오르고 `to-long` 에서 내린다. */
export function swapShare(tl: TimelineFrame): number {
  return tl.at('to-short') - tl.at('to-long');
}

/** 긴 접안의 이름표 · 값 글자 짙기 — `mark-long` 에서 짙어지고 `to-short` 에서 옅어진다. */
export function markLong(tl: TimelineFrame): number {
  return tl.at('mark-long') * (1 - tl.at('to-short'));
}

/** 짧은 접안의 이름표 · 값 글자 짙기 — `mark-short` 에서 짙어지고 `to-long` 에서 옅어진다. */
export function markShort(tl: TimelineFrame): number {
  return tl.at('mark-short') * (1 - tl.at('to-long'));
}

// ------------------------------------------------------------------------
// 기하 — 월드 단위
// ------------------------------------------------------------------------

export interface TelescopeGeometry {
  /** 대물렌즈 초점 거리(월드). 공통 초점면의 x 다. */
  fo: number;
  /** 지금 접안렌즈 초점 거리(월드). */
  fe: number;
  /** 접안렌즈 가운데 x — 두 초점이 겹치도록 fo + fe. */
  eyeX: number;
  /**
   * 가운데 줄기(대물렌즈 한가운데를 지난 줄기)가 접안렌즈를 나와 광축을 다시 지나는 x —
   * 출구 동공, 눈을 대는 자리다. 나간 줄기 다발이 여기서 가장 좁다.
   */
  exitX: number;
  /** 들어오는 줄기의 기울기 각(라디안). */
  theta: number;
  /** 줄기가 모이는 공통 초점면 위의 점. */
  focus: Vec2;
  /** 나가는 줄기가 광축과 이루는 각(라디안, 아래로 기울어 크기만). */
  phi: number;
}

/** 바꿈 몫 `share`(0 = 긴 접안, 1 = 짧은 접안)일 때의 배치. 그 사이 초점 거리도 두 초점이 겹친다. */
export function geometry(c: TelescopeConstants, share: number): TelescopeGeometry {
  const fo = c.focalObjectiveCm / c.cmPerUnit;
  const feCm = c.focalEyeLongCm + (c.focalEyeShortCm - c.focalEyeLongCm) * share;
  const fe = feCm / c.cmPerUnit;
  const theta = (c.inAngleDeg * Math.PI) / 180;
  const focusY = fo * Math.tan(theta);
  return {
    fo,
    fe,
    eyeX: fo + fe,
    exitX: fo + fe + (fe * (fo + fe)) / fo,
    theta,
    focus: [fo, focusY],
    phi: Math.atan(focusY / fe),
  };
}

/** 대물렌즈에서 잰 줄기들의 높이(월드). 가운데가 0 이고 위아래로 대칭이다. */
export function rayHeights(c: TelescopeConstants): number[] {
  const n = Math.max(1, Math.round(c.rayCount));
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * c.raySpacing);
}

/**
 * 대물렌즈 높이 h 를 지나는 줄기의 꺾은선 — 출발 · 대물렌즈 · 초점 · 접안렌즈 · 끝(x = endX).
 * 대물렌즈 앞은 기울기 tanθ 의 평행 줄기, 접안렌즈 뒤는 초점과 접안렌즈 가운데를 잇는
 * 방향의 평행 줄기다.
 */
export function rayPath(g: TelescopeGeometry, h: number, endX: number): Vec2[] {
  const tanIn = Math.tan(g.theta);
  const [fx, fy] = g.focus;
  const slopeMid = (fy - h) / fx;
  const eyeY = fy + slopeMid * g.fe;
  const slopeOut = -fy / g.fe;
  return [
    [RAY_START_X, h + RAY_START_X * tanIn],
    [0, h],
    [fx, fy],
    [g.eyeX, eyeY],
    [endX, eyeY + (endX - g.eyeX) * slopeOut],
  ];
}

/**
 * 나가는 각 안의 θ 칸 눈금 각(라디안). k 번째 눈금은 들어오는 기울기(tanθ)의 k 배가 되는
 * 방향이다 — 나가는 줄기와 같은 셈이라 마지막 칸이 줄기와 어긋나지 않는다. 나가는 각보다
 * 작은 것만 돌려준다.
 */
export function tickAngles(g: TelescopeGeometry): number[] {
  const tanIn = Math.tan(g.theta);
  const tanOut = Math.tan(g.phi);
  const out: number[] = [];
  for (let k = 1; k * tanIn < tanOut - TICK_EPSILON; k++) out.push(Math.atan(k * tanIn));
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: TelescopeState }): TelescopeState {
  return params.state;
}
