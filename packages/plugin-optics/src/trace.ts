import type { OpticalElement, Vec2 } from '@aperi21/schema';
import { add, dot, len, norm, reflect, refract, scale, sub } from './math';

/**
 * OpticalElement 의 표면을 로컬 기준의 두 엔드포인트로 근사.
 * orientation 은 표면 법선 각도(라디안). size 가 스칼라면 반높이 근사로 처리,
 * 복합 size 타입은 number 만 지원(MVP).
 *
 * 반환: [A, B, normal] — 선분 양 끝점과 "입사 반대편" 을 향하는 단위 법선.
 */
function elementGeometry(el: OpticalElement): { a: Vec2; b: Vec2; normal: Vec2; half: number } {
  const half = typeof el.size === 'number' ? el.size / 2 : 2;
  const n: Vec2 = [Math.cos(el.orientation), Math.sin(el.orientation)];
  // 선분은 법선 수직 방향으로 2*half.
  const t: Vec2 = [-n[1], n[0]];
  const a = add(el.pos, scale(t, half));
  const b = sub(el.pos, scale(t, half));
  return { a, b, normal: n, half };
}

/**
 * 레이(시작점 + 방향) 가 선분 AB 와 만나는 교차 파라미터.
 * 반환: { t: 레이 매개변수(>0 인 경우만 유효), hit: 교차점 } 또는 null.
 */
function intersectRayWithSegment(
  origin: Vec2,
  dir: Vec2,
  a: Vec2,
  b: Vec2,
): { t: number; hit: Vec2 } | null {
  const s: Vec2 = [b[0] - a[0], b[1] - a[1]];
  const r: Vec2 = dir;
  const denom = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(denom) < 1e-9) return null;
  const oa: Vec2 = [a[0] - origin[0], a[1] - origin[1]];
  const t = (oa[0] * s[1] - oa[1] * s[0]) / denom;
  const u = (oa[0] * r[1] - oa[1] * r[0]) / denom;
  if (t <= 1e-6 || u < 0 || u > 1) return null;
  return { t, hit: [origin[0] + t * r[0], origin[1] + t * r[1]] };
}

export interface TraceResult {
  segments: Vec2[];
  terminated: 'absorbed' | 'escaped' | 'max-bounces';
}

export interface TraceOptions {
  maxBounces?: number;
  maxLength?: number;
  /** 프리즘 외부 굴절률. 기본 1 (공기). */
  mediumIndex?: number;
}

/**
 * 출발점 + 방향에서 시작해 OpticalElement 리스트와 상호작용하며 경로를 추적.
 * 지원 subtype:
 *  - mirror-flat / mirror-concave / mirror-convex → 반사
 *  - lens-thin / lens-convex / lens-concave → thin-lens 근사로 굴절 (포칼길이 기반)
 *  - prism → 굴절(refractiveIndex)
 *  - screen → absorbed
 *  - slit, polarizer, wave-plate → 통과 (간섭/편광은 MVP 범위 밖)
 */
export function traceRay(
  origin: Vec2,
  dir: Vec2,
  elements: readonly OpticalElement[],
  options: TraceOptions = {},
): TraceResult {
  const maxBounces = options.maxBounces ?? 16;
  const maxLength = options.maxLength ?? 1000;
  const mediumIndex = options.mediumIndex ?? 1;

  const segments: Vec2[] = [origin];
  let curOrigin: Vec2 = origin;
  let curDir: Vec2 = norm(dir);
  let totalLen = 0;

  for (let bounce = 0; bounce <= maxBounces; bounce++) {
    // 모든 요소와 교차 검사. 최소 t 선택.
    let best: {
      t: number;
      hit: Vec2;
      el: OpticalElement;
      normal: Vec2;
    } | null = null;
    for (const el of elements) {
      const geom = elementGeometry(el);
      const hit = intersectRayWithSegment(curOrigin, curDir, geom.a, geom.b);
      if (!hit) continue;
      if (!best || hit.t < best.t) {
        // 법선은 입사 반대 방향을 가리키도록 뒤집기.
        const n = dot(curDir, geom.normal) > 0 ? scale(geom.normal, -1) : geom.normal;
        best = { t: hit.t, hit: hit.hit, el, normal: n };
      }
    }

    if (!best) {
      // 아무 것과도 안 부딪힘 → 추적 종료 (최대 길이까지 뻗어나감)
      const remaining = Math.max(0, maxLength - totalLen);
      const end: Vec2 = [
        curOrigin[0] + curDir[0] * remaining,
        curOrigin[1] + curDir[1] * remaining,
      ];
      segments.push(end);
      return { segments, terminated: 'escaped' };
    }

    const segLen = len(sub(best.hit, curOrigin));
    totalLen += segLen;
    segments.push(best.hit);

    const el = best.el;
    const n = best.normal;

    switch (el.subtype) {
      case 'screen':
        return { segments, terminated: 'absorbed' };

      case 'mirror-flat': {
        curDir = norm(reflect(curDir, n));
        break;
      }

      case 'mirror-concave':
      case 'mirror-convex': {
        // focal-length 기반 근축 근사. subtype 에 따라 부호 결정.
        // concave 는 초점길이 양수(수렴), convex 는 음수(발산) 가 관례.
        const f =
          (typeof el.focalLength === 'number' ? el.focalLength : 10) *
          (el.subtype === 'mirror-convex' ? -1 : 1);
        curDir = norm(thinMirrorReflect(curDir, n, best.hit, el.pos, f));
        break;
      }

      case 'lens-thin':
      case 'lens-convex':
      case 'lens-concave': {
        const f =
          (typeof el.focalLength === 'number' ? el.focalLength : 10) *
          (el.subtype === 'lens-concave' ? -1 : 1);
        curDir = norm(thinLensRefract(curDir, n, best.hit, el.pos, f));
        break;
      }

      case 'prism': {
        const nIdx = el.refractiveIndex ?? 1.5;
        const eta = mediumIndex / nIdx;
        curDir = norm(refract(curDir, n, eta));
        break;
      }

      case 'slit':
      case 'polarizer':
      case 'wave-plate':
      default:
        // 통과: 방향 유지, 위치만 아주 살짝 밀어서 self-intersection 방지.
        break;
    }

    // self-intersection 회피: 다음 교차 검사 시 origin 을 hit 에서 방향으로 살짝 이동
    curOrigin = [best.hit[0] + curDir[0] * 1e-6, best.hit[1] + curDir[1] * 1e-6];

    if (totalLen >= maxLength) {
      return { segments, terminated: 'max-bounces' };
    }
  }

  return { segments, terminated: 'max-bounces' };
}

