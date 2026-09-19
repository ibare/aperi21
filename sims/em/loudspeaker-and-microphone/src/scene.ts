// ========================================================================
// loudspeaker-and-microphone — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 스피커를 축을 따라 자른 **옆 단면**이다. 진동판은 오른쪽(공기 쪽)으로 열리고 가로로 떤다.
//
//   왼쪽   기록지 두 띠 — 위 `전류 I`(실선), 아래 `진동판 x`(점선). 펜은 오른쪽 끝, 종이는 왼쪽으로 흐른다.
//   가운데 자석 단면(가운데 극 N · 앞판 S, 틈의 자기장 B 는 바깥쪽), 틈 속 코일 단면(⊗ · ⊙),
//          코일에 붙은 보빈 · 진동판 · 먼지막이, 고정된 바구니와 가장자리.
//   오른쪽 공기 알갱이 — 가로로 밀리고 당겨져 촘촘한 곳 · 성긴 곳이 생긴다.
//
// 겹침은 scene 에 쓴 순서다(`drawOrder: 'scene'`):
//
//   공기 → 기록지(띠 · 파형 · 펜) → 바구니 → 자석 → 자기장 → 보빈 · 진동판 · 먼지막이
//   → 코일(속을 바탕으로 덮음) → 전류 표식 → 변환 화살표 · 소리 화살표 → 이름표
//
// 강조색(accent)은 한 뜻에만 쓴다 — **에너지가 가는 쪽.** 스피커 판에는 I → x, 공기로 나가는
// 소리. 마이크 판에는 들어오는 소리, x → I. 두 파형은 색이 아니라 선 모양(실선 · 점선)과 이름으로
// 가른다 (S-piece). 자석 · 바구니 · 자기장은 배경 정보라 회색, 장치 · 파형 · 공기는 먹.
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
import { airDisplacement, airRestPositions, derive, readConstants, type RecordSample } from './physics';
import { AIR_FAR, CONE_RIM_X, SCENE_BOUNDS, text } from './schema';
import type { LoudspeakerAndMicrophoneState } from './state';

// ---- 배치(월드) — 기록지 ----
const STRIP_LEFT = -8.6;
const STRIP_RIGHT = -4.9;
/** 전류 띠 · 변위 띠의 가운데 높이, 띠 반 높이. */
const CURRENT_STRIP_Y = 0.85;
const DISPLACEMENT_STRIP_Y = -0.85;
const STRIP_HALF = 0.6;
/** 변환 화살표(I ↔ x)의 가로 자리 · 띠 가운데에서 물린 거리. */
const CONVERT_X = -4.45;
const CONVERT_INSET = 0.15;

// ---- 배치(월드) — 자석 ----
const MAGNET_BACK = -3.9;
const MAGNET_FRONT = -2.0;
const MAGNET_HALF = 1.3;
/** 틈 안쪽 끝(가운데 극의 뿌리 쪽 벽). */
const GAP_INNER = -2.9;
/** 가운데 극 반 높이 · 앞판 안쪽 가장자리 높이 — 그 사이가 틈이다. */
const POLE_HALF = 0.32;
const PLATE_INNER = 0.78;
/** 극 글자 자리. */
const NORTH_AT: Vec2 = [-2.4, 0];
const SOUTH_X = -2.45;
/** 틈의 자기장 화살표 가로 자리(코일이 가장 왼쪽으로 가도 닿지 않는 곳). */
const FIELD_X = -2.86;
const FIELD_INSET = 0.04;

