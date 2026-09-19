// ========================================================================
// spherical-aberration — 상태
// ========================================================================
// 모든 움직임은 시각의 함수라 쌓는 것이 없다. 화면에 수를 띄우지 않으므로 캡션 `vars`
// 로 끼울 글자도 없다 — 상태는 비어 있다 (S-sim 「상태가 시계뿐인 조각」).
// ========================================================================

export type SphericalAberrationState = Record<string, never>;

export function initialState(): SphericalAberrationState {
  return {};
}
