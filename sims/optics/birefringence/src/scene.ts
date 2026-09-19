// ========================================================================
// birefringence — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다.
//
// 두 칸이다.
//   왼쪽 — 옆에서 본 단면. 종이 위 글자에서 올라온 빛 한 줄기가 결정 밑면에서 둘로 갈라진다.
//          정상광 o 는 곧게, 이상광 e 는 비스듬히 지나 윗면에서 나란히 나간다. 떨림은 표식으로 단다 —
//          o 는 종이면에 수직(⊙), e 는 종이면 안에서 줄기에 수직(가로 눈금). 들어오는 줄기에는 둘 다 있다.
//          이 단면은 오른쪽 그림에서 두 상을 잇는 선을 따라 자른 것이다.
//   오른쪽 — 위에서 본 모습. 결정 윗면(마름모) 밑으로 글자가 두 겹(o 상 · e 상) 보인다. 결정이 돌면
//          e 상이 o 상 둘레를 돌고 그 자취가 점선으로 남는다. 편광판을 얹으면 그 결에 따라 한 상이 사라진다.
//
// 색 — 빛 줄기 · 떨림 표식 · 글자는 모두 ink(같은 빛, 같은 글자). o 와 e 는 색이 아니라 경로 모양 ·
// 떨림 표식 · 이름표로 가른다(S-piece). 결정 · 종이 · 편광판 · 자취는 배경 정보라 muted.
// ========================================================================

import type {
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
  crystalAngle,
  drawnWalkOff,
  imageShares,
  polarizerAngle,
  polarizerPresence,
  readConstants,
  separation,
} from './physics';
import {
  CRYSTAL_HALF_W,
  CRYSTAL_SLANT,
  EXIT_LEN,
  FACE_ANGLE_DEG,
  FACE_EDGE,
  GAP,
  PAPER_HALF_W,
  PAPER_Y,
  POLARIZER_INNER_R,
  POLARIZER_R,
  POL_HATCH_GAP,
  SCENE_BOUNDS,
  TOP_CENTER,
  text,
} from './schema';
import type { BirefringenceState } from './state';

/** 이름표 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 칸 이름 글자 크기(화면 px). */
const TITLE_PX = 13;
/** 위에서 본 글자 크기(화면 px). */
const GLYPH_PX = 50;
/** 상 이름(o · e) 글자 크기(화면 px). */
const IMAGE_LABEL_PX = 14;
/** 이름표를 앵커에서 띄우는 거리(화면 px). */
const LABEL_GAP = 10;
/** 굴절률 글자를 줄기에서 띄우는 거리(화면 px) — 떨림 눈금 끝을 비켜 간다. */
const INDEX_GAP = 16;
/** 상 이름을 글자 가운데에서 두 상을 잇는 방향으로 띄우는 거리(화면 px). */
const IMAGE_LABEL_GAP = 40;
/** 칸 이름을 칸 위 끝에서 올리는 거리(월드). */
const TITLE_RISE = 0.25;

/** 선 굵기(화면 px). */
const BEAM_W = 2.2;
const PAPER_W = 1.6;
const EDGE_W = 1.4;
const TICK_W = 1.6;
const HATCH_W = 1;
const AXIS_W = 2.4;
const TRAIL_W = 1.4;
/** 짙기. 결정 채움 · 결정 윗면 채움 · 편광판 채움 · 결 · 자취. */
const CRYSTAL_FILL = 0.14;
const FACE_FILL = 0.12;
const POLARIZER_FILL = 0.1;
const HATCH_OPACITY = 0.45;
const TRAIL_OPACITY = 0.7;

/** 글자 점 반지름(월드). */
const LETTER_DOT_R = 0.06;
/** 떨림 표식 ⊙ 의 고리 반지름(월드). 가운데 점은 `point` 모양이다. */
const VIB_RING_R = 0.085;
/** 떨림 눈금 반길이(월드). */
const TICK_HALF = 0.11;
/**
 * 떨림 표식이 놓이는 자리 — 구간 안 몫(0 = 구간 시작, 1 = 끝). 목록이 코드에 남는다 (장부 G105).
 * o 의 ⊙ 과 e 의 눈금이 서로 다른 높이에 오게 엇갈려 둔다.
 */
