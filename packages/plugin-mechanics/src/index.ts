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

import type { Vec2 } from '@aperi21/schema';

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

/* ── 12시 기준 · 시계방향 극좌표 ───────────────────────────────────────────── */

/**
 * 12시에서 **시계방향으로** 잰 각 `theta` 의 자리를 월드 좌표로 돌려준다.
 *
 * 회전을 다루는 조각은 각을 "12시에서 시계방향" 으로 센다 — 시계도 각도기도,
 * 캡션이 하는 말도 그렇다. 반면 수학의 극좌표는 3시에서 반시계방향이라 조각마다
 * `θ − π/2` 를 손으로 끼워 넣게 되고, **거기에 캔버스의 뒤집힌 y 축까지 겹친다.**
 * 부호를 하나 틀려도 그림은 그대로 그려진다. 회전이 반대로 돌거나 시작 자리가
 * 90° 어긋날 뿐이라 **예외도 안 나고 타입도 통과한다.** 그 환산을 한 곳에 둔다.
 *
 * 월드 y 는 위가 양이고 뒤집는 것은 카메라의 일이다(`camera.toScreen`). 그래서
 * `θ=0` 이 `+y`(12시), `θ=π/2` 가 `+x`(3시) — 화면에서 시계방향이 된다.
 * 조각은 `θ − π/2` 도 y 뒤집기도 쓰지 않는다.
 */
export function pointAtClockAngle(center: Vec2, radius: number, theta: number): Vec2 {
  return [center[0] + radius * Math.sin(theta), center[1] + radius * Math.cos(theta)];
}

/**
 * `pointAtClockAngle` 의 역 — 월드 점이 중심에서 어느 시계각에 있는지. 범위는 `[0, 2π)`.
 *
 * 끌기·맞히기가 포인터 자리를 각으로 되읽을 때 쓴다. 정·역을 짝으로 두는 이유는
 * 한쪽만 공통으로 두면 다른 쪽에서 다시 `atan2(y, x)` 를 써 **두 규약이 한 조각 안에
 * 섞이기** 때문이다.
 */
export function clockAngleOf(center: Vec2, point: Vec2): number {
  const a = Math.atan2(point[0] - center[0], point[1] - center[1]);
  return a < 0 ? a + Math.PI * 2 : a;
}

/* ── 세계 좌표 주기 배경 ───────────────────────────────────────────────────── */

/**
 * 주기 `period` 로 되풀이되는 것의 자리 가운데 `[from, to]` 안에 드는 것을 전부 돌려준다.
 *
 * 기준틀을 옮기는 조각은 **어느 기준틀에서 보든 화면이 비면 안 된다.** A 에서 정지한
 * 것은 B 에서 반드시 흘러 나가므로, 화면을 채우는 것은 공간적으로 주기여야 한다.
 * 이 감기를 `relative-velocity` 는 한 조각 안에서만 세 번 다시 짰다 — 물거품·자갈·선착장.
 *
 * `[from, to]` 는 **월드 단위의 보이는 범위**다. 픽셀이 아니고, 기준틀 좌표도 아니다 —
 * 관측자가 흘러간 만큼 함께 밀려난 범위를 넘긴다. 가장자리에서 반쯤 걸친 것이 통째로
 * 사라지지 않도록 그리는 것의 크기만큼 넉넉히 넓혀 준다.
 *
 * 주기를 고르는 것은 조각의 몫이다. 주기가 보이는 폭보다 좁으면 한 화면에 같은 것이
 * 여러 벌 들어와 되풀이가 눈에 걸린다 (그 조각은 화면 약 41 m 에 주기 60 m). 또 주기가
 * 그 안에 놓는 것들의 간격으로 **나누어떨어지지 않으면 이음매에서 간격이 어긋난다**
 * (선착장 12 m × 5 = 60 m).
 */
