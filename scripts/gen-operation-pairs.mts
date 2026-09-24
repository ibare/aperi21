/**
 * 주제 설명과 조각의 한 줄 주장을 맞댄다.
 *
 * 실행: pnpm pairs:gen  →  tasks/topic-gaps/PAIRS.md · PAIRS.html
 *
 * ## 왜
 *
 * 조각의 `description` 은 **조각의 한 줄 주장**이고 발행 카탈로그의 설명으로 나간다
 * (FACET `FacetJson.description` 과 같은 자리). 주제의 `desc` 는 같은 것을 가리키는
 * 사이트의 한 줄이다. 둘은 같은 것을 두 곳에 손으로 적은 것이라, 한쪽만 고치면
 * 갈라진다.
 *
 * 글자가 같아야 하는 것은 아니다 — 주제는 이름표를 달고 조각은 화면이 하는 일을
 * 말하므로 말투가 다른 것이 오히려 맞다. 그래서 **자동으로 맞추지 않고 갈라진
 * 자리를 보여 주기만 한다.** 판정은 사람이 한다.
 *
 * 전에는 `operation` 을 맞댔다. 그 필드는 조작기 설명 · 주장 · 주제 desc 사본이
 * 뒤섞여 있어 FACET 에 맞추며 지웠다 (2026-09-24).
 *
 * ## 기준선
 *
 * `BASELINE` 은 「설명」 갈래 수정을 적용하기 직전 커밋이다. 그때와 desc 가 달라진
 * 주제를 「우리가 고침」으로 가른다.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'tasks/topic-gaps/PAIRS.md');
const OUT_HTML = join(ROOT, 'tasks/topic-gaps/PAIRS.html');
const BASELINE = '681305f~1';

type Topic = { id: string; name: string; domain: string; desc: string; visualNote: string; sim?: string };

function parseTopics(text: string): Topic[] {
  const out: Topic[] = [];
  let cur: Topic | null = null;
  for (const line of text.split('\n')) {
    const id = /^  - id: (\S+)/.exec(line);
    if (id) {
      cur = { id: id[1], name: '', domain: '', desc: '', visualNote: '' };
      out.push(cur);
      continue;
    }
    if (!cur) continue;
    for (const f of ['name', 'domain', 'desc', 'visualNote', 'sim'] as const) {
      const m = new RegExp(`^    ${f}: (.+)$`).exec(line);
      if (m) cur[f] = m[1];
    }
  }
  return out;
}

const now = parseTopics(readFileSync(join(ROOT, 'docs/topics/topics.yaml'), 'utf8'));
const base = new Map(
  parseTopics(
    execFileSync('git', ['show', `${BASELINE}:docs/topics/topics.yaml`], { cwd: ROOT, encoding: 'utf8' }),
  ).map((t) => [t.id, t.desc]),
);

/** 조각의 한 줄 주장. 문안 키로 두거나 schema 에 리터럴로 둔다. 아직 없으면 빈 문자열. */
function descriptionOf(simId?: string): string {
  if (!simId) return '';
  const name = simId.replace(/^aperi21:/, '');
  for (const cat of readdirSync(join(ROOT, 'sims'))) {
    const p = join(ROOT, 'sims', cat, name, 'src/schema.ts');
    if (!existsSync(p)) continue;
    const t = readFileSync(p, 'utf8');
    const keyed = /'label\.description':\s*\{\s*ko:\s*'((?:[^'\\]|\\.)*)'/.exec(t);
    const inline = /\n  description:\s*\{\s*ko:\s*'((?:[^'\\]|\\.)*)'/.exec(t);
    return keyed?.[1] ?? inline?.[1] ?? '';
  }
  return '';
}

const PARTICLE = /(이|가|은|는|을|를|의|에|와|과|도|만|인|한|로|으로|에서|에는|까지|부터|라는|이라|하는|되는|처럼|만큼)$/;
const words = (s: string): string[] =>
  [...new Set(s.split(/[\s·,()]+/))]
    .map((w) => w.replace(PARTICLE, ''))
    .filter((w) => w.length >= 2 && /[가-힣]/.test(w));

type Row = Topic & { op: string; touched: boolean; onlyDesc: string[]; onlyOp: string[] };

