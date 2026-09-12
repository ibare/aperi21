// ========================================================================
// gas-pressure — 순수 물리
// ========================================================================
// DOM·캔버스·색을 모른다. 난수를 쓰는 곳은 하나뿐이고 시드를 인자로 받는다 (S-sim).
//
// 이상기체로 둔다 — 분자끼리는 부딪지 않는다. 계산해도 벽이 받는 충격량의 합은
// 같고, 화면에는 서로 튕기는 곁가지 운동만 늘어 "벽을 때린다" 가 흐려진다.
// ========================================================================

import type { EnvironmentDef, StageDef, TimelineEase } from '@aperi21/schema';
import {
  BAR,
  BOX,
  CAPTION_COLD_BELOW,
  CAPTION_HOT_ABOVE,
  MOLECULE_COUNT,
  MOLECULE_RADIUS,
  PRESSURE_WINDOW,
  TIMELINE,
  T_COLD,
  T_HOT,
  T_MAX,
  V_MAX,
} from './schema';
import type { GasPressureState, Molecule, WallHit } from './state';

// ------------------------------------------------------------------------
// 분자 배치 — 시드 난수
// ------------------------------------------------------------------------

/** 분자 중심이 오갈 수 있는 자리. 벽에서 반지름만큼 안쪽이다. */
const INNER = {
  minX: BOX.left + MOLECULE_RADIUS,
  maxX: BOX.right - MOLECULE_RADIUS,
  minY: BOX.bottom + MOLECULE_RADIUS,
  maxY: BOX.top - MOLECULE_RADIUS,
} as const;

/** 분자 중심이 오갈 수 있는 가로 길이. 압력 눈금이 이 길이로 나뉜다. */
const INNER_WIDTH = INNER.maxX - INNER.minX;
const INNER_HEIGHT = INNER.maxY - INNER.minY;

/** mulberry32. 같은 시드는 언제나 같은 수열을 준다. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 분자 `MOLECULE_COUNT` 개를 뽑는다.
 *
 * 방향은 등방, 속력계수는 2차원 맥스웰 분포(레일리)에서 Box-Muller 로 뽑아
 * `⟨c²⟩ = 1` 로 정규화한다. 그 정규화 덕분에 막대 눈금을 이론값
 * `N·⟨v²⟩ / (2·L)` 로 계산해 박을 수 있다 — 눈으로 맞춘 상수가 아니다.
 */
