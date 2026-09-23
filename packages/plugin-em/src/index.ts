/**
 * plugin-em — 전자기 도메인의 **순수 계산**.
 *
 * `plugin-mechanics` 와 같은 규약이다 — 렌더러가 없고, `Plugin` 객체도 없으며,
 * `installAperi21Plugins` 에 등록하지 않는다 (C6). sim 이 직접 import 한다.
 *
 * 역학과 한 패키지에 섞지 않는다. 섞으면 한쪽만 쓰는 조각이 반대쪽 계산까지
 * 받는다.
 */

/**
 * 목표 방향을 1차로 따라가는 각도를 한 걸음 전진시킨다.
 *
 * `θ' = k·strength·sin(θ_target − θ)` — 나침반 바늘, 풍향계, 바람에 눕는 풀,
 * 전기 쌍극자가 전부 같은 식이다. 회전 속도가 장의 세기에 비례하므로 약한
 * 자리에서는 느리게 돌고, 그래서 같은 시각에 **덜 돌아 있다**
 * (`field-of-straight-wire` 의 "멀수록 덜 돌아선다" 가 이 성질이다).
 *
 * `sin` 을 쓰는 것이 핵심이다 — 각도 차를 그대로 쓰면 ±π 를 넘는 순간 반대로
 * 돌고, 그 경계 처리를 조각마다 다시 짜면 조각마다 다르게 틀린다.
 */
export function followAngle(
  theta: number,
  target: number,
  dt: number,
  opts: { rate: number; strength?: number },
): number {
  const strength = opts.strength ?? 1;
  return theta + opts.rate * strength * Math.sin(target - theta) * dt;
}

/** 각도를 `-π..π` 로 접는다. 비교와 표시에 쓴다. */
export function wrapAngle(theta: number): number {
  const t = (theta + Math.PI) % (2 * Math.PI);
  return (t < 0 ? t + 2 * Math.PI : t) - Math.PI;
}

/**
 * 곧은 전선이 만드는 자기장의 세기 — 거리에 반비례한다.
 *
 * 상수를 하나로 묶어 `strength/r` 로 준다. 절대 단위(μ₀I/2πr)를 쓰지 않는 것은
 * 화면에 수치를 두지 않기 때문이다 — 세기는 바늘이 얼마나 돌아섰는지로만 말한다.
 */
export function wireFieldMagnitude(r: number, strength: number): number {
  return r > 1e-9 ? strength / r : 0;
}

/** 전선을 감아 도는 방향(접선). 전류 부호가 바뀌면 반대로 돈다. */
export function wireFieldDirection(
  dx: number,
  dy: number,
  sign: number,
): readonly [number, number] {
  const r = Math.hypot(dx, dy);
  if (!(r > 1e-9)) return [0, 0];
  const s = sign >= 0 ? 1 : -1;
  return [(-dy / r) * s, (dx / r) * s];
}
