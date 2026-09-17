// ========================================================================
// atomic-orbital — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 발견 자리를 투영해 깊이 단계마다 점 묶음 하나로 넘긴다.
// ========================================================================

import type { Bounds, Primitive, SceneGraph, StageDef, Vec2 } from '@aperi21/schema';
import { BOUNDS, FLASH, FRAME, ORBITAL_REACH } from './schema';
import type { AtomicOrbitalState } from './state';
import { depthBand, project, rateAt, readMeasure, scaleFor, swayAt } from './physics';

/** 가로로는 자르지 않는다 — 원본 캔버스 폭은 화면 폭이다. */
const CLIP_WIDE = 1e4;

export function scene(params: { state: AtomicOrbitalState; stage?: StageDef }): SceneGraph {
  const { state } = params;
  const m = readMeasure(params.stage);
  const reach = ORBITAL_REACH[state.shown];
  const scale = scaleFor(reach);
  const yaw = swayAt(state.clock);
  const tau = state.tau;
  const found = state.found;
  // 원본 캔버스(세로 refHeight) 밖의 점은 잘린다 — 캡션 줄 위로 번지지 않는다.
  const half = FRAME.refHeight / 2;
  const clip = { min: [-CLIP_WIDE, -half] as Vec2, max: [CLIP_WIDE, half] as Vec2 };

  // 1. 쌓인 자리 — 깊이 단계마다 한 묶음. 앞일수록 크고 진하다. 겹침으로 밀도가 보인다.
  const bands: Vec2[][] = Array.from({ length: FRAME.bands }, () => []);
  for (const f of found) {
    if (tau - f.born < f.life) continue; // 아직 「방금 발견된 자리」
    const p = project(f, yaw, scale);
    bands[depthBand(p.depth, reach)]!.push([p.x, p.y]);
  }
  const out: Primitive[] = bands.map((positions, b) => ({
    type: 'particleSystem',
    id: `found-${b}`,
    positions,
    shape: 'square',
    // `square` 의 크기는 반변이다. 원본은 한 변을 적었다.
    sizes: (FRAME.sizeBase + FRAME.sizeStep * b) / 2,
    opacity: FRAME.alphaBase + FRAME.alphaStep * b,
    style: { colorRole: 'ink', emphasis: 'strong' },
    clip,
  }));

  // 2. 핵.
  out.push({
    type: 'body',
    id: 'nucleus',
    pos: [0, 0],
    shape: 'circle',
    size: FRAME.nucleus,
    glow: false,
    outline: 'none',
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 3. 방금 발견된 자리 — 강조색은 이 뜻 하나. 수명은 최대 `FLASH.maxLife` 라 끝에서만 훑는다.
  const ring = rateAt(tau, m) < FLASH.ringBelowRate;
  const dots: Vec2[] = [];
  const opacities: number[] = [];
  const marks: { pos: Vec2; age: number }[] = [];
  let from = found.length;
  while (from > 0 && tau - found[from - 1]!.born < FLASH.maxLife) from--;
  for (let i = from; i < found.length; i++) {
    const f = found[i]!;
    const age = tau - f.born;
    if (age >= f.life) continue;
    const p = project(f, yaw, scale);
    const pos: Vec2 = [p.x, p.y];
    dots.push(pos);
    opacities.push(1 - FLASH.fade * (age / f.life));
    if (ring) marks.push({ pos, age });
  }
  out.push({
    type: 'particleSystem',
    id: 'just-found',
    positions: dots,
    sizes: ring ? FLASH.dotWithRing : FLASH.dotAlone,
    opacities,
    style: { colorRole: 'accent', emphasis: 'strong' },
    clip,
  });
  if (ring) {
    // 고리가 그려지는 동안(측정률 < ringBelowRate)은 모든 강조 수명이 maxLife 라
    // 인스턴스 수명 하나로 원본의 점별 수명과 같다.
    out.push({
      type: 'trace',
      id: 'just-found-ring',
      marks,
      life: FLASH.maxLife,
      shape: 'ring',
      size: FLASH.ringFrom,
      spreadTo: FLASH.ringTo,
      width: FLASH.ringWidth,
      style: { colorRole: 'accent', emphasis: 'strong' },
      clip,
    });
  }
  return out;
}

/** 고정 틀 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (S-piece). */
export function boundsHint(): Bounds {
  return {
    minX: -BOUNDS.halfWidth,
    maxX: BOUNDS.halfWidth,
    minY: -BOUNDS.halfHeight,
    maxY: BOUNDS.halfHeight,
  };
}