const rows: Row[] = now
  .filter((t) => t.sim)
  .map((t) => {
    const op = descriptionOf(t.sim);
    return {
      ...t,
      op,
      touched: base.has(t.id) && base.get(t.id) !== t.desc,
      onlyDesc: words(t.desc).filter((w) => !op.includes(w)),
      onlyOp: words(op).filter((w) => !t.desc.includes(w)),
    };
  });

const copies = rows.filter((r) => r.desc === r.op);
const diff = rows.filter((r) => r.desc !== r.op);
const touched = diff.filter((r) => r.touched);
const drift = diff.filter((r) => !r.touched);

// ---------------------------------------------------------------- markdown

const md = [
  '# 주제 설명 ↔ 조각의 한 줄 주장',
  '',
  '자동 생성 — 직접 편집하지 말 것. 생성: `pnpm pairs:gen` (scripts/gen-operation-pairs.mts).',
  '읽기 좋은 쪽은 같은 자리의 `PAIRS.html` 이다.',
  '',
  `주제 ${rows.length} · **글자까지 같음 ${copies.length}** · 갈림 ${diff.length}(우리가 고침 ${touched.length} · 원래 갈림 ${drift.length})`,
  '',
  '`description` 은 조각의 한 줄 주장이고 발행 카탈로그의 설명으로 나간다. 글자까지 같은 것은',
  '주제에서 베껴 온 것이고, **그 사본을 화면과 맞대 본 적은 없다.**',
  '',
  '말투가 다른 것은 잘못이 아니다 — 주제는 이름표를, 조각은 화면이 하는 일을 말한다.',
  '판정은 사람이 한다.',
  '',
  '## 우리가 desc 를 고친 뒤 갈라진 것',
  '',
  '조각 쪽이 옛말을 그대로 들고 있을 가능성이 높은 자리다.',
  '',
  '| 주제 | 주제 desc | 조각의 한 줄 주장 |',
  '| --- | --- | --- |',
  ...touched.map((r) => `| \`${r.id}\` | ${r.desc} | ${r.op} |`),
  '',
  '## 원래 갈려 있던 것',
  '',
  '조각이 자기 한 줄을 화면을 보고 따로 쓴 자리가 대부분이다.',
  '',
  '| 주제 | 주제 desc | 조각의 한 줄 주장 |',
  '| --- | --- | --- |',
  ...drift.map((r) => `| \`${r.id}\` | ${r.desc} | ${r.op} |`),
  '',
];
writeFileSync(OUT_MD, md.join('\n'), 'utf8');

// -------------------------------------------------------------------- html

const DOMAIN: Record<string, string> = {
  kinematics: '운동학',
  'newtonian-mechanics': '뉴턴 역학',
  'energy-momentum': '일·에너지·운동량',
  'rotation-oscillation': '회전과 진동',
  gravitation: '중력과 천체',
  fluids: '유체',
  thermodynamics: '열과 통계',
  'waves-acoustics': '파동',
  optics: '광학',
  electromagnetism: '전자기',
  'modern-physics': '현대물리',
};

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
const mark = (text: string, ws: string[]) => {
  let out = esc(text);
  for (const w of [...ws].sort((a, b) => b.length - a.length)) {
    if (w) out = out.split(esc(w)).join(`<mark>${esc(w)}</mark>`);
  }
  return out;
};