// ---- 배치(월드) — 움직이는 부분(쉬는 자리) ----
/** 코일 단면 가운데 · 폭 · 높이. 위아래 두 가닥이 같은 높이에 있다. */
const COIL_X = -2.4;
const COIL_Y = 0.55;
const COIL_W = 0.34;
const COIL_H = 0.3;
/** 보빈이 진동판과 만나는 꼭지(가로). 진동판은 보빈 높이(`COIL_Y`)에서 시작한다. */
const APEX_X = -1.7;
/** 진동판 가장자리 높이. 가로 자리는 `CONE_RIM_X`. */
const RIM_Y = 1.7;
/** 먼지막이 호의 반지름 · 표본 수. */
const CAP_RADIUS = 0.62;
const CAP_SAMPLES = 24;
/** 바구니(고정) 끝 높이 — 가장자리(서라운드)가 여기와 진동판 가장자리를 잇는다. */
const BASKET_RIM_Y = 1.95;

// ---- 배치(월드) — 이름표 · 화살표 ----
const MODE_LABEL_AT: Vec2 = [-2.2, 2.35];
/** 소리 진행 화살표 — 공기 위. 스피커 판은 왼→오, 마이크 판은 오→왼. */
const SOUND_ARROW_Y = 2.05;
const SOUND_ARROW_NEAR = 0.3;
const SOUND_ARROW_FAR = 2.9;
const AIR_LABEL_AT: Vec2 = [AIR_FAR, SOUND_ARROW_Y];
/** ⊗ 가위표 반 길이 · ⊙ 점 반지름(월드). */
const CROSS_ARM = 0.075;
const DOT_RADIUS = 0.045;
/** 화살촉 크기(월드). */
const HEAD_SIZE = 0.2;
const FIELD_HEAD_SIZE = 0.11;
/** 이 아래의 전류(봉우리 몫)면 방향 표식을 두지 않는다 — 0 을 지나며 표식이 깜박이지 않게. */
const MARK_MIN = 0.12;

// ---- 모양(화면 px · 불투명도) ----
const MAGNET_FILL_OPACITY = 0.28;
const BASKET_WIDTH_PX = 1.5;
const BASKET_OPACITY = 0.8;
const FIELD_WIDTH_PX = 1.4;
const CONE_WIDTH_PX = 2.5;
const COIL_WIDTH_PX = 2;
const CROSS_WIDTH_PX = 1.8;
const SURROUND_WIDTH_PX = 1.5;
const BASELINE_WIDTH_PX = 1;
const BASELINE_OPACITY = 0.6;
const TRACE_WIDTH_PX = 2.2;
const ARROW_WIDTH_PX = 3.5;
/** 공기 알갱이 반지름(화면 px — `particleSystem.sizes` 의 단위). */
const AIR_DOT_PX = 2.2;
const AIR_OPACITY = 0.85;
/** 코일 속 칠 — 0 이면 바탕 그대로다(뒤의 자기장 · 보빈 선만 가린다). */
const COIL_FILL_OPACITY = 0;
/** 글자 크기 · 이름표 띄움(화면 px). */
const MODE_FONT_PX = 17;
const POLE_FONT_PX = 15;
const LABEL_FONT_PX = 14;
const STRIP_LABEL_OFFSET_PX: Vec2 = [0, -12];
const FIELD_LABEL_OFFSET_PX: Vec2 = [-8, 0];

const ink = { colorRole: 'ink', emphasis: 'strong' } as const;
const accent = { colorRole: 'accent', emphasis: 'strong' } as const;
const muted = { colorRole: 'muted', emphasis: 'strong' } as const;

function rect(cx: number, cy: number, w: number, h: number): Vec2[] {
  return [
    [cx - w / 2, cy - h / 2],
    [cx + w / 2, cy - h / 2],
    [cx + w / 2, cy + h / 2],
    [cx - w / 2, cy + h / 2],
  ];
}

/** 기록 표본을 띠 위 월드 점으로. */
function tracePoints(record: readonly RecordSample[], pick: (s: RecordSample) => number, centerY: number, height: number): Vec2[] {
  return record.map((s) => [STRIP_RIGHT - s.age * (STRIP_RIGHT - STRIP_LEFT), centerY + pick(s) * STRIP_HALF * height]);
}

