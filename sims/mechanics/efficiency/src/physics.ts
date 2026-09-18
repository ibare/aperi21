// ========================================================================
// efficiency — 순수 계산
// ========================================================================
// 물리는 한 줄이다 — 넣은 것 = 쓸모 + 샌 것, 효율 = 쓸모 / 넣은 것. 나머지는 그 양을
// 띠의 굵기로 옮기는 배치 계산이다. 입구를 늘릴 때는 **모든 굵기에 같은 배율**을 곱한다 —
// 그래서 늘리는 동안 몫(효율)은 그대로이고, 굵기만 A 와 견줄 수 있게 된다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  BEND_R,
  DOT_SPACING,
  DOT_SPEED,
  HEAD_FLARE,
  HEAD_LEN,
  IN_A,
  IN_B,
  INLET_LEN,
  LOSS_FLOOR,
  MACHINE_PAD,
  MACHINE_W,
  OUT_A,
  OUT_B,
  OUTLET_LEN,
  UNIT,
  Y_TOP,
} from './schema';
import type { EfficiencyState } from './state';

export interface EfficiencyConstants {
  inA: number;
  outA: number;
  inB: number;
  outB: number;
}

export function readConstants(stage: StageDef): EfficiencyConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    inA: c.inA ?? IN_A,
    outA: c.outA ?? OUT_A,
    inB: c.inB ?? IN_B,
    outB: c.outB ?? OUT_B,
  };
}

/**
 * 입구를 맞춘 정도 0~1. 0 은 제 크기, 1 은 두 입구가 같은 굵기. **단계 경계는 선언이
 * 정한다** — 늘리는 단계의 진행도에서 되돌리는 단계의 진행도를 뺀다 (S-piece).
 */
export function matchProgress(tl: TimelineFrame): number {
  return tl.at('scale') - tl.at('unscale');
}

/**
 * 한 기계에 곱할 굵기 배율. 맞춘 정도 m 에서 1 → (큰 입구 / 제 입구) 로 간다.
 * 큰 쪽은 늘 1 이다 — 작은 쪽이 큰 쪽의 굵기로 늘어난다.
 */
export function gainFor(inJ: number, target: number, m: number): number {
  return 1 + (target / inJ - 1) * m;
}

/** 효율(%)을 정수 문자열로. 이 조각의 기본값(40 · 75 · 60 · 25)은 모두 정수다. */
export function percentText(part: number, whole: number): string {
  return String(Math.round((part / whole) * 100));
}

/** 한 기계의 띠 모양 — 모두 월드 좌표. */
export interface FlowShape {
  /** 들어가는 띠 · 쓸모 갈래 · 새는 갈래 · 기계 상자의 다각형. */
  inlet: Vec2[];
  useful: Vec2[];
  loss: Vec2[];
  machine: Vec2[];
  /** 이름표 자리. */
  nameAt: Vec2;
  inletLabelAt: Vec2;
  usefulLabelAt: Vec2;
  lossLabelAt: Vec2;
  /** 흐르는 점 자리와 점마다의 짙기. */
  dots: Vec2[];
  dotOpacities: number[];
}

/** 굽이를 몇 마디로 자를지. 곡선 어휘가 없어 점으로 표본한다 (장부 G28). */
const BEND_STEPS = 16;
/** 점이 띠 첫머리에서 나타나는 거리 · 끝에서 사라지는 거리(월드). */
const DOT_FADE_IN = 0.3;
const DOT_FADE_OUT = 0.6;

/**
 * 한 기계의 흐름을 배치한다. `gain` 은 모든 굵기에 똑같이 곱한다 — 몫은 그대로다.
 *
 * 띠는 윗변(`Y_TOP`)을 맞춘다. 위쪽이 쓸모 몫, 아래쪽이 샌 몫이다. 기계를 나오면 쓸모
 * 몫은 곧장 오른쪽으로, 샌 몫은 아래로 꺾인다.
 */
