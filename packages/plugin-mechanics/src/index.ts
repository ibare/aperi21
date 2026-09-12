/**
 * plugin-mechanics — 역학 도메인의 **순수 계산**.
 *
 * 렌더러가 없다. 그래서 `Plugin` 객체도 없고 `installAperi21Plugins` 에 등록하지
 * 않는다 — 등록은 부팅 경로라 거기 얹으면 이 계산을 쓰지 않는 조각도 전부 받는다
 * (C6: 능력은 `import` 로 붙인다). sim 이 직접 import 하고, 번들러가 그 조각
 * chunk 에만 넣는다. `dc-circuit` 이 `solveMna` 를 쓰는 방식과 같다.
 *
 * 원칙 1 이 sim 에 허용하는 것은 「schema 의 선언 타입과 도메인 plugin 의 순수
 * 계산 함수·타입」이다. 여기 있는 것은 전부 순수 함수다 — 캔버스도 상태도 모른다.
 */

/** 중력 가속도의 기본값(m/s²). 스테이지 상수가 비었을 때만 쓴다. */
export const G = 9.8;

/**
 * 마찰 없이 구속된 물체의 속력. **높이만으로 정해진다.**
 *
 * `v = √(2g·Δh)` — 어떤 모양의 길을 지나왔든 내려온 높이가 같으면 속력이 같다.
 * 조각마다 이 식과 적분기를 손으로 짜면 조각마다 다른 수치 오차가 생기고,
 * 에너지 보존이 근사가 되어 주장 자체가 흔들린다 (`ramp-energy` NOTES).
 *
 * 적분기를 고르는 것은 조각의 몫으로 남긴다 — 진자처럼 진폭이 시들면 안 되는
 * 물리는 velocity Verlet 이어야 한다 (`pendulum-isochronism` NOTES).
 */
export function speedFromDrop(drop: number, g: number = G): number {
  return Math.sqrt(2 * g * Math.max(0, drop));
}

/** 길 위의 한 점. 매개변수 `u` 를 좌표로 옮긴다. */
export type PathPoint = readonly [number, number];

/**
 * 매개변수로 주어진 길 위에서 마찰 없이 미끄러지는 물체를 한 걸음 전진시킨다.
 *
 * 속력은 높이에서 바로 나오므로(위 `speedFromDrop`) 적분하는 것은 **길 위의
 * 자리**뿐이다. 그래서 에너지 오차가 쌓이지 않는다 — 오차는 도착 *시각*에만
 * 남고 "같은 속력으로 내려선다" 는 주장에는 닿지 않는다.
 *
 * RK4 로 적분한다. 오일러면 굽은 길에서 눈에 띄게 어긋난다.
 */
export function advanceOnPath(
  u: number,
  dt: number,
  opts: {
    /** 매개변수 → 좌표. */
    at: (u: number) => PathPoint;
    /** 출발 높이(월드 y). 여기서 얼마나 내려왔는지로 속력이 정해진다. */
    startY: number;
    /** 중력 가속도. 생략하면 `G`. */
    g?: number;
    /** 매개변수의 끝. 넘으면 여기서 멈춘다. */
    uMax?: number;
  },
): number {
  const { at, startY, uMax } = opts;
  const g = opts.g ?? G;
  // du/dt = v / |dP/du| — 길 위의 속력을 매개변수 속도로 옮긴다.
  const rate = (uu: number): number => {
    const clamped = uMax !== undefined ? Math.min(uu, uMax) : uu;
    const h = 1e-4;
    const [x0, y0] = at(Math.max(0, clamped - h));
    const [x1, y1] = at(clamped + h);
    const ds = Math.hypot(x1 - x0, y1 - y0) / (2 * h);
    if (!(ds > 1e-9)) return 0;
    const [, y] = at(clamped);
    return speedFromDrop(startY - y, g) / ds;
  };

  const k1 = rate(u);
  const k2 = rate(u + (dt * k1) / 2);
  const k3 = rate(u + (dt * k2) / 2);
  const k4 = rate(u + dt * k3);
  const next = u + (dt * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
  return uMax !== undefined ? Math.min(next, uMax) : next;
}
