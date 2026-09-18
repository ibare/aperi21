// ========================================================================
// diffraction — 순수 물리
// ========================================================================
// 왼쪽(벽 앞): 들어오는 평면파 cos(k(x − x_f)). 앞머리 x_f 가 속력 c 로 오른쪽으로 간다.
// 오른쪽(틈 뒤): 틈 위에 촘촘히 놓은 점파원의 합
//   Σ a · ½(1 + cos θ) · cos(kr − ωτ − π/4) / √((r + λ/4)/λ)
// τ 는 앞머리가 틈을 나온 뒤 흐른 시간이고, 점마다 c·τ 반경 안에만 기여한다 — 둥근 앞머리가
// 이것으로 생긴다. 점파원은 **계산의 표본**이지 그림이 아니다(작도는 huygens-principle 몫).
//
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CELL,
  FIELD_H,
  FIELD_W,
  PRESS_CLIP,
  SLIT_CENTER_Y,
  SLIT_SAMPLES,
  SLIT_WIDTH,
  WALL_THICKNESS,
  WALL_X,
  WAVELENGTH,
  WAVE_SPEED,
} from './schema';
import type { DiffractionState } from './state';

/** 틈을 나온 자리(월드 x). 점파원이 여기 선다. */
export const EXIT_X = WALL_X + WALL_THICKNESS;
/** 왼쪽(입사파) 격자 가로 칸 수 — 한 행이면 된다(세로로 같은 값). */
export const LEFT_COLS = Math.ceil(EXIT_X / CELL);
/** 오른쪽(틈 뒤) 격자 가로 · 세로 칸 수. */
export const RIGHT_COLS = Math.ceil((FIELD_W - EXIT_X) / CELL);
export const ROWS = Math.ceil(FIELD_H / CELL);

/** 앞머리를 부드럽게 하는 폭 — 파장의 이만큼. */
const SOFT_FRACTION = 0.5;
/** 2 차원 점파원이 앞서는 위상(라디안). 원통파의 −π/4. */
const WAVELET_LAG = Math.PI / 4;
/** 원통파 감쇠의 근거리 누름 — r 에 파장의 이만큼을 더해 r → 0 에서 터지지 않게 한다. */
const NEAR_FRACTION = 0.25;

export interface DiffractionConstants {
  /** 파장(월드). */
  wavelength: number;
  /** 물결 속력(월드/초). */
  waveSpeed: number;
  /** 틈 폭(월드). */
  slitWidth: number;
}

export function readConstants(stage: StageDef): DiffractionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    wavelength: c.wavelength ?? WAVELENGTH,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    slitWidth: c.slitWidth ?? SLIT_WIDTH,
  };
}

/** 틈의 아래 · 위 가장자리(월드 y). 벽 · 점선 · 점파원이 같은 값을 쓴다. */
export function slitEdges(c: DiffractionConstants): { lower: number; upper: number } {
  return { lower: SLIT_CENTER_Y - c.slitWidth / 2, upper: SLIT_CENTER_Y + c.slitWidth / 2 };
}

const smooth = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/**
 * 약한 물결도 보이도록 제곱근으로 누르되 부호는 유지한다. 결과는 −1 ~ 1.
 * 색 사상이 아니라 값의 모양이다 (huygens-principle 과 같은 곡선).
 */
function press(v: number): number {
  return Math.sign(v) * Math.sqrt(Math.min(PRESS_CLIP, Math.abs(v)) / PRESS_CLIP);
}

/** 한 프레임의 시각 — 시간표가 정한다. */
interface Clock {
  /** 앞머리가 틈을 나온 뒤 흐른 시간(초). 다가가는 동안은 음수다. */
  tau: number;
  /** 물결의 크기 배율 1 → 0. 마지막 단계에서 수면이 가라앉는다. */
  calm: number;
}

/**
 * 앞머리가 틈을 나오는 순간은 **선언이 정한다** — `spread` 단계의 시작이다. 모듈 상수와 견주지
 * 않는다 (S-piece 「시간표는 선언이다」). `approach` 를 늘이면 앞머리가 더 왼쪽에서 출발할 뿐이다.
 */
function clock(tl: TimelineFrame): Clock {
  return { tau: tl.u - tl.start('spread'), calm: 1 - tl.at('settle') };
}

/** 들어오는 평면파 — 칸 열마다 하나. 누른 변위(−1 ~ 1)를 돌려준다. */
export function incidentColumns(tl: TimelineFrame, c: DiffractionConstants): number[] {
  const { tau, calm } = clock(tl);
  const k = (2 * Math.PI) / c.wavelength;
  const soft = c.wavelength * SOFT_FRACTION;
  const front = EXIT_X + c.waveSpeed * tau;
  const out = new Array<number>(LEFT_COLS);
  for (let cx = 0; cx < LEFT_COLS; cx++) {
    const x = (cx + 0.5) * CELL;
    const reach = smooth((front - x) / soft);
    out[cx] = press(calm * reach * Math.cos(k * (x - front)));
  }
  return out;
}

/**
 * 틈 뒤 점파원 합 — 행 우선, 첫 행이 월드 위쪽. 누른 변위(−1 ~ 1)를 돌려준다.
 * 미리 그린 둥근 선이 아니라 실제 합이다. 어디까지 돌아 들어가는지는 계산이 정한다.
 */
export function diffractedField(tl: TimelineFrame, c: DiffractionConstants): number[] {
  const { tau, calm } = clock(tl);
  const out = new Array<number>(RIGHT_COLS * ROWS).fill(0);
  if (tau <= 0 || calm <= 0) return out;

  const k = (2 * Math.PI) / c.wavelength;
  const omega = k * c.waveSpeed;
  const soft = c.wavelength * SOFT_FRACTION;
  const reach = c.waveSpeed * tau;
  const { lower } = slitEdges(c);
  const spacing = c.slitWidth / SLIT_SAMPLES;
  /** 점파원 하나의 세기 — 촘촘한 점들이 합쳐 틈을 나온 물결과 같은 세기가 되도록. */
  const amp = spacing / c.wavelength;
  const near = c.wavelength * NEAR_FRACTION;
  const sources = Array.from({ length: SLIT_SAMPLES }, (_, j) => lower + (j + 0.5) * spacing);

  for (let row = 0; row < ROWS; row++) {
    const y = FIELD_H - (row + 0.5) * CELL;
    for (let col = 0; col < RIGHT_COLS; col++) {
      const dx = (col + 0.5) * CELL;
      let sum = 0;
      for (const sy of sources) {
        const dy = y - sy;
        const r = Math.sqrt(dx * dx + dy * dy);
        const w = smooth((reach - r) / soft);
        if (w === 0) continue;
        const oblique = 0.5 * (1 + dx / r);
        const decay = 1 / Math.sqrt((r + near) / c.wavelength);
        sum += w * amp * oblique * decay * Math.cos(k * r - omega * tau - WAVELET_LAG);
      }
      out[row * RIGHT_COLS + col] = press(calm * sum);
    }
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: DiffractionState }): DiffractionState {
  return params.state;
}
