// ========================================================================
// prism — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 빛 없음 판(`region` `light: 0`) 위에 꼭지가 위인 삼각 프리즘과 오른쪽 스크린. 흰 줄기는 빛 채널의
// 가득 찬 빛, 색 줄기는 파장의 빛 색(`wavelengthToLinearRgb`)이다. 흰빛은 라이트 바탕에서 사라지므로
// (G92) 두 테마에서 같은 어두운 판을 깐다. 색 줄기는 더해서 칠해(`blend: 'add'`) 첫 면 가까이 겹친
// 자리가 다시 희게 보인다.
//
// 두 괄호는 같은 반지름의 `sector` 다 — 첫 면 뒤는 입사점에서, 둘째 면 뒤는 빨강 · 보라 줄기를 거슬러
// 만나는 점에서 빨강 방향부터 보라 방향까지 쓴다. 반지름이 같아 호의 길이가 곧 벌어진 각의 비다.
// ========================================================================

import type { Bounds, EnvironmentDef, Primitive, Readout, SceneGraph, StageDef, TimelineFrame, Vec2, ViewDef } from '@aperi21/schema';
import { wavelengthToLinearRgb } from '@aperi21/plugin-optics';
import { derive, incoming, lineMeet, prismShape, readConstants, tracePaths, type ColorPath } from './physics';
import { APEX, BEAM_IN_LEN, BRACKET_R, PANEL, SCENE_BOUNDS, SCREEN_X, SCREEN_Y, text, type PrismMessageKey } from './schema';
import type { PrismState } from './state';

/** 선 굵기(화면 px) — 흰 줄기 · 색 줄기 · 프리즘 테 · 스크린 · 스크린 위 띠 · 괄호 호. */
const BEAM_WIDTH_PX = 3;
const RAY_WIDTH_PX = 2;
const EDGE_WIDTH_PX = 1.5;
const SCREEN_WIDTH_PX = 3;
const BAND_WIDTH_PX = 9;
const BRACKET_RIM_PX = 3;
/** 판 위 빛의 세기 — 유리 속 · 프리즘 테 · 스크린 · 괄호. 판이 빛 없음이라 두 테마에서 같다. */
const GLASS_LIGHT = 0.035;
const EDGE_LIGHT = 0.5;
const SCREEN_LIGHT = 0.3;
const BRACKET_LIGHT = 0.85;
/** 괄호 부채꼴 속 채움 — 호가 주인공이고 속은 옅게. */
const BRACKET_FILL = 0.14;
/** 글자 크기(화면 px) — 이름표 · 판 밖 줄 · 괄호 칩. */
const LABEL_PX = 13;
const NOTE_PX = 12;
const CHIP_PX = 12;
/** 글자 띄움(화면 px) — 판 밖 이름표와 판 가장자리 사이, 괄호 칩과 호 끝 사이. */
const LABEL_GAP_PX = 12;
const BRACKET_LABEL_GAP_PX = 16;

/** 방향 벡터의 각(라디안, x 축에서 반시계). */
const angleOf = (d: Vec2): number => Math.atan2(d[1], d[0]);
const polar = (center: Vec2, r: number, a: number): Vec2 => [center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)];
const lerp = (a: Vec2, b: Vec2, k: number): Vec2 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

function rect(b: { minX: number; maxX: number; minY: number; maxY: number }): Vec2[] {
  return [
    [b.minX, b.minY],
    [b.maxX, b.minY],
    [b.maxX, b.maxY],
    [b.minX, b.maxY],
  ];
}

function label(
  id: string,
  key: PrismMessageKey,
  world: Vec2,
  opts: {
    vars?: Record<string, string>;
    offset?: Vec2;
    align?: Readout['align'];
    size?: number;
    role?: 'ink' | 'muted';
    chip?: boolean;
    opacity?: number;
  },
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world, ...(opts.offset ? { offset: opts.offset } : {}) },
    text: text(key),
    ...(opts.vars ? { vars: opts.vars } : {}),
    chip: opts.chip ?? false,
    font: 'text',
    align: opts.align ?? 'left',
    fontSize: opts.size ?? LABEL_PX,
    style: { colorRole: opts.role ?? 'ink', emphasis: 'strong' },
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}

/** 빨강 방향에서 보라 방향까지 쓰는 괄호. */
function bracket(id: string, center: Vec2, red: Vec2, violet: Vec2, opacity: number): Primitive {
  return {
    type: 'sector',
    id,
    center,
    radius: BRACKET_R,
    from: angleOf(red),
    to: angleOf(violet),
    fillOpacity: BRACKET_FILL,
    rimWidth: BRACKET_RIM_PX,
    light: BRACKET_LIGHT,
    opacity,
  };
}

