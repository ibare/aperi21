import type { BackgroundParticleKind } from '@aperi21/host';
import type { EnvironmentDef, StageDef } from '@aperi21/schema';

/**
 * 스테이지·환경 조합에서 배경 입자 종류를 결정.
 * Phase 3 에서 Bundle 이 자체 규칙을 제공하게 이동할 수 있도록 별도 함수로 유지.
 */
export function resolveBackgroundKind(
  stage: StageDef | undefined,
  environments: EnvironmentDef[],
): BackgroundParticleKind {
  for (const env of environments) {
    if ((env.effects.drag ?? 0) > 0 && env.id.toLowerCase().includes('rain')) {
      return 'rain';
    }
  }
  const hasAtmosphere = stage?.constants.hasAtmosphere;
  const g = stage?.constants.g ?? 9.8;
  if (hasAtmosphere === 0) {
    return g < 2 ? 'stars-sparse' : 'stars-dense';
  }
  return 'none';
}
