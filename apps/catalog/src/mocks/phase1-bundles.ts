import type { Bundle } from '@aperi21/schema';
import { projectileBundle } from '@aperi21/sim-projectile';
import { rayTracingBundle } from '@aperi21/sim-ray-tracing';
import { dcCircuitBundle } from '@aperi21/sim-dc-circuit';
import { pressureIsotropyBundle } from '@aperi21/sim-pressure-isotropy';
import { pressureAndContainerShapeBundle } from '@aperi21/sim-pressure-and-container-shape';
import { archimedesPrincipleBundle } from '@aperi21/sim-archimedes-principle';

/**
 * Phase 2 실구현 번들 매핑. TopicDetailPage 에서 Embed 로 전달되는 값.
 *
 * 과거 Phase 1 단계에서는 `placeholder()` 로 빈 Bundle 을 만들어 연결했으나,
 * 광선 추적·DC 회로가 실제 구현되면서 전부 실 Bundle 로 교체됨.
 */
export const projectile: Bundle = projectileBundle as unknown as Bundle;
export const rayTracing: Bundle = rayTracingBundle as unknown as Bundle;
export const dcCircuit: Bundle = dcCircuitBundle as unknown as Bundle;
export const pressureIsotropy: Bundle = pressureIsotropyBundle as unknown as Bundle;
export const pressureAndContainerShape: Bundle =
  pressureAndContainerShapeBundle as unknown as Bundle;
export const archimedesPrinciple: Bundle = archimedesPrincipleBundle as unknown as Bundle;

/**
 * 레지스트리 id → Bundle. 키는 `aperi21:<id>` 로, 카탈로그의 `simId` 와 같은 표기를
 * 쓴다 (C4 — 같은 대상에 두 이름을 두지 않는다).
 */
export const MOCK_BUNDLES: Record<string, Bundle> = {
  'aperi21:projectile': projectile,
  'aperi21:ray-tracing': rayTracing,
  'aperi21:dc-circuit': dcCircuit,
  'aperi21:pressure-isotropy': pressureIsotropy,
  'aperi21:pressure-and-container-shape': pressureAndContainerShape,
  'aperi21:archimedes-principle': archimedesPrinciple,
};
