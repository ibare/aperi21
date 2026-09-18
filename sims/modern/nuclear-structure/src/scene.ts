// ========================================================================
// nuclear-structure — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 없음.
//
// 핵자는 `body` 원 하나씩(한 핵에 많아야 열몇 개라 낱개로 둔다). 양성자의 `+` 는
// `body` custom 경로를 바탕색 둘레로 긋는다 — 짙은 원 위 글자에 쓸 반전 색 역할이
// 없어(장부 G07) 바탕색 선을 빌렸다. 방금 들어오거나 바뀐 알갱이의 고리는
// `trajectory` closed(원 표본, G28), 괄호는 `lineSet`, 글자는 `readout`.
//
// 색 — 양성자는 먹(`ink`), 중성자는 회색(`muted`). 둘을 가르는 것은 색만이 아니라
// `+` 표식이다. 강조색(`accent`)은 「이 단계에서 들어오거나 바뀐 알갱이」 한 뜻에만 쓴다.
// ========================================================================

import type {
  Bounds,
  Body,
  EnvironmentDef,
  LineSet,
  Primitive,
  Readout,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Trajectory,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  diff,
  elementOf,
  massNumber,
  nucleonOffset,
  nucleonTypes,
  outward,
  readConstants,
  type Nucleon,
  type Nuclide,
} from './physics';
import {
  BRACKET_INSET,
  BRACKET_LABEL_Y,
  BRACKET_TICK,
  BRACKET_Y,
  FLY_IN_DIST,
  NAME_Y,
  NOTATION_Y,
  NUCLEON_R,
  SCENE_BOUNDS,
  SLOT_X,
  text,
  type NuclearStructureMessageKey,
} from './schema';
import type { NuclearStructureState } from './state';

// ------------------------------------------------------------------------
// 위계 — 화면 px 이거나 핵자 반지름에 대한 비
// ------------------------------------------------------------------------

/** `+` 팔 길이 — 핵자 반지름에 대한 비. */
const PLUS_ARM = 0.55;
/** 강조 고리 반지름 — 핵자 반지름에 대한 비. */
const RING_RADIUS = 1.35;
/** 강조 고리 굵기(화면 px). */
const RING_W = 2;
/** 원을 표본하는 꼭짓점 수 (G28). */
const CIRCLE_SEGMENTS = 20;
/** 괄호 굵기(화면 px). */
const BRACKET_W = 1.5;
/** 원소 기호 · 첨자 · 이름 · 괄호 이름표 글자 크기(화면 px). */
const SYMBOL_PX = 30;
const SCRIPT_PX = 15;
const NAME_PX = 14;
const BRACKET_LABEL_PX = 13;
/** 기호를 앵커에서 오른쪽으로 미는 거리 · 첨자를 앵커 왼쪽에 붙이는 거리 · 첨자를 위아래로 벌리는 거리(화면 px). */
const SYMBOL_DX = -6;
const SCRIPT_DX = -9;
const SCRIPT_DY = 10;
/** 핵자가 제자리에서 떠는 폭(월드)과 빠르기(rad/s). 묶인 알갱이가 살아 있게 보이는 정도의 결이다. */
const JIGGLE_AMP = 0.012;
const JIGGLE_RATE = 4.2;
/** 세로 떨림 빠르기 — 가로에 대한 비. 같으면 핵자가 원을 그리며 돈다. */
const JIGGLE_RATE_Y = 1.3;
/** 핵자마다 떨림 위상을 벌리는 각(라디안). 황금각이라 이웃끼리 겹치지 않는다. */
const JIGGLE_PHASE = Math.PI * (3 - Math.sqrt(5));

const INK = { colorRole: 'ink', emphasis: 'strong' } as const;
const NEUTRON = { colorRole: 'muted', emphasis: 'strong' } as const;
const GUIDE = { colorRole: 'muted', emphasis: 'strong' } as const;
const ACCENT = { colorRole: 'accent', emphasis: 'strong' } as const;

const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;

function circle(c: Vec2, r: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < CIRCLE_SEGMENTS; k++) {
    const a = (k / CIRCLE_SEGMENTS) * Math.PI * 2;
    pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  return pts;
}

/** `+` 표식 — 바탕색 선 두 획. 좌표는 핵자 중심 기준 월드, y 위. */
const PLUS_PATH = (() => {
  const a = NUCLEON_R * PLUS_ARM;
  return `M ${-a} 0 L ${a} 0 M 0 ${-a} L 0 ${a}`;
})();