export function scene(params: {
  state: LoudspeakerAndMicrophoneState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline } = params;
  if (!timeline) throw new Error('loudspeaker-and-microphone: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const r = derive(timeline, c);
  const op = r.opacity;
  const modeOp = op * (r.microphone ? r.microphoneOpacity : r.speakerOpacity);
  const d = r.cone;
  const out: Primitive[] = [];

  // ---- 공기 — 쉬는 자리에서 가로로 밀리고 당겨진다 ----
  const rest = airRestPositions(c);
  out.push({
    type: 'particleSystem',
    id: 'air',
    positions: rest.map(([x, y]): Vec2 => [x + airDisplacement(x, timeline.u, timeline, c), y]),
    sizes: AIR_DOT_PX,
    opacity: op * AIR_OPACITY,
    style: ink,
  });

  // ---- 기록지 두 띠 — 지금 판의 기록 ----
  const strips: { id: string; y: number; msg: 'label.current' | 'label.displacement'; dashed: boolean; pick: (s: RecordSample) => number }[] = [
    { id: 'current', y: CURRENT_STRIP_Y, msg: 'label.current', dashed: false, pick: (s) => s.current },
    { id: 'displacement', y: DISPLACEMENT_STRIP_Y, msg: 'label.displacement', dashed: true, pick: (s) => s.displacement },
  ];
  for (const s of strips) {
    out.push({
      type: 'trajectory',
      id: `${s.id}-baseline`,
      points: [
        [STRIP_LEFT, s.y],
        [STRIP_RIGHT, s.y],
      ],
      width: BASELINE_WIDTH_PX,
      opacity: op * BASELINE_OPACITY,
      style: muted,
    });
    out.push({
      type: 'readout',
      id: `${s.id}-label`,
      anchor: { world: [STRIP_LEFT, s.y + STRIP_HALF], offset: STRIP_LABEL_OFFSET_PX },
      text: text(s.msg),
      chip: false,
      font: 'text',
      fontSize: LABEL_FONT_PX,
      italic: false,
      weight: 'bold',
      align: 'left',
      opacity: op,
      style: ink,
    });
    const pts = tracePoints(r.record, s.pick, s.y, c.traceHeight);
    if (pts.length >= 2) {
      out.push({
        type: 'trajectory',
        id: `${s.id}-trace`,
        points: pts,
        width: TRACE_WIDTH_PX,
        opacity: modeOp,
        style: s.dashed ? { ...ink, lineStyle: 'dashed' } : ink,
      });
    }
    const pen = pts[0];
    if (pen) {
      out.push({ type: 'body', id: `${s.id}-pen`, pos: pen, shape: 'point', opacity: modeOp, style: ink });
    }
  }

  // ---- 바구니(고정) — 앞판 바깥 모서리에서 가장자리까지 ----
  for (const sgn of [1, -1]) {
    out.push({
      type: 'trajectory',
      id: `basket-${sgn}`,
      points: [
        [MAGNET_FRONT, sgn * MAGNET_HALF],
        [CONE_RIM_X, sgn * BASKET_RIM_Y],
      ],
      width: BASKET_WIDTH_PX,
      opacity: op * BASKET_OPACITY,
      style: muted,
    });
  }

  // ---- 자석 단면 — 뒤판 · 가운데 극 · 위아래 앞판. 틈은 가운데 극과 앞판 사이 ----
  const magnet: Vec2[] = [
    [MAGNET_BACK, MAGNET_HALF],
    [MAGNET_FRONT, MAGNET_HALF],
    [MAGNET_FRONT, PLATE_INNER],
    [GAP_INNER, PLATE_INNER],
    [GAP_INNER, POLE_HALF],
    [MAGNET_FRONT, POLE_HALF],
    [MAGNET_FRONT, -POLE_HALF],
    [GAP_INNER, -POLE_HALF],
    [GAP_INNER, -PLATE_INNER],
    [MAGNET_FRONT, -PLATE_INNER],
    [MAGNET_FRONT, -MAGNET_HALF],
    [MAGNET_BACK, -MAGNET_HALF],
  ];
  out.push({
    type: 'region',
    id: 'magnet',
    points: magnet,
    fillOpacity: MAGNET_FILL_OPACITY,
    outline: magnet.map((_, i): readonly [number, number] => [i, (i + 1) % magnet.length]),
    opacity: op,
    style: muted,
  });
  const poleLabel = (id: string, at: Vec2, msg: 'label.north' | 'label.south'): Primitive => ({
    type: 'readout',
    id,
    anchor: { world: at },
    text: text(msg),
    chip: false,
    font: 'text',
    fontSize: POLE_FONT_PX,
    weight: 'bold',
    align: 'center',
    opacity: op,
    style: ink,
  });
  out.push(poleLabel('pole-n', NORTH_AT, 'label.north'));
  const plateMid = (MAGNET_HALF + PLATE_INNER) / 2;
  out.push(poleLabel('pole-s-top', [SOUTH_X, plateMid], 'label.south'));
  out.push(poleLabel('pole-s-bottom', [SOUTH_X, -plateMid], 'label.south'));

  // ---- 틈의 자기장 — 가운데 극(N)에서 앞판(S)으로, 바깥쪽 ----
  for (const sgn of [1, -1]) {
    out.push({
      type: 'vector',
      id: `field-${sgn}`,
      from: [FIELD_X, sgn * (POLE_HALF + FIELD_INSET)],
      delta: [0, sgn * (PLATE_INNER - POLE_HALF - 2 * FIELD_INSET)],
      width: FIELD_WIDTH_PX,
      headSize: FIELD_HEAD_SIZE,
      opacity: op,
      style: muted,
    });
  }
  out.push({
    type: 'readout',
    id: 'field-label',
    anchor: { world: [FIELD_X, (POLE_HALF + PLATE_INNER) / 2], offset: FIELD_LABEL_OFFSET_PX },
    text: text('label.field'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    italic: true,
    weight: 'bold',
    align: 'right',
    opacity: op,
    style: muted,
  });

  // ---- 움직이는 부분 — 보빈 · 진동판 · 먼지막이 · 가장자리. 모두 d 만큼 가로로 ----
  const coilLeft = COIL_X - COIL_W / 2 + d;
  const apex = APEX_X + d;
  const rim = CONE_RIM_X + d;
  for (const sgn of [1, -1]) {
    out.push({
      type: 'trajectory',
      id: `cone-${sgn}`,
      points: [
        [coilLeft, sgn * COIL_Y],
        [apex, sgn * COIL_Y],
        [rim, sgn * RIM_Y],
      ],
      width: CONE_WIDTH_PX,
      opacity: op,
      style: ink,
    });
    out.push({
      type: 'trajectory',
      id: `surround-${sgn}`,
      points: [
        [rim, sgn * RIM_Y],
        [CONE_RIM_X, sgn * BASKET_RIM_Y],
      ],
      width: SURROUND_WIDTH_PX,
      opacity: op,
      style: ink,
    });
  }
  const capCx = apex - Math.sqrt(Math.max(CAP_RADIUS * CAP_RADIUS - COIL_Y * COIL_Y, 0));
  const capHalf = Math.atan2(COIL_Y, apex - capCx);
  const cap: Vec2[] = [];
  for (let i = 0; i <= CAP_SAMPLES; i++) {
    const a = -capHalf + (2 * capHalf * i) / CAP_SAMPLES;
    cap.push([capCx + CAP_RADIUS * Math.cos(a), CAP_RADIUS * Math.sin(a)]);
  }
  out.push({ type: 'trajectory', id: 'dust-cap', points: cap, width: CONE_WIDTH_PX, opacity: op, style: ink });

  // ---- 코일 단면 — 위아래 두 가닥. 속을 바탕으로 덮어 보빈 선을 가린다 ----
  for (const sgn of [1, -1]) {
    const box = rect(COIL_X + d, sgn * COIL_Y, COIL_W, COIL_H);
    out.push(
      {
        type: 'region',
        id: `coil-inside-${sgn}`,
        points: box,
        opaque: true,
        fillOpacity: COIL_FILL_OPACITY,
        opacity: op,
        style: ink,
      },
      {
        type: 'trajectory',
        id: `coil-${sgn}`,
        points: box,
        closed: true,
        width: COIL_WIDTH_PX,
        opacity: op,
        style: ink,
      },
    );
  }

  // ---- 전류 방향 — 위 가닥 ⊗ 이면 아래 가닥 ⊙. 교류라 번갈아 뒤집힌다 ----
  if (Math.abs(r.current) >= MARK_MIN) {
    const upperIn = r.current > 0;
    for (const sgn of [1, -1]) {
      const cx = COIL_X + d;
      const cy = sgn * COIL_Y;
      const into = sgn > 0 ? upperIn : !upperIn;
      if (into) {
        out.push({
          type: 'lineSet',
          id: `current-mark-${sgn}`,
          lines: [
            [
              [cx - CROSS_ARM, cy - CROSS_ARM],
              [cx + CROSS_ARM, cy + CROSS_ARM],
            ],
            [
              [cx - CROSS_ARM, cy + CROSS_ARM],
              [cx + CROSS_ARM, cy - CROSS_ARM],
            ],
          ],
          width: CROSS_WIDTH_PX,
          opacity: op,
          style: ink,
        });
      } else {
        out.push({
          type: 'body',
          id: `current-mark-${sgn}`,
          pos: [cx, cy],
          shape: 'circle',
          size: DOT_RADIUS,
          glow: false,
          outline: 'none',
          opacity: op,
          style: ink,
        });
      }
    }
  }

  // ---- 에너지가 가는 쪽 — 변환(I ↔ x)과 소리(나감 · 들어옴) ----
  const speakerFlow = !r.microphone && timeline.u >= timeline.start('speak-ramp');
  const micConvert = r.microphone && timeline.u >= timeline.start('listen-ramp');
  const top = CURRENT_STRIP_Y - CONVERT_INSET;
  const bottom = DISPLACEMENT_STRIP_Y + CONVERT_INSET;
  if (speakerFlow || micConvert) {
    out.push({
      type: 'vector',
      id: 'convert',
      from: speakerFlow ? [CONVERT_X, top] : [CONVERT_X, bottom],
      delta: [0, speakerFlow ? bottom - top : top - bottom],
      width: ARROW_WIDTH_PX,
      headSize: HEAD_SIZE,
      opacity: modeOp,
      style: accent,
    });
  }
  if (speakerFlow || r.microphone) {
    const len = SOUND_ARROW_FAR - SOUND_ARROW_NEAR;
    out.push({
      type: 'vector',
      id: 'sound',
      from: speakerFlow ? [SOUND_ARROW_NEAR, SOUND_ARROW_Y] : [SOUND_ARROW_FAR, SOUND_ARROW_Y],
      delta: [speakerFlow ? len : -len, 0],
      width: ARROW_WIDTH_PX,
      headSize: HEAD_SIZE,
      opacity: modeOp,
      style: accent,
    });
  }
  out.push({
    type: 'readout',
    id: 'air-label',
    anchor: { world: AIR_LABEL_AT },
    text: text('label.air'),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    weight: 'bold',
    align: 'right',
    opacity: op,
    style: ink,
  });

  // ---- 지금 장치가 하는 일 ----
  out.push({
    type: 'readout',
    id: 'mode-label',
    anchor: { world: MODE_LABEL_AT },
    text: text(r.microphone ? 'label.microphone' : 'label.speaker'),
    chip: false,
    font: 'text',
    fontSize: MODE_FONT_PX,
    weight: 'bold',
    align: 'center',
    opacity: modeOp,
    style: ink,
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`). id 'caption' 을 두지 않는다.
  return out;
}

/** 고정 경계 — 기록지 이름표부터 공기 먼 끝, 아래 캡션 줄까지. */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