const INCOMING_DOT_AT = 0.68;
const INCOMING_TICK_AT = 0.3;
const INSIDE_DOT_AT = [0.3, 0.72] as const;
const INSIDE_TICK_AT = [0.4, 0.86] as const;
const EXIT_MARK_AT = 0.42;
/** 굴절률 글자가 붙는 줄기 위 자리(결정 안 구간 몫). */
const INDEX_AT = 0.52;
const INDEX_E_AT = 0.63;
/** 편광판 이름표가 붙는 둘레 위 자리(반지름 배수 · 135° 방향). */
const POLARIZER_LABEL_AT = Math.SQRT1_2;
/** 자취 · 원 표본 수. */
const ARC_SAMPLES = 72;

const RAD = Math.PI / 180;

function add(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}
function scale(a: Vec2, k: number): Vec2 {
  return [a[0] * k, a[1] * k];
}
function lerp(a: Vec2, b: Vec2, u: number): Vec2 {
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}
function rotate(a: Vec2, th: number): Vec2 {
  const c = Math.cos(th);
  const s = Math.sin(th);
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
}

/** 방향 `dir` 의 평행선으로 원(반지름 `outer`)을 채우되, 안쪽 원(반지름 `inner`)은 비운다. */
function annulusChords(center: Vec2, dir: Vec2, outer: number, inner: number, gap: number): Vec2[][] {
  const n: Vec2 = [-dir[1], dir[0]];
  const out: Vec2[][] = [];
  const count = Math.floor(outer / gap);
  for (let i = -count; i <= count; i++) {
    const o = i * gap;
    if (Math.abs(o) >= outer) continue;
    const h = Math.sqrt(outer * outer - o * o);
    const base = add(center, scale(n, o));
    if (Math.abs(o) < inner) {
      const hi = Math.sqrt(inner * inner - o * o);
      out.push([add(base, scale(dir, -h)), add(base, scale(dir, -hi))]);
      out.push([add(base, scale(dir, hi)), add(base, scale(dir, h))]);
    } else {
      out.push([add(base, scale(dir, -h)), add(base, scale(dir, h))]);
    }
  }
  return out;
}

