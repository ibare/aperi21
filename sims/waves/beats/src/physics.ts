import type { EnvironmentDef, StageDef } from '@aperi21/schema';
import type { BeatsPhase, BeatsSample, BeatsState } from './state';

const TAU = Math.PI * 2;

/** 차이가 이보다 작으면 어긋남이 없는 것으로 본다(Hz). */
const LOCKED_EPS = 1e-4;
/** |cos| 가 이보다 크면 발맞춘 것. */
const IN_PHASE = 0.86;
/** |cos| 가 이보다 작으면 엇갈린 것. */
const OPPOSED = 0.18;
/**
 * 마디를 세는 데 두는 여유(주기 비율).
 *
 * 마디가 걸음 끝에 **정확히** 놓이는 순간이 있다 — Δf=0.45 에서 3.333 초가 그렇다.
 * 위상차를 걸음마다 더해 온 값은 그 자리에서 참값보다 아주 조금 모자라거나 넘치고,
 * 어느 쪽인지는 몇 걸음을 걸어왔는지에 달린다. 여유 없이 세면 같은 그림이 프리롤
 * 길이에 따라 마디를 하나 덜 그린다 — 눈에 보이는 차이인데 예외도 없다.
 */
const CROSS_EPS = 1e-9;

export interface BeatsConstants {
  /** 기준 음의 진동수(Hz). */
  readonly f1: number;
  /** 두 음의 진동수 차이 기본값(Hz). */
  readonly df0: number;
  /** 판이 담는 시간(초). */
  readonly window: number;
}

export function readConstants(stage: StageDef): BeatsConstants {
  const c = stage.constants;
  return { f1: c.f1 ?? 3, df0: c.df0 ?? 0.45, window: c.window ?? 4.5 };
}

/**
 * 지금 두 음이 놓인 국면. 캡션 슬롯이 이 결과를 가리킨다 (`caption.cases`).
 *
 * 위상차의 절반이 만드는 `|cos|` 가 곧 합친 소리의 크기다 —
 * `sin θ + sin(θ+D) = 2 cos(D/2) sin(θ+D/2)`. 그래서 이 하나로 네 국면이 갈린다.
 */
export function derivePhase(drift: number, df: number): BeatsPhase {
  const locked = df <= LOCKED_EPS;
  const half = (((drift / 2) % Math.PI) + Math.PI) % Math.PI;
  const c = Math.abs(Math.cos(half));
  const inPhase = !locked && c > IN_PHASE;
  const opposed = !locked && c < OPPOSED;
  const rest = !locked && !inPhase && !opposed;
  return {
    locked,
    inPhase,
    opposed,
    drifting: rest && half < Math.PI / 2,
    returning: rest && half >= Math.PI / 2,
  };
}

/** 시간창 밖으로 나간 것을 버린다. 앞에서부터 잘라 내므로 뒤는 건드리지 않는다. */
function dropOlder<T>(items: readonly T[], cutoff: number, timeOf: (item: T) => number): readonly T[] {
  const first = items.findIndex((item) => timeOf(item) >= cutoff);
  if (first === -1) return [];
  return first === 0 ? items : items.slice(first);
}

/**
 * 한 스텝 전진. 순수 함수.
 *
 * **위상은 누적한다.** `sin(2πft)` 를 쓰면 조작기로 진동수를 바꾸는 순간 파형이
 * 점프한다 — 주기 운동을 다루는 조각이면 전부 밟는 함정이다 (원본 NOTES).
 *
 * 마디(합이 지워진 순간)를 잡는 것도 여기다. 렌더러는 선언과 theme 만 읽으므로
 * 사건을 감지하는 일은 조각의 몫이고, 엔진은 그 목록을 받아 나이 들여 그린다
 * (`Trace`).
 */
export function step(params: {
  state: BeatsState;
  dt: number;
  stage: StageDef;
  environments: EnvironmentDef[];
}): BeatsState {
  const { state, dt, stage } = params;
  if (!(dt > 0)) return state;
  const c = readConstants(stage);

  const clock = state.clock + dt;
  const phase1 = (state.phase1 + TAU * c.f1 * dt) % TAU;
  const phase2 = (state.phase2 + TAU * (c.f1 + state.df) * dt) % TAU;
  const drift = state.drift + TAU * state.df * dt;
  const cutoff = clock - c.window;

  const sample: BeatsSample = { t: clock, a: Math.sin(phase1), b: Math.sin(phase2) };
  const samples = [...dropOlder(state.samples, cutoff, (s) => s.t), sample];

  // 두 위상의 차가 파이의 홀수배를 지나는 순간이 마디다 — 그때 합이 지워진다.
  //
  // **걸음 끝이 아니라 지나간 순간을 적는다.** 위상차는 한 걸음 안에서 일정한
  // 속도로 늘어나므로 되짚어 정확히 잡을 수 있다 (`Trace`: 프레임 사이 교차를
  // 보간해 잡는 일은 조각의 physics 가 한다). 걸음 끝으로 적으면 자국이 걸음
  // 격자에 걸려 최대 1/60 초씩 밀리고, 그만큼 마디가 제자리를 벗어난다.
  const nodeIndex = Math.floor((drift - Math.PI) / TAU + CROSS_EPS) + 1;
  const crossed: number[] = [];
  if (nodeIndex > state.nodeIndex) {
    const rate = TAU * state.df;
    for (let i = state.nodeIndex + 1; i <= nodeIndex; i++) {
      // i 번째 마디는 위상차가 파이의 (2i−1) 배가 되는 자리다.
      const target = Math.PI * (2 * i - 1);
      // 교차가 걸음 끝보다 뒤일 수는 없다. 여유(`CROSS_EPS`)로 세면 참값이 걸음 끝을
      // 아주 조금 넘어설 수 있는데, 그대로 두면 자국이 '지금'(x=0) 보다 오른쪽에
      // 놓여 판 밖으로 밀리고 '울렁임 한 칸' 도 그 자국을 세지 못한다.
      crossed.push(rate > 0 ? Math.min(clock, clock - (drift - target) / rate) : clock);
    }
  }
  const nodes = dropOlder(
    crossed.length > 0 ? [...state.nodes, ...crossed] : state.nodes,
    cutoff,
    (t) => t,
  );

  return {
    ...state,
    clock,
    phase1,
    phase2,
    drift,
    nodeIndex,
    samples,
    nodes,
    phase: derivePhase(drift, state.df),
  };
}