/**
 * 박막 렌즈 근축 근사. element 중심(C), 초점 f. 입사 광선이 C 에서 교차한
 * 것처럼 간주하고, 렌즈 평면과 평행 성분 변화를 부여한다.
 *
 * 출력 방향 d' = d + (hit 에서 광축에 수직으로 떨어진 거리 / f) * (−법선의 평면 성분)
 * MVP 는 정확한 광선 추적이 아니라 "수렴/발산" 을 시각적으로 보여주는 수준.
 */
function thinLensRefract(d: Vec2, n: Vec2, hit: Vec2, center: Vec2, f: number): Vec2 {
  if (Math.abs(f) < 1e-6) return d;
  // 렌즈 평면의 접선(수직) 벡터
  const t: Vec2 = [-n[1], n[0]];
  // hit 에서 중심까지의 평면 내 오프셋 (접선 성분)
  const h = sub(hit, center);
  const y = dot(h, t);
  // 편향각 근사: -y/f (수렴렌즈는 중심 쪽으로 꺾임)
  const deflect = -y / f;
  return norm([d[0] + t[0] * deflect, d[1] + t[1] * deflect]);
}

/**
 * 박막 거울 근축 근사. 거울 반사 후 focal-length 에 따라 추가 편향.
 * 먼저 거울면 법선으로 반사시킨 뒤 lens 와 같은 방식으로 편향량 추가.
 */
function thinMirrorReflect(d: Vec2, n: Vec2, hit: Vec2, center: Vec2, f: number): Vec2 {
  const reflected = reflect(d, n);
  if (Math.abs(f) < 1e-6) return reflected;
  const t: Vec2 = [-n[1], n[0]];
  const h = sub(hit, center);
  const y = dot(h, t);
  const deflect = -y / f;
  return norm([reflected[0] + t[0] * deflect, reflected[1] + t[1] * deflect]);
}

/**
 * thin-lens 결상 공식: 1/v = 1/f - 1/u (u=object distance, 부호 규약: object 는 렌즈 앞쪽 양수).
 * 반환: 이미지 위치(월드좌표), magnification.
 */
export function findImage(
  objectPos: Vec2,
  lens: OpticalElement,
): { position: Vec2; magnification: number } | null {
  if (
    lens.subtype !== 'lens-thin' &&
    lens.subtype !== 'lens-convex' &&
    lens.subtype !== 'lens-concave'
  ) {
    return null;
  }
  const f =
    (typeof lens.focalLength === 'number' ? lens.focalLength : 10) *
    (lens.subtype === 'lens-concave' ? -1 : 1);
  const axis: Vec2 = [Math.cos(lens.orientation), Math.sin(lens.orientation)];
  const rel = sub(objectPos, lens.pos);
  const u = -dot(rel, axis); // 물체가 렌즈 앞(광축 반대) 일 때 양수
  if (Math.abs(u - f) < 1e-6) return null;
  const v = (f * u) / (u - f);
  const mag = -v / u;
  // 이미지 위치 = lens.pos + axis * v (렌즈 뒤쪽). 평면 성분은 mag 배.
  const t: Vec2 = [-axis[1], axis[0]];
  const y = dot(rel, t);
  return {
    position: add(add(lens.pos, scale(axis, v)), scale(t, y * mag)),
    magnification: mag,
  };
}
