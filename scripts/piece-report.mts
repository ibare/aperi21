/**
 * 자유 구현 조각 보고서 — 코드를 읽기 전에 보는 한 장.
 *
 * 각 조각을 headless 크롬으로 여러 시각(?t=)에 열어 두 가지를 모은다.
 *   - 스크린샷           → 사람이 배치로 확인하는 화면
 *   - piece-kit 계측 JSON → 묶음별 캔버스 호출 수, 오류, 실제 캔버스 크기
 * 여기에 조각이 스스로 쓴 inventory.json 을 붙여 _report/ 에 떨군다.
 *
 *   pnpm piece:report --batch=00-pilot-kinematics
 *        배치 매니페스트(tasks/piece-lab/_batches/<name>.json)의 조각들 → _report/<name>/
 *        확인 지점 ② 의 보고서다. 한 페이지에 한 배치만 담는다
 *   pnpm piece:report <id…>
 *        배치 없는 점검 → _report/_scratch/<id>/ (여럿이면 _scratch/_adhoc/)
 *        에이전트의 자기 점검용. 배치 보고서를 덮지 않는다
 *   --sims=http://localhost:5176/aperi21/
 *        정식 sims 가 있으면 같은 t 의 스크린샷을 자유 구현본 옆에 둔다 (카탈로그 dev 서버 필요)
 *
 * 산출물 (gitignore — 언제든 다시 만든다)
 *   _report/index.html              배치 목차. 각 배치의 summary.json 만 모은다
 *   _report/<batch>/index.html      사람용 — 배치 합계 · 조각 × 시각 스크린샷 · 엔진 대조
 *   _report/<batch>/report.md       분석용 — 계측 표 · inventory · 엔진 대조
 *   _report/<batch>/summary.json    목차가 읽는 요약
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LAB = join(ROOT, 'tasks/piece-lab');
const REPORT_ROOT = join(LAB, '_report');
const BATCHES = join(LAB, '_batches');
/** 이번 실행의 출력 자리. main 이 인자를 보고 정한다. */
let OUT = REPORT_ROOT;
let SHOTS = join(OUT, 'shots');
/** 한 번의 크롬 실행이 이보다 오래 걸리면 끊는다. */
const CHROME_TIMEOUT_MS = 30_000;
const WIDTH = 900;
const HEIGHT = 720;
const DEFAULT_PROBES = [0, 1.5, 4, 8];

function findChrome(): string {
  const cache = join(process.env.HOME ?? '', 'Library/Caches/ms-playwright');
  const found: string[] = [];
  const walk = (dir: string, depth: number): void => {
    if (depth > 5 || !existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (name === 'Google Chrome for Testing' && statSync(p).isFile()) found.push(p);
      else if (statSync(p).isDirectory()) walk(p, depth + 1);
    }
  };
  walk(cache, 0);
  const pick = found.sort().pop();
  if (!pick) throw new Error('headless 크롬을 찾지 못했다 (~/Library/Caches/ms-playwright)');
  return pick;
}

interface Inventory {
  id?: string;
  claim?: string;
  verb?: string;
  probeTimes?: number[];
  elements?: {
    mark?: string;
    what?: string;
    physical?: string;
    drawing?: string;
    motion?: string;
    state?: string;
    interaction?: string | null;
  }[];
  controls?: unknown[];
  hidden?: string[];
  timeline?: { t: number; what: string }[];
  engineWish?: string[];
}

/** 메인 에이전트가 원본을 엔진 어휘에 대 본 결과. `tasks/piece-lab/<id>/engine-fit.json`. */
interface EngineFit {
  rows?: { element: string; vocab?: string; status: '있음' | '수정 필요' | '없음' | '엔진 밖'; note?: string }[];
  outside?: string[];
}

const FIT_ORDER = ['없음', '수정 필요', '엔진 밖', '있음'] as const;

interface Probe {
  t: number;
  shot: string;
  /** 같은 t 의 정식 sims 스크린샷. sims 가 없거나 --sims 를 안 줬으면 없다. */
  simsShot?: string;
  report: {
    t?: number;
    frames?: number;
    marks?: Record<string, Record<string, number>>;
    canvases?: { w: number; h: number }[];
    errors?: string[];
  } | null;
}