/** 핵 하나가 지금 어떤 모습인지. `to` 로 가는 중이면 `progress` 가 0~1. */
interface NucleusDraw {
  id: string;
  center: Vec2;
  from: Nuclide;
  to: Nuclide;
  progress: number;
  /** 들어오거나 바뀐 알갱이에 강조 고리를 둘지. */
  ringChanged: boolean;
  opacity: number;
  /** 이름표 불투명도 — 핵이 자리에 닿기 전에는 옅다. */
  labelOpacity: number;
}

function jiggle(i: number, t: number): Vec2 {
  const ph = i * JIGGLE_PHASE;
  return [JIGGLE_AMP * Math.sin(JIGGLE_RATE * t + ph), JIGGLE_AMP * Math.cos(JIGGLE_RATE * JIGGLE_RATE_Y * t + ph)];
}

function nucleonBody(id: string, pos: Vec2, type: Nucleon, opacity: number): Body {
  return {
    type: 'body',
    id,
    shape: 'circle',
    pos,
    size: NUCLEON_R,
    outline: 'background',
    glow: false,
    opacity,
    style: type === 'p' ? INK : NEUTRON,
  };
}

function plusMark(id: string, pos: Vec2, opacity: number): Body {
  return {
    type: 'body',
    id,
    shape: 'custom',
    customPath: PLUS_PATH,
    pos,
    fill: 'none',
    outline: 'background',
    opacity,
    style: INK,
  };
}

function label(
  id: string,
  key: NuclearStructureMessageKey,
  pos: Vec2,
  offset: Vec2,
  vars: Record<string, string | number>,
  fontSize: number,
  align: 'left' | 'center' | 'right',
  opacity: number,
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos, offset },
    text: text(key),
    vars,
    chip: false,
    font: 'text',
    align,
    fontSize,
    opacity,
    style: INK,
  };
}

/** 핵 하나 — 핵자 · 표식 · 강조 고리 · 핵종 표기 · 이름. */
function nucleus(d: NucleusDraw, t: number, out: Primitive[]): void {
  if (d.opacity <= 0) return;
  const a = nucleonTypes(d.from);
  const b = nucleonTypes(d.to);
  const changes = diff(d.from, d.to);
  const p = d.progress;
  const bodies: Body[] = [];
  const marks: Body[] = [];
  const rings: Vec2[][] = [];

  changes.forEach((ch, i) => {
    const off = nucleonOffset(i);
    const j = jiggle(i, t);
    const home: Vec2 = [d.center[0] + off[0] + j[0], d.center[1] + off[1] + j[1]];
    const dir = outward(i);
    let pos = home;
    // 종류가 겹쳐 보이는 동안 그릴 것 — [종류, 불투명도]
    const layers: [Nucleon, number][] = [];
    if (ch === 'same') {
      layers.push([a[i]!, 1]);
    } else if (ch === 'change') {
      // 제자리에서 새 종류가 옛 종류 위로 짙어진다. 바깥부터 그리려고 목록을 뒤집으므로
      // 새 종류를 먼저 넣어야 위에 온다.
      layers.push([b[i]!, p], [a[i]!, 1]);
    } else if (ch === 'arrive') {
      if (p <= 0) return;
      const far = FLY_IN_DIST * (1 - p);
      pos = [home[0] + dir[0] * far, home[1] + dir[1] * far];
      // 바깥에서 온전한 알갱이로 들어온다 — 옅게 두면 반쯤 있는 것으로 읽힌다.
      layers.push([b[i]!, 1]);
    } else {
      if (p >= 1) return;
      const far = FLY_IN_DIST * p;
      pos = [home[0] + dir[0] * far, home[1] + dir[1] * far];
      layers.push([a[i]!, 1 - p]);
    }
    layers.forEach(([type, o], k) => {
      if (o <= 0) return;
      bodies.push(nucleonBody(`${d.id}-nucleon-${i}-${k}`, pos, type, o * d.opacity));
      if (type === 'p') marks.push(plusMark(`${d.id}-plus-${i}-${k}`, pos, o * d.opacity));
    });
    if (d.ringChanged && ch !== 'same' && p > 0) rings.push(circle(pos, NUCLEON_R * RING_RADIUS));
  });

  // 바깥 자리부터 그린다 — 안쪽 알갱이가 위에 와야 가운데 양성자의 + 가 가려지지 않는다.
  // 표식은 모든 원 위에 둔다. 가장자리에 붙은 새 알갱이는 강조 고리가 따로 떼어 보인다.
  out.push(...bodies.reverse(), ...marks.reverse());
  rings.forEach((pts, k) => {
    const ring: Trajectory = {
      type: 'trajectory',
      id: `${d.id}-ring-${k}`,
      points: pts,
      closed: true,
      width: RING_W,
      opacity: d.opacity,
      style: ACCENT,
    };
    out.push(ring);
  });

  // 핵종 표기 — 바뀌는 일이 끝나면(진행도 1) 새 핵의 이름표가 된다.
  const shown = p >= 1 ? d.to : d.from;
  const el = elementOf(shown.z);
  const o = d.labelOpacity * d.opacity;
  const at: Vec2 = [d.center[0], NOTATION_Y];
  out.push(label(`${d.id}-symbol`, 'label.value', at, [SYMBOL_DX, 0], { v: el.symbol }, SYMBOL_PX, 'left', o));
  out.push(label(`${d.id}-mass`, 'label.value', at, [SCRIPT_DX, -SCRIPT_DY], { v: massNumber(shown) }, SCRIPT_PX, 'right', o));
  out.push(label(`${d.id}-atomic`, 'label.value', at, [SCRIPT_DX, SCRIPT_DY], { v: shown.z }, SCRIPT_PX, 'right', o));
  out.push(label(`${d.id}-name`, el.name, [d.center[0], NAME_Y], [0, 0], { a: massNumber(shown) }, NAME_PX, 'center', o));
}

