// ========================================================================
// impedance-mismatch — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 줄 · 이음매 안내선 · 점선 윤곽
// (trajectory), 이름표(readout)가 모두 표준 어휘로 있다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 세 줄은 같은 대상(같은 펄스를 실은 줄)이라 같은 먹색이다. 이음매
// 안내선 · 점선 윤곽은 배경 정보라 muted. **강조색은 쓰지 않는다** — 되돌아온 몫은 점선을
// 채우는 높이로, 뒤집힘은 아래로 솟는 모양으로 보인다 (S-piece). 세 줄을 가르는 것은
// 이어 붙인 줄의 굵기와 이름표다.
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  LocalizedText,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import {
  displacement,
  fullReturn,
  pastPulseCount,
  pulseCenter,
  pulseSpacing,
  readConstants,
  type ImpedanceConstants,
} from './physics';
import {
  HEADER_Y,
  JUNCTION_GUIDE_OVERHANG,
  LANE_LABEL_GAP,
  LANE_Y,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { ImpedanceMismatchState } from './state';

/** 가벼운 줄 표본 수 — 펄스 폭(0.45)에 표본이 열여덟쯤 들어간다. */
const LIGHT_SAMPLES = 200;
/**
 * 이은 줄 표본 수 — 가장 무거운 줄(Z2 = 9Z1)에서 건너간 펄스는 폭이 1/9 로 좁아진다(0.05).
 * 그 폭에도 표본이 여럿 들어가도록 촘촘하게 둔다.
 */
const TAIL_SAMPLES = 900;
/** 가벼운 줄 굵기(화면 px). */
const STRING_WIDTH_PX = 2.5;
/**
 * 이은 줄이 Z2/Z1 이 두 배 될 때마다 더 굵어지는 양(화면 px). 굵기는 **순서만** 말한다 —
 * 무거운 줄이 굵어 보이면 되고, 굵기 비로 임피던스 비를 읽게 하지 않는다.
 */
const HEAVY_WIDTH_STEP_PX = 0.9;
/** 이음매 안내선 굵기(화면 px). 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** 점선 윤곽 굵기(화면 px). */
const GHOST_WIDTH_PX = 1.5;
/** 점선 윤곽이 다 나타났을 때의 불투명도. 줄보다 한 단 뒤에 선다. */
const GHOST_OPACITY = 0.85;
/** 줄 이름 · 설명 글자 크기(화면 px). */
const LANE_NAME_PX = 15;
const LANE_NOTE_PX = 12;
/** 줄 이름을 줄 높이 위로 · 설명을 아래로 띄우는 거리(화면 px). */
const LANE_NAME_LIFT_PX = -10;
const LANE_NOTE_DROP_PX = 10;
/** 머리 이름표 글자 크기(화면 px). */
const HEADER_PX = 12;

/** 한 줄 구간의 점들. x 가 from 에서 to 까지. */
function stringPoints(
  from: number,
  to: number,
  samples: number,
  laneY: number,
  sample: (x: number) => number,
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = from + ((to - from) * i) / samples;
    pts.push([x, laneY + sample(x)]);
  }
  return pts;
}

/** Z2/Z1 에 맞는 줄 이름 · 설명 문안. 같은 줄이면 비를 적지 않는다. */
function laneTexts(rho: number): { name: LocalizedText; note: LocalizedText } {
  if (rho === 1) return { name: text('label.ratioSame'), note: text('label.sameNote') };
  return {
    name: text('label.ratio'),
    note: rho > 1 ? text('label.heavierNote') : text('label.lighterNote'),
  };
}

/** 한 줄 — 점선 윤곽 · 가벼운 쪽 · 이은 쪽 · 이름표. */
function lane(
  index: number,
  laneY: number,
  rho: number,
  s: number,
  spacing: number,
  count: number,
  ghostOpacity: number,
  c: ImpedanceConstants,
): Primitive[] {
  const J = c.junctionX;
  const end = J + c.tailLength;
  const y = (x: number): number => displacement(x, rho, s, spacing, count, c);
  const out: Primitive[] = [];

  // 「전부 되돌아왔다면」 의 윤곽. 줄보다 먼저 선언해 평평한 부분이 줄에 가려진다.
  out.push({
    type: 'trajectory',
    id: `ghost-${index}`,
    points: stringPoints(0, J, LIGHT_SAMPLES, laneY, (x) => fullReturn(x, rho, s, c)),
    width: GHOST_WIDTH_PX,
    opacity: ghostOpacity,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
  });
  out.push({
    type: 'trajectory',
    id: `light-${index}`,
    points: stringPoints(0, J, LIGHT_SAMPLES, laneY, y),
    width: STRING_WIDTH_PX,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trajectory',
    id: `tail-${index}`,
    points: stringPoints(J, end, TAIL_SAMPLES, laneY, y),
    width: STRING_WIDTH_PX + HEAVY_WIDTH_STEP_PX * Math.max(0, Math.log2(rho)),
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 이름표 — 줄 높이(평형)에 고정. 비는 선언값을 그대로 쓴다 (S-piece 유효숫자).
  const at: Vec2 = [end + LANE_LABEL_GAP, laneY];
  const { name, note } = laneTexts(rho);
  out.push(
    {
      type: 'readout',
      id: `lane-${index}-name`,
      anchor: { world: at, offset: [0, LANE_NAME_LIFT_PX] },
      text: name,
      vars: { ratio: String(rho) },
      chip: false,
      font: 'text',
      fontSize: LANE_NAME_PX,
      weight: 'bold',
      align: 'left',
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: `lane-${index}-note`,
      anchor: { world: at, offset: [0, LANE_NOTE_DROP_PX] },
      text: note,
      chip: false,
      font: 'text',
      fontSize: LANE_NOTE_PX,
      align: 'left',
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  );
  return out;
}

/** 머리 이름표 하나 — 월드 자리 가운데 정렬. */
function header(id: string, x: number, label: LocalizedText): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: [x, HEADER_Y] },
    text: label,
    chip: false,
    font: 'text',
    fontSize: HEADER_PX,
    align: 'center',
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

export function scene(params: {
  state: ImpedanceMismatchState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('impedance-mismatch: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const s = pulseCenter(tl, c);
  const spacing = pulseSpacing(tl, c);
  const count = pastPulseCount(spacing, c);
  const J = c.junctionX;
  // 점선 윤곽은 `splitOut` 단계에 나타난다 — 되돌아온 몫이 이음매를 떠나는 때다.
  // `splitIn` 에 두면 들어오는 펄스 밑에 그림자처럼 비친다. 이징은 선언이 정한다.
  const ghostOpacity = GHOST_OPACITY * tl.at('splitOut');
  const out: Primitive[] = [];

  // 이음매 안내선 — 세 줄을 세로로 꿰는 점선. 같은 줄(위)에서도 자리는 보인다.
  const topY = Math.max(...LANE_Y);
  const bottomY = Math.min(...LANE_Y);
  out.push({
    type: 'trajectory',
    id: 'junction-guide',
    points: [
      [J, bottomY - JUNCTION_GUIDE_OVERHANG],
      [J, topY + JUNCTION_GUIDE_OVERHANG],
    ],
    width: GUIDE_WIDTH_PX,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
  });

  LANE_Y.forEach((laneY, i) => {
    out.push(...lane(i, laneY, c.ratios[i]!, s, spacing, count, ghostOpacity, c));
  });

  out.push(
    header('header-incoming', J / 2, text('label.incoming')),
    header('header-junction', J, text('label.junction')),
    header('header-tail', J + c.tailLength / 2, text('label.tail')),
  );

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
