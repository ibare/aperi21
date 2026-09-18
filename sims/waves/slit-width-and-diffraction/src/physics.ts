// ========================================================================
// slit-width-and-diffraction — 순수 물리
// ========================================================================
// 왼쪽(벽 앞): 들어오는 평면파 cos(k(x − x_f)). 앞머리 x_f 가 속력 c 로 오른쪽으로 간다.
// 두 수조가 같은 물결을 받는다.
// 오른쪽(틈 뒤): 수조마다 제 틈 위에 촘촘히 놓은 점파원의 합
//   Σ a · ½(1 + cos θ) · cos(kr − ωτ − π/4) / √((r + λ/4)/λ)
// τ 는 앞머리가 틈을 나온 뒤 흐른 시간이고, 점마다 c·τ 반경 안에만 기여한다 — 앞머리가 이것으로
// 생긴다. 틈이 넓으면 점들의 파가 가운데 줄기에서만 보강되어 곧은 물결이 되고, 틈이 파장만 하면
// 점 몇 개가 한 점처럼 모여 반원이 된다. 어느 쪽이 되는지는 이 합이 정한다.
//
// 칸막이 · 벽에서 되돌아오는 파는 두지 않는다(흡수하는 가장자리로 본다).
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import {
  CELL,
  FIELD_W,
  NARROW_RATIO,
  PRESS_CLIP,
  PRESS_EXPONENT,
  SAMPLES_PER_WAVELENGTH,
  TANK_H,
  WALL_THICKNESS,
  WALL_X,
  WAVELENGTH,
  WAVE_SPEED,
  WIDE_RATIO,
} from './schema';
import type { SlitWidthAndDiffractionState } from './state';

/** 틈을 나온 자리(월드 x). 점파원이 여기 선다. */
export const EXIT_X = WALL_X + WALL_THICKNESS;
/** 왼쪽(입사파) 격자 가로 칸 수 — 한 행이면 된다(세로로 같은 값). */
export const LEFT_COLS = Math.ceil(EXIT_X / CELL);
/** 오른쪽(틈 뒤) 격자 가로 칸 수 · 수조 한 판의 세로 칸 수. */
export const RIGHT_COLS = Math.ceil((FIELD_W - EXIT_X) / CELL);
export const TANK_ROWS = Math.ceil(TANK_H / CELL);

/** 앞머리를 부드럽게 하는 폭 — 파장의 이만큼. */
const SOFT_FRACTION = 0.5;
/** 2 차원 점파원이 앞서는 위상(라디안). 원통파의 −π/4. */
const WAVELET_LAG = Math.PI / 4;
/** 원통파 감쇠의 근거리 누름 — r 에 파장의 이만큼을 더해 r → 0 에서 터지지 않게 한다. */
const NEAR_FRACTION = 0.25;
/** 틈 하나에 놓는 점파원의 최소 수. 파장만 한 틈에서도 합이 되도록. */
const MIN_SAMPLES = 3;

export interface SlitWidthAndDiffractionConstants {
  /** 파장(월드). */
  wavelength: number;
  /** 물결 속력(월드/초). */
  waveSpeed: number;
  /** 위 수조 틈 폭 / 파장. */
  wideRatio: number;
  /** 아래 수조 틈 폭 / 파장. */
  narrowRatio: number;
}

export function readConstants(stage: StageDef): SlitWidthAndDiffractionConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    wavelength: c.wavelength ?? WAVELENGTH,
    waveSpeed: c.waveSpeed ?? WAVE_SPEED,
    wideRatio: c.wideRatio ?? WIDE_RATIO,
    narrowRatio: c.narrowRatio ?? NARROW_RATIO,
  };
}

/** 수조 한 판의 틈 — 가운데 높이(월드 y)와 폭(월드). */
export interface Gap {
  center: number;
  width: number;
}

/** 틈의 아래 · 위 가장자리(월드 y). 벽 · 점선 · 점파원이 같은 값을 쓴다. */
export function gapEdges(g: Gap): { lower: number; upper: number } {
  return { lower: g.center - g.width / 2, upper: g.center + g.width / 2 };
}

const smooth = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

/** 약한 물결도 보이도록 누르되 부호는 유지한다. 결과는 −1 ~ 1. */
function press(v: number): number {
  return Math.sign(v) * Math.pow(Math.min(PRESS_CLIP, Math.abs(v)) / PRESS_CLIP, PRESS_EXPONENT);
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
 * 않는다 (S-piece 「시간표는 선언이다」).
 */
function clock(tl: TimelineFrame): Clock {
  return { tau: tl.u - tl.start('spread'), calm: 1 - tl.at('settle') };
}

/** 들어오는 평면파 — 칸 열마다 하나. 누른 변위(−1 ~ 1)를 돌려준다. 두 수조가 같이 쓴다. */
export function incidentColumns(tl: TimelineFrame, c: SlitWidthAndDiffractionConstants): number[] {
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
 * 한 수조의 틈 뒤 점파원 합 — 행 우선, 첫 행이 수조 위쪽. 누른 변위(−1 ~ 1)를 돌려준다.
 * `tankY` 는 수조 바닥의 월드 y. 미리 그린 둥근 선이 아니라 실제 합이다.
 */
export function diffractedField(
  tl: TimelineFrame,
  c: SlitWidthAndDiffractionConstants,
  tankY: number,
  gap: Gap,
): number[] {
  const { tau, calm } = clock(tl);
  const out = new Array<number>(RIGHT_COLS * TANK_ROWS).fill(0);
  if (tau <= 0 || calm <= 0) return out;

  const k = (2 * Math.PI) / c.wavelength;
  const omega = k * c.waveSpeed;
  const soft = c.wavelength * SOFT_FRACTION;
  const reach = c.waveSpeed * tau;
  const { lower } = gapEdges(gap);
  const count = Math.max(MIN_SAMPLES, Math.ceil((gap.width / c.wavelength) * SAMPLES_PER_WAVELENGTH));
  const spacing = gap.width / count;
  /** 점파원 하나의 세기 — 촘촘한 점들이 합쳐 틈을 나온 물결과 같은 세기가 되도록. */
  const amp = spacing / c.wavelength;
  const near = c.wavelength * NEAR_FRACTION;
  const sources = Array.from({ length: count }, (_, j) => lower + (j + 0.5) * spacing);
  const top = tankY + TANK_ROWS * CELL;

  for (let row = 0; row < TANK_ROWS; row++) {
    const y = top - (row + 0.5) * CELL;
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
export function step(params: { state: SlitWidthAndDiffractionState }): SlitWidthAndDiffractionState {
  return params.state;
}
