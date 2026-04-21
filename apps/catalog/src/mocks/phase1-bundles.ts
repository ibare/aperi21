import type { Bundle } from '@aperi21/schema';
import { projectileBundle } from '@aperi21/bundle-projectile';
import { rayTracingBundle } from '@aperi21/bundle-ray-tracing';
import { dcCircuitBundle } from '@aperi21/bundle-dc-circuit';

/**
 * Phase 2 실구현 번들 매핑. BundleDetailPage 에서 Embed 로 전달되는 값.
 *
 * 과거 Phase 1 단계에서는 `placeholder()` 로 빈 Bundle 을 만들어 연결했으나,
 * ray_tracing/dc_circuit 이 실제 구현되면서 전부 실 Bundle 로 교체됨.
 */
export const projectile: Bundle = projectileBundle as unknown as Bundle;
export const rayTracing: Bundle = rayTracingBundle as unknown as Bundle;
export const dcCircuit: Bundle = dcCircuitBundle as unknown as Bundle;

export const MOCK_BUNDLES: Record<string, Bundle> = {
  projectile,
  ray_tracing: rayTracing,
  dc_circuit: dcCircuit,
};