export function tiledPositions(
  x: number,
  opts: {
    /** 되풀이 주기(월드 단위). 양수여야 한다. */
    period: number;
    /** 보이는 범위의 시작(월드 단위). */
    from: number;
    /** 보이는 범위의 끝(월드 단위). */
    to: number;
    /** 돌려줄 자리 수의 상한. 생략하면 1024. */
    limit?: number;
  },
): number[] {
  const { period, from, to } = opts;
  const limit = opts.limit ?? 1024;
  if (!(period > 0) || !(to >= from)) return [];
  const out: number[] = [];
  const first = x + Math.ceil((from - x) / period) * period;
  // 주기가 보이는 범위에 비해 터무니없이 좁으면(0 에 가까운 주기 · 뒤바뀐 범위) 반복이
  // 폭주한다. 그 개수는 어차피 그림에 쓸 수 없으므로 여기서 끊는다.
  for (let v = first; v <= to && out.length < limit; v += period) out.push(v);
  return out;
}

/* ── 사건의 기준틀 변환 (갈릴레이) ─────────────────────────────────────────── */

/** 시공의 한 사건 — 어디서(`x`, `y`) 언제(`t`) 일어났는가. */
export type SpacetimeEvent = {
  readonly x: number;
  readonly y: number;
  /** 그 일이 일어난 시각. 전단항이 이 값으로 정해진다. */
  readonly t: number;
};

/** 보는 사람의 기준틀. **위치는 적분해서 쌓은 값이다.** */
export type ObserverFrame = {
  /** 관측자가 여기까지 흘러온 자리. `advanceObserver` 로만 쌓는다. */
  readonly at: Vec2;
  /** 지금 기준틀의 속도. */
  readonly velocity: Vec2;
  /** 지금 시각. `eventInFrame` 이 과거와의 시차를 재는 데 쓴다. */
  readonly t: number;
};

/** 정지한 기준틀에서 시작한다. */
export function observerAtRest(t: number = 0): ObserverFrame {
  return { at: [0, 0], velocity: [0, 0], t };
}

/**
 * 기준틀을 한 걸음 전진시킨다 — `Xobs += u·dt`.
 *
 * **`x − u·t` 로 쓰면 안 된다.** 기준틀 속도가 시간에 따라 바뀔 수 있으면 그 식은
 * `t·du/dt` 만큼의 가짜 이동을 만들고, 시간이 흐를수록 화면이 걷잡을 수 없이 폭주한다.
 * 슬라이더로 기준틀을 연속으로 훑는 조각이 실제로 겪고 고친 자리다
 * (`relative-velocity` NOTES (b)). 관측자 위치는 반드시 적분이어야 한다.
 *
 * 기준틀을 토글이 아니라 **연속량**으로 두는 것이 이 구조의 전제다. 두 값 사이를
 * 오가는 버튼이면 컷이 바뀔 뿐 아무것도 기울지 않는다.
 */
export function advanceObserver(frame: ObserverFrame, velocity: Vec2, dt: number): ObserverFrame {
  return {
    at: [frame.at[0] + velocity[0] * dt, frame.at[1] + velocity[1] * dt],
    velocity,
    t: frame.t + dt,
  };
}

/**
 * **지금 있는 것**을 이 기준틀의 좌표로 옮긴다 — `x − Xobs`.
 *
 * 지나간 자리에는 쓰지 않는다. 과거 사건은 `eventInFrame` 이다.
 */
export function positionInFrame(frame: ObserverFrame, world: Vec2): Vec2 {
  return [world[0] - frame.at[0], world[1] - frame.at[1]];
}

/**
 * **지나간 사건**을 이 기준틀의 좌표로 옮긴다 — `x − Xobs + u·(t − tᵢ)`.
 *
 * 둘째 항이 갈릴레이 변환의 전단(shear)이다. 과거일수록 더 밀리고, 그래서 지나온
 * 길이 기준틀에 따라 **기운다.** 이 항을 빠뜨리면 궤적 하나만 안 기우는데, 배경도
 * 흐르고 물체도 움직이므로 **예외도 안 나고 타입도 통과하고 그림만 그럴듯하게 틀린다.**
 * 눈으로 잡기 어려운 종류라 두 변환을 이름으로 갈라 둔다.
 *
 * 세계 좌표에 궤적을 한 번 그려 놓고 카메라만 옮기는 방식으로는 이 전단이 나오지
 * 않는다. 매 프레임 과거 사건을 지금 기준틀의 좌표로 **다시 찍어야** 한다.
 *
 * 무엇이 이 변환을 받고 무엇이 안 받는지는 조각이 정한다 — 상대속도 조각에서는
 * 뱃머리의 *각도* 가 변환을 받지 않아야 주장이 선다.
 */
