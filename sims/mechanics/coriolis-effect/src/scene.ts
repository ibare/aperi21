// ========================================================================
// coriolis-effect — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 —
// 원판·받침·사람·공(body) · 깃발(body custom) · 살·깃대·지나간 길(trajectory) ·
// 판 이름표(readout) 가 모두 표준 어휘로 있다.
//
// 원본 좌표(아래로 +)를 월드(위로 +)로 옮길 때 y 만 뒤집는다. 두 판은 한 월드에
// 나란히 놓인다. 원판·깃발·공이 판 가운데(x 420)를 넘지 않아 `clip` 은 걸지 않는다
// (왼쪽 원판은 85~345, 깃발 끝까지 더해도 365 를 넘지 않는다).
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

import { ballOffset, diskAngle, pageTime, readThrow, type Frame, type Throw } from './physics';
import { AIM, H, ON_DISK_CX, OUTSIDE_CX, PANEL_CY, R, TRAIL_SEG, W, text, type CoriolisEffectMessageKey } from './schema';
import type { CoriolisEffectState } from './state';

// ------------------------------------------------------------------------
// 원본 그리기 치수 (px)
// ------------------------------------------------------------------------

/**
 * 원판 채움의 빛의 양. 원본은 바탕(#fbfaf7)보다 한 톤 짙은 무채색(#e9e5dc)이었다.
 * 색 리터럴 대신 무채색 역할을 바탕 쪽으로 옅게 섞는다 (C2).
 */
const DISK_LUMINANCE = 0.16;
/** 살 — 원본 #d6d0c4, 굵기 1, 개수, 첫 살의 각. */
const SPOKE_LUMINANCE = 0.3;
const SPOKE_WIDTH = 1;
const SPOKES = 6;
const SPOKE_PHASE = Math.PI / 6;
/** 깃대 길이 · 굵기, 깃발 삼각형(깃대 끝에서 5 · 10 안쪽, 옆으로 12), 받침 반지름. */
const POLE_LEN = 20;
const POLE_WIDTH = 2;
const FLAG_PATH = 'M 20 0 L 15 -12 L 10 0 Z';
const FOOT_R = 3;
/** 던지는 사람 반지름. */
const THROWER_R = 6;
/** 지나간 길 — 굵기, 알파. 공 반지름. */
const TRAIL_WIDTH = 2.5;
const TRAIL_ALPHA = 0.85;
const BALL_R = 7;
/** 판 이름표 — 윗줄 y, 글자 크기. */
const LABEL_TOP = 8;
const LABEL_FONT = 14;

/** 무채색 물체(과녁·사람) — 원본 #4a4a4a. */
const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
/** 공과 그 길 — 강조색은 이 하나에만 쓴다. */
const BALL = { colorRole: 'primary', emphasis: 'strong' } as const;
const GREY = { colorRole: 'muted', emphasis: 'strong' } as const;

interface Panel {
  frame: Frame;
  cx: number;
  label: CoriolisEffectMessageKey;
}

const PANELS: readonly Panel[] = [
  { frame: 'outside', cx: OUTSIDE_CX, label: 'label.outside' },
  { frame: 'onDisk', cx: ON_DISK_CX, label: 'label.onDisk' },
];

/** 원본 좌표 → 월드. 판 중심에서 (dx, dy) 떨어진 점, y 를 뒤집는다. */
function at(p: Panel, dx: number, dy: number): Vec2 {
  return [p.cx + dx, -(PANEL_CY + dy)];
}

function disk(out: Primitive[], p: Panel, phi: number): void {
  const fill: Body = {
    type: 'body',
    id: `${p.frame}-disk`,
    shape: 'disc',
    pos: at(p, 0, 0),
    size: R,
    fill: 'solid',
    outline: 'line',
    glow: false,
    luminance: DISK_LUMINANCE,
    style: GREY,
  };
  out.push(fill);
  // 살 — 원판이 도는지 서 있는지를 보이게 하는 유일한 단서.
  for (let k = 0; k < SPOKES; k++) {
    const a = phi + (k * Math.PI) / 3 + SPOKE_PHASE;
    out.push({
      type: 'trajectory',
      id: `${p.frame}-spoke-${k}`,
      points: [at(p, 0, 0), at(p, R * Math.cos(a), R * Math.sin(a))],
      width: SPOKE_WIDTH,
      style: GREY,
      luminance: SPOKE_LUMINANCE,
    });
  }
}