export function scene(params: {
  state: BirefringenceState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { state, stage, timeline } = params;
  if (!timeline) throw new Error('birefringence: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const d = separation(c);
  const rho = drawnWalkOff(c);
  const out: Primitive[] = [];

  // ================= 왼쪽 — 옆에서 본 단면 =================

  const y0 = PAPER_Y + GAP;
  const y1 = y0 + c.thickness;
  const letter: Vec2 = [0, PAPER_Y];
  const oIn: Vec2 = [0, y0];
  const oOut: Vec2 = [0, y1];
  const eOut: Vec2 = [d, y1];
  const sideTop = y1 + EXIT_LEN;

  out.push({
    type: 'trajectory',
    id: 'paper',
    points: [
      [-PAPER_HALF_W, PAPER_Y],
      [PAPER_HALF_W, PAPER_Y],
    ],
    width: PAPER_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'letter-label',
    anchor: { world: letter, offset: [0, LABEL_GAP] },
    text: text('label.letter'),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  const crystal: Vec2[] = [
    [-CRYSTAL_HALF_W, y0],
    [CRYSTAL_HALF_W, y0],
    [CRYSTAL_HALF_W + CRYSTAL_SLANT, y1],
    [-CRYSTAL_HALF_W + CRYSTAL_SLANT, y1],
  ];
  out.push({
    type: 'region',
    id: 'crystal-side',
    points: crystal,
    fillOpacity: CRYSTAL_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'crystal-side-edge',
    points: crystal,
    closed: true,
    width: EDGE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'crystal-label',
    anchor: { world: [CRYSTAL_HALF_W, y0], offset: [LABEL_GAP, 0] },
    text: text('label.crystal'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 줄기 — 들어오는 한 줄기, 결정 안의 두 줄기, 나가는 두 줄기(화살촉).
  out.push({
    type: 'trajectory',
    id: 'beam-in',
    points: [letter, oIn],
    width: BEAM_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'beam-o-inside',
    points: [oIn, oOut],
    width: BEAM_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'beam-e-inside',
    points: [oIn, eOut],
    width: BEAM_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'beam-o-exit',
    from: oOut,
    delta: [0, EXIT_LEN],
    width: BEAM_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'vector',
    id: 'beam-e-exit',
    from: eOut,
    delta: [0, EXIT_LEN],
    width: BEAM_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'body',
    id: 'letter-dot',
    pos: letter,
    shape: 'circle',
    size: LETTER_DOT_R,
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 떨림 표식 — o 는 ⊙(종이면에 수직), e 는 줄기에 수직인 가로 눈금(종이면 안).
  const dotAt: Vec2[] = [
    lerp(letter, oIn, INCOMING_DOT_AT),
    ...INSIDE_DOT_AT.map((u) => lerp(oIn, oOut, u)),
    lerp(oOut, [0, sideTop], EXIT_MARK_AT),
  ];
  dotAt.forEach((p, i) => {
    out.push({
      type: 'body',
      id: `vib-ring-${i}`,
      pos: p,
      shape: 'circle',
      size: VIB_RING_R,
      fill: 'none',
      outline: 'role',
      glow: false,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'body',
      id: `vib-dot-${i}`,
      pos: p,
      shape: 'point',
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  });
  const eDir: Vec2 = [Math.sin(rho), Math.cos(rho)];
  const ePerp: Vec2 = [eDir[1], -eDir[0]];
  const tick = (p: Vec2, perp: Vec2): Vec2[] => [add(p, scale(perp, -TICK_HALF)), add(p, scale(perp, TICK_HALF))];
  out.push({
    type: 'lineSet',
    id: 'vib-ticks',
    lines: [
      tick(lerp(letter, oIn, INCOMING_TICK_AT), [1, 0]),
      ...INSIDE_TICK_AT.map((u) => tick(lerp(oIn, eOut, u), ePerp)),
      tick(lerp(eOut, [d, sideTop], EXIT_MARK_AT), [1, 0]),
    ],
    width: TICK_W,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 이름표 — 나가는 줄기 끝에 줄기 이름, 결정 안 줄기 옆에 굴절률.
  out.push({
    type: 'readout',
    id: 'o-ray-label',
    anchor: { world: [0, sideTop], offset: [-LABEL_GAP, 0] },
    text: text('label.oRay'),
    chip: false,
    font: 'text',
    align: 'right',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'e-ray-label',
    anchor: { world: [d, sideTop], offset: [LABEL_GAP, 0] },
    text: text('label.eRay'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'o-index',
    anchor: { world: lerp(oIn, oOut, INDEX_AT), offset: [-INDEX_GAP, 0] },
    text: text('label.nO'),
    vars: { n: state.nO },
    chip: false,
    align: 'right',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'e-index',
    anchor: { world: lerp(oIn, eOut, INDEX_E_AT), offset: [INDEX_GAP, 0] },
    text: text('label.nE'),
    vars: { n: state.nE },
    chip: false,
    align: 'left',
    fontSize: LABEL_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'side-title',
    anchor: { world: [-PAPER_HALF_W, sideTop + TITLE_RISE] },
    text: text('label.side'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: TITLE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // ================= 오른쪽 — 위에서 본 모습 =================

  const phi = crystalAngle(timeline, c);
  const joinDir: Vec2 = [Math.cos(phi), Math.sin(phi)];
  const oImg: Vec2 = TOP_CENTER;
  const eImg: Vec2 = add(TOP_CENTER, scale(joinDir, d));

  // 결정 윗면 — 마름모. 결정과 함께 돈다.
  const u: Vec2 = [FACE_EDGE / 2, 0];
  const v: Vec2 = scale([Math.cos(FACE_ANGLE_DEG * RAD), Math.sin(FACE_ANGLE_DEG * RAD)], FACE_EDGE / 2);
  const face: Vec2[] = [
    scale(add(u, v), -1),
    add(u, scale(v, -1)),
    add(u, v),
    add(scale(u, -1), v),
  ].map((p) => add(TOP_CENTER, rotate(p, phi)));
  out.push({
    type: 'region',
    id: 'crystal-face',
    points: face,
    fillOpacity: FACE_FILL,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: 'crystal-face-edge',
    points: face,
    closed: true,
    width: EDGE_W,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // e 상의 자취 — 결정이 돈 만큼의 호. 돌기 전에는 없다.
  if (phi > 0) {
    const trail: Vec2[] = [];
    const steps = Math.max(2, Math.ceil((ARC_SAMPLES * phi) / (2 * Math.PI)));
    for (let i = 0; i <= steps; i++) {
      const a = (phi * i) / steps;
      trail.push(add(TOP_CENTER, [d * Math.cos(a), d * Math.sin(a)]));
    }
    out.push({
      type: 'trajectory',
      id: 'e-trail',
      points: trail,
      width: TRAIL_W,
      opacity: TRAIL_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
  }

  // 편광판 — 얹히는 동안 나타난다. 결과 축은 글자를 가리지 않게 고리에만 긋는다.
  const presence = polarizerPresence(timeline);
  if (presence > 0) {
    const polDir: Vec2 = rotate(joinDir, polarizerAngle(timeline, c));
    const disc: Vec2[] = [];
    for (let i = 0; i < ARC_SAMPLES; i++) {
      const a = (i / ARC_SAMPLES) * Math.PI * 2;
      disc.push(add(TOP_CENTER, [POLARIZER_R * Math.cos(a), POLARIZER_R * Math.sin(a)]));
    }
    out.push({
      type: 'region',
      id: 'polarizer-fill',
      points: disc,
      fillOpacity: POLARIZER_FILL,
      opacity: presence,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'lineSet',
      id: 'polarizer-hatch',
      lines: annulusChords(TOP_CENTER, polDir, POLARIZER_R, POLARIZER_INNER_R, POL_HATCH_GAP),
      width: HATCH_W,
      opacity: presence * HATCH_OPACITY,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'lineSet',
      id: 'polarizer-axis',
      lines: [
        [add(TOP_CENTER, scale(polDir, -POLARIZER_R)), add(TOP_CENTER, scale(polDir, -POLARIZER_INNER_R))],
        [add(TOP_CENTER, scale(polDir, POLARIZER_INNER_R)), add(TOP_CENTER, scale(polDir, POLARIZER_R))],
      ],
      width: AXIS_W,
      opacity: presence,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'trajectory',
      id: 'polarizer-rim',
      points: disc,
      closed: true,
      width: EDGE_W,
      opacity: presence,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: 'polarizer-label',
      anchor: {
        world: add(TOP_CENTER, [-POLARIZER_R * POLARIZER_LABEL_AT, POLARIZER_R * POLARIZER_LABEL_AT]),
        offset: [-LABEL_GAP, 0],
      },
      text: text('label.polarizer'),
      chip: false,
      font: 'text',
      align: 'right',
      fontSize: LABEL_PX,
      opacity: presence,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // 글자 두 겹 — o 상은 제자리, e 상은 두 상을 잇는 방향으로 갈라진 거리만큼. 남은 밝기만큼 짙다.
  const share = imageShares(timeline, c);
  const labelOff = (sign: number): Vec2 => [sign * joinDir[0] * IMAGE_LABEL_GAP, -sign * joinDir[1] * IMAGE_LABEL_GAP];
  const images: { id: 'o' | 'e'; pos: Vec2; share: number; sign: number }[] = [
    { id: 'e', pos: eImg, share: share.e, sign: 1 },
    { id: 'o', pos: oImg, share: share.o, sign: -1 },
  ];
  for (const img of images) {
    if (img.share <= 0) continue;
    out.push({
      type: 'readout',
      id: `glyph-${img.id}`,
      anchor: { world: img.pos },
      text: text('glyph.letter'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: GLYPH_PX,
      opacity: img.share,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    out.push({
      type: 'readout',
      id: `glyph-${img.id}-label`,
      anchor: { world: img.pos, offset: labelOff(img.sign) },
      text: text(img.id === 'o' ? 'label.o' : 'label.e'),
      chip: false,
      italic: true,
      fontSize: IMAGE_LABEL_PX,
      opacity: img.share,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  out.push({
    type: 'readout',
    id: 'top-title',
    anchor: { world: [TOP_CENTER[0] - POLARIZER_R, sideTop + TITLE_RISE] },
    text: text('label.top'),
    chip: false,
    font: 'text',
    align: 'left',
    fontSize: TITLE_PX,
    style: { colorRole: 'muted', emphasis: 'strong' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
