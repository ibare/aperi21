// ========================================================================
// band-theory — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 띠(`region`) · 준위(`lineSet`) · 전자(`particleSystem`) ·
// 양공(`body` 빈 고리) · 전기장과 빛(`vector`) · 띠틈(`dimension` + `readout`) ·
// 이름(`readout`) 이 모두 표준 어휘로 있다.
//
// 색: 세 그림의 띠는 같은 보조색(같은 종류의 대상), 준위 선 · 치수선은 무채색, 전자 ·
// 양공은 먹색 하나(같은 전자와 그 빈자리). 강조색은 **빛이 전자에게 준 에너지** 화살표
// 한 가지 뜻에만 쓴다 — 두 그림에서 같은 길이라는 것이 주장의 절반이다.
// ========================================================================

import type {
  Body,
  Bounds,
  EnvironmentDef,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  bandHalfHeight,
  crossesGap,
  edgeFade,
  fadeOpacity,
  hopState,
  landingLevel,
  levelY,
  lowerBand,
  metalFilledLevels,
  photonProgress,
  photonSlot,
  readConstants,
  SLOT_PITCH,
  slotX,
  timeSinceField,
  timeSinceFlow,
  upperBand,
  wrapX,
  type Band,
  type BandTheoryConstants,
} from './physics';
import {
  BAND_HALF_W,
  BAND_BASE_Y,
  COLUMN_X,
  EV_TO_WORLD,
  LEVELS_PER_BAND,
  SCENE_BOUNDS,
  SLOTS_PER_LEVEL,
  text,
  type BandTheoryMessageKey,
} from './schema';
import type { BandTheoryState } from './state';

// ------------------------------------------------------------------------
// 모양 — 선 굵기 · 글자 크기 · 짙기 · 띄움 거리 (C2)
// ------------------------------------------------------------------------

/** 띠 채움 짙기. 준위 선과 전자가 그 위에서 읽혀야 한다. */
const BAND_FILL = 0.16;
/** 준위 선 굵기(화면 px) · 짙기. 빈 준위는 이 선만 남는다 — 「빈 자리」 가 이 선이다. */
const LEVEL_WIDTH_PX = 1;
const LEVEL_OPACITY = 0.75;
/** 전자 점 반지름(화면 px). */
const ELECTRON_PX = 3.2;
/** 양공 고리 반지름(월드). 전자 점과 같은 크기로 보이게. */
const HOLE_RADIUS = 0.04;
/** 감아 도는 전자가 띠 가장자리에서 옅어지는 폭(월드). */
const EDGE_FADE_W = SLOT_PITCH * 0.6;

/** 이름표 글자 크기(화면 px) · 그림 이름 글자 크기. */
const LABEL_PX = 12;
const TITLE_PX = 13;
/** 그림 이름을 띠 바닥 아래로 내리는 거리(화면 px). */
const TITLE_OFFSET: Vec2 = [0, 17];
/** 띠틈 치수선을 띠 오른쪽으로 띄우는 거리(월드) · 그 값 글자를 치수선에서 띄우는 거리(화면 px). */
const GAP_DIM_DX = 0.13;
const GAP_LABEL_OFFSET: Vec2 = [7, 0];
/** 빛 에너지 글자를 첫 화살표에서 띄우는 거리(화면 px). */
const PHOTON_LABEL_OFFSET: Vec2 = [-7, 0];
/**
 * 전자 · 양공 기호를 점에서 띄우는 거리(화면 px) — 둘 다 위. 전자 기호를 아래(틈 쪽)에 두면
 * 좁은 반도체 틈 안에서 양공 기호와 세로로 붙어 어느 것이 어느 점의 것인지 흐려진다.
 */
const ELECTRON_TAG_OFFSET: Vec2 = [0, -11];
const HOLE_TAG_OFFSET: Vec2 = [0, -11];

/** 전기장 화살표 — 가장 높은 띠 위로 띄우는 거리 · 반길이(월드) · 굵기(화면 px). */
const FIELD_ROW_GAP = 0.24;
const FIELD_HALF_LEN = 0.34;
const FIELD_WIDTH_PX = 2;
/** 빛 화살표 굵기(화면 px). */
const PHOTON_WIDTH_PX = 2.5;
/** 틈을 넘지 못한 빛 화살표가 물러나는 짙기. 사라지면 「같은 길이」 를 견줄 수 없다. */
const MISSED_PHOTON_OPACITY = 0.55;