export function createMolecules(seed: number): Molecule[] {
  const rand = mulberry32(seed);
  const gauss = (): number => {
    const u1 = Math.max(1e-9, rand());
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  const out: Molecule[] = [];
  for (let i = 0; i < MOLECULE_COUNT; i++) {
    const th = 2 * Math.PI * rand();
    const g1 = gauss();
    const g2 = gauss();
    const x = INNER.minX + 1 + rand() * (INNER_WIDTH - 2);
    const y = INNER.maxY - 1 - rand() * (INNER_HEIGHT - 2);
    out.push({
      x,
      y,
      dx: Math.cos(th),
      // 월드는 y 가 위다. 등방이라 부호는 분포를 바꾸지 않는다.
      dy: -Math.sin(th),
      c: Math.sqrt(g1 * g1 + g2 * g2) / Math.SQRT2,
    });
  }
  return out;
}

// ------------------------------------------------------------------------
// 자동 진행 — 선언한 시간표를 시각에서 푼다
// ------------------------------------------------------------------------
//
// `step` 은 `timeline` 을 받지 않는다 — 엔진이 그것을 넘기는 곳은 `scene` 뿐이다.
// 그래서 여기서 한 번 더 푼다. **경계 숫자는 다시 적지 않는다**: 읽는 것은
// `schema.TIMELINE` 이고, 여기 있는 것은 곡선뿐이다.

const EASES: Record<TimelineEase, (x: number) => number> = {
  linear: (x) => x,
  smooth: (x) => x * x * (3 - 2 * x),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};

/** 한 주기의 길이(초). 단계 길이의 합이다. */
const PERIOD = TIMELINE.phases.reduce((n, p) => n + p.duration, 0);

export interface PhaseReading {
  /** 지금 단계 id. */
  id: string;
  /** 지금 단계의 진행도 0~1 (이징 적용). */
  progress: number;
}

/** 시각 `t` 의 단계와 진행도. 주기 함수라 음수 시각도 그대로 정의된다(프리롤). */
export function phaseAt(t: number): PhaseReading {
  const u = ((t % PERIOD) + PERIOD) % PERIOD;
  let start = 0;
  for (const p of TIMELINE.phases) {
    if (u < start + p.duration) {
      const raw = (u - start) / p.duration;
      return { id: p.id, progress: EASES[p.ease ?? 'linear'](raw) };
    }
    start += p.duration;
  }
  const last = TIMELINE.phases[TIMELINE.phases.length - 1]!;
  return { id: last.id, progress: 1 };
}

/** 자동 진행이 정하는 온도(K). 단계 이름은 선언(`TIMELINE`)의 것과 같다. */
export function autoTemperature(t: number): number {
  const phase = phaseAt(t);
  switch (phase.id) {
    case 'cold':
      return T_COLD;
    case 'warming':
      return T_COLD + (T_HOT - T_COLD) * phase.progress;
    case 'hot':
      return T_HOT;
    default:
      return T_HOT + (T_COLD - T_HOT) * phase.progress;
  }
}

/** 온도가 정하는 속력(월드/초). 온도는 속력에만 손을 댄다. */
export function speedAt(temperature: number): number {
  return V_MAX * Math.sqrt(Math.max(0, temperature) / T_MAX);
}

/** `c = 1` 인 분자가 가장 뜨거울 때 정면으로 때린 세기. 자국 길이의 기준이다. */
export const MAG_REF = 2 * V_MAX;

// ------------------------------------------------------------------------
// 압력 눈금
// ------------------------------------------------------------------------
//
// 뜨거울 때의 평균 압력이 `BAR.max` 가 되도록 맞춘 눈금.
//   단위시간당 벽 충격량 = N·⟨v²⟩ / (2·L)   (2차원, ⟨vx²⟩ = ⟨v²⟩/2)

const PRESSURE_REF = (MOLECULE_COUNT * ((V_MAX * V_MAX * T_HOT) / T_MAX)) / (2 * INNER_WIDTH);
const PRESSURE_SCALE = BAR.max / PRESSURE_REF;

/** 막대가 넘어설 수 없는 높이(월드). 상자보다 높이 자라지 않는다. */
const PRESSURE_CEILING = BOX.top - BOX.bottom;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

// ------------------------------------------------------------------------
// 한 스텝
// ------------------------------------------------------------------------

/**
 * 한 스텝 전진. 순수 함수.
 *
 * 벽 충돌을 이벤트로 쌓아 최근 시간창의 합을 압력으로 쓴다. **그 요동을
 * 평활하지 않는다** — 요동은 버그가 아니라 "압력은 합" 이라는 주장 자체다
 * (원본 NOTES). 차가울 때 0.9 초에 두드림이 열 번쯤밖에 안 들어와서 막대가
 * 눈에 띄게 들썩이는 것이 이 조각이 가장 하고 싶은 말이다.
 */
export function step(params: {
  state: GasPressureState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): GasPressureState {
  const { state, dt } = params;
  const t = state.t + dt;

  // 한 번 잡으면 계속 수동이다. 러너는 잡혔다는 사실만 적고(`heldPath`), 그 뒤에
  // 자동 진행이 어떻게 양보하고 무엇으로 돌아갈지는 조각이 정한다.
  const manual = state.manual || state.slider.held;
  const temperature = manual
    ? clamp(state.slider.temperature, T_COLD, T_HOT)
    : autoTemperature(t);
  const v = speedAt(temperature);

  // 창 밖으로 밀려난 두드림은 버린다. 시간창 누적기의 전부다.
  const hits: WallHit[] = [];
  for (const h of state.hits) {
    if (t - h.t <= PRESSURE_WINDOW) hits.push(h);
  }

  const molecules: Molecule[] = [];
  for (const m of state.molecules) {
    const sp = m.c * v;
    let x = m.x + m.dx * sp * dt;
    let y = m.y + m.dy * sp * dt;
    let dx = m.dx;
    let dy = m.dy;
    if (x < INNER.minX) {
      x = INNER.minX;
      dx = -dx;
    }
    if (y < INNER.minY) {
      y = INNER.minY;
      dy = -dy;
    }
    if (y > INNER.maxY) {
      y = INNER.maxY;
      dy = -dy;
    }
    if (x > INNER.maxX) {
      x = INNER.maxX;
      // 되튀므로 벽이 받은 충격량은 2m|vx|. 질량은 1 로 둔다.
      hits.push({ t, y, mag: 2 * Math.abs(dx) * sp });
      dx = -dx;
    }
    molecules.push({ x, y, dx, dy, c: m.c });
  }

  let sum = 0;
  for (const h of hits) {
    const age = t - h.t;
    if (age >= 0 && age <= PRESSURE_WINDOW) sum += h.mag;
  }
  const pressure = Math.min(PRESSURE_CEILING, (sum / PRESSURE_WINDOW) * PRESSURE_SCALE);

  // 자동 진행 중에는 손잡이가 스스로 움직여, 지금 무엇이 변하는 중인지 가리킨다.
  const sliderTemperature = manual ? state.slider.temperature : Math.round(temperature);

  // 캡션이 갈리는 지점은 상태다. 선언은 어디를 보라고만 말한다 (원칙 2).
  const manualCold = manual && temperature < CAPTION_COLD_BELOW;
  const manualHot = manual && temperature > CAPTION_HOT_ABOVE;

  return {
    t,
    molecules,
    hits,
    temperature,
    pressure,
    slider: { temperature: sliderTemperature, held: state.slider.held },
    manual,
    caption: {
      manualCold,
      manualHot,
      manualMid: manual && !manualCold && !manualHot,
    },
  };
}