export function eventInFrame(frame: ObserverFrame, event: SpacetimeEvent): Vec2 {
  const lag = frame.t - event.t;
  return [
    event.x - frame.at[0] + frame.velocity[0] * lag,
    event.y - frame.at[1] + frame.velocity[1] * lag,
  ];
}

/* ── 곡률 반지름으로 정의되는 경로 ─────────────────────────────────────────── */

/** `pathFromCurvatureRadius` 가 빚어 놓은 경로. 모양이 변하지 않으므로 한 번만 만든다. */
export type CurvaturePath = {
  /** φ 표본마다의 곡선 위 점. */
  readonly points: readonly Vec2[];
  /** 같은 표본의 곡률 중심이 그리는 길 — 축폐선. 공짜로 따라 나온다. */
  readonly evolute: readonly Vec2[];
  /** 시작점부터 잰 호길이. `points` 와 길이가 같다. */
  readonly arcLengths: readonly number[];
  /** 표본의 매개변수 φ(바깥 법선의 방향각). */
  readonly angles: readonly number[];
  /** 표본의 곡률 반지름 — 넘긴 `radiusAt` 을 그대로 잰 값. */
  readonly radii: readonly number[];
  /** 전체 호길이. 닫힌 곡선이면 둘레다. */
  readonly totalLength: number;
  /** 끝점과 첫점 사이 거리. 0 이 아니면 닫히지 않았다는 뜻이다. */
  readonly closureGap: number;
  /** 닫힌 곡선인가. 호길이·각 변환이 한 바퀴를 감을지 끝에서 멈출지를 정한다. */
  readonly closed: boolean;
};

/** 경로 위 한 자리의 곡률 정보. */
export type CurvatureSample = {
  /** 그 자리의 매개변수 φ. 닫힌 곡선에서는 바퀴 수만큼 2π 가 쌓인다. */
  readonly phi: number;
  readonly radius: number;
  readonly point: Vec2;
  /** 그 자리의 곡률 중심 — 축폐선 위의 점. */
  readonly center: Vec2;
};

/**
 * **곡률 반지름을 입력으로 받아** 그 곡률을 갖는 곡선을 빚는다.
 *
 * 곡선을 먼저 정하고 곡률을 미분해 얻는 방향은 실패한다. 기하가 강제하기 때문이다 —
 * 폭 W, 총 회전각 2A 인 곡선의 곡률 반지름은 W/2A 언저리라 **열린 아치에서는 큰 원이
 * 화면의 몇 배가 되고**, 타원은 곡률 반지름 비가 `(a/b)³` 이라 조금만 길쭉해도 손을
 * 벗어나며, **사인 곡선은 변곡점에서 곡률이 0 이라 반지름이 무한대로 터진다**
 * (`radius-of-curvature` NOTES (b)).
 *
 * 그래서 거꾸로 세운다. 바깥 법선의 방향각 φ 에 대한 지지함수 `h(φ)` 로 곡선을 빚으면
 * `R = h + h″` 이므로 **곡률 반지름이 설계값으로 직접 나온다.** 다만 `h` 를 풀 필요는
 * 없다 — 같은 매개화에서
 *
 * ```
 * dP/dφ = R(φ)·(−sin φ, cos φ)      ds = R dφ      중심 = P − R·(cos φ, sin φ)
 * ```
 *
 * 이므로 `R` 만 적분하면 곡선도 축폐선도 호길이도 함께 나온다. `h` 를 두 번 수치
 * 미분하는 것보다 훨씬 안정적이다.
 *
 * **닫힌 볼록 곡선의 조건이 둘이다.**
 * - `R(φ) > 0` 이 어디서나 성립해야 볼록하다. 0 을 지나면 곡선이 스스로를 넘는다.
 * - `R` 에 **1차 조화(`cos φ` · `sin φ` 성분)가 섞이면 닫히지 않는다.** `∫R cos φ dφ`
 *   와 `∫R sin φ dφ` 가 둘 다 0 이어야 끝이 처음으로 돌아온다. `R = C − 3A·cos 2φ`
 *   처럼 2차 이상만 쓰면 저절로 만족된다. 어긋나면 `closureGap` 에 드러나는데,
 *   **그 전까지는 그림이 조금 벌어진 채로 그냥 그려진다.**
 *
 * 곡선은 표본의 무게중심이 원점에 오도록 옮겨 놓는다(`center: false` 로 끌 수 있다).
 * 평행이동은 곡률에도 축폐선에도 영향이 없고, 조각이 자리를 정하기 쉬워진다.
 */
