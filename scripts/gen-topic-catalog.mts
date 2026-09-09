/**
 * 주제 카탈로그 생성기.
 *
 * 원본은 `tasks/piece-catalog/PHYSICS-TOPICS.md` 하나다. 사람이 그 문서만 고치고
 * 사이트가 읽는 JSON 은 여기서 만든다 — 두 곳에 적으면 반드시 어긋난다.
 *
 * 구조는 FACET `apps/playground/src/catalog.json` 을 따른다: **주제와 구현물이 한
 * 트리에 살고, 구현된 것만 레지스트리 id 를 단다.** FACET 은 835개 항목 중 137개만
 * `facetId` 를 갖는다. 우리는 `simId` 를 쓴다.
 *
 * 이 목록은 **만들 시각화 목록이 아니다.** 질문을 캘 맥락이며, 주제 하나가 조각
 * 하나가 되지 않는다. 사이트도 그렇게 렌더해야 한다.
 *
 * 사용: pnpm catalog:topics
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'tasks/piece-catalog/PHYSICS-TOPICS.md');
const OUT = resolve(ROOT, 'apps/catalog/src/data/catalog.json');

/** 문서의 분과 제목 → 도메인 id. 문서에는 번호와 한글 이름만 있다. */
const DOMAIN_IDS: Record<string, string> = {
  '운동학': 'kinematics',
  '뉴턴 역학': 'newtonian-mechanics',
  '일·에너지·운동량': 'energy-momentum',
  '회전과 진동': 'rotation-oscillation',
  '중력과 천체': 'gravitation',
  '유체': 'fluids',
  '열과 통계': 'thermodynamics',
  '파동과 음향': 'waves-acoustics',
  '광학': 'optics',
  '전자기': 'electromagnetism',
  '현대물리': 'modern-physics',
};

/**
 * 구현된 sim ↔ 주제 대응. **잠정이다.**
 *
 * 이 셋은 주제 목록보다 먼저, 질문 없이 만들어졌다 (`tasks/facet-insights/ANALYSIS.md`
 * §4). 실험실 자격 기준으로 재보면 셋 다 미달이거나 조건부다. 여기 적은 것은
 * "이 주제 자리에 마운트 가능한 것이 하나 있다" 는 사실일 뿐, 그 주제를 제대로
 * 답한다는 뜻이 아니다.
 *
 * `kind` 를 달지 않는 것도 그래서다. 조각·실험실 분류는 그 규범으로 만든 것에만 붙인다.
 */
const IMPLEMENTED: Record<string, string> = {
  'projectile-motion': 'aperi21:projectile',
  'thin-lens': 'aperi21:ray-tracing',
  'series-parallel-resistors': 'aperi21:dc-circuit',
};

interface Topic {
  id: string;
  name: string;
  desc: string;
  /** 조각·실험실 분류. 그 규범으로 만든 것에만 붙는다. */
  kind?: 'piece' | 'lab';
  /** 이 조각을 만들게 한 주제. kind 가 있을 때만. */
  origin?: string;
  /** 레지스트리 id. **있으면 구현된 것이다.** */
  simId?: string;
}

interface Domain {
  id: string;
  name: string;
  topics: Topic[];
}

function parse(md: string): Domain[] {
  const domains: Domain[] = [];
  let current: Domain | null = null;

  for (const line of md.split('\n')) {
    const heading = line.match(/^## \d+\.\s+(.+?)\s*$/);
    if (heading) {
      const name = heading[1]!;
      const id = DOMAIN_IDS[name];
      if (!id) throw new Error(`분과 '${name}' 의 도메인 id 가 DOMAIN_IDS 에 없다`);
      current = { id, name, topics: [] };
      domains.push(current);
      continue;
    }
    // `## 집계` 같은 다른 h2 를 만나면 분과 구간이 끝난다.
    if (line.startsWith('## ')) current = null;
    if (!current) continue;

    const row = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/);
    if (!row) continue;
    const [, id, name, desc] = row as unknown as [string, string, string, string];
    const topic: Topic = { id, name, desc };
    if (IMPLEMENTED[id]) topic.simId = IMPLEMENTED[id];
    current.topics.push(topic);
  }
  return domains;
}

const domains = parse(readFileSync(SRC, 'utf8'));

// 정합 검사 — 문서가 바뀌어 매핑이 떠도 조용히 지나가지 않게.
const allIds = new Set(domains.flatMap((d) => d.topics.map((t) => t.id)));
if (allIds.size !== domains.reduce((n, d) => n + d.topics.length, 0)) {
  throw new Error('주제 id 가 중복된다');
}
for (const topicId of Object.keys(IMPLEMENTED)) {
  if (!allIds.has(topicId)) {
    throw new Error(`IMPLEMENTED 의 '${topicId}' 가 주제 목록에 없다 — 문서가 바뀌었는지 확인`);
  }
}

const topics = domains.reduce((n, d) => n + d.topics.length, 0);
const implemented = domains.reduce(
  (n, d) => n + d.topics.filter((t) => t.simId).length,
  0,
);

const catalog = {
  $comment:
    '자동 생성 — 직접 편집하지 말 것. 원본은 tasks/piece-catalog/PHYSICS-TOPICS.md. 생성: pnpm catalog:topics',
  version: '2',
  domain: 'physics',
  domains,
  summary: { topics, implemented },
};

writeFileSync(OUT, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
process.stdout.write(
  `[catalog] 도메인 ${domains.length} · 주제 ${topics} · 구현 ${implemented} → ${OUT.replace(ROOT + '/', '')}\n`,
);
