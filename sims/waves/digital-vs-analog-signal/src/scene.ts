// ========================================================================
// digital-vs-analog-signal — 장면 선언
// ========================================================================
// 그리지 않는다, 선언한다.
//
// 자유 렌더를 쓰지 않는다. 칸 테두리 · 선로 · 문턱 · 두 신호 · 보낸 모양 점선이 모두
// `trajectory` 이고, 이름표가 `readout` 이다. 칸에 신호가 「들어오는」 것은 칸 사각형을
// 진행도만큼만 여는 `clip` 으로 한다.
//
// 색: 두 줄의 신호는 같은 먹색이다(같은 대상 — 「보내는 신호」). 가르는 것은 줄 이름과
// 모양(곡선 · 계단)이다. 도착한 그대로의 신호는 무채색 가는 선, 중계기가 내보낸 신호는
// 먹색 굵은 선 — 굵기와 짙기가 「키우기 전 · 뒤」 를 가른다. 강조색은 쓰지 않는다.
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
import { deriveStations, readConstants, sampleX } from './physics';
import {
  ANALOG_BASE_Y,
  DIGITAL_BASE_Y,
  LANE_WIDTH,
  PANEL_GAP,
  PANEL_H,
  PANEL_PAD,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { DigitalVsAnalogSignalState } from './state';

/** 칸 테두리 · 선로 · 문턱선의 굵기(화면 px). 안내선이라 가늘다. */
const GUIDE_WIDTH_PX = 1;
/** 도착한 그대로의 신호 굵기(화면 px). */
const ARRIVED_WIDTH_PX = 1.25;
/** 중계기가 내보낸 신호 굵기(화면 px). */
const SIGNAL_WIDTH_PX = 2;
/** 보낸 모양 점선의 굵기(화면 px). */
const GHOST_WIDTH_PX = 1.5;
/** 칸 테두리 · 선로의 불투명도. 칸은 자리일 뿐이라 신호보다 옅다. */
const GUIDE_OPACITY = 0.55;
/** 칸 이름 · 문턱 이름의 글자 크기(화면 px). */
const LABEL_PX = 12;
/** 줄 이름의 글자 크기(화면 px). */
const ROW_LABEL_PX = 13;
/** 칸 이름을 칸 윗변 위로 띄우는 거리(화면 px). */
const STATION_LABEL_OFFSET: Vec2 = [0, -11];
/** 줄 이름을 첫 칸 왼쪽으로 띄우는 거리(화면 px). */
const ROW_LABEL_OFFSET: Vec2 = [-12, 0];
/** 문턱 이름을 마지막 문턱선 오른쪽 끝에서 띄우는 거리(화면 px). */
const THRESHOLD_LABEL_OFFSET: Vec2 = [7, 0];

const muted = { colorRole: 'muted', emphasis: 'strong' } as const;
const ink = { colorRole: 'ink', emphasis: 'strong' } as const;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

interface Lane {
  base: number;
  /** 신호 세기 v → 월드 y. */
  y(v: number): number;
}

const lane = (base: number): Lane => ({
  base,
  y: (v) => base + PANEL_PAD + v * (PANEL_H - 2 * PANEL_PAD),
});

export function scene(params: {
  state: DigitalVsAnalogSignalState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { timeline: tl } = params;
  if (!tl) throw new Error('digital-vs-analog-signal: schema.timeline 이 선언되어야 한다');
  const c = readConstants(params.stage);
  const stations = deriveStations(c);
  const n = stations.length;
  const hops = n - 1;

  // 칸 폭은 칸 수를 따라가지만 전체 폭은 고정이다 — 경계가 움직이지 않는다 (원칙 6).
  const panelW = (LANE_WIDTH - (n - 1) * PANEL_GAP) / n;
  const x0 = (k: number): number => k * (panelW + PANEL_GAP);
  const px = (k: number, x: number): number => x0(k) + x * panelW;

  const analog = lane(ANALOG_BASE_Y);
  const digital = lane(DIGITAL_BASE_Y);

  const send = tl.at('send');
  const travel = tl.at('travel');
  const compare = tl.at('compare');
  const op = 1 - tl.at('fade');

  /** 칸 k 에 신호가 들어온 몫(0~1). 출발 칸은 `send`, 나머지는 `travel` 을 구간 수로 가른다. */
  const reveal = (k: number): number => (k === 0 ? send : clamp01(travel * hops - (k - 1)));

  const g: Primitive[] = [];

  const rect = (k: number, base: number): Vec2[] => [
    [x0(k), base],
    [x0(k) + panelW, base],
    [x0(k) + panelW, base + PANEL_H],
    [x0(k), base + PANEL_H],
  ];
  /** 칸 사각형을 왼쪽부터 `r` 만큼만 연다. 신호가 칸에 들어오는 모습이다. */
  const opening = (k: number, base: number, r: number) => ({
    min: [x0(k), base] as Vec2,
    max: [x0(k) + panelW * r, base + PANEL_H] as Vec2,
  });

  const curve = (k: number, L: Lane, vs: readonly number[]): Vec2[] =>
    vs.map((v, i) => [px(k, sampleX(i)), L.y(v)] as Vec2);
  const steps = (k: number, L: Lane, bits: readonly number[]): Vec2[] => {
    const pts: Vec2[] = [];
    bits.forEach((b, i) => {
      pts.push([px(k, i / bits.length), L.y(b)]);
      pts.push([px(k, (i + 1) / bits.length), L.y(b)]);
    });
    return pts;
  };

  for (const [row, L] of [
    ['analog', analog],
    ['digital', digital],
  ] as const) {
    // ---- 줄 이름 ----
    g.push({
      type: 'readout',
      id: `${row}-name`,
      anchor: { world: [x0(0), L.base + PANEL_H / 2], offset: ROW_LABEL_OFFSET },
      text: text(row === 'analog' ? 'label.analog' : 'label.digital'),
      chip: false,
      font: 'text',
      weight: 'bold',
      fontSize: ROW_LABEL_PX,
      align: 'right',
      opacity: op,
      style: ink,
    });

    for (let k = 0; k < n; k++) {
      const s = stations[k]!;
      const r = reveal(k);

      // ---- 칸 테두리와 앞 칸에서 오는 선로 ----
      g.push({
        type: 'trajectory',
        id: `${row}-frame-${k}`,
        points: rect(k, L.base),
        closed: true,
        width: GUIDE_WIDTH_PX,
        opacity: op * GUIDE_OPACITY,
        style: muted,
      });
      if (k > 0) {
        const midY = L.base + PANEL_H / 2;
        g.push({
          type: 'trajectory',
          id: `${row}-line-${k}`,
          points: [
            [x0(k - 1) + panelW, midY],
            [x0(k), midY],
          ],
          width: GUIDE_WIDTH_PX,
          opacity: op * GUIDE_OPACITY,
          style: muted,
        });
      }

      // ---- 디지털 문턱 — 도착한 신호를 가르는 높이. 중계기의 성질이라 신호가 오기 전에도 있다 ----
      if (row === 'digital' && k > 0) {
        const yCut = L.y(c.attenuation * c.threshold);
        g.push({
          type: 'trajectory',
          id: `threshold-${k}`,
          points: [
            [x0(k), yCut],
            [x0(k) + panelW, yCut],
          ],
          width: GUIDE_WIDTH_PX,
          opacity: op,
          style: { ...muted, lineStyle: 'dashed' },
        });
        // 이름은 줄 끝 칸 밖에 한 번만 — 칸 안에 두면 도착한 신호와 겹친다.
        if (k === n - 1) {
          g.push({
            type: 'readout',
            id: 'threshold-name',
            anchor: { world: [x0(k) + panelW, yCut], offset: THRESHOLD_LABEL_OFFSET },
            text: text('label.threshold'),
            chip: false,
            font: 'text',
            fontSize: LABEL_PX,
            align: 'left',
            opacity: op,
            style: muted,
          });
        }
      }

      if (r <= 0) continue;
      const clip = opening(k, L.base, r);

      // ---- 도착한 그대로(약해지고 잡음이 섞인 것) ----
      const arrived = row === 'analog' ? s.analogArrived : s.digitalArrived;
      if (arrived) {
        g.push({
          type: 'trajectory',
          id: `${row}-arrived-${k}`,
          points: curve(k, L, arrived),
          width: ARRIVED_WIDTH_PX,
          opacity: op,
          clip,
          style: muted,
        });
      }

      // ---- 중계기가 내보낸 것 ----
      // 아날로그는 도착한 것을 1/감쇠 배 키운 것, 디지털은 비트마다 다시 판정한 계단이다.
      // 칸 밖으로 넘친 몫은 자른다 — 칸이 곧 선로가 담을 수 있는 폭이다.
      g.push({
        type: 'trajectory',
        id: `${row}-out-${k}`,
        points: row === 'analog' ? curve(k, L, s.analogOut) : steps(k, L, s.digitalBits),
        width: SIGNAL_WIDTH_PX,
        opacity: op,
        clip,
        style: ink,
      });

      // ---- 보낸 모양 — 도착 칸에만, 견주는 단계에서 ----
      if (k === n - 1 && compare > 0) {
        const sent = stations[0]!;
        g.push({
          type: 'trajectory',
          id: `${row}-sent-ghost`,
          points: row === 'analog' ? curve(k, L, sent.analogOut) : steps(k, L, sent.digitalBits),
          width: GHOST_WIDTH_PX,
          opacity: op,
          clip,
          style: { ...muted, lineStyle: 'dashed' },
        });
      }
    }
  }

  // ---- 칸 이름 — 위 줄 위에만. 두 줄이 같은 자리를 지나므로 한 번이면 된다 ----
  for (let k = 0; k < n; k++) {
    const isSource = k === 0;
    const isReceiver = k === n - 1;
    g.push({
      type: 'readout',
      id: `station-${k}`,
      anchor: { world: [x0(k) + panelW / 2, ANALOG_BASE_Y + PANEL_H], offset: STATION_LABEL_OFFSET },
      text: text(isSource ? 'label.source' : isReceiver ? 'label.receiver' : 'label.relay'),
      ...(isSource || isReceiver ? {} : { vars: { n: k } }),
      chip: false,
      font: 'text',
      fontSize: LABEL_PX,
      align: 'center',
      opacity: op,
      style: muted,
    });
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return g;
}

/** 고정 경계. 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
