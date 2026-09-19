// ========================================================================
// maxwells-equations — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 비스듬히 위에서 본 사슬. 누운 E 고리는 실선, 선 B 고리는 점선이고 둘 다 먹색이다 —
// E 와 B 를 색으로 가르지 않는다(선 모양과 표식 `E` · `B` 로 가른다, S-piece).
//
// 고리는 단계마다 하나씩 **도는 쪽으로 한 바퀴 그려지며** 생긴다. 그려지는 끝에 촉이 붙어
// 있어 「두른다」 · 「돈다」 가 보인다. 두 단계 뒤에는 옅어진다 — 앞머리만 짙어서 사슬이
// 오른쪽으로 나아가는 것이 보인다.
//
// 그리는 순서(`drawOrder: 'scene'`) — E 고리 뒤 반쪽 → 처음 B → B 고리 → E 고리 앞 반쪽 →
// 표식. 누운 E 고리가 선 B 고리 · 처음 B 를 앞뒤로 감싸야 서로 꿰인 것으로 읽힌다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  Vector,
  ViewDef,
} from '@aperi21/schema';
import {
  linkCenterX,
  linkKind,
  loopPoint,
  project,
  readConstants,
  seedX,
  sweepLoop,
  sweepTip,
  loopStart,
  type LoopKind,
  type MaxwellsEquationsConstants,
  type Vec3,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { MaxwellsEquationsState } from './state';

// ------------------------------------------------------------------------
// 색 — 모두 먹색. 강조색을 쓰지 않는다(가를 뜻이 없다).
// ------------------------------------------------------------------------

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;

// ------------------------------------------------------------------------
// 치수 — 굵기 · 글자 크기 · 띄움은 화면 px, 나머지는 월드
// ------------------------------------------------------------------------

/** 한 바퀴를 이루는 표본 수. */
const LOOP_SEGMENTS = 96;
/** 고리 선 굵기. */
const LOOP_WIDTH_PX = 2;
/** 처음 B 화살표 굵기. */
const SEED_WIDTH_PX = 2.6;
/** 처음 B 화살표 촉 크기(월드). */
const SEED_HEAD = 0.2;
/** 고리 촉 — 그려지는 끝에서 이만큼(라디안) 뒤부터 긋는 짧은 화살표. */
const TIP_BACK_RAD = 0.42;
/** 고리 촉 크기(월드). */
const TIP_HEAD = 0.16;
/** 고리 촉 축 굵기. */
const TIP_WIDTH_PX = 2;
/** 표식 글자 크기. */
const LABEL_PX = 14;
/** 표식을 고리에서 위로 띄우는 거리(화면 px). E 는 뒤쪽 끝 위, B 는 위쪽 끝 위. */
const LABEL_GAP_PX = 13;
/** 처음 B 의 표식을 화살 끝에서 왼쪽으로 띄우는 거리(화면 px) — 오른쪽은 첫 E 고리 표식 자리다. */
const SEED_LABEL_GAP_PX = 12;
/** 두 단계 뒤 고리가 옅어져 머무는 불투명도 — 앞머리가 짙어 사슬이 나아가는 쪽이 보인다. */
const PAST_OPACITY = 0.3;
/** 이보다 옅으면 선언하지 않는다(촉 · 표식이 남지 않게). */
const MIN_OPACITY = 0.02;

// ------------------------------------------------------------------------
// 조각
// ------------------------------------------------------------------------

/** 한 고리의 지금 모습. */
interface LinkFrame {
  index: number;
  kind: LoopKind;
  cx: number;
  progress: number;
  opacity: number;
}

function linkFrames(tl: TimelineFrame, c: MaxwellsEquationsConstants): LinkFrame[] {
  const fade = 1 - tl.at('fade');
  const out: LinkFrame[] = [];
  for (let i = 1; i <= c.linkCount; i++) {
    const progress = tl.at(`link${i}`);
    // 두 단계 뒤 고리가 그려지는 동안 옅어진다. 마지막 둘은 옅어지지 않고 `fade` 만 따른다.
    const later = i + 2 <= c.linkCount ? tl.at(`link${i + 2}`) : 0;
    const opacity = (1 - (1 - PAST_OPACITY) * later) * fade;
    out.push({ index: i, kind: linkKind(i), cx: linkCenterX(i, c), progress, opacity });
  }
  return out;
}

/** 3차원 표본 줄을 깊이의 부호로 가른다 — 뒤(z < 0) · 앞(z ≥ 0). 경계 점은 양쪽에 넣어 잇는다. */
function splitByDepth(points: readonly Vec3[]): { back: Vec3[][]; front: Vec3[][] } {
  const back: Vec3[][] = [];
  const front: Vec3[][] = [];
  let run: Vec3[] = [];
  let isFront: boolean | null = null;
  for (const p of points) {
    const f = p[2] >= 0;
    if (isFront !== null && f !== isFront) {
      run.push(p);
      (isFront ? front : back).push(run);
      run = [run[run.length - 2] ?? p];
    }
    run.push(p);
    isFront = f;
  }
  if (run.length >= 2 && isFront !== null) (isFront ? front : back).push(run);
  return { back, front };
}

/** 그려지는 끝의 촉 — 끝 조금 뒤에서 끝까지 긋는 짧은 화살표. */
function tipArrow(link: LinkFrame, c: MaxwellsEquationsConstants): { vector: Vector; depth: number } {
  const tipT = sweepTip(link.kind, link.progress);
  const fromT = Math.max(loopStart(link.kind), tipT - TIP_BACK_RAD);
  const a3 = loopPoint(link.kind, link.cx, fromT, c);
  const b3 = loopPoint(link.kind, link.cx, tipT, c);
  const a = project(a3, c);
  const b = project(b3, c);
  return {
    depth: b3[2],
    vector: {
      type: 'vector',
      id: `tip-${link.index}`,
      from: a,
      delta: [b[0] - a[0], b[1] - a[1]],
      headSize: TIP_HEAD,
      width: TIP_WIDTH_PX,
      style: INK,
      opacity: link.opacity,
    },
  };
}

function loopLabel(link: LinkFrame, c: MaxwellsEquationsConstants): Readout {
  const at = project(loopPoint(link.kind, link.cx, loopStart(link.kind), c), c);
  return {
    type: 'readout',
    id: `name-${link.index}`,
    anchor: { world: at, offset: [0, -LABEL_GAP_PX] },
    text: text(link.kind === 'E' ? 'label.e' : 'label.b'),
    chip: false,
    font: 'text',
    italic: true,
    weight: 'bold',
    fontSize: LABEL_PX,
    style: INK,
    opacity: link.opacity,
  };
}

export function scene(params: {
  state: MaxwellsEquationsState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);
  const links = linkFrames(tl, c).filter((l) => l.progress > 0 && l.opacity > MIN_OPACITY);
  const toScreen = (run: readonly Vec3[]): Vec2[] => run.map((p) => project(p, c));

  // E 고리 — 뒤 반쪽 · 앞 반쪽을 따로 모은다.
  const eBack: Vec2[][] = [];
  const eBackOpacity: number[] = [];
  const eFront: Vec2[][] = [];
  const eFrontOpacity: number[] = [];
  const backTips: Vector[] = [];
  const frontTips: Vector[] = [];
  const bLoops: Primitive[] = [];

  for (const link of links) {
    const tip = tipArrow(link, c);
    if (link.kind === 'E') {
      const { back, front } = splitByDepth(sweepLoop('E', link.cx, link.progress, c, LOOP_SEGMENTS));
      for (const run of back) {
        eBack.push(toScreen(run));
        eBackOpacity.push(link.opacity);
      }
      for (const run of front) {
        eFront.push(toScreen(run));
        eFrontOpacity.push(link.opacity);
      }
      (tip.depth < 0 ? backTips : frontTips).push(tip.vector);
    } else {
      bLoops.push({
        type: 'trajectory',
        id: `loop-${link.index}`,
        points: toScreen(sweepLoop('B', link.cx, link.progress, c, LOOP_SEGMENTS)),
        width: LOOP_WIDTH_PX,
        style: { ...INK, lineStyle: 'dashed' },
        opacity: link.opacity,
      });
      bLoops.push(tip.vector);
    }
  }

  const out: Primitive[] = [];

  const eBackSet: LineSet = {
    type: 'lineSet',
    id: 'e-back',
    lines: eBack,
    opacities: eBackOpacity,
    width: LOOP_WIDTH_PX,
    style: INK,
  };
  if (eBack.length > 0) out.push(eBackSet);
  out.push(...backTips);

  // 처음 B — 첫 E 고리가 그려지는 동안에도 계속 자라고(그래야 「커지는 B 를 두른다」 가 참이다),
  // 둘째 고리가 그려지는 동안 사라진다. 자라는 구간은 선언된 단계 경계 seed 시작 ~ link1 끝이다.
  const seedLen = c.seedLength * tl.span(tl.start('seed'), tl.end('link1'), 'smooth');
  const seedOpacity = (1 - tl.at('link2')) * (1 - tl.at('fade'));
  if (seedLen > 0 && seedOpacity > MIN_OPACITY) {
    const sx = seedX(c);
    out.push({
      type: 'vector',
      id: 'seed',
      from: [sx, -seedLen / 2],
      delta: [0, seedLen],
      headSize: SEED_HEAD,
      width: SEED_WIDTH_PX,
      style: INK,
      opacity: seedOpacity,
    });
    out.push({
      type: 'readout',
      id: 'seed-name',
      anchor: { world: [sx, seedLen / 2], offset: [-SEED_LABEL_GAP_PX, 0] },
      text: text('label.b'),
      chip: false,
      font: 'text',
      italic: true,
      weight: 'bold',
      fontSize: LABEL_PX,
      align: 'right',
      style: INK,
      opacity: seedOpacity,
    });
  }

  out.push(...bLoops);

  const eFrontSet: LineSet = {
    type: 'lineSet',
    id: 'e-front',
    lines: eFront,
    opacities: eFrontOpacity,
    width: LOOP_WIDTH_PX,
    style: INK,
  };
  if (eFront.length > 0) out.push(eFrontSet);
  out.push(...frontTips);

  for (const link of links) out.push(loopLabel(link, c));

  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
