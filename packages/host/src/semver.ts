/**
 * 경량 semver 비교. 외부 의존 없이 Plugin 호환 검사에 필요한 수준만.
 *
 * 지원하는 범위 문법:
 * - `1.2.3`        — 정확 일치
 * - `=1.2.3`       — 정확 일치
 * - `^1.2.3`       — 같은 MAJOR (major=0 이면 같은 MINOR)
 * - `~1.2.3`       — 같은 MAJOR·MINOR
 * - `>=1.2.3`      — 이상
 * - `>1.2.3`       — 초과
 * - `<=1.2.3`      — 이하
 * - `<1.2.3`       — 미만
 * - `*`            — 아무 버전
 */

export interface SemverParts {
  major: number;
  minor: number;
  patch: number;
  pre?: string;
}

export function parseSemver(input: string): SemverParts {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(input.trim());
  if (!m) {
    throw new Error(`[semver] invalid version: '${input}'`);
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    pre: m[4],
  };
}

/** a<b 이면 음수, a==b 이면 0, a>b 이면 양수. pre-release 는 숫자 정렬. */
export function compareSemver(a: string, b: string): number {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;
  if (pa.pre === pb.pre) return 0;
  if (pa.pre === undefined) return 1;
  if (pb.pre === undefined) return -1;
  return pa.pre < pb.pre ? -1 : 1;
}

/** "id" 또는 "id@range" 를 분해. range 가 없으면 undefined. */
export function parseRequirement(raw: string): { id: string; range?: string } {
  const at = raw.lastIndexOf('@');
  // 선두 '@' 는 scope 표기의 일부 — 패키지 이름에 @ 가 들어간다.
  // 따라서 "@scope/name@^1.0" 형태에서는 마지막 '@' 만 버전 구분자.
  if (at <= 0) return { id: raw };
  const id = raw.slice(0, at);
  const range = raw.slice(at + 1);
  if (!range) return { id };
  return { id, range };
}

export function matchesRange(version: string, range: string): boolean {
  const r = range.trim();
  if (r === '*' || r === '') return true;

  // 비교 연산자 접두어
  if (r.startsWith('>=')) return compareSemver(version, r.slice(2).trim()) >= 0;
  if (r.startsWith('<=')) return compareSemver(version, r.slice(2).trim()) <= 0;
  if (r.startsWith('>')) return compareSemver(version, r.slice(1).trim()) > 0;
  if (r.startsWith('<')) return compareSemver(version, r.slice(1).trim()) < 0;
  if (r.startsWith('=')) return compareSemver(version, r.slice(1).trim()) === 0;

  if (r.startsWith('^')) {
    const base = parseSemver(r.slice(1).trim());
    const v = parseSemver(version);
    if (compareSemver(version, r.slice(1).trim()) < 0) return false;
    if (base.major > 0) return v.major === base.major;
    if (base.minor > 0) return v.major === 0 && v.minor === base.minor;
    return v.major === 0 && v.minor === 0 && v.patch === base.patch;
  }

  if (r.startsWith('~')) {
    const base = parseSemver(r.slice(1).trim());
    const v = parseSemver(version);
    if (compareSemver(version, r.slice(1).trim()) < 0) return false;
    return v.major === base.major && v.minor === base.minor;
  }

  // 연산자 없으면 정확 일치
  return compareSemver(version, r) === 0;
}
