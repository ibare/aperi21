import type { BundleState, OpticalElement, Vec2 } from '@aperi21/schema';

/**
 * Ray Tracing 번들 상태.
 *
 * - element: 선택된 요소(렌즈/거울) 한 개. 파라미터 변경 시 재생성된다.
 * - sourcePos: 광원 위치(object). 파라미터로 조작.
 * - rays: 세 개의 "주요 광선"(삼광선법) — 결상을 보여주기 위한 정형 광선.
 * - image: 렌즈/거울 공식으로 계산한 이미지 위치. 계산 실패면 null.
 */
export interface RayTracingState extends BundleState {
  element: OpticalElement;
  sourcePos: Vec2;
  rays: Array<{ id: string; origin: Vec2; direction: Vec2; wavelength?: number }>;
  image: { position: Vec2; magnification: number } | null;
}