function target(out: Primitive[], p: Panel, phi: number): void {
  const a = AIM + phi;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  out.push({
    type: 'trajectory',
    id: `${p.frame}-target-pole`,
    points: [at(p, R * ux, R * uy), at(p, (R + POLE_LEN) * ux, (R + POLE_LEN) * uy)],
    width: POLE_WIDTH,
    style: INK,
  });
  // 깃발의 지역 좌표 — x 가 바깥쪽(반지름 방향), -y 가 원본에서 깃발이 뻗던 옆쪽.
  // 원본 화면 각 a 는 월드(y 위)에서 −a 다.
  const flag: Body = {
    type: 'body',
    id: `${p.frame}-target-flag`,
    shape: 'custom',
    pos: at(p, R * ux, R * uy),
    customPath: FLAG_PATH,
    orientation: -a,
    style: INK,
  };
  out.push(flag);
  const foot: Body = {
    type: 'body',
    id: `${p.frame}-target-foot`,
    shape: 'circle',
    pos: at(p, R * ux, R * uy),
    size: FOOT_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: INK,
  };
  out.push(foot);
}

function thrower(p: Panel): Body {
  return {
    type: 'body',
    id: `${p.frame}-thrower`,
    shape: 'circle',
    pos: at(p, 0, 0),
    size: THROWER_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: INK,
  };
}

function trail(p: Panel, th: Throw): Primitive {
  const pts: Vec2[] = [];
  for (let i = 0; i <= TRAIL_SEG; i++) {
    const [x, y] = ballOffset(p.frame, th.t0, (th.tau * i) / TRAIL_SEG);
    pts.push(at(p, x, y));
  }
  return {
    type: 'trajectory',
    id: `${p.frame}-trail`,
    points: pts,
    width: TRAIL_WIDTH,
    style: BALL,
    opacity: TRAIL_ALPHA * th.fade,
  };
}

function ball(p: Panel, th: Throw): Body {
  const [x, y] = ballOffset(p.frame, th.t0, th.tau);
  return {
    type: 'body',
    id: `${p.frame}-ball`,
    shape: 'circle',
    pos: at(p, x, y),
    size: BALL_R,
    fill: 'solid',
    outline: 'none',
    glow: false,
    style: BALL,
    opacity: th.fade,
  };
}

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: CoriolisEffectState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) throw new Error('coriolis-effect: schema.timeline 이 선언되어야 한다');
  const th = readThrow(tl);
  // 원판은 주기와 무관하게 돈다 — 원본은 주기 위상이 아니라 페이지 시계를 썼다.
  const spin = diskAngle(pageTime(tl));
  const out: Primitive[] = [];

  // 그리는 순서가 곧 겹침 순서다 (`schema.drawOrder: 'scene'`). 원본의 mark 순서를 따른다.

  // ── 관점 이름 ── 원본은 윗줄 기준(top), readout 월드 앵커는 가운데 줄 기준이라 반 글자 내린다.
  for (const p of PANELS) {
    out.push({
      type: 'readout',
      id: `${p.frame}-label`,
      anchor: { world: [p.cx, -(LABEL_TOP + LABEL_FONT / 2)] },
      text: text(p.label),
      chip: false,
      align: 'center',
      font: 'text',
      fontSize: LABEL_FONT,
      style: GREY,
    });
  }

  // ── 원판 ── 바깥에서는 돈다, 원판 위에서는 서 있다.
  for (const p of PANELS) disk(out, p, p.frame === 'outside' ? spin : 0);
  // ── 과녁 ── 원판에 붙어 함께 돈다.
  for (const p of PANELS) target(out, p, p.frame === 'outside' ? spin : 0);
  // ── 던지는 사람 ──
  for (const p of PANELS) out.push(thrower(p));
  // ── 공이 지나간 길 ──
  for (const p of PANELS) out.push(trail(p, th));
  // ── 공 ──
  for (const p of PANELS) out.push(ball(p, th));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/**
 * 고정 경계 — 원본 논리 캔버스와 그 아래 캡션 한 줄. 프레이밍은 주장의 일부라
 * 매 프레임 같은 값이다.
 */
export function boundsHint(): Bounds {
  return { minX: 0, maxX: W, minY: -(H + 30), maxY: 0 };
}
