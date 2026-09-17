// ========================================================================
// equipotential-surface — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// - 전위 지형(3차원 곡면) → `scalarField` 하나. 투영 · 깊이 · 음영은 physics 가 원본 px 격자에
//   구운 밝기 값이다 (곡면 어휘가 없다 — NOTES.md 「어휘 부족」).
// - 전위 지도 → `scalarField` 하나.
// - 등전위선 → 판마다 `lineSet` 하나.
// - 자취 → 판마다 `lineSet` 하나(경로별 흐려짐은 `opacities`).
// - 직각 표시 → `lineSet` 하나(ㄱ자 꺾은선, 경로별 흐려짐은 `opacities`).
// - 시험 전하 점 → `body` 원(최대 판마다 여섯).
// - 원천 전하 → 바탕색 원(`region` opaque) + 먹색 고리 · 기호(`lineSet` 하나).
// ========================================================================

import type { Body, Bounds, LineSet, Primitive, Region, SceneGraph, Vec2 } from '@aperi21/schema';
import { headOf, mapWorld, progressOf, toWorld, type Head, type TestPath } from './physics';
import { CAPTION_BAND, MAP, MAP_GRID, MARKS, STAGE, SURFACE_W } from './schema';
import type { EquipotentialSurfaceState } from './state';

/** 원을 다각형으로 표본하는 개수. */
const CIRCLE_SAMPLES = 40;
/** 등전위선 불투명도 — 원본의 회청색 선(먹보다 옅다). 직각 표시(먹)와 갈린다. */
const CONTOUR_OPACITY = 0.75;