/** 두 자리를 잇는 괄호와 그 이름표. */
function bracket(
  id: string,
  x0: number,
  x1: number,
  key: NuclearStructureMessageKey,
  opacity: number,
  out: Primitive[],
): void {
  if (opacity <= 0) return;
  const l = x0 + BRACKET_INSET;
  const r = x1 - BRACKET_INSET;
  const lines: LineSet = {
    type: 'lineSet',
    id: `${id}-bracket`,
    lines: [
      [
        [l, BRACKET_Y + BRACKET_TICK],
        [l, BRACKET_Y],
        [r, BRACKET_Y],
        [r, BRACKET_Y + BRACKET_TICK],
      ],
    ],
    width: BRACKET_W,
    opacity,
    style: GUIDE,
  };
  out.push(lines);
  out.push(label(`${id}-label`, key, [(x0 + x1) / 2, BRACKET_LABEL_Y], [0, 0], {}, BRACKET_LABEL_PX, 'center', opacity));
}

export function scene(params: {
  state: NuclearStructureState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('nuclear-structure: schema.timeline 이 선언되어야 한다');
  const [k1, k2, k3] = readConstants(params.stage).nuclides;
  const copyA = tl.at('copyA');
  const add = tl.at('add');
  const same = tl.at('sameIn');
  const copyB = tl.at('copyB');
  const change = tl.at('change');
  const other = tl.at('otherIn');
  const keep = 1 - tl.at('fade');
  const out: Primitive[] = [];

  // 첫 핵 — 늘 서 있다.
  nucleus(
    { id: 'first', center: [SLOT_X[0], 0], from: k1, to: k1, progress: 1, ringChanged: false, opacity: 1, labelOpacity: 1 },
    tl.t,
    out,
  );

  // 둘째 — 첫 핵이 옮겨 와서 모자란 알갱이를 받는다.
  if (copyA > 0) {
    nucleus(
      {
        id: 'second',
        center: [lerp(SLOT_X[0], SLOT_X[1], copyA), 0],
        from: k1,
        to: k2,
        progress: add,
        ringChanged: true,
        opacity: keep,
        labelOpacity: copyA,
      },
      tl.t,
      out,
    );
  }

  // 셋째 — 둘째가 옮겨 와서 알갱이 종류가 바뀐다.
  if (copyB > 0) {
    nucleus(
      {
        id: 'third',
        center: [lerp(SLOT_X[1], SLOT_X[2], copyB), 0],
        from: k2,
        to: k3,
        progress: change,
        ringChanged: true,
        opacity: keep,
        labelOpacity: copyB,
      },
      tl.t,
      out,
    );
  }

  bracket('same', SLOT_X[0], SLOT_X[1], 'label.sameElement', same * keep, out);
  bracket('other', SLOT_X[1], SLOT_X[2], 'label.otherElement', other * keep, out);

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
