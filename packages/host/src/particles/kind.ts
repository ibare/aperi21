import type { BackgroundParticleKind } from './background';
import type { EnvironmentDef, StageDef } from '@aperi21/schema';

/**
 * 스테이지·환경 조합에서 배경 입자 종류를 결정한다.
 *
 * 대기가 없고 중력이 약하면 별, 비가 오는 환경이면 빗줄기. 배경은 "여기가 어디인가"
 * 를 말하는 것이라 스테이지를 바꾸면 함께 바뀌어야 한다.
 */
export function resolveBackgroundKind(
  stage: StageDef | undefined,
  environments: readonly EnvironmentDef[],
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
