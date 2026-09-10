/**
 * 입자 재료 — 프리미티브 구현이 쓴다. 조각은 이것을 모른다.
 *
 * `tasks/engine-requirements/REQUIREMENTS.md` §4.2.
 */

/**
 * 출생 번호에서 뽑는 안정 난수. 0~1.
 *
 * **프레임마다 새로 뽑으면 흐름이 부들부들 떤다.** 같은 입자는 살아 있는 동안
 * 같은 흩날림을 가져야 하고, 그러려면 난수의 씨앗이 시간이 아니라 그 입자의
 * 정체(출생 번호)여야 한다. 조각마다 다시 발견할 일이 아니다.
 */
export function stableRandom(seed: number, salt = 0): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35 + salt);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export interface EmissionOptions {
  /** 지금 시각(초). */
  time: number;
  /** 초당 방출 개수. */
  rate: number;
  /** 입자 수명(초). */
  life: number;
}

/**
 * 지금 살아 있는 입자의 (출생 번호, 나이) 목록.
 *
 * 배열을 들고 있지 않는다. 나이만으로 자리가 정해지므로 **매 프레임 다시 세어도
 * 같은 결과**가 나오고, 그래서 상태가 없다. 방출 간격의 하위 시간도 저절로
 * 맞는다 — 한 프레임에 여럿이 태어날 때 순서가 뒤집히는 사고가 없다.
 */
export function livingParticles(opts: EmissionOptions): { index: number; age: number }[] {
  const { time, rate, life } = opts;
  if (rate <= 0 || life <= 0) return [];
  const newest = Math.floor(time * rate);
  const count = Math.min(Math.ceil(life * rate), 4096);
  const out: { index: number; age: number }[] = [];
  for (let k = 0; k < count; k++) {
    const index = newest - k;
    if (index < 0) break;
    const age = time - index / rate;
    if (age >= 0 && age <= life) out.push({ index, age });
  }
  return out;
}