const card = (r: Row) => `
<article class="row" data-group="${r.touched ? 'touched' : 'drift'}" data-text="${esc(`${r.id} ${r.name} ${r.desc} ${r.op}`)}">
  <header><h3>${esc(r.name)}</h3><code>${esc(r.id)}</code><span class="dom">${DOMAIN[r.domain] ?? r.domain}</span>
  <span class="tag ${r.touched ? 't' : 'd'}">${r.touched ? '우리가 고침' : '원래 갈림'}</span></header>
  <div class="pair">
    <div class="side"><span class="k">주제 desc</span><p>${mark(r.desc, r.onlyDesc)}</p></div>
    <div class="side"><span class="k">조각의 한 줄 주장</span><p>${mark(r.op, r.onlyOp)}</p></div>
  </div>
  <p class="vn"><span class="k">visualNote</span> ${esc(r.visualNote)}</p>
</article>`;

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>주제와 조각의 한 줄</title>
<style>
:root{--bg:#faf8f5;--fg:#1c1a17;--dim:#6b6560;--line:#e3ded6;--card:#fff;--mark:#f6e0a8;--t:#8a5a2b;--d:#3c6e63;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#16150f;--fg:#ece7de;--dim:#9a938a;--line:#2e2b25;--card:#1e1c17;--mark:#5a4718;--t:#d0a068;--d:#79b3a4;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#16150f;--fg:#ece7de;--dim:#9a938a;--line:#2e2b25;--card:#1e1c17;--mark:#5a4718;--t:#d0a068;--d:#79b3a4;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;padding-block:32px;padding-inline:16px}
.wrap{max-width:1040px;margin:0 auto;display:flex;flex-direction:column;gap:20px}
h1{font-size:24px;margin:0;letter-spacing:-.02em}
.lede{color:var(--dim);margin:0;max-width:66ch}
.bar{position:sticky;top:0;background:var(--bg);padding-block:12px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line);z-index:2}
button,input{font:inherit;color:inherit;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 14px}
button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
input{flex:1;min-width:180px;border-radius:8px}
.row{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px}
.row header{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
h3{margin:0;font-size:17px}
code{color:var(--dim);font-size:12.5px}
.dom{color:var(--dim);font-size:12.5px}
.tag{margin-left:auto;font-size:12px;padding:2px 10px;border-radius:999px;border:1px solid currentColor}
.tag.t{color:var(--t)}.tag.d{color:var(--d)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.pair{grid-template-columns:1fr}}
.side{border:1px solid var(--line);border-radius:8px;padding:10px 12px}
.side p{margin:4px 0 0}
.k{font-size:11.5px;letter-spacing:.06em;color:var(--dim)}
.vn{margin:0;color:var(--dim);font-size:13.5px}
mark{background:var(--mark);color:inherit;border-radius:3px;padding:0 2px}
.count{color:var(--dim);font-size:13px;margin:0}
[hidden]{display:none!important}
</style></head><body>
<div class="wrap">
<h1>주제와 조각이 서로 다른 말을 하는 자리</h1>
<p class="lede">주제의 <code>desc</code> 와 조각이 화면에 띄우는 <code>description</code> 을 ${rows.length}개 전수로 맞댄 것이다.
${copies.length}개는 글자까지 같고(조각을 지을 때 주제에서 베꼈다), 여기 ${diff.length}개가 갈렸다.
칠해진 낱말은 <strong>한쪽에만 있는 말</strong>이다.</p>
<div class="bar">
  <button data-f="all" aria-pressed="true">전체 ${diff.length}</button>
  <button data-f="touched" aria-pressed="false">우리가 고침 ${touched.length}</button>
  <button data-f="drift" aria-pressed="false">원래 갈림 ${drift.length}</button>
  <input id="q" type="search" placeholder="주제·낱말로 거르기" />
</div>
<p class="count" id="count"></p>
${diff.map(card).join('\n')}
</div>
<script>
const rows=[...document.querySelectorAll('.row')];
const btns=[...document.querySelectorAll('[data-f]')];
const q=document.getElementById('q');
let f='all';
function apply(){
  const t=q.value.trim();let n=0;
  for(const r of rows){
    const okF=f==='all'||r.dataset.group===f;
    const okQ=!t||r.dataset.text.includes(t);
    r.hidden=!(okF&&okQ);
    if(!r.hidden)n++;
  }
  document.getElementById('count').textContent=n+'건 보이는 중';
}
btns.forEach(b=>b.addEventListener('click',()=>{f=b.dataset.f;btns.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));apply();}));
q.addEventListener('input',apply);
apply();
</script>
</body></html>`;
writeFileSync(OUT_HTML, html, 'utf8');

process.stdout.write(
  `[pairs] 주제 ${rows.length} · 사본 ${copies.length} · 갈림 ${diff.length}(고침 ${touched.length} · 원래 ${drift.length}) → tasks/topic-gaps/PAIRS.md · PAIRS.html\n`,
);
