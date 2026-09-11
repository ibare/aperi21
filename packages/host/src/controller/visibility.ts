import type { BundleState, ControllerSpec } from '@aperi21/schema';
import { readPath } from './path';

/**
 * 지금 보이는 조작기만 고른다 — 선언의 `visibleWhen` 이 가리키는 state 경로가
 * 참일 때만 남긴다.
 *
 * **slot 은 거르기 전 선언 순서로 센다.** 자리를 선언하지 않은 조작기는 기본
 * 모서리에서 slot 만큼 쌓이므로, 거른 목록으로 slot 을 다시 세면 숨었다 나타난
 * 조작기가 앞의 빈자리로 미끄러진다 — 저작자가 아무것도 바꾸지 않았는데 자리가
 * 움직인다.
 *
 * 원본 spec 객체를 바꾸지 않는다. 조각의 선언은 모듈 스코프의 한 벌이라 한
 * 문서의 모든 임베드가 같은 객체를 본다 (C5 · 원칙 6).
 */
export function visibleControllers(
  specs: readonly ControllerSpec[],
  state: BundleState,
): { spec: ControllerSpec; slot: number }[] {
  const slots = new Map<ControllerSpec['type'], number>();
  const out: { spec: ControllerSpec; slot: number }[] = [];
  for (const spec of specs) {
    const slot = slots.get(spec.type) ?? 0;
    slots.set(spec.type, slot + 1);
    if (spec.visibleWhen && !readPath<boolean>(state, spec.visibleWhen)) continue;
    out.push({ spec, slot });
  }
  return out;
}
