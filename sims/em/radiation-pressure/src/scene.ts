// ========================================================================
// radiation-pressure — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다.
//
// 아래에서 위로 (drawOrder: 'scene') —
//   레일 · 출발 자리 점선 → 광자 물결 묶음(lineSet) → 광원 판(body) → 판(body) · 거울 면(trajectory)
//   → 판이 받은 p · F 화살표(vector) → 광자가 싣고 가는 p 화살표(vector) → 치수선 · 이름표 · 배율 알림(readout).
//
// 색은 뜻마다 하나다 — 광자와 광자가 싣고 가는 p 는 primary(빛), 레일 · 광원 · 치수는 muted(장치),
// **강조색은 「판이 받은 것」 한 뜻에만** — 판에 쌓이는 p 화살표와 힘 F 화살표.
// 검은 판은 역할색이 아니라 빛 없음(`light: 0`)으로 칠해 두 테마에서 똑같이 검다. 빛 색은 짓지 않는다 —
// 광자는 색이 아니라 물결 모양으로 빛임을 보인다.
// ========================================================================

import type { Bounds, Primitive, SceneGraph, StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ABSORB_KICKS,
  REFLECT_KICKS,
  packetCenter,
  packetLine,
  photonOffset,
  plateForce,
  pushedDistance,
  readConstants,
  type RadiationPressureConstants,
} from './physics';
import { SCENE_BOUNDS, text, type RadiationPressureMessageKey } from './schema';
import type { RadiationPressureState } from './state';

// ------------------------------------------------------------------------
// 그림 치수 — 화면 px 는 위계라 배율을 따르지 않는다 (C2)
// ------------------------------------------------------------------------

/** 광자 물결 굵기(화면 px). */
const PHOTON_PX = 2;
/** 화살표 굵기(화면 px) · 머리(월드). 판이 받은 것을 광자의 p 보다 굵게 긋는다. */
const PHOTON_ARROW_PX = 2;
const PLATE_ARROW_PX = 3;
const ARROW_HEAD = 0.13;
/** 이보다 짧은 화살표는 긋지 않는다(월드) — 거울에서 p 가 뒤집히는 한가운데서 머리만 남지 않게. */
const ARROW_MIN = 0.06;
/** 이보다 짧은 화살표는 이름표를 달지 않는다(월드) — 자라기 시작한 화살표 둘의 이름표가 겹치지 않게. */
const LABEL_MIN = 0.3;
/** 광자의 p 화살표가 광자 위로 뜨는 높이(월드). */
const PHOTON_ARROW_LIFT = 0.3;

/** 거울 면 굵기(화면 px). 반사하는 면을 판 몸통보다 짙게 긋는다. */
const MIRROR_FACE_PX = 3;
/** 레일 · 출발 자리 점선 굵기(화면 px). */
const GUIDE_PX = 1;
/** 레일이 판 출발 자리 왼쪽으로 뻗는 길이 · 오른쪽 끝(월드). */
const RAIL_LEAD = 0.5;
const RAIL_END = 4.2;
/** 치수선이 레일 아래로 내려가는 거리(월드). */
const DIM_DROP = 0.16;
/** 광원 판 두께(월드) · 빛줄기 위아래로 더 뻗는 길이(월드). */
const SOURCE_THICK = 0.14;
const SOURCE_MARGIN = 0.12;

/** 판 이름표 — 판 위로 뜨는 높이(월드) · 글자 크기(화면 px). */
const NAME_LIFT = 0.2;
const NAME_PX = 12;
/** 배율 알림 — 글자 크기 · 모서리에서 띄움(화면 px). */
const NOTE_PX = 11;
const NOTE_INSET = 8;

// ------------------------------------------------------------------------
// 두 레인
// ------------------------------------------------------------------------

interface Lane {
  id: 'absorber' | 'mirror';
  /** 레인 가운데 높이의 부호 — 위 +1, 아래 −1. */
  side: 1 | -1;
  reflect: boolean;
  kicks: number;
  name: RadiationPressureMessageKey;
}

const LANES: readonly Lane[] = [
  { id: 'absorber', side: 1, reflect: false, kicks: ABSORB_KICKS, name: 'label.absorber' },
  { id: 'mirror', side: -1, reflect: true, kicks: REFLECT_KICKS, name: 'label.mirror' },
];

// ------------------------------------------------------------------------
// scene
// ------------------------------------------------------------------------

