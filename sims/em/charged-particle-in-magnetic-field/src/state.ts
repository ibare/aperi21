/**
 * 상태가 없다. 균일한 자기장 속 원운동은 정확한 해가 있어 전하 · 자취 · 강조선이 모두
 * 조각 시계의 함수다. 원본은 회전 적분기로 쌓았지만, 그 적분기가 지키던 「궤도가
 * 닫힌다」 는 해석해에서는 저절로 참이다.
 */
export type ChargedParticleInMagneticFieldState = Record<string, never>;

export function initialState(): ChargedParticleInMagneticFieldState {
  return {};
}
