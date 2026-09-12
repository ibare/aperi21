/**
 * 주제 카탈로그 생성기.
 *
 * 원본은 `docs/topics/topics.yaml` 하나다. 사람이 그 파일만 고치고 사이트가 읽는
 * JSON 은 여기서 만든다 — 두 곳에 적으면 반드시 어긋난다.
 *
 * 모집단(글로벌 초·중·고 물리)과 판정 기준, 스키마는 `docs/topics/README.md` 가 정한다.
 *
 * 구조는 FACET `apps/playground/src/catalog.json` 을 따른다: **주제와 구현물이 한
 * 트리에 살고, 구현된 것만 레지스트리 id 를 단다.** FACET 은 835개 항목 중 137개만
 * `facetId` 를 갖는다. 우리는 `simId` 를 쓴다.
 *
 * 이 목록은 **만들 시각화 목록이 아니다.** 주제 하나가 조각 하나가 되지 않으며,
 * 무엇을 만들지는 원본의 `visual` 판정이 가른다. 사이트도 그렇게 렌더해야 한다.
 *
 * 사용: pnpm catalog:topics
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = resolve(ROOT, 'docs/topics/topics.yaml');
const OUT = resolve(ROOT, 'apps/catalog/src/data/catalog.json');

/**
 * 엔진 밖에서 만든 조각(자립 HTML). `tasks/piece-lab/<주제 id>/index.html` 이 있으면
 * 사이트가 iframe 으로 띄운다.
 *
 * **이것은 임시 다리다.** 이 조각들은 `Bundle` 이 아니라 `{aperi21:<id>}` 봉투로
 * 쓸 수 없다. 엔진 경계를 정하기 전에 눈으로 견주려고 붙여 둔 것이다.
 *
 * 디렉터리 이름이 **조각 id** 인 것은 여기 걸리지 않는다 — 주제 id 와 조각 id 는
 * 다를 수 있기 때문이다(`newtons-first-law` ↔ `inertial-frame`). 원본에 적힌 사실이
 * 아니라 파일이 있느냐로 정해지는 파생값이라 여기서 판정한다.
 */
const LAB_SRC = resolve(ROOT, 'tasks/piece-lab');
const LAB_DEST = resolve(ROOT, 'apps/catalog/public/piece-lab');

/** `docs/topics/topics.yaml` 의 항목. 스키마 설명은 `docs/topics/README.md` 5절. */
interface SourceTopic {
  id: string;
  name: string;
  desc: string;
  domain: string;
  /** 'primary' | 'lower' | 'upper'. 교육과정 대조 전에는 null */
  level: string | null;
  /** 근거가 된 계열. 대조 전에는 빈 배열 */
  curricula: string[];
  /** 'yes' | 'no' | 'unsure'. 구현 대상을 가르는 판정 */
  visual: string;
  /** 레지스트리 등록 키 **전체**. 있으면 구현된 것이다 */
  sim?: string;
  /** 어느 배치에서 구현됐나. 배치 기록이 있는 것만 */
  batch?: string;
}

interface Source {
  domains: { id: string; name: string }[];
  topics: SourceTopic[];
}

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
  /** 자립 HTML 조각의 경로. 엔진 밖에서 만든 것이라 simId 와 성격이 다르다. */
  labUrl?: string;
}

interface Domain {
  id: string;
  name: string;
  topics: Topic[];
}

const source = parse(readFileSync(SRC, 'utf8')) as Source;

// 정합 검사 — 원본이 바뀌어 어긋나도 조용히 지나가지 않게.
const domainIds = new Set(source.domains.map((d) => d.id));
const seen = new Set<string>();
for (const t of source.topics) {
  if (seen.has(t.id)) throw new Error(`주제 id 가 중복된다: ${t.id}`);
  seen.add(t.id);
  if (!domainIds.has(t.domain)) {
    throw new Error(`주제 '${t.id}' 의 분과 '${t.domain}' 가 domains 에 없다`);
  }
  // C4 — 등록 키는 원본에 전체가 적혀 있어야 한다. 여기서 조립하지 않는다.
  if (t.sim && !t.sim.startsWith('aperi21:')) {
    throw new Error(`주제 '${t.id}' 의 sim '${t.sim}' 이 등록 키 형태가 아니다`);
  }
}

const byDomain = new Map<string, Topic[]>(source.domains.map((d) => [d.id, []]));
for (const t of source.topics) {
  const topic: Topic = { id: t.id, name: t.name, desc: t.desc };
  if (t.sim) topic.simId = t.sim;
  if (existsSync(resolve(LAB_SRC, t.id, 'index.html'))) {
    topic.labUrl = `piece-lab/${t.id}/index.html`;
  }
  byDomain.get(t.domain)!.push(topic);
}

const domains: Domain[] = source.domains.map((d) => ({
  id: d.id,
  name: d.name,
  topics: byDomain.get(d.id)!,
}));

// 자립 조각을 사이트가 서빙할 수 있는 자리로 복사. 원본은 tasks/piece-lab 하나다.
if (existsSync(LAB_SRC)) {
  rmSync(LAB_DEST, { recursive: true, force: true });
  mkdirSync(LAB_DEST, { recursive: true });
  // 보고서(스크린샷)는 사이트에 싣지 않는다. 계측 키트(_harness)는 조각이 참조하므로 싣는다.
  cpSync(LAB_SRC, LAB_DEST, {
    recursive: true,
    filter: (src) => !src.includes('/_report'),
  });
}

const topics = domains.reduce((n, d) => n + d.topics.length, 0);
const implemented = domains.reduce((n, d) => n + d.topics.filter((t) => t.simId).length, 0);
const labs = domains.reduce((n, d) => n + d.topics.filter((t) => t.labUrl).length, 0);

const catalog = {
  $comment:
    '자동 생성 — 직접 편집하지 말 것. 원본은 docs/topics/topics.yaml. 생성: pnpm catalog:topics',
  version: '2',
  domain: 'physics',
  domains,
  summary: { topics, implemented, labs },
};

writeFileSync(OUT, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

// 판정 현황은 생성물에 싣지 않고 여기서만 알린다 — 사이트가 아직 쓰지 않는 값이다.
const visual = source.topics.reduce<Record<string, number>>((acc, t) => {
  acc[t.visual] = (acc[t.visual] ?? 0) + 1;
  return acc;
}, {});
const leveled = source.topics.filter((t) => t.level).length;

process.stdout.write(
  `[catalog] 도메인 ${domains.length} · 주제 ${topics} · 구현 ${implemented} · 자립조각 ${labs} → ${OUT.replace(ROOT + '/', '')}\n` +
    `[판정] visual ${Object.entries(visual)
      .map(([k, v]) => `${k} ${v}`)
      .join(' · ')} · level 채움 ${leveled}/${topics}\n`,
);