export function scene(params: {
  state: RadiationPressureState;
  stage: StageDef;
  timeline?: TimelineFrame;
}): SceneGraph {
  const tl = params.timeline;
  if (!tl) return [];
  const c = readConstants(params.stage);

  const out: Primitive[] = [];
  const guides: Primitive[] = [];
  const photons: Primitive[] = [];
  const devices: Primitive[] = [];
  const plateArrows: Primitive[] = [];
  const photonArrows: Primitive[] = [];
  const notes: Primitive[] = [];

  /** 빛줄기가 흐르기 시작했는가 — 광자 하나씩 보내는 앞 단계와 가른다. 경계는 시간표의 것이다. */
  const streaming = tl.u >= tl.start('fill');
  const pushing = tl.u >= tl.start('push');
  /** 흐름 · 힘 · 치수가 다음 주기로 흐려지는 몫. */
  const fadeOut = 1 - tl.at('fade');
  /** 밀기 단계에서 흐른 시간(초). 단계가 끝나면 단계 길이에 머문다. */
  const tauPush = tl.at('push') * tl.duration('push');

  for (const lane of LANES) {
    const y = lane.side * c.laneY;
    const force = plateForce(c, lane.kicks);
    const shift = pushedDistance(c, force, tauPush) * fadeOut;
    const face = c.plateX + shift;
    const back = face + c.plateThick;
    const halfH = c.plateHeight / 2;
    const railY = y - halfH;

    // ── 레일 · 출발 자리 ──────────────────────────────────────────────
    guides.push({
      type: 'surface',
      id: `${lane.id}-rail`,
      geometry: { kind: 'wall', from: [c.plateX - RAIL_LEAD, railY], to: [RAIL_END, railY] },
      style: { colorRole: 'muted', emphasis: 'medium' },
    });
    guides.push({
      type: 'trajectory',
      id: `${lane.id}-start`,
      points: [
        [c.plateX, railY],
        [c.plateX, y + halfH],
      ],
      width: GUIDE_PX,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    });

    // ── 광자 ─────────────────────────────────────────────────────────
    if (!streaming) {
      singlePhoton(c, tl, lane, y, face, photons, photonArrows);
    } else {
      const lines = streamPhotons(c, tl, lane, y, face);
      if (lines.length > 0) {
        photons.push({
          type: 'lineSet',
          id: `${lane.id}-stream`,
          lines,
          width: PHOTON_PX,
          opacity: fadeOut,
          style: { colorRole: 'primary', emphasis: 'strong' },
        });
      }
    }

    // ── 광원 판 ──────────────────────────────────────────────────────
    devices.push({
      type: 'body',
      id: `${lane.id}-source`,
      shape: 'rect',
      pos: [c.sourceX - SOURCE_THICK / 2, y],
      size: [SOURCE_THICK, 2 * (c.beamHalf + SOURCE_MARGIN)],
      style: { colorRole: 'muted', emphasis: 'medium' },
    });

    // ── 판 ──────────────────────────────────────────────────────────
    const plateCenter: Vec2 = [face + c.plateThick / 2, y];
    if (lane.reflect) {
      devices.push({
        type: 'body',
        id: `${lane.id}-plate`,
        shape: 'rect',
        pos: plateCenter,
        size: [c.plateThick, c.plateHeight],
        style: { colorRole: 'muted', emphasis: 'medium' },
      });
      devices.push({
        type: 'trajectory',
        id: `${lane.id}-face`,
        points: [
          [face, y - halfH],
          [face, y + halfH],
        ],
        width: MIRROR_FACE_PX,
        style: { colorRole: 'ink', emphasis: 'strong' },
      });
    } else {
      devices.push({
        type: 'body',
        id: `${lane.id}-plate`,
        shape: 'rect',
        pos: plateCenter,
        size: [c.plateThick, c.plateHeight],
        light: 0,
      });
    }

    // ── 판이 받은 것 ─────────────────────────────────────────────────
    if (!pushing) {
      // 광자 하나에서 받은 운동량 — 광자가 잃은 만큼(흡수 p, 반사 p + p). 빛줄기가 차는 동안 흐려진다.
      const received = tl.at('hit') * lane.kicks * c.momentumArrow;
      chain(plateArrows, `${lane.id}-kick`, [back, y], received, lane.kicks, 'label.p', 1 - tl.at('fill'));
    } else {
      // 쉬지 않고 쬐는 빛의 힘 — 흡수 F, 반사 F + F. 같은 배율이라 거울 쪽이 같은 화살표 둘이다.
      chain(plateArrows, `${lane.id}-force`, [back, y], force * c.forceArrowScale, lane.kicks, 'label.f', fadeOut);
      if (shift > ARROW_MIN) {
        notes.push({
          type: 'dimension',
          id: `${lane.id}-shift`,
          from: [c.plateX, railY - DIM_DROP],
          to: [face, railY - DIM_DROP],
          opacity: fadeOut,
        });
      }
    }

    // ── 이름표 ──────────────────────────────────────────────────────
    notes.push({
      type: 'readout',
      id: `${lane.id}-name`,
      anchor: { world: [c.plateX + c.plateThick / 2, y + halfH + NAME_LIFT] },
      text: text(lane.name),
      chip: false,
      font: 'text',
      fontSize: NAME_PX,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ── 과장 배율 알림 — 판이 밀리는 동안만 ────────────────────────────
  if (pushing) {
    notes.push({
      type: 'readout',
      id: 'exaggeration',
      anchor: { screen: 'top-right', offset: [-NOTE_INSET, NOTE_INSET] },
      text: text('label.exaggeration'),
      vars: { k: String(c.pushExaggeration) },
      fontSize: NOTE_PX,
      opacity: fadeOut,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  out.push(...guides, ...photons, ...devices, ...plateArrows, ...photonArrows, ...notes);
  return out;
}

// ------------------------------------------------------------------------
// 광자 하나씩 — approach · hit · read
// ------------------------------------------------------------------------

/**
 * 레인마다 광자 하나. 곧게 간다고 칠 때의 가운데 x(`s`)가 시간표를 따라 나아간다 —
 * `approach` 동안 광원에서 앞면에 닿기까지, `hit` 동안 묶음 한 길이만큼(흡수는 판 속으로 사라지고
 * 반사는 앞면에서 접힌다), `read` 동안 광원까지 되돌아갈 거리만큼.
 */
function singlePhoton(
  c: RadiationPressureConstants,
  tl: TimelineFrame,
  lane: Lane,
  y: number,
  face: number,
  photons: Primitive[],
  photonArrows: Primitive[],
): void {
  const half = c.packetLength / 2;
  const start = c.sourceX + half;
  const reach = face - half - start;
  const s = start + reach * tl.at('approach') + c.packetLength * tl.at('hit') + reach * tl.at('read');

  const line = packetLine(c, s, y, face, lane.reflect);
  if (line.length > 0) {
    photons.push({
      type: 'lineSet',
      id: `${lane.id}-photon`,
      lines: [line],
      width: PHOTON_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    });
  }

  // 광자가 싣고 가는 운동량 — 흡수는 p 에서 0 으로 줄고, 반사는 +p 에서 −p 로 뒤집힌다.
  const h = tl.at('hit');
  const signed = lane.reflect ? 1 - 2 * h : 1 - h;
  const len = signed * c.momentumArrow;
  if (Math.abs(len) < ARROW_MIN) return;
  const cx = lane.reflect ? packetCenter(s, face) : Math.min(s, face - half);
  photonArrows.push({
    type: 'vector',
    id: `${lane.id}-photon-p`,
    from: [cx - len / 2, y + PHOTON_ARROW_LIFT],
    delta: [len, 0],
    label: Math.abs(len) >= LABEL_MIN ? text('label.p') : undefined,
    width: PHOTON_ARROW_PX,
    headSize: ARROW_HEAD,
    // 이름표를 늘 화살표 위(광자 반대쪽)에 둔다 — 왼쪽을 향하면 반시계 쪽이 아래가 된다.
    labelSide: len >= 0 ? 'ccw' : 'cw',
    style: { colorRole: 'primary', emphasis: 'strong' },
  });
}

// ------------------------------------------------------------------------
// 흐르는 빛 — fill · push · fade
// ------------------------------------------------------------------------

/**
 * 빛줄기의 광자들. 광자 k 는 빛줄기가 흐르기 시작한 뒤 k / rate 초에 광원을 떠난다.
 * 속력은 `fill` 단계 동안 첫 광자가 판 출발 자리에 닿도록 정한다 — 힘은 `push` 가 시작할 때 걸린다.
 */
function streamPhotons(
  c: RadiationPressureConstants,
  tl: TimelineFrame,
  lane: Lane,
  y: number,
  face: number,
): Vec2[][] {
  const tau = tl.u - tl.start('fill');
  const speed = (c.plateX - c.sourceX) / tl.duration('fill');
  const lines: Vec2[][] = [];
  const last = Math.floor(tau * c.photonRate);
  for (let k = 0; k <= last; k += 1) {
    const s = c.sourceX + speed * (tau - k / c.photonRate);
    // 되돌아온 광자가 광원을 지나면 끝 — 반사 레인만 해당한다.
    if (packetCenter(s, face) < c.sourceX) continue;
    const line = packetLine(c, s, y + photonOffset(c, k), face, lane.reflect);
    if (line.length > 0) lines.push(clipBehind(line, c.sourceX));
  }
  return lines.filter((l) => l.length >= 2);
}

/** 광원 판 뒤로 빠진 표본을 버린다 — 막 떠나는 묶음이 광원 뒤에서 삐져나오지 않게. */
function clipBehind(line: Vec2[], x: number): Vec2[] {
  return line.filter((p) => p[0] >= x);
}

// ------------------------------------------------------------------------
// 머리-꼬리로 잇는 화살표
// ------------------------------------------------------------------------

/**
 * 길이 `total` 을 같은 몫 `count` 개로 나눠 머리-꼬리로 잇는다 (G108). 몫 하나가 광자 하나에서
 * 받은 운동량(또는 그 힘)이라, 거울 판의 화살표가 같은 화살표 둘로 읽힌다.
 */
function chain(
  out: Primitive[],
  id: string,
  from: Vec2,
  total: number,
  count: number,
  label: RadiationPressureMessageKey,
  opacity: number,
): void {
  const each = total / count;
  if (each < ARROW_MIN || opacity <= 0) return;
  for (let i = 0; i < count; i += 1) {
    out.push({
      type: 'vector',
      id: `${id}-${i}`,
      from: [from[0] + i * each, from[1]],
      delta: [each, 0],
      label: each >= LABEL_MIN ? text(label) : undefined,
      width: PLATE_ARROW_PX,
      headSize: ARROW_HEAD,
      labelSide: 'ccw',
      opacity,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