export function pathFromCurvatureRadius(opts: {
  /** 매개변수 φ 에서의 곡률 반지름. 어디서나 양수여야 한다. */
  radiusAt: (phi: number) => number;
  /** 표본 구간 수. 생략하면 360. */
  samples?: number;
  /** φ 의 시작. 생략하면 0. */
  from?: number;
  /** φ 의 끝. 생략하면 2π(닫힌 한 바퀴). */
  to?: number;
  /** 무게중심을 원점으로 옮길지. 생략하면 옮긴다. */
  center?: boolean;
}): CurvaturePath {
  const { radiusAt } = opts;
  const n = Math.max(2, Math.floor(opts.samples ?? 360));
  const from = opts.from ?? 0;
  const to = opts.to ?? Math.PI * 2;
  const step = (to - from) / n;

  const angles: number[] = [];
  const radii: number[] = [];
  const points: [number, number][] = [];
  const arcLengths: number[] = [];

  let x = 0;
  let y = 0;
  let s = 0;
  let ra = radiusAt(from);
  for (let i = 0; i <= n; i++) {
    const phi = from + step * i;
    angles.push(phi);
    radii.push(ra);
    points.push([x, y]);
    arcLengths.push(s);
    if (i === n) break;
    // 심프슨. dP/dφ 는 φ 를 따라 한 바퀴 매끄럽게 도는 삼각함수라, 같은 표본 수에서
    // 사다리꼴보다 오차가 두 자릿수 작다. 이 곡선은 한 번 빚고 계속 쓰므로 여기서
    // 정확해 두면 이후 프레임마다 값이 떠다니지 않는다.
    const mid = phi + step / 2;
    const next = from + step * (i + 1);
    const rm = radiusAt(mid);
    const rb = radiusAt(next);
    x -= (step / 6) * (ra * Math.sin(phi) + 4 * rm * Math.sin(mid) + rb * Math.sin(next));
    y += (step / 6) * (ra * Math.cos(phi) + 4 * rm * Math.cos(mid) + rb * Math.cos(next));
    s += (step / 6) * (ra + 4 * rm + rb);
    ra = rb;
  }

  const head = points[0] ?? [0, 0];
  const tail = points[points.length - 1] ?? head;
  const closureGap = Math.hypot(tail[0] - head[0], tail[1] - head[1]);
  const closed = closureGap <= 1e-6 * Math.max(1, s);

  if (opts.center ?? true) {
    // 닫힌 곡선은 끝 표본이 첫 표본과 같은 점이다. 그대로 세면 그 한 점이 두 번
    // 세어져 무게중심이 미세하게 끌려간다.
    const count = Math.max(1, closed ? points.length - 1 : points.length);
    let mx = 0;
    let my = 0;
    for (let i = 0; i < count; i++) {
      const p = points[i];
      if (!p) continue;
      mx += p[0];
      my += p[1];
    }
    mx /= count;
    my /= count;
    for (const p of points) {
      p[0] -= mx;
      p[1] -= my;
    }
  }

  const evolute: Vec2[] = points.map((p, i) => {
    const phi = angles[i] ?? 0;
    const r = radii[i] ?? 0;
    return [p[0] - r * Math.cos(phi), p[1] - r * Math.sin(phi)];
  });

  return {
    points,
    evolute,
    arcLengths,
    angles,
    radii,
    totalLength: s,
    closureGap,
    closed,
  };
}

/**
 * 호길이 `s` 가 놓인 표본 구간과 그 안에서의 비율을 찾는다.
 *
 * 닫힌 곡선이면 바퀴를 감고, 열린 곡선이면 양 끝에서 멈춘다. `arcLengths` 는 `R > 0`
 * 인 동안 단조 증가하므로 이분 탐색이 성립한다.
 */