export function flowShape(
  origin: number,
  inJ: number,
  outJ: number,
  gain: number,
  t: number,
): FlowShape {
  const tIn = inJ * UNIT * gain;
  const tOut = outJ * UNIT * gain;
  const tLoss = tIn - tOut;
  const top = Y_TOP;
  const bottom = top - tIn;
  const split = top - tOut;

  const xMachine = origin + INLET_LEN;
  const xExit = xMachine + MACHINE_W;
  const xHead = xExit + OUTLET_LEN;
  const xTip = xHead + HEAD_LEN;

  // 굽이 중심 — 띠의 아랫변 바로 아래. 안쪽 반지름 BEND_R, 바깥 반지름 BEND_R + 샌 굵기.
  const cx = xExit;
  const cy = bottom - BEND_R;
  const rIn = BEND_R;
  const rOut = BEND_R + tLoss;

  const arc = (r: number, reverse: boolean): Vec2[] => {
    const pts: Vec2[] = [];
    for (let i = 0; i <= BEND_STEPS; i++) {
      const k = reverse ? BEND_STEPS - i : i;
      const a = (Math.PI / 2) * (1 - k / BEND_STEPS); // π/2 → 0 (시계 방향)
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  };

  // 띠를 기계 상자 안까지 넣는다 — 상자가 이음매를 덮는다.
  const inlet: Vec2[] = [
    [origin, top],
    [xExit, top],
    [xExit, bottom],
    [origin, bottom],
  ];
  const useful: Vec2[] = [
    [xMachine, top],
    [xHead, top],
    [xHead, top + HEAD_FLARE],
    [xTip, top - tOut / 2],
    [xHead, split - HEAD_FLARE],
    [xHead, split],
    [xMachine, split],
  ];
  const loss: Vec2[] = [
    [xMachine, split],
    ...arc(rOut, false),
    [cx + rOut, LOSS_FLOOR],
    [cx + rIn, LOSS_FLOOR],
    ...arc(rIn, true),
    [xMachine, bottom],
  ];
  const machine: Vec2[] = [
    [xMachine, top + MACHINE_PAD],
    [xExit, top + MACHINE_PAD],
    [xExit, bottom - MACHINE_PAD],
    [xMachine, bottom - MACHINE_PAD],
  ];

  // ---- 흐르는 점: 1 J 마다 한 가닥 ----
  // 가닥 j 는 띠 굵기의 (j + ½)/n 깊이를 달린다. 위쪽 outJ 가닥은 쓸모로, 나머지는 새는
  // 쪽으로 간다 — 가닥 수를 세면 받은 J · 내놓은 J 가 된다. 자리는 시각 t 의 함수라
  // 같은 시각은 언제나 같은 화면이다.
  const dots: Vec2[] = [];
  const dotOpacities: number[] = [];
  const lanes = Math.round(inJ);
  const usefulLanes = Math.round(outJ);
  for (let j = 0; j < lanes; j++) {
    const depth = ((j + 0.5) / lanes) * tIn;
    const y = top - depth;
    const toExit = xExit - origin;
    const isUseful = j < usefulLanes;
    const r = rIn + (tIn - depth);
    const arcLen = (r * Math.PI) / 2;
    const drop = cy - LOSS_FLOOR;
    const total = isUseful ? xHead - origin : toExit + arcLen + drop;

    const at = (s: number): Vec2 => {
      if (s <= toExit) return [origin + s, y];
      if (isUseful) return [origin + s, y];
      const s2 = s - toExit;
      if (s2 <= arcLen) {
        const a = Math.PI / 2 - s2 / r;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      }
      return [cx + r, cy - (s2 - arcLen)];
    };

    // 가닥마다 출발을 엇갈린다 — 가지런히 맞추면 점이 세로줄로 서서 격자로 읽힌다.
    const phase = (((j * 0.618) % 1) + 1) % 1;
    const head = (((t * DOT_SPEED) / DOT_SPACING + phase) % 1) * DOT_SPACING;
    for (let s = head; s < total; s += DOT_SPACING) {
      const fadeIn = Math.min(1, s / DOT_FADE_IN);
      const fadeOut = Math.min(1, (total - s) / DOT_FADE_OUT);
      dots.push(at(s));
      dotOpacities.push(Math.max(0, Math.min(fadeIn, fadeOut)));
    }
  }

  return {
    inlet,
    useful,
    loss,
    machine,
    nameAt: [(xMachine + xExit) / 2, top + MACHINE_PAD + 0.26],
    inletLabelAt: [origin, top + 0.2],
    usefulLabelAt: [xTip + 0.14, top - tOut / 2],
    lossLabelAt: [cx + (rIn + rOut) / 2, LOSS_FLOOR - 0.24],
    dots,
    dotOpacities,
  };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EfficiencyState }): EfficiencyState {
  return params.state;
}
