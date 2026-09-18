// ========================================================================
// nuclear-structure — 순수 계산
// ========================================================================
// 쌓는 상태가 없다. 핵의 모양은 (Z, N) 의 함수이고, 옮겨 가고 들어오고 바뀌는 것은
// 시간표 진행도의 함수다. `step` 은 항등이다.
//
// 핵자 배치 — 해바라기 씨 배열(황금각 나선). i 번째 자리는 중심에서 √(i+½) 에
// 비례해 떨어지므로 자리를 더해도 앞 자리가 움직이지 않는다. 새 알갱이가 **바깥
// 테두리에 붙는다** — 「더 들어왔다」 가 모양으로 읽힌다.
//
// 종류 배정 — 앞의 2·min(Z, N) 자리는 양성자 · 중성자가 번갈아, 나머지는 많은 쪽.
// 그래서 탄소-12 → 탄소-14 는 12 · 13 번 자리(중성자)가 더해지는 것이고, 탄소-14 →
// 질소-14 는 12 번 자리 하나가 중성자에서 양성자로 바뀌는 것이다.
// ========================================================================

import type { StageDef, Vec2 } from '@aperi21/schema';
import { ELEMENTS, N1, N2, N3, NUCLEON_SPACING, Z1, Z2, Z3 } from './schema';
import type { NuclearStructureState } from './state';

export type Nucleon = 'p' | 'n';

export interface Nuclide {
  /** 양성자 수(원자 번호). */
  z: number;
  /** 중성자 수. */
  n: number;
}

export interface NuclearStructureConstants {
  nuclides: readonly [Nuclide, Nuclide, Nuclide];
}

/** 스테이지 상수를 기본값과 함께 읽는다 (원칙 2). */
export function readConstants(stage: StageDef): NuclearStructureConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    nuclides: [
      { z: c.z1 ?? Z1, n: c.n1 ?? N1 },
      { z: c.z2 ?? Z2, n: c.n2 ?? N2 },
      { z: c.z3 ?? Z3, n: c.n3 ?? N3 },
    ],
  };
}

/** 질량수 A = Z + N. */
export function massNumber(k: Nuclide): number {
  return k.z + k.n;
}

/** 원자 번호의 기호 · 이름 키. 표에 없는 Z 는 던진다 — 빈 이름표로 조용히 틀리지 않게. */
export function elementOf(z: number): (typeof ELEMENTS)[number] {
  const e = ELEMENTS[z];
  if (!e) throw new Error(`nuclear-structure: 원소 표에 Z=${z} 가 없다`);
  return e;
}

/** 자리 i 의 핵자 종류. 앞은 번갈아, 뒤는 많은 쪽. */
export function nucleonTypes(k: Nuclide): Nucleon[] {
  const pair = Math.min(k.z, k.n);
  const out: Nucleon[] = [];
  for (let i = 0; i < 2 * pair; i++) out.push(i % 2 === 0 ? 'p' : 'n');
  const rest: Nucleon = k.z > k.n ? 'p' : 'n';
  for (let i = 2 * pair; i < massNumber(k); i++) out.push(rest);
  return out;
}

/** 황금각(라디안). */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** 자리 i 의 핵 중심 기준 위치(월드). 자리를 더해도 앞 자리는 그대로다. */
export function nucleonOffset(i: number): Vec2 {
  const r = NUCLEON_SPACING * Math.sqrt(i + 0.5);
  const a = i * GOLDEN_ANGLE;
  return [r * Math.cos(a), r * Math.sin(a)];
}

/** 자리 i 에서 바깥쪽을 향한 단위 벡터 — 새 알갱이가 이 방향에서 들어온다. */
export function outward(i: number): Vec2 {
  const a = i * GOLDEN_ANGLE;
  return [Math.cos(a), Math.sin(a)];
}

/** 두 핵을 자리마다 견준 결과. 같은 자리는 그대로, 다르면 바뀜, 한쪽에만 있으면 들어옴 · 나감. */
export type SlotChange = 'same' | 'change' | 'arrive' | 'leave';

export function diff(from: Nuclide, to: Nuclide): SlotChange[] {
  const a = nucleonTypes(from);
  const b = nucleonTypes(to);
  const out: SlotChange[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i >= a.length) out.push('arrive');
    else if (i >= b.length) out.push('leave');
    else out.push(a[i] === b[i] ? 'same' : 'change');
  }
  return out;
}

/** 캡션 `vars` 가 가리킬 문자열 — 스테이지 상수에서 만든다. 선언된 정수를 그대로 쓴다. */
export function captionOf(c: NuclearStructureConstants): NuclearStructureState['caption'] {
  const [k1, k2, k3] = c.nuclides;
  return {
    z1: String(k1.z),
    n1: String(k1.n),
    a1: String(massNumber(k1)),
    a2: String(massNumber(k2)),
    z2: String(k2.z),
    z3: String(k3.z),
    s3: elementOf(k3.z).symbol,
  };
}

/** 쌓는 상태가 없다 — 캡션 문자열만 들고 있다. */
export function step(params: { state: NuclearStructureState }): NuclearStructureState {
  return params.state;
}
