import type { PrimitiveRenderer, VortexField } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { advanceVortices, createVortexBag, type Vortex, type VortexBagOptions } from '../kit/vortex';

/** 이 장의 상태를 담는 저장소 키. `filament` 가 같은 키로 읽는다. */
export function vortexStoreKey(id: string): string {
  return `vortexField:${id}`;
}

export interface VortexBagState {
  bag: Vortex[];
  options: VortexBagOptions | null;
  gain: number;
  frame: number;
}

/**
 * 빈 상태. `filament` 가 먼저 돌아도 이것을 만들고, `vortexField` 가 그 뒤에
 * 채운다.
 *
 * 예전에는 `filament` 가 장을 못 찾으면 `undefined` 를 저장했고, 저장소는 키가
 * 있으면 다시 만들지 않으므로 **영원히 소용돌이가 0** 이었다. 화면은 멀쩡히
 * 그려지고 예외도 나지 않는데 난류만 나오지 않는다.
 */
export function emptyVortexState(): VortexBagState {
  return { bag: [], options: null, gain: 0, frame: 0 };
}

const DEFAULT_COUNT = 34;

/**
 * 수명 있는 소용돌이 다발이 만드는 속도장.
 *
 * 보통 아무것도 그리지 않는다 — 하는 일은 상태를 앞으로 굴리는 것이고, 화면에
 * 나타나는 것은 이 장을 참조하는 `filament` 의 모양이다. z 는 배경 장(0)이라
 * 실보다 먼저 돌아 같은 프레임의 실이 갱신된 장을 본다.
 */
export const renderVortexField: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as VortexField;
  const id = p.id ?? 'vortex';
  const centerY = (p.bounds.min[1] + p.bounds.max[1]) / 2;
  const options: VortexBagOptions = {
    count: p.count ?? DEFAULT_COUNT,
    minX: p.bounds.min[0],
    maxX: p.bounds.max[0],
    centerY,
    spreadY: (p.bounds.max[1] - p.bounds.min[1]) * 1.15,
    radius: p.radius,
    span: p.span,
  };

  const state = rc.store?.<VortexBagState>(vortexStoreKey(id), emptyVortexState);
  if (!state) return;

  // 비어 있으면 채운다 — 먼저 돈 `filament` 가 만들어 둔 껍데기일 수 있다.
  if (state.bag.length === 0) state.bag = createVortexBag(options);
  state.options = options;
  state.gain = p.gain;
  state.frame += 1;

  const flow = Math.hypot(p.drift[0], p.drift[1]) * rc.deltaTime;
  if (flow > 0) advanceVortices(state.bag, flow, options, state.frame);

  if (!p.visible) return;

  // 보이게 하는 것은 장을 들여다볼 때뿐이다.
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'muted', emphasis: 'subtle' });
  for (const v of state.bag) {
    const [x, y] = rc.toScreen([v.x, v.y]);
    c.beginPath();
    c.arc(x, y, Math.max(1, v.r * rc.scale), 0, Math.PI * 2);
    c.globalAlpha = 0.12 * v.e;
    c.fillStyle = color;
    c.fill();
    c.globalAlpha = 1;
  }
  finalizeBaseMeta(rc, p);
};