type Kind = 'metal' | 'insulator' | 'semiconductor';

const TITLE_KEY: Record<Kind, BandTheoryMessageKey> = {
  metal: 'label.metal',
  insulator: 'label.insulator',
  semiconductor: 'label.semiconductor',
};

const rect = (cx: number, halfW: number, yFrom: number, yTo: number): Vec2[] => [
  [cx - halfW, yFrom],
  [cx + halfW, yFrom],
  [cx + halfW, yTo],
  [cx - halfW, yTo],
];

function gapOf(c: BandTheoryConstants, kind: Kind): number | undefined {
  if (kind === 'insulator') return c.insulatorGapEv;
  if (kind === 'semiconductor') return c.semiconductorGapEv;
  return undefined;
}

export function scene(params: {
  state: BandTheoryState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('band-theory: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const op = fadeOpacity(tl);
  const spread = tl.at('spread');

  const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
  const band = { colorRole: 'secondary', emphasis: 'strong' } as const;
  const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
  const accent = { colorRole: 'accent', emphasis: 'strong' } as const;

  const g: Primitive[] = [];
  const low = lowerBand(c);
  const kinds: readonly Kind[] = ['metal', 'insulator', 'semiconductor'];

  // 전기장 · 빛 화살표의 짙기 — `fieldIn` 동안 나타나고 `flowIn` 동안 물러난다.
  const fieldAlpha = tl.at('fieldIn');
  const photonFade = 1 - tl.at('flowIn');
  const drift = c.driftSpeed * timeSinceField(tl);
  const flowDrift = c.driftSpeed * timeSinceFlow(tl);
  const { done: hopBase, move: hopMove } = hopState(tl, c);

  // 가장 높은 띠 위 — 세 그림의 전기장 화살표가 같은 줄에 선다.
  const fieldRowY =
    Math.max(
      low.top,
      ...kinds.map((k) => {
        const gap = gapOf(c, k);
        return gap === undefined ? low.top : upperBand(c, gap).top;
      }),
    ) + FIELD_ROW_GAP;

  for (const kind of kinds) {
    const cx = COLUMN_X[kind];
    const gapEv = gapOf(c, kind);
    const up: Band | undefined = gapEv === undefined ? undefined : upperBand(c, gapEv);
    const bands: Band[] = up ? [low, up] : [low];

    // ---- 띠 ----
    bands.forEach((b, bi) => {
      const mid = (b.bottom + b.top) / 2;
      const hh = bandHalfHeight(b, spread);
      if (hh > 1e-3) {
        g.push({
          type: 'region',
          id: `${kind}-band-${bi}`,
          points: rect(cx, BAND_HALF_W, mid - hh, mid + hh),
          fillOpacity: BAND_FILL,
          opacity: op,
          style: band,
        });
      }
    });

    // ---- 준위 — 퍼지는 동안 한 줄에서 여러 줄로 갈라진다 ----
    const lines: Vec2[][] = [];
    for (const b of bands) {
      for (let k = 0; k < LEVELS_PER_BAND; k++) {
        const y = levelY(b, k, spread);
        lines.push([
          [cx - BAND_HALF_W, y],
          [cx + BAND_HALF_W, y],
        ]);
      }
    }
    g.push({
      type: 'lineSet',
      id: `${kind}-levels`,
      lines,
      width: LEVEL_WIDTH_PX,
      opacity: op * LEVEL_OPACITY,
      style: muted,
    });

    // ---- 띠틈 — 치수선과 값. 띠가 다 퍼질 무렵 나타난다 ----
    if (up && gapEv !== undefined) {
      const lowEdge = (low.bottom + low.top) / 2 + bandHalfHeight(low, spread);
      const upEdge = (up.bottom + up.top) / 2 - bandHalfHeight(up, spread);
      const dimX = cx + BAND_HALF_W + GAP_DIM_DX;
      const gapAlpha = op * spread * spread;
      g.push({
        type: 'dimension',
        id: `${kind}-gap`,
        from: [dimX, lowEdge],
        to: [dimX, upEdge],
        opacity: gapAlpha,
        style: muted,
      });
      g.push({
        type: 'readout',
        id: `${kind}-gap-value`,
        anchor: { world: [dimX, (lowEdge + upEdge) / 2], offset: GAP_LABEL_OFFSET },
        text: text('label.energy'),
        vars: { e: String(gapEv) },
        chip: false,
        font: 'mono',
        fontSize: LABEL_PX,
        align: 'left',
        opacity: gapAlpha,
        style: ink,
      });
    }

    // ---- 전자 ----
    const positions: Vec2[] = [];
    const alphas: number[] = [];
    const put = (x: number, y: number, a = 1): void => {
      positions.push([x, y]);
      alphas.push(a);
    };
    const holes: Body[] = [];
    const tags: Primitive[] = [];

    if (kind === 'metal') {
      // 반쯤 찬 띠. 맨 위 전자 줄만 바로 위에 빈 준위가 있어 전기장을 따라 흐른다.
      const filled = metalFilledLevels(c);
      for (let k = 0; k < filled; k++) {
        const y = levelY(low, k, spread);
        const moving = k === filled - 1;
        for (let j = 0; j < SLOTS_PER_LEVEL; j++) {
          if (!moving) {
            put(slotX(cx, j), y);
            continue;
          }
          // 전자는 음전하라 전기장(오른쪽)과 반대로 흐른다.
          const x = wrapX(cx, slotX(cx, j) - drift);
          put(x, y, edgeFade(cx, x, EDGE_FADE_W));
        }
      }
    } else {
      const gap = gapEv ?? 0;
      const crosses = crossesGap(c, gap);
      const top = LEVELS_PER_BAND - 1;
      const topY = levelY(low, top, spread);

      // 아래 준위들 — 꽉 차 있고 움직이지 않는다.
      for (let k = 0; k < top; k++) {
        const y = levelY(low, k, spread);
        for (let j = 0; j < SLOTS_PER_LEVEL; j++) put(slotX(cx, j), y);
      }

      // 맨 위 준위 — 빛을 받는 줄.
      const kicked = new Map<number, number>(); // 칸 → 알갱이 번호
      const rises: number[] = [];
      for (let i = 0; i < c.photonCount; i++) {
        const { rise } = photonProgress(tl, i);
        rises.push(rise);
        if (crosses && rise > 0) kicked.set(photonSlot(i), i);
      }

      if (kicked.size === 0) {
        for (let j = 0; j < SLOTS_PER_LEVEL; j++) put(slotX(cx, j), topY);
      } else {
        // 양공이 한 칸 오른쪽으로 옮겨 갈 때 그 오른쪽 전자가 왼쪽으로 한 칸 건너온다.
        // 전자가 떠난 칸에 고리가 차오르고 전자가 들어간 칸의 고리가 사라진다 — 한 칸에
        // 전자와 고리가 겹쳐 보이지 않게 둘 다 칸 자리에 둔다.
        const holeAt = new Set<number>();
        const incoming = new Set<number>();
        for (const s of kicked.keys()) {
          holeAt.add(s + hopBase);
          if (hopMove > 0) incoming.add(s + hopBase + 1);
        }
        for (let j = 0; j < SLOTS_PER_LEVEL; j++) {
          if (holeAt.has(j)) continue;
          put(slotX(cx, j) - (incoming.has(j) ? hopMove * SLOT_PITCH : 0), topY);
        }
        const ring = (id: string, x: number, alpha: number): void => {
          if (alpha <= 0) return;
          holes.push({
            type: 'body',
            id,
            pos: [x, topY],
            shape: 'circle',
            size: HOLE_RADIUS,
            fill: 'none',
            outline: 'role',
            glow: false,
            opacity: op * alpha,
            style: ink,
          });
        };
        const sorted = [...kicked.keys()].sort((a, b) => a - b);
        for (const s of sorted) {
          ring(`${kind}-hole-${s}`, slotX(cx, s + hopBase), 1 - hopMove);
          ring(`${kind}-hole-${s}-next`, slotX(cx, s + hopBase + 1), hopMove);
        }
        if (tl.at('flowIn') > 0 && sorted.length > 0) {
          // 오른쪽으로 옮겨 가는 양공 — 맨 왼쪽 것에 기호를 단다.
          const hx = slotX(cx, sorted[0]! + hopBase) + hopMove * SLOT_PITCH;
          tags.push({
            type: 'readout',
            id: `${kind}-hole-tag`,
            anchor: { world: [hx, topY], offset: HOLE_TAG_OFFSET },
            text: text('label.hole'),
            chip: false,
            font: 'text',
            fontSize: LABEL_PX,
            align: 'center',
            opacity: op,
            style: ink,
          });
        }
      }

      // 빛 화살표 · 넘어간 전자.
      const photonH = c.photonEv * EV_TO_WORLD;
      const land = up ? landingLevel(c, gap) : -1;
      for (let i = 0; i < c.photonCount; i++) {
        const rise = rises[i]!;
        // 화살표는 빛 단계에만 있다. 넘어간 전자는 그 뒤에도 남는다 — 아래에서 따로 놓는다.
        if (rise > 0 && photonFade > 0) {
          const settled = photonProgress(tl, i).settle;
          const missed = !crosses && settled > 0;
          const x = slotX(cx, photonSlot(i));
          g.push({
            type: 'vector',
            id: `${kind}-photon-${i}`,
            from: [x, topY],
            delta: [0, photonH * rise],
            width: PHOTON_WIDTH_PX,
            opacity:
              op * photonFade * (missed ? 1 - (1 - MISSED_PHOTON_OPACITY) * settled : 1),
            style: missed ? { ...accent, lineStyle: 'dashed' } : accent,
          });
          if (i === 0 && rise >= 1) {
            g.push({
              type: 'readout',
              id: `${kind}-photon-value`,
              anchor: { world: [x, topY + photonH / 2], offset: PHOTON_LABEL_OFFSET },
              text: text('label.energy'),
              vars: { e: String(c.photonEv) },
              chip: false,
              font: 'mono',
              fontSize: LABEL_PX,
              align: 'right',
              opacity: op * photonFade,
              style: accent,
            });
          }
        }
        if (!crosses || !up || rise <= 0) continue;
        // 화살표 끝까지 오르고, 위 띠 바닥 준위로 내려앉은 뒤, 흐름 단계에 전기장과 반대로 흐른다.
        const { settle } = photonProgress(tl, i);
        const tipY = topY + photonH * rise;
        const landY = levelY(up, land, spread);
        const y = tipY + (landY - tipY) * settle;
        const x0 = slotX(cx, photonSlot(i));
        const x = flowDrift > 0 ? wrapX(cx, x0 - flowDrift) : x0;
        const a = flowDrift > 0 ? edgeFade(cx, x, EDGE_FADE_W) : 1;
        put(x, y, a);
        // 왼쪽으로 옮겨 가는 전자 — 감아 돌지 않는 맨 오른쪽 것에 기호를 단다.
        if (i === c.photonCount - 1 && tl.at('flowIn') > 0) {
          tags.push({
            type: 'readout',
            id: `${kind}-electron-tag`,
            anchor: { world: [x, y], offset: ELECTRON_TAG_OFFSET },
            text: text('label.electron'),
            chip: false,
            font: 'text',
            fontSize: LABEL_PX,
            align: 'center',
            opacity: op * a,
            style: ink,
          });
        }
      }
    }

    g.push({
      type: 'particleSystem',
      id: `${kind}-electrons`,
      positions,
      opacities: alphas,
      sizes: ELECTRON_PX,
      opacity: op,
      style: ink,
    });
    g.push(...holes, ...tags);

    // ---- 전기장 — 세 그림에 같은 화살표 ----
    if (fieldAlpha > 0) {
      g.push({
        type: 'vector',
        id: `${kind}-field`,
        from: [cx - FIELD_HALF_LEN, fieldRowY],
        delta: [2 * FIELD_HALF_LEN, 0],
        label: text('label.field'),
        width: FIELD_WIDTH_PX,
        opacity: op * fieldAlpha,
        style: muted,
      });
    }

    // ---- 그림 이름 ----
    g.push({
      type: 'readout',
      id: `${kind}-title`,
      anchor: { world: [cx, BAND_BASE_Y], offset: TITLE_OFFSET },
      text: text(TITLE_KEY[kind]),
      chip: false,
      font: 'text',
      fontSize: TITLE_PX,
      weight: 'bold',
      align: 'center',
      opacity: op,
      style: ink,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