function locateArcLength(
  path: CurvaturePath,
  s: number,
): { index: number; frac: number; laps: number } {
  const last = path.arcLengths.length - 1;
  const total = path.totalLength;
  let laps = 0;
  let target = s;
  if (path.closed && total > 0) {
    laps = Math.floor(s / total);
    target = s - laps * total;
  } else {
    target = Math.min(Math.max(s, 0), total);
  }
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((path.arcLengths[mid] ?? 0) <= target) lo = mid;
    else hi = mid;
  }
  const s0 = path.arcLengths[lo] ?? 0;
  const s1 = path.arcLengths[lo + 1] ?? s0;
  return { index: lo, frac: s1 > s0 ? (target - s0) / (s1 - s0) : 0, laps };
}

/**
 * 호길이 → 매개변수 φ.
 *
 * **경로 위를 달리는 표지자는 호길이로 움직여야 한다.** `ds = R dφ` 이므로 φ 를 등속으로
 * 돌리면 굽은 자리에서 느려지고, 그러면 "느린 곳에서 원이 작다" 는 **틀린 읽기가 생긴다.**
 * 원이 바뀌는 이유가 오직 자리라는 것을 지키려면 속력이 어디서나 같아야 한다
 * (`radius-of-curvature` NOTES (b)). 이 어긋남은 눈으로 잡기 어렵다 — 그림은 멀쩡하고
 * 뜻만 바뀐다.
 */
export function angleAtArcLength(path: CurvaturePath, s: number): number {
  const { index, frac, laps } = locateArcLength(path, s);
  const a0 = path.angles[index] ?? 0;
  const a1 = path.angles[index + 1] ?? a0;
  const span = (path.angles[path.angles.length - 1] ?? 0) - (path.angles[0] ?? 0);
  return a0 + (a1 - a0) * frac + laps * span;
}

/**
 * 매개변수 φ → 호길이. 시작 자리를 φ 로 잡아 놓고 이후는 호길이로만 나아갈 때 쓴다.
 */
export function arcLengthAtAngle(path: CurvaturePath, phi: number): number {
  const last = path.angles.length - 1;
  const a0 = path.angles[0] ?? 0;
  const aN = path.angles[last] ?? a0;
  const span = aN - a0;
  if (!(span > 0)) return 0;
  let laps = 0;
  let target = phi;
  if (path.closed) {
    laps = Math.floor((phi - a0) / span);
    target = phi - laps * span;
  } else {
    target = Math.min(Math.max(phi, a0), aN);
  }
  // 표본이 φ 등간격이라 구간은 나눗셈 한 번으로 나온다.
  const t = ((target - a0) / span) * last;
  const index = Math.min(Math.max(Math.floor(t), 0), last - 1);
  const frac = t - index;
  const s0 = path.arcLengths[index] ?? 0;
  const s1 = path.arcLengths[index + 1] ?? s0;
  return laps * path.totalLength + s0 + (s1 - s0) * frac;
}

/**
 * 호길이 `s` 에서의 점·곡률 반지름·곡률 중심을 한 번에 읽는다. 조각의 상태가 호길이
 * 하나로 끝나므로 자동 진행과 손 조작의 인계가 대입 한 줄이 된다.
 *
 * 표본 사이는 선형으로 잇는다. 표본 360 개면 반지름 180 짜리 곡선에서 현의 처짐이
 * 0.01 미만이라 눈에 닿지 않고, 그 대신 결과가 함수를 물고 있지 않은 **순수한 표**로
 * 남는다.
 */
export function sampleAtArcLength(path: CurvaturePath, s: number): CurvatureSample {
  const { index, frac, laps } = locateArcLength(path, s);
  const mix = (a: number, b: number): number => a + (b - a) * frac;

  const a0 = path.angles[index] ?? 0;
  const a1 = path.angles[index + 1] ?? a0;
  const span = (path.angles[path.angles.length - 1] ?? 0) - (path.angles[0] ?? 0);

  const p0 = path.points[index] ?? ([0, 0] as Vec2);
  const p1 = path.points[index + 1] ?? p0;
  const c0 = path.evolute[index] ?? ([0, 0] as Vec2);
  const c1 = path.evolute[index + 1] ?? c0;
  const r0 = path.radii[index] ?? 0;
  const r1 = path.radii[index + 1] ?? r0;

  return {
    phi: mix(a0, a1) + laps * span,
    radius: mix(r0, r1),
    point: [mix(p0[0], p1[0]), mix(p0[1], p1[1])],
    center: [mix(c0[0], c1[0]), mix(c0[1], c1[1])],
  };
}
