// ========================================================================
// equivalence-principle — 순수 물리
// ========================================================================
// 바깥 그림은 공을 놓은 순간 **우주 상자와 함께 멈춰 있던 관성계**에서 본다.
//
// - 우주 상자: 공에는 아무 힘도 없어 그 자리에 떠 있다. 상자는 가속도 g 로 올라와
//   바닥이 ½ g t² 만큼 다가온다.
// - 지구 상자: 상자는 서 있고 공이 가속도 g 로 ½ g t² 만큼 떨어진다.
//
// 두 경우 모두 **상자 바닥에서 잰 공의 높이** 는 h − ½ g t² 로 같다 — 이것이 상자 안에서 볼 수
// 있는 전부다. 낙하 단계의 진행도 p(0~1)를 시간으로 삼으면 그 높이는 h (1 − p²) 이다.
//
// 모든 것이 시각의 함수라 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import { DROP_HEIGHT_M, G_MS2, STAR_SEED } from './schema';
import type { EquivalencePrincipleState } from './state';

export interface EquivalencePrincipleConstants {
  /** 가속도 = 중력 가속도(m/s²). 선언값 그대로 화면에 쓴다. */
  gMs2: number;
  /** 공을 놓는 높이(m, 바닥에서 공 아래 끝까지). */
  dropHeightM: number;
  /** 배경 별의 시드. */
  seed: number;
}

export function readConstants(stage: StageDef): EquivalencePrincipleConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    gMs2: c.gMs2 ?? G_MS2,
    dropHeightM: c.dropHeightM ?? DROP_HEIGHT_M,
    seed: c.seed ?? STAR_SEED,
  };
}

/** 등가속 낙하의 꼴 — 진행도 p 동안 지난 몫(0~1). ½ g t² 를 전체 낙하로 나눈 것이다. */
export function fallen(p: number): number {
  return p * p;
}

/**
 * 상자 바닥에서 잰 공의 높이 — 놓는 높이에 대한 비(0~1). **두 상자가 같다.**
 *
 * 바깥에서 본 낙하(`drop`) 뒤 바닥에 닿아 0, 창을 가리며(`close`) 선반으로 돌아가 1, 안에서 본
 * 낙하(`inside`) 뒤 다시 0, 창을 열며(`open`) 1 로 돌아온다.
 */
export function ballRise(tl: TimelineFrame): number {
  return 1 - fallen(tl.at('drop')) + tl.at('close') - fallen(tl.at('inside')) + tl.at('open');
}

/**
 * 우주 상자 바닥의 높이(월드) — 두 상자가 나란히 서는 높이(0)에서 잰다.
 *
 * 공을 놓는 순간 바닥은 −h 에 있고, 바깥에서 본 낙하 동안 ½ g t² 꼴로 올라와 공에 닿는 순간
 * 0 이 된다. 안에서 보는 동안은 0 에 머물고(상자 안 관찰자에게 상자는 늘 제자리다), 창을 열며
 * 처음 자리로 돌아간다.
 */
export function spaceFloor(tl: TimelineFrame, h: number): number {
  return -h * (1 - fallen(tl.at('drop')) + tl.at('open'));
}

/** 바깥을 알려 주는 것(별 · 불꽃 · 땅 · 화살표 · 상자 이름)의 짙기. 창을 가리면 0. */
export function outsideVisibility(tl: TimelineFrame): number {
  return 1 - tl.at('close') + tl.at('open');
}

/**
 * 지금 쌓이는 자국 묶음 — 바깥에서 본 낙하의 것인지 안에서 본 낙하의 것인지와 그 진행도 · 짙기.
 * 창을 가리는 동안 바깥 자국이 옅어지고, 창을 여는 동안 안쪽 자국이 옅어진다.
 */
export function strobeRun(tl: TimelineFrame): { progress: number; opacity: number } {
  if (tl.at('close') < 1) return { progress: tl.at('drop'), opacity: 1 - tl.at('close') };
  return { progress: tl.at('inside'), opacity: 1 - tl.at('open') };
}

/**
 * 같은 시간 간격 `count` 칸의 자국 — 바닥에서 잰 공 높이의 비(0~1). 진행도 `progress` 까지
 * 지난 것만 돌려준다. 간격이 아래로 갈수록 벌어지는 것(1 : 3 : 5 …)이 등가속의 모양이다.
 */
export function strobeHeights(progress: number, count: number): number[] {
  const out: number[] = [];
  for (let k = 0; k <= count; k++) {
    const s = k / count;
    if (s > progress) break;
    out.push(1 - fallen(s));
  }
  return out;
}

/** 시드 결정적 난수(mulberry32). 같은 시드는 언제나 같은 별자리를 만든다 (S-sim). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 사각형 안에 흩뿌린 별 자리. 시드와 개수만으로 정해진다. */
export function starField(seed: number, count: number, min: Vec2, max: Vec2): Vec2[] {
  const rand = mulberry32(seed);
  const out: Vec2[] = [];
  for (let i = 0; i < count; i++) {
    out.push([min[0] + (max[0] - min[0]) * rand(), min[1] + (max[1] - min[1]) * rand()]);
  }
  return out;
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: EquivalencePrincipleState }): EquivalencePrincipleState {
  return params.state;
}
