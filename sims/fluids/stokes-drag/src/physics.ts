// ========================================================================
// stokes-drag — 순수 물리
// ========================================================================
// 느린 흐름에서 구가 받는 저항은 속력에 정비례한다 (F = 6πηrv). 그래서 가라앉는
// 구의 속력은 지수적으로 종단 속도에 다가간다 —
//   v(s) = vt·(1 − e^(−s/τ)),   깊이(s) = vt·(s − τ·(1 − e^(−s/τ)))
// (s 는 놓은 뒤 흐른 시간). 종단 속도와 시간 상수는 모두 반지름의 **제곱**을 따른다 —
//   vt = 2(ρs − ρf)·g·r² / 9η,   τ = 2ρs·r² / 9η.
// 닫힌 꼴이라 쌓는 상태가 없다 — 모든 것이 시각의 함수다.
// ========================================================================

import type { StageDef, TimelineFrame } from '@aperi21/schema';
import { RADIUS_BIG, RADIUS_SMALL, RELAX_SMALL, RELEASE_Y, STROBE, TUBE_BOTTOM } from './schema';
import type { StokesDragState } from './state';

export interface StokesDragConstants {
  /** 두 구의 반지름(월드). */
  radiusSmall: number;
  radiusBig: number;
  /** 작은 구의 시간 상수(초). 큰 구는 반지름 제곱 비만큼 길다. */
  relaxSmall: number;
  /** 자국 간격(초). */
  strobe: number;
}

export function readConstants(stage: StageDef): StokesDragConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    radiusSmall: c.radiusSmall ?? RADIUS_SMALL,
    radiusBig: c.radiusBig ?? RADIUS_BIG,
    relaxSmall: c.relaxSmall ?? RELAX_SMALL,
    strobe: c.strobe ?? STROBE,
  };
}

/** 놓은 뒤 s 초 동안 내려온 거리 — 종단 속도 vt, 시간 상수 τ. */
function depthAt(s: number, vt: number, tau: number): number {
  if (s <= 0) return 0;
  return vt * (s - tau * (1 - Math.exp(-s / tau)));
}

export interface SphereReading {
  /** 구 중심의 월드 y. */
  y: number;
  /** 놓은 자리에서 내려온 거리(월드). */
  depth: number;
  /** 자국 — 놓은 순간부터 `strobe` 간격마다 지난 자리의 중심 y. 첫 자국이 놓은 자리다. */
  marks: number[];
  /** 바닥에 닿아 멈췄는가. */
  landed: boolean;
}

export interface SinkReading {
  small: SphereReading;
  big: SphereReading;
  /** 큰 구가 닿은 순간 작은 구가 내려와 있던 거리 — 닿은 뒤에만 있다. */
  smallDepthAtArrival?: number;
}

/**
 * 두 구를 읽는다. **단계 경계는 선언이 정한다** — 놓는 시각은 `drop` 의 시작, 큰 구가
 * 닿는 시각은 `sink` 의 끝이다 (S-piece 「시간표는 선언이다」).
 *
 * 큰 구의 종단 속도는 그 두 시각 사이에 관 바닥까지 내려오도록 되짚는다. 작은 구의
 * 종단 속도는 거기에 **반지름 비의 제곱**을 곱한 것이다 — 이 한 줄이 조각의 물리다.
 * 시간 상수도 같은 비로 늘어난다.
 */
export function readSink(tl: TimelineFrame, c: StokesDragConstants): SinkReading {
  const release = tl.start('drop');
  const arrival = tl.end('sink');
  const s = Math.max(0, tl.u - release);
  const sArrive = arrival - release;

  const ratio = (c.radiusSmall / c.radiusBig) ** 2;
  const tauSmall = c.relaxSmall;
  const tauBig = c.relaxSmall / ratio;

  // 큰 구 중심이 바닥 위 반지름 자리에 닿기까지 내려오는 거리.
  const travel = RELEASE_Y - (TUBE_BOTTOM + c.radiusBig);
  const vtBig = travel / depthAt(sArrive, 1, tauBig);
  const vtSmall = vtBig * ratio;

  const read = (vt: number, tau: number, floor: number): SphereReading => {
    const limit = RELEASE_Y - floor;
    const depth = Math.min(limit, depthAt(s, vt, tau));
    const marks: number[] = [];
    for (let k = 0; k * c.strobe <= s + 1e-9; k++) {
      const d = depthAt(k * c.strobe, vt, tau);
      if (d > limit + 1e-9) break;
      marks.push(RELEASE_Y - d);
    }
    return { y: RELEASE_Y - depth, depth, marks, landed: depth >= limit - 1e-9 };
  };

  const small = read(vtSmall, tauSmall, TUBE_BOTTOM + c.radiusSmall);
  const big = read(vtBig, tauBig, TUBE_BOTTOM + c.radiusBig);
  const arrived = s >= sArrive - 1e-9;
  return {
    small,
    big,
    smallDepthAtArrival: arrived ? depthAt(sArrive, vtSmall, tauSmall) : undefined,
  };
}

/** 이번 주기에서 그림이 흐려진 정도 0~1. 마지막 단계에서 지우고 다시 놓는다. */
export function sceneOpacity(tl: TimelineFrame): number {
  return 1 - tl.at('fade');
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: StokesDragState }): StokesDragState {
  return params.state;
}