/** 월드 원 둘레(닫힌 꺾은선). */
function circle(c: Vec2, r: number, closed: boolean): Vec2[] {
  const pts: Vec2[] = [];
  const n = closed ? CIRCLE_SAMPLES + 1 : CIRCLE_SAMPLES;
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** 원천 전하 하나 — 바탕색 원 + 고리 · 가로선 · (양이면) 세로선. 고리 · 기호는 `glyphs` 에 모은다. */
function charge(id: string, pos: Vec2, r: number, q: number, glyphs: Vec2[][]): Region {
  glyphs.push(circle(pos, r, true));
  const g = r * 0.5;
  glyphs.push([[pos[0] - g, pos[1]], [pos[0] + g, pos[1]]]);
  if (q > 0) glyphs.push([[pos[0], pos[1] - g], [pos[0], pos[1] + g]]);
  return { type: 'region', id, points: circle(pos, r, false), opaque: true, fillOpacity: 0, style: { colorRole: 'ink' } };
}

function glyphSet(id: string, lines: Vec2[][]): LineSet {
  return { type: 'lineSet', id, lines, width: MARKS.chargeStroke, style: { colorRole: 'ink', emphasis: 'strong' } };
}

/** 시험 전하 점 — 강조색 채움 + 바탕색 둘레. */
function head(id: string, pos: Vec2, r: number, alpha: number): Body {
  return {
    type: 'body',
    id,
    pos,
    shape: 'circle',
    size: r,
    fill: 'solid',
    outline: 'background',
    glow: false,
    opacity: alpha,
    style: { colorRole: 'accent', emphasis: 'strong' },
  };
}

interface Live {
  readonly i: number;
  readonly path: TestPath;
  readonly s: number;
  readonly alpha: number;
  readonly head: Head;
}

export function scene(params: { state: EquipotentialSurfaceState }): SceneGraph {
  const { state } = params;
  const { terrain } = state;
  const out: Primitive[] = [];

  // 지금 보이는 시험 전하들. 흐려짐이 0 이면 어느 판에도 그리지 않는다 (원본 그대로).
  const live: Live[] = [];
  terrain.paths.forEach((path, i) => {
    if (!path) return;
    const { s, alpha } = progressOf(path, state.t);
    if (alpha <= 0) return;
    live.push({ i, path, s, alpha, head: headOf(terrain, path, s) });
  });

  // ================= 왼쪽 — 전위 지형 =================
  out.push({
    type: 'scalarField',
    id: 'terrain',
    min: [0, 0],
    max: [SURFACE_W, STAGE.height],
    cols: SURFACE_W,
    rows: STAGE.height,
    values: terrain.surfaceValues,
    range: [0, 1],
    colors: { high: 'ink' },
  });

  out.push({
    type: 'lineSet',
    id: 'terrain-contours',
    lines: terrain.surfaceContours,
    width: MARKS.contourWidth,
    opacity: CONTOUR_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  const surfaceGlyphs: Vec2[][] = [];
  terrain.surfaceCharges.forEach((c, k) => {
    if (c.visible) out.push(charge(`terrain-charge-${k}`, c.pos, MARKS.chargeSurface, c.q, surfaceGlyphs));
  });
  if (surfaceGlyphs.length > 0) out.push(glyphSet('terrain-charge-glyphs', surfaceGlyphs));

  // 곡면에 가려진 표본에서 펜을 든다 — 보이는 구간마다 선 하나.
  const surfaceRuns: Vec2[][] = [];
  const surfaceRunAlpha: number[] = [];
  for (const L of live) {
    let run: Vec2[] = [];
    const flush = (): void => {
      if (run.length >= 2) {
        surfaceRuns.push(run);
        surfaceRunAlpha.push(L.alpha);
      }
      run = [];
    };
    for (let n = 0; n <= L.head.k; n++) {
      const p = L.path.pts[n]!;
      if (!p.vis) {
        flush();
        continue;
      }
      run.push(p.p3);
    }
    if (run.length > 0 && L.head.vis) run.push(L.head.p3);
    flush();
  }
  out.push({
    type: 'lineSet',
    id: 'terrain-paths',
    lines: surfaceRuns,
    opacities: surfaceRunAlpha,
    width: MARKS.pathWidth,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });
  for (const L of live) {
    if (L.head.vis) out.push(head(`terrain-head-${L.i}`, L.head.p3, MARKS.headSurface, L.alpha));
  }

  // ================= 오른쪽 — 전위 지도 =================
  out.push({
    type: 'scalarField',
    id: 'map',
    min: toWorld(MAP.x, MAP.y + MAP.h),
    max: toWorld(MAP.x + MAP.w, MAP.y),
    cols: MAP_GRID.cols,
    rows: MAP_GRID.rows,
    values: terrain.mapValues,
    range: [0, 1],
    colors: { high: 'ink' },
  });

  out.push({
    type: 'lineSet',
    id: 'map-contours',
    lines: terrain.mapContours,
    width: MARKS.contourWidth,
    opacity: CONTOUR_OPACITY,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  out.push({
    type: 'lineSet',
    id: 'map-paths',
    lines: live.map((L) => [...L.path.pts.slice(0, L.head.k + 1).map((p) => p.map), L.head.map]),
    opacities: live.map((L) => L.alpha),
    width: MARKS.pathWidth,
    style: { colorRole: 'accent', emphasis: 'strong' },
  });

  // 직각 표시 — 지나간 교차점에만. 두 변은 경로 방향(u)과 그 수직(w, 등전위선 방향).
  const a = MARKS.rightAngle;
  const corners: Vec2[][] = [];
  const cornerAlpha: number[] = [];
  for (const L of live) {
    for (const c of L.path.cross) {
      if (c.s > L.s) break;
      // 원본 px 는 y 가 아래라 장 방향의 세로 부호를 뒤집는다.
      const ux = c.ux;
      const uy = -c.uy;
      const wx = -uy;
      const wy = ux;
      corners.push([
        toWorld(c.px - a * ux, c.py - a * uy),
        toWorld(c.px - a * ux + a * wx, c.py - a * uy + a * wy),
        toWorld(c.px + a * wx, c.py + a * wy),
      ]);
      cornerAlpha.push(L.alpha);
    }
  }
  out.push({
    type: 'lineSet',
    id: 'right-angles',
    lines: corners,
    opacities: cornerAlpha,
    width: MARKS.rightAngleWidth,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  for (const L of live) out.push(head(`map-head-${L.i}`, L.head.map, MARKS.headMap, L.alpha));

  const mapGlyphs: Vec2[][] = [];
  state.charges.forEach((c, k) => {
    out.push(charge(`map-charge-${k}`, mapWorld(c.x, c.y), MARKS.chargeMap, c.q, mapGlyphs));
  });
  out.push(glyphSet('map-charge-glyphs', mapGlyphs));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 원본 캔버스 그대로에 아래 캡션 띠를 더한다. 매 프레임 같은 값 (S-piece). */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: STAGE.width, minY: -CAPTION_BAND, maxY: STAGE.height };
}
