// ========================================================================
// microscope — 순수 물리
// ========================================================================
// 두 상의 자리 · 크기는 여기서 계산하지 않는다 — scene 이 plugin-optics `findImage` 로 얻는다.
// 여기 있는 것은 스테이지 상수 읽기, 시간표 진행도를 줄기 길이 · 짙기 · 막대 칸 수로 옮기는 것,
// 그리고 꺾인 줄기를 길이 몫으로 자르는 배치 계산이다. 단계 경계를 코드 상수로 가르지 않는다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  EYEPIECE_FOCAL,
  EYEPIECE_MAG,
  OBJECTIVE_FOCAL,
  OBJECTIVE_MAG,
  SPECIMEN_DISTANCE,
  SPECIMEN_HEIGHT,
  TOTAL_MAG,
  TUBE_LENGTH,
} from './schema';
import type { MicroscopeState } from './state';

export interface MicroscopeConstants {
  /** 대물렌즈 초점 거리(월드). */
  objectiveFocal: number;
  /** 시료 ↔ 대물렌즈 거리(월드). */
  specimenDistance: number;
  /** 시료 높이(월드) = 막대 한 칸의 길이. */
  specimenHeight: number;
  /** 대물렌즈 ↔ 접안렌즈 거리(월드). */
  tubeLength: number;
  /** 접안렌즈 초점 거리(월드). */
  eyepieceFocal: number;
  /** 배율 정박값 — 화면 글자와 막대 칸 수. */
  objectiveMag: number;
  eyepieceMag: number;
  totalMag: number;
}

export function readConstants(stage: StageDef): MicroscopeConstants {
  const c = stage.constants ?? {};
  return {
    objectiveFocal: c.objectiveFocal ?? OBJECTIVE_FOCAL,
    specimenDistance: c.specimenDistance ?? SPECIMEN_DISTANCE,
    specimenHeight: c.specimenHeight ?? SPECIMEN_HEIGHT,
    tubeLength: c.tubeLength ?? TUBE_LENGTH,
    eyepieceFocal: c.eyepieceFocal ?? EYEPIECE_FOCAL,
    objectiveMag: c.objectiveMag ?? OBJECTIVE_MAG,
    eyepieceMag: c.eyepieceMag ?? EYEPIECE_MAG,
    totalMag: c.totalMag ?? TOTAL_MAG,
  };
}

/** 지금 보이는 모양 — 모두 시간표 진행도의 곱 · 합이다. */
export interface MicroscopeShow {
  /** 대물 줄기가 나타난 몫 [뒤끝, 앞끝] (경로 길이의 몫). 되돌림 때 뒤끝이 앞으로 따라간다. */
  objRays: readonly [number, number];
  /** 접안 줄기가 나타난 몫 [뒤끝, 앞끝]. */
  eyeRays: readonly [number, number];
  /** 실상 화살표 · 이름표 짙기. */
  realImage: number;
  /** 허상 쪽으로 거꾸로 잇는 점선이 뻗은 몫(0~1). */
  backReach: number;
  /** 허상 화살표 · 이름표 · 점선 짙기. */
  virtualImage: number;
  /** 대물 · 접안 막대의 칸 수(1 에서 정박값까지). */
  objectiveCells: number;
  eyepieceCells: number;
  /** 전체 막대 — 대물 막대 몇 개가 이어졌나(1 에서 접안 배율까지)와 짙기. */
  totalBlocks: number;
  totalBar: number;
  /** 되돌림 동안 남는 몫(1 → 0). 연장 점선처럼 뻗은 몫과 짙기를 따로 읽는 것이 쓴다. */
  keep: number;
  /** 값 글자 `×{m}` 짙기. */
  objectiveMark: number;
  eyepieceMark: number;
  totalMark: number;
}

export function show(tl: TimelineFrame, c: MicroscopeConstants): MicroscopeShow {
  const keep = 1 - tl.at('reset');
  const drain = tl.at('reset');
  return {
    objRays: [drain, tl.at('obj-rays')],
    eyeRays: [drain, tl.at('eye-rays')],
    realImage: tl.at('obj-image') * keep,
    backReach: tl.at('eye-image'),
    virtualImage: tl.at('eye-image') * keep,
    objectiveCells: 1 + (c.objectiveMag - 1) * tl.at('obj-image') * keep,
    eyepieceCells: 1 + (c.eyepieceMag - 1) * tl.at('eye-image') * keep,
    totalBlocks: 1 + (c.eyepieceMag - 1) * tl.at('stack'),
    totalBar: tl.at('copy') * keep,
    keep,
    objectiveMark: tl.at('obj-mark') * keep,
    eyepieceMark: tl.at('eye-mark') * keep,
    totalMark: tl.at('total-mark') * keep,
  };
}

/**
 * 꺾인 줄기 `points` 에서 경로 길이 몫 [from, to] 구간만 잘라 낸다. 줄기가 뻗어 나가는 것과
 * 되돌림 때 뒤끝이 따라가 사라지는 것을 한 계산으로 한다. 점이 둘 못 되면 빈 배열이다.
 */
export function subPath(points: readonly Vec2[], from: number, to: number): Vec2[] {
  if (to <= from || points.length < 2) return [];
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    lens.push(d);
    total += d;
  }
  const s0 = from * total;
  const s1 = to * total;
  const out: Vec2[] = [];
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const d = lens[i - 1]!;
    const segFrom = walked;
    const segTo = walked + d;
    walked = segTo;
    if (segTo < s0 || segFrom > s1 || d === 0) continue;
    const at = (s: number): Vec2 => {
      const k = Math.min(1, Math.max(0, (s - segFrom) / d));
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    };
    if (out.length === 0) out.push(at(Math.max(s0, segFrom)));
    out.push(at(Math.min(s1, segTo)));
  }
  return out.length >= 2 ? out : [];
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: MicroscopeState }): MicroscopeState {
  return params.state;
}
