/**
 * 조각 한 줄 설명 생성기.
 *
 * 실행: pnpm description:gen
 *
 * 조각의 `description`(호스트 카탈로그의 한 줄 설명)은 **주제의 `desc` 에서 온다.**
 * 작업 순서가 `docs/topics/topics.yaml` → sims 이므로 원본은 주제 쪽이고, 조각이 가진
 * 값은 파생값이다. 둘을 손으로 맞추면 한쪽만 고쳐지는 날이 온다 — `operation` 시절
 * 444 개 중 92 개가 그렇게 갈라졌다.
 *
 * 쓰는 곳: 각 `sims/<category>/<id>/src/schema.ts` 안의 `'label.description'` 블록
 * (messages 에 둔 조각) 또는 선언에 직접 적은 `description:` 블록. **별도 생성물 파일을
 * 두지 않고 그 블록만 제자리에서 다시 쓴다** — S-sim 이 `src/` 루트에 6 파일 외를 두지
 * 못하게 하기 때문이다. 블록 위에는 손으로 고치지 말라는 주석을 함께 쓴다.
 *
 * 주제의 `sim` 이 가리키는 조각 폴더는 **정확히 하나**여야 한다. 없거나 둘 이상이면
 * 실패한다 — 조용히 건너뛰면 id 가 어긋나도 타입과 테스트가 모두 통과한다 (C4).
 * `sim` 이 없는 주제(아직 만들지 않은 것)는 건너뛴다.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { repoRoot } from './sim-schemas.mts';

/** 선언 블록의 언어 순서. 조각 문안의 관례와 같다. */
const ORDER = ['ko', 'en', 'ja', 'zh', 'ar', 'es', 'fr', 'hi', 'id', 'pt'] as const;

const MARK = '  /** 원본 docs/topics/topics.yaml 의 desc — `pnpm description:gen` 이 쓴다. 손으로 고치지 않는다. */';

type Topic = { id: string; sim?: string; desc: Record<string, string> };

function quote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function block(head: string, desc: Record<string, string>): string[] {
  return [MARK, `  ${head}: {`, ...ORDER.map((l) => `    ${l}: ${quote(desc[l]!)},`), '  },'];
}

/** `sims/<category>/<leaf>/src/schema.ts` 를 찾는다. 정확히 하나가 아니면 던진다. */
function schemaFileOf(leaf: string): string {
  const sims = join(repoRoot, 'sims');
  const hits = readdirSync(sims)
    .map((category) => join(sims, category, leaf, 'src', 'schema.ts'))
    .filter((f) => existsSync(f));
  if (hits.length !== 1) {
    throw new Error(`aperi21:${leaf} 의 조각 선언이 ${hits.length}개다 — 정확히 하나여야 한다`);
  }
  return hits[0]!;
}

/**
 * 블록을 찾아 새 줄로 바꾼다. 머리 줄 바로 위의 JSDoc 은 그 블록의 것이라 함께 바꾼다
 * (옛 주석이 남으면 생성 주석과 둘이 된다).
 */
function rewrite(src: string, desc: Record<string, string>, file: string): string {
  const lines = src.split('\n');
  const heads: [RegExp, string][] = [
    [/^  'label\.description': \{/, "'label.description'"],
    [/^  description: \{/, 'description'],
  ];
  const found = heads
    .map(([re, head]) => ({ at: lines.findIndex((l) => re.test(l)), head }))
    .filter((h) => h.at >= 0);
  if (found.length !== 1) {
    throw new Error(`${file}: description 블록이 ${found.length}개다 — 정확히 하나여야 한다`);
  }
  const { at, head } = found[0]!;

  // 끝: 한 줄 선언이면 그 줄, 아니면 들여쓰기 두 칸의 `},` 까지.
  let end = at;
  if (!/\},\s*$/.test(lines[at]!)) {
    end = lines.findIndex((l, i) => i > at && /^  \},\s*$/.test(l));
    if (end < 0) throw new Error(`${file}: description 블록의 끝을 찾지 못했다`);
  }

  // 시작: 바로 위가 JSDoc 이면 그 머리까지 거슬러 올라간다.
  let start = at;
  if (/^\s*\*\/\s*$/.test(lines[at - 1] ?? '') || lines[at - 1] === MARK) {
    if (lines[at - 1] === MARK) start = at - 1;
    else {
      let i = at - 1;
      while (i >= 0 && !/^\s*\/\*\*/.test(lines[i]!)) i--;
      if (i < 0) throw new Error(`${file}: description 위 주석의 머리를 찾지 못했다`);
      start = i;
    }
  }

  lines.splice(start, end - start + 1, ...block(head, desc));
  return lines.join('\n');
}

function main(): void {
  const { topics } = parse(readFileSync(join(repoRoot, 'docs/topics/topics.yaml'), 'utf8')) as {
    topics: Topic[];
  };
  let written = 0;
  let same = 0;
  for (const t of topics) {
    if (!t.sim) continue;
    for (const l of ORDER) {
      if (typeof t.desc?.[l] !== 'string' || t.desc[l]!.trim() === '') {
        throw new Error(`topics.yaml ${t.id}: desc.${l} 이 없다 — 열 언어 필수 (C1)`);
      }
    }
    const desc = Object.fromEntries(ORDER.map((l) => [l, t.desc[l]!.trim()]));
    const file = schemaFileOf(t.sim.replace(/^aperi21:/, ''));
    const src = readFileSync(file, 'utf8');
    const next = rewrite(src, desc, file);
    if (next === src) same++;
    else {
      writeFileSync(file, next);
      written++;
    }
  }
  process.stdout.write(`[description] 주제 desc → 조각 description · 바뀜 ${written} · 그대로 ${same}\n`);
}

main();