function chromeArgs(extra: string[], url: string): string[] {
  return [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--force-device-scale-factor=1', `--window-size=${WIDTH},${HEIGHT}`,
    '--virtual-time-budget=1500', '--allow-file-access-from-files',
    ...extra, url,
  ];
}

function probeSims(chrome: string, base: string, id: string, t: number): string | undefined {
  const shot = join(SHOTS, `${fileId(id)}@${t}.sims.png`);
  const url = `${base.replace(/\/?$/, '/')}#/topic/${id}?t=${t}`;
  try {
    execFileSync(
      chrome,
      [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        '--force-device-scale-factor=1', `--window-size=${WIDTH},${HEIGHT + 400}`,
        '--virtual-time-budget=5000', `--screenshot=${shot}`, url,
      ],
      { timeout: CHROME_TIMEOUT_MS, stdio: 'ignore' },
    );
    return shot;
  } catch {
    return undefined;
  }
}

function probe(chrome: string, id: string, t: number): Probe {
  const url = pathToFileURL(join(LAB, id, 'index.html')).href + `?t=${t}&seed=1`;
  const shot = join(SHOTS, `${fileId(id)}@${t}.png`);
  execFileSync(chrome, chromeArgs([`--screenshot=${shot}`], url), {
    timeout: CHROME_TIMEOUT_MS, stdio: 'ignore',
  });
  let report: Probe['report'] = null;
  try {
    const dom = execFileSync(chrome, chromeArgs(['--dump-dom'], url), {
      timeout: CHROME_TIMEOUT_MS, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024,
    }).toString('utf8');
    const m = dom.match(/<script[^>]*id="piece-report"[^>]*>([\s\S]*?)<\/script>/);
    if (m) report = JSON.parse(m[1]!.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  } catch {
    report = null;
  }
  return { t, shot, report };
}

/** 하위 경로 id(_harness/example)를 파일 이름으로 쓸 수 있게. */
function fileId(id: string): string {
  return id.replace(/[\/]/g, '__');
}

/** 카탈로그에서 이 주제의 simId. 조각 id 와 주제 id 는 같게 둔다. */
function simIdOf(id: string): string | undefined {
  const catalog = JSON.parse(readFileSync(join(ROOT, 'apps/catalog/src/data/catalog.json'), 'utf8'));
  let found: string | undefined;
  const walk = (o: unknown): void => {
    if (found || !o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    const rec = o as Record<string, unknown>;
    if (rec.id === id && typeof rec.simId === 'string') found = rec.simId;
    Object.values(rec).forEach(walk);
  };
  walk(catalog);
  return found;
}

/**
 * 렌더러 안에서 적분하는 어휘. `inspectAt` 시각 이동으로는 전진하지 않아서
 * 자유 구현본과 다르게 나온다 — 조각 탓이 아니라 장치 탓인 차이다.
 */
const INTEGRATING_VOCAB = ['filament', 'vortexField'];

function comparisonLimit(id: string): string[] {
  const dirs = readdirSync(join(ROOT, 'sims'))
    .map((c) => join(ROOT, 'sims', c, id, 'src'))
    .filter((d) => existsSync(d));
  const hits = new Set<string>();
  for (const d of dirs) {
    for (const f of readdirSync(d)) {
      if (!f.endsWith('.ts')) continue;
      const text = readFileSync(join(d, f), 'utf8');
      for (const v of INTEGRATING_VOCAB) if (text.includes(`type: '${v}'`)) hits.add(v);
    }
  }
  return [...hits];
}

function sumOps(ops: Record<string, number> | undefined): number {
  return Object.values(ops ?? {}).reduce((a, b) => a + b, 0);
}

function listPieces(): string[] {
  return readdirSync(LAB).filter(
    (d) => !d.startsWith('_') && existsSync(join(LAB, d, 'index.html')),
  );
}

interface BatchManifest {
  name: string;
  title?: string;
  record?: string;
  pieces: string[];
}

interface BatchSummary {
  name: string;
  title: string;
  record?: string;
  generatedAt: string;
  pieces: string[];
  gaps: { 없음: number; '수정 필요': number };
  outside: number;
  warnings: number;
  sims: boolean;
}

/** 루트 목차 — 배치마다 summary.json 하나만 읽는다. 조각이 수백 개여도 이 페이지는 가볍다. */
function writeRootIndex(): void {
  const esc = (s: string): string => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
  const batches: BatchSummary[] = existsSync(REPORT_ROOT)
    ? readdirSync(REPORT_ROOT)
        .filter((d) => !d.startsWith('_') && existsSync(join(REPORT_ROOT, d, 'summary.json')))
        .map((d) => JSON.parse(readFileSync(join(REPORT_ROOT, d, 'summary.json'), 'utf8')) as BatchSummary)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];
  const rows = batches
    .map(
      (b) => `<tr><td><a href="${esc(b.name)}/index.html">${esc(b.name)}</a></td><td>${esc(b.title)}</td>
      <td>${b.pieces.length}</td><td>${b.gaps['없음']}</td><td>${b.gaps['수정 필요']}</td><td>${b.outside}</td>
      <td>${b.warnings ? `<b class="warn">${b.warnings}</b>` : '0'}</td><td>${b.sims ? 'sims 비교' : '원본'}</td>
      <td>${esc(b.generatedAt.slice(0, 16).replace('T', ' '))}</td></tr>`,
    )
    .join('');
  writeFileSync(
    join(REPORT_ROOT, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>조각 보고서 목차</title>
<style>body{margin:0;padding:24px;font:14px/1.5 system-ui,sans-serif;background:#f6f3ec;color:#23282e}
h1{font-size:20px;margin:0 0 16px} table{border-collapse:collapse;background:#fff;border:1px solid #ddd}
th,td{padding:6px 12px;border-top:1px solid #eee;text-align:left} th{color:#777;font-weight:500} .warn{color:#c33}</style>
<h1>조각 보고서 — 배치 목차</h1>
<table><thead><tr><th>배치</th><th>제목</th><th>조각</th><th>없음</th><th>수정 필요</th><th>엔진 밖</th><th>경고</th><th>종류</th><th>만든 때</th></tr></thead>
<tbody>${rows || '<tr><td colspan="9">배치 보고서가 아직 없다</td></tr>'}</tbody></table>
`,
  );
}

function main(): void {
  const args = process.argv.slice(2);
  const ids = args.filter((a) => !a.startsWith('-'));
  const simsBase = args.find((a) => a.startsWith('--sims='))?.slice('--sims='.length);
  const batchName = args.find((a) => a.startsWith('--batch='))?.slice('--batch='.length);

  let manifest: BatchManifest | null = null;
  let pieces: string[];
  if (batchName) {
    const mf = join(BATCHES, `${batchName}.json`);
    if (!existsSync(mf)) throw new Error(`배치 매니페스트가 없다: ${mf}`);
    manifest = JSON.parse(readFileSync(mf, 'utf8')) as BatchManifest;
    pieces = manifest.pieces;
    OUT = join(REPORT_ROOT, manifest.name);
  } else {
    pieces = ids.length > 0 ? ids : listPieces();
    OUT = join(REPORT_ROOT, '_scratch', pieces.length === 1 ? fileId(pieces[0]!) : '_adhoc');
  }
  SHOTS = join(OUT, 'shots');
  // 이 출력 자리의 옛 스크린샷을 지운다 — 남아 있으면 이번 실행에 없는 시각이 섞인다.
  rmSync(SHOTS, { recursive: true, force: true });
  const chrome = findChrome();
  mkdirSync(SHOTS, { recursive: true });

  const results: { id: string; inv: Inventory; probes: Probe[]; fit: EngineFit | null }[] = [];
  for (const id of pieces) {
    const invPath = join(LAB, id, 'inventory.json');
    const inv: Inventory = existsSync(invPath) ? JSON.parse(readFileSync(invPath, 'utf8')) : {};
    const times = inv.probeTimes?.length ? inv.probeTimes : DEFAULT_PROBES;
    const probes = times.map((t) => probe(chrome, id, t));
    if (simsBase && simIdOf(id)) {
      for (const p of probes) p.simsShot = probeSims(chrome, simsBase, id, p.t);
    }
    const fitPath = join(LAB, id, 'engine-fit.json');
    const fit: EngineFit | null = existsSync(fitPath) ? JSON.parse(readFileSync(fitPath, 'utf8')) : null;
    results.push({ id, inv, probes, fit });
    const ok = probes.filter((p) => p.report).length;
    console.log(`  ${id.padEnd(36)} 시각 ${times.length}개 · 계측 ${ok}/${times.length}`);
  }

  // ---- 분석용 report.md ----
  const md: string[] = ['# 자유 구현 보고서', ''];

  // 배치 전체 — 엔진 작업 목록 초안
  const gaps = results.flatMap(({ id, fit }) =>
    (fit?.rows ?? []).filter((r) => r.status === '없음' || r.status === '수정 필요').map((r) => ({ id, ...r })),
  );
  const outside = results.flatMap(({ id, fit }) => (fit?.outside ?? []).map((o) => ({ id, o })));
  if (results.some((r) => r.fit)) {
    md.push('## 엔진에 없는 기능 · 수정 필요 (배치 합계)', '');
    if (gaps.length) {
      md.push('| 판정 | 조각 | 화면 요소 | 어휘 | 근거 |', '|---|---|---|---|---|');
      for (const g of gaps.sort((a, b) => FIT_ORDER.indexOf(a.status) - FIT_ORDER.indexOf(b.status))) {
        md.push(`| ${g.status} | ${g.id} | ${g.element} | ${g.vocab ?? ''} | ${g.note ?? ''} |`);
      }
    } else md.push('없음 — 지금 어휘로 모두 된다.');
    md.push('');
    if (outside.length) md.push('**엔진 밖 — 결정 필요**', ...outside.map((x) => `- ${x.id}: ${x.o}`), '');
  }
  const missingFit = results.filter((r) => !r.fit).map((r) => r.id);
  if (missingFit.length) md.push(`- ⚠ 엔진 대조(engine-fit.json) 없음: ${missingFit.join(', ')}`, '');

  for (const { id, inv, probes, fit } of results) {
    md.push(`## ${id}`, '');
    if (inv.claim) md.push(`**주장** ${inv.claim}`, '');
    if (inv.verb) md.push(`**동사** ${inv.verb}`, '');
    const problems: string[] = [];
    if (!existsSync(join(LAB, id, 'inventory.json'))) problems.push('inventory.json 없음');
    if (probes.some((p) => !p.report)) problems.push('계측 JSON 없음 — piece-kit 을 싣지 않았거나 loop 를 쓰지 않았다');
    const errs = [...new Set(probes.flatMap((p) => p.report?.errors ?? []))];
    if (errs.length) problems.push(`오류 ${errs.length}건: ${errs.slice(0, 3).join(' / ')}`);
    const unmarked = probes.map((p) => sumOps(p.report?.marks?.['(묶음 밖)']));
    if (unmarked.some((n) => n > 20)) problems.push(`묶음 밖 호출이 많다 (${unmarked.join(', ')}) — mark 로 감싸지 않은 그리기`);
    if (problems.length) md.push(...problems.map((p) => `- ⚠ ${p}`), '');
    const limit = comparisonLimit(id);
    if (limit.length) md.push(`- ⓘ 비교 한계 — sims 가 렌더러 안에서 적분하는 어휘(${limit.join(', ')})를 쓴다. 같은 t 라도 자유 구현본과 다르게 나온다`, '');

    // 묶음 × 시각 표
    const marks = [...new Set(probes.flatMap((p) => Object.keys(p.report?.marks ?? {})))];
    md.push(`| 묶음 | ${probes.map((p) => `t=${p.t}`).join(' | ')} | 주로 쓴 호출 |`);
    md.push(`|---|${probes.map(() => '---:').join('|')}|---|`);
    for (const m of marks) {
      const cells = probes.map((p) => String(sumOps(p.report?.marks?.[m])));
      const merged: Record<string, number> = {};
      for (const p of probes) for (const [k, v] of Object.entries(p.report?.marks?.[m] ?? {})) merged[k] = (merged[k] ?? 0) + v;
      const top = Object.entries(merged).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k).join(' ');
      md.push(`| ${m} | ${cells.join(' | ')} | ${top} |`);
    }
    md.push('');

    if (inv.elements?.length) {
      md.push('| 묶음 | 무엇 | 물리 | 그리는 법 | 운동 | 상태 |', '|---|---|---|---|---|---|');
      for (const e of inv.elements) {
        md.push(`| ${e.mark ?? ''} | ${e.what ?? ''} | ${e.physical ?? ''} | ${e.drawing ?? ''} | ${e.motion ?? ''} | ${e.state ?? ''} |`);
      }
      md.push('');
    }
    if (inv.hidden?.length) md.push('**일부러 두지 않은 것**', ...inv.hidden.map((h) => `- ${h}`), '');
    if (inv.engineWish?.length) md.push('**다시 짜기 아까웠던 것 (자기 신고)**', ...inv.engineWish.map((h) => `- ${h}`), '');
    if (fit?.rows?.length) {
      md.push('**엔진 대조**', '', '| 화면 요소 | 어휘 | 판정 | 근거 |', '|---|---|---|---|');
      for (const r of fit.rows) md.push(`| ${r.element} | ${r.vocab ?? ''} | ${r.status} | ${r.note ?? ''} |`);
      md.push('');
    }
  }
  writeFileSync(join(OUT, 'report.md'), md.join('\n') + '\n');

  // ---- 사람용 index.html ----
  const esc = (s: string): string => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
  const badge = (st: string): string =>
    `<span class="st st-${({ '있음': 'ok', '수정 필요': 'fix', '없음': 'no', '엔진 밖': 'out' } as Record<string, string>)[st] ?? 'ok'}">${esc(st)}</span>`;
  const fitTable = (fit: EngineFit | null): string => {
    if (!fit?.rows?.length) return '<p class="warn">엔진 대조(engine-fit.json) 없음</p>';
    const rows = fit.rows
      .map((r) => `<tr><td>${esc(r.element)}</td><td><code>${esc(r.vocab ?? '')}</code></td><td>${badge(r.status)}</td><td>${esc(r.note ?? '')}</td></tr>`)
      .join('');
    const out = fit.outside?.length ? `<p class="out"><b>엔진 밖</b> — ${fit.outside.map(esc).join(' · ')}</p>` : '';
    return `<table class="fit"><thead><tr><th>화면 요소</th><th>어휘</th><th>판정</th><th>근거</th></tr></thead><tbody>${rows}</tbody></table>${out}`;
  };
  const summary = results.some((r) => r.fit)
    ? `<section class="summary"><h2>엔진에 없는 기능 · 수정 필요 — 배치 합계</h2>${
        gaps.length
          ? `<table class="fit"><thead><tr><th>판정</th><th>조각</th><th>화면 요소</th><th>어휘</th><th>근거</th></tr></thead><tbody>${gaps
              .map((g) => `<tr><td>${badge(g.status)}</td><td>${esc(g.id)}</td><td>${esc(g.element)}</td><td><code>${esc(g.vocab ?? '')}</code></td><td>${esc(g.note ?? '')}</td></tr>`)
              .join('')}</tbody></table>`
          : '<p>없음 — 지금 어휘로 모두 된다.</p>'
      }${outside.length ? `<p class="out"><b>엔진 밖 — 결정 필요</b></p><ul>${outside.map((x) => `<li>${esc(x.id)}: ${esc(x.o)}</li>`).join('')}</ul>` : ''}</section>`
    : '';
  // 출력 자리에서 tasks/piece-lab 까지의 상대 경로 (_report/<batch> → ../.., _report/_scratch/<id> → ../../..)
  const labLink = relative(OUT, LAB) || '.';
  const cards = results.map(({ id, inv, probes, fit }) => {
    const shots = probes.map((p) => {
      const err = p.report?.errors?.length ? `<b class="err">오류 ${p.report.errors.length}</b>` : '';
      const sims = p.simsShot
        ? `<img class="sims" src="shots/${esc(fileId(id))}@${p.t}.sims.png" loading="lazy">`
        : '';
      return `<figure><img src="shots/${esc(fileId(id))}@${p.t}.png" loading="lazy">${sims}<figcaption>t = ${p.t}s ${err}${sims ? ' · 위 자유 구현 / 아래 sims' : ''}</figcaption></figure>`;
    }).join('');
    return `<section><h2>${esc(id)}</h2>${inv.claim ? `<p class="claim">${esc(inv.claim)}</p>` : ''}
      <div class="row">${shots}</div>
      <h3>엔진 대조</h3>${fitTable(fit)}
      <p class="links"><a href="${esc(labLink)}/${esc(id)}/index.html">실시간으로 열기</a> · <a href="${esc(labLink)}/${esc(id)}/NOTES.md">NOTES</a></p></section>`;
  }).join('\n');
  writeFileSync(join(OUT, 'index.html'), `<!doctype html><meta charset="utf-8"><title>조각 보고서</title>
<style>
body{margin:0;padding:24px;font:14px/1.5 system-ui,sans-serif;background:#f6f3ec;color:#23282e}
h1{font-size:20px;margin:0 0 16px} h2{font-size:16px;margin:0 0 4px}
section{background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;margin:0 0 20px}
.claim{margin:0 0 12px;color:#555} .row{display:flex;gap:10px;overflow-x:auto}
figure{margin:0;flex:0 0 360px} img{width:100%;border:1px solid #e3e0d8;border-radius:4px}
figcaption{font-size:12px;color:#777}
h3{font-size:14px;margin:14px 0 6px} table.fit{border-collapse:collapse;width:100%;font-size:13px}
table.fit th,table.fit td{border-top:1px solid #eee;padding:5px 8px;text-align:left;vertical-align:top}
table.fit th{color:#777;font-weight:500} .st{display:inline-block;padding:1px 7px;border-radius:10px;font-size:12px;white-space:nowrap}
.st-ok{background:#e7f1e6;color:#2d6a2d} .st-fix{background:#fbefd9;color:#8a5a10} .st-no{background:#f8dfdc;color:#9b2c21}
.st-out{background:#e8e8f2;color:#44447a} .warn{color:#c33} .out{font-size:13px;color:#44447a} .summary{border-color:#d9c7a3} img.sims{margin-top:6px;outline:2px solid #8fbcd6} .err{color:#c33} .links{font-size:12px;margin:8px 0 0}
</style>
<p class="links"><a href="${esc(relative(OUT, REPORT_ROOT) || '.')}/index.html">← 배치 목차</a></p>
<h1>${esc(manifest ? `${manifest.name} — ${manifest.title ?? ''}` : '점검 (배치 아님)')} <small>${new Date().toISOString().slice(0, 16).replace('T', ' ')}</small></h1>
${manifest?.record ? `<p class="links">기록: <code>${esc(manifest.record)}</code></p>` : ''}
${summary}
${cards}
`);
  if (manifest) {
    const warnings = results.filter(
      (r) => !r.fit || r.probes.some((p) => !p.report || (p.report.errors?.length ?? 0) > 0),
    ).length;
    const summaryJson: BatchSummary = {
      name: manifest.name,
      title: manifest.title ?? manifest.name,
      record: manifest.record,
      generatedAt: new Date().toISOString(),
      pieces: manifest.pieces,
      gaps: {
        없음: gaps.filter((g) => g.status === '없음').length,
        '수정 필요': gaps.filter((g) => g.status === '수정 필요').length,
      },
      outside: outside.length,
      warnings,
      sims: Boolean(simsBase),
    };
    writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summaryJson, null, 2) + '\n');
    writeRootIndex();
  }
  console.log(`\n→ ${resolve(OUT, 'index.html')}\n→ ${resolve(OUT, 'report.md')}`);
  if (manifest) console.log(`→ ${resolve(REPORT_ROOT, 'index.html')} (배치 목차)`);
}

main();
