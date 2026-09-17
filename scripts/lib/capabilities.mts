/**
 * 조각이 선언한 능력을 소스에서 뽑는다.
 *
 * `SceneGraph` 는 `{ type: 'body' }` 라는 **데이터**여서 번들러가 무엇이 쓰이는지
 * 알 수 없다. 선언 우선(원칙 2)과 정적 분석이 정면으로 충돌하는 지점이고, 그
 * 사이를 잇는 것이 이 추출기다 (REQUIREMENTS.md §2.4 조건 3).
 *
 * 조작기 선언도 마찬가지로 데이터다 (원칙 7 ④). 지금 화면에 떠 있는지는
 * `visibleWhen` 이 정하지만 선언 자체는 언제나 소스에 있으므로, 뜨고 지는 것과
 * 무관하게 전부 잡힌다. 놓치는 쪽보다 넘치는 쪽이 안전하다.
 *
 * `pnpm gen:capabilities` 와 `pnpm budget` 이 같은 표를 본다.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** 표준 렌더러 — 선언의 primitive type → `@aperi21/host` 의 export 이름. */
export const RENDERERS: Record<string, string> = {
  body: 'renderBody',
  trajectory: 'renderTrajectory',
  vector: 'renderVector',
  surface: 'renderSurface',
  marker: 'renderMarker',
  graph: 'renderGraph',
  event: 'renderEvent',
  gauge: 'renderGauge',
  region: 'renderRegion',
  stream: 'renderStream',
  readout: 'renderReadout',
  scale: 'renderScale',
  dimension: 'renderDimension',
  vortexField: 'renderVortexField',
  filament: 'renderFilament',
  constraint: 'renderConstraint',
  particleSystem: 'renderParticleSystem',
  trace: 'renderTrace',
  sector: 'renderSector',
};

/** 표준 조작기 — 선언의 controller type → 클래스 이름. */
export const CONTROLLERS: Record<string, string> = {
  'pinball-launcher': 'PinballLauncherController',
  'angle-dial': 'AngleDialController',
  slider: 'SliderController',
  'value-edit': 'ValueEditController',
  placement: 'PlacementController',
  'scale-drag': 'ScaleDragController',
  'point-drag': 'PointDragController',
  'param-panel': 'ParamPanelController',
  'view-tabs': 'ViewTabsController',
  'stage-tabs': 'StageTabsController',
  'env-toggles': 'EnvTogglesController',
  'param-chips': 'ParamChipsController',
  'reset-buttons': 'ResetButtonsController',
  button: 'ButtonController',
};

export const ALL_CAPABILITIES: Record<string, string> = { ...RENDERERS, ...CONTROLLERS };

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === '__tests__' || name === 'node_modules') continue;
      walk(p, out);
    } else if (name.endsWith('.ts') && !name.endsWith('.generated.ts')) {
      out.push(p);
    }
  }
  return out;
}

/**
 * 선언 필드가 **엔진에게 그리게 하는** 어휘. 조각의 scene 에는 그 type 이 없어도
 * 엔진이 대신 만들어 넣으므로 능력은 실려야 한다 — 빠지면 러너가 렌더러를 못 찾고
 * 조용히 건너뛴다.
 *
 * `BundleSchema.caption` 슬롯 → 엔진이 `readout` 을 만든다 (`host/src/time/timeline.ts`).
 * `anchor:` 까지 보는 것은 지역 변수 `const caption: Readout` 와 가르기 위해서다.
 * 슬롯 안의 한 겹 중괄호(`style: { … }` 가 앞에 오는 경우)는 건너뛴다. 놓치면 캡션이
 * 조용히 사라지므로 `packages/bootstrap/test/declarations.test.ts` 가 생성물을 확인한다.
 */
const IMPLIED: readonly { pattern: RegExp; types: readonly string[] }[] = [
  { pattern: /\bcaption:\s*\{(?:[^{}]|\{[^{}]*\})*?\banchor:/, types: ['readout'] },
];

/** 이 sim 의 `src` 가 선언한 표준 능력 type 집합. */
export function declaredCapabilities(simSrc: string): Set<string> {
  const used = new Set<string>();
  for (const file of walk(simSrc)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/type:\s*'([a-zA-Z-]+)'/g)) {
      const t = m[1]!;
      if (t in ALL_CAPABILITIES) used.add(t);
    }
    for (const { pattern, types } of IMPLIED) {
      if (pattern.test(text)) for (const t of types) used.add(t);
    }
  }
  return used;
}

export interface SimEntry {
  /** `fluids/archimedes-principle` */
  id: string;
  category: string;
  name: string;
  src: string;
  /** package.json 의 name. `@aperi21/sim-archimedes-principle` */
  pkg: string;
  /** `Bundle` 을 내보내는 export 이름. */
  bundleExport: string;
}

/**
 * 번들 export 를 **모양으로** 찾는다. 이름 규약(`<name>Bundle`)에 묶으면 규약이
 * 흔들릴 때 조용히 어긋난다 — 실제로 한 번 겪었다.
 */
function findBundleExport(src: string): string {
  const index = readFileSync(join(src, 'index.ts'), 'utf8');
  const typed = index.match(/export const (\w+):\s*Bundle\b/);
  if (typed) return typed[1]!;
  const named = index.match(/export const (\w+Bundle)\b/);
  if (named) return named[1]!;
  throw new Error(`[budget] ${src}/index.ts 에서 Bundle export 를 찾지 못했다`);
}

/** 워크스페이스의 sim 목록. */
export function listSims(root: string): SimEntry[] {
  const out: SimEntry[] = [];
  const simsDir = join(root, 'sims');
  for (const category of readdirSync(simsDir)) {
    const catDir = join(simsDir, category);
    if (!statSync(catDir).isDirectory()) continue;
    for (const name of readdirSync(catDir)) {
      const dir = join(catDir, name);
      const src = join(dir, 'src');
      const pkgJson = join(dir, 'package.json');
      if (!existsSync(src) || !existsSync(pkgJson)) continue;
      const pkg = JSON.parse(readFileSync(pkgJson, 'utf8')).name as string;
      out.push({
        id: `${category}/${name}`,
        category,
        name,
        src,
        pkg,
        bundleExport: findBundleExport(src),
      });
    }
  }
  return out;
}