export function scene(params: {
  state: PrismState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, timeline } = params;
  if (!timeline) throw new Error('prism: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline);
  const shape = prismShape(c);
  const { hit, dir } = incoming(c, shape);
  const paths = tracePaths(c, shape);
  const g: Primitive[] = [];

  // ---- 빛 없음 판 · 프리즘 · 스크린 ----
  g.push({ type: 'region', id: 'panel', points: rect(PANEL), fillOpacity: 1, light: 0 });
  const tri: Vec2[] = [shape.apex, shape.baseRight, shape.baseLeft];
  g.push({ type: 'region', id: 'prism', points: tri, fillOpacity: 1, light: GLASS_LIGHT });
  g.push({ type: 'trajectory', id: 'prism-edge', points: tri, closed: true, width: EDGE_WIDTH_PX, light: EDGE_LIGHT });
  g.push({
    type: 'trajectory',
    id: 'screen',
    points: [
      [SCREEN_X, SCREEN_Y[0]],
      [SCREEN_X, SCREEN_Y[1]],
    ],
    width: SCREEN_WIDTH_PX,
    light: SCREEN_LIGHT,
  });

  // ---- 들어오는 흰 줄기 — 첫 면까지 자란다 ----
  const source: Vec2 = [hit[0] - dir[0] * BEAM_IN_LEN, hit[1] - dir[1] * BEAM_IN_LEN];
  if (r.beamIn > 0 && r.visible > 0) {
    g.push({
      type: 'trajectory',
      id: 'beam-in',
      points: [source, lerp(source, hit, r.beamIn)],
      width: BEAM_WIDTH_PX,
      light: 1,
      opacity: r.visible,
    });
  }

  // ---- 유리 속 색 줄기 — 첫 면에서 둘째 면까지 자란다 ----
  if (r.inside > 0 && r.visible > 0) {
    paths.forEach((p, i) => {
      g.push({
        type: 'trajectory',
        id: `ray-in-${i}`,
        points: [hit, lerp(hit, p.exitAt, r.inside)],
        width: RAY_WIDTH_PX,
        light: { rgb: wavelengthToLinearRgb(p.nm) },
        blend: 'add',
        opacity: r.visible,
      });
    });
  }

  // ---- 둘째 면 뒤 색 줄기 — 스크린까지 자란다 ----
  if (r.exit > 0 && r.visible > 0) {
    paths.forEach((p, i) => {
      if (!p.screenAt) return;
      g.push({
        type: 'trajectory',
        id: `ray-out-${i}`,
        points: [p.exitAt, lerp(p.exitAt, p.screenAt, r.exit)],
        width: RAY_WIDTH_PX,
        light: { rgb: wavelengthToLinearRgb(p.nm) },
        blend: 'add',
        opacity: r.visible,
      });
    });
  }

  // ---- 스크린 위 띠 — 색마다 이웃 줄기와의 가운데까지 칠한다 ----
  const landed = paths.filter((p): p is ColorPath & { screenAt: Vec2 } => p.screenAt !== undefined);
  const bandOpacity = r.band * r.visible;
  if (bandOpacity > 0) {
    landed.forEach((p, i) => {
      const y = p.screenAt[1];
      const prev = landed[i - 1]?.screenAt[1];
      const next = landed[i + 1]?.screenAt[1];
      const up = prev !== undefined ? (prev - y) / 2 : next !== undefined ? (y - next) / 2 : 0;
      const down = next !== undefined ? (y - next) / 2 : up;
      g.push({
        type: 'trajectory',
        id: `band-${i}`,
        points: [
          [SCREEN_X, y + up],
          [SCREEN_X, y - down],
        ],
        width: BAND_WIDTH_PX,
        light: { rgb: wavelengthToLinearRgb(p.nm) },
        opacity: bandOpacity,
      });
    });
  }

  // ---- 두 괄호 — 같은 반지름, 빨강 방향에서 보라 방향까지 ----
  const red = paths[0]!;
  const violet = paths[paths.length - 1]!;
  const inOpacity = r.bracketIn * r.visible;
  if (inOpacity > 0) {
    g.push(bracket('bracket-in', hit, red.insideDir, violet.insideDir, inOpacity));
    g.push(
      label('bracket-in-name', 'label.bracketIn', polar(hit, BRACKET_R, angleOf(violet.insideDir)), {
        offset: [0, BRACKET_LABEL_GAP_PX],
        align: 'center',
        size: CHIP_PX,
        chip: true,
        opacity: inOpacity,
      }),
    );
  }
  const outOpacity = r.bracketOut * r.visible;
  if (outOpacity > 0 && red.outDir && violet.outDir) {
    const meet = lineMeet(red.exitAt, red.outDir, violet.exitAt, violet.outDir);
    g.push(bracket('bracket-out', meet, red.outDir, violet.outDir, outOpacity));
    g.push(
      label('bracket-out-name', 'label.bracketOut', polar(meet, BRACKET_R, angleOf(violet.outDir)), {
        offset: [0, BRACKET_LABEL_GAP_PX],
        align: 'center',
        size: CHIP_PX,
        chip: true,
        opacity: outOpacity,
      }),
    );
  }

  // ---- 판 밖 글자 — 흰빛(왼쪽) · 과장 배율 · 꼭지각 · 스크린(위) · 색 이름(오른쪽) ----
  g.push(label('name-white', 'label.white', [PANEL.minX, source[1]], { offset: [-LABEL_GAP_PX, 0], align: 'right' }));
  g.push(
    label('name-apex', 'label.apex', [APEX[0], PANEL.maxY], {
      vars: { a: state.apexText },
      offset: [0, -LABEL_GAP_PX],
      align: 'center',
    }),
  );
  g.push(
    label('name-screen', 'label.screen', [SCREEN_X, PANEL.maxY], {
      offset: [0, -LABEL_GAP_PX],
      align: 'center',
      size: NOTE_PX,
      role: 'muted',
    }),
  );
  const top = landed[0];
  const bottom = landed[landed.length - 1];
  if (bandOpacity > 0 && top && bottom) {
    g.push(
      label('name-red', 'label.red', [PANEL.maxX, top.screenAt[1]], {
        offset: [LABEL_GAP_PX, 0],
        opacity: bandOpacity,
      }),
    );
    g.push(
      label('name-violet', 'label.violet', [PANEL.maxX, bottom.screenAt[1]], {
        offset: [LABEL_GAP_PX, 0],
        opacity: bandOpacity,
      }),
    );
  }
  g.push(
    label('gain', 'label.gain', [PANEL.minX, PANEL.maxY], {
      vars: { k: state.gainText },
      offset: [0, -LABEL_GAP_PX],
      align: 'left',
      size: NOTE_PX,
      role: 'muted',
    }),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
