// ========================================================================
// noise-cancellation — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더를 쓰지 않는다 — 평형선 · 세 파형 · 옛 소음의
// 흔적은 모두 `trajectory`, 줄 이름은 `readout` 이다. 캡션은 선언의 캡션 슬롯이 그린다.
//
// 색은 뜻마다 하나다 — 귀에 닿는 합은 먹색 굵은 선(주인공), 바깥 소음과 뒤집은 소리는
// 같은 무채색 선이다. 둘을 가르는 것은 줄의 자리와 **모양**(마루 자리에 골)이지 색이
// 아니다. 뒤집힘을 역할색으로 칠하면 범례가 되고 「위아래가 바뀌었다」 를 색이 가로챈다
// (S-piece).
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
  noiseAt,
  noisePartials,
  readConstants,
  speakerState,
  type NoisePartial,
} from './physics';
import { ROW_ANTI_Y, ROW_EAR_Y, ROW_NOISE_Y, SCENE_BOUNDS, STRING_HALF, text } from './schema';
import type { NoiseCancellationState } from './state';

/** 곡선 표본 간격(월드 칸). 가장 짧은 파장(0.9 칸)에도 표본이 20 개 넘게 걸린다. */
const SAMPLE_STEP = 0.04;
/** 합 굵기 · 소음과 뒤집은 소리 굵기 · 평형선 굵기 · 흔적 굵기(화면 px). 합이 주인공이라 가장 굵다. */
const SUM_WIDTH = 2.75;
const WAVE_WIDTH = 1.75;
const REST_WIDTH = 1;
const GHOST_WIDTH = 1.25;
/** 스피커가 꺼진 동안 복사본을 보이는 불투명도 — 아직 소리가 아니라는 표시다. */
const PREVIEW_OPACITY = 0.35;
/** 줄 이름 글자 크기(화면 px)와 가장 높은 마루 위로 띄우는 거리(화면 px). */
const ROW_LABEL_PX = 12;
const ROW_LABEL_GAP_PX = 10;

/** 줄 끝에서 끝까지 표본해 곡선 하나를 뽑는다. */
function curve(y0: number, fn: (x: number) => number): Vec2[] {
  const n = Math.ceil((2 * STRING_HALF) / SAMPLE_STEP);
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = -STRING_HALF + (2 * STRING_HALF * i) / n;
    pts.push([x, y0 + fn(x)]);
  }
  return pts;
}

/** 한 줄의 틀 — 평형선과 왼쪽 위 이름. */
function frame(id: string, y0: number, top: number, name: LocalizedText): Primitive[] {
  return [
    {
      type: 'trajectory',
      id: `rest-${id}`,
      points: [
        [-STRING_HALF, y0],
        [STRING_HALF, y0],
      ],
      width: REST_WIDTH,
      style: { colorRole: 'muted', emphasis: 'subtle' },
    },
    {
      type: 'readout',
      id: `name-${id}`,
      anchor: { world: [-STRING_HALF, y0 + top], offset: [0, -ROW_LABEL_GAP_PX] },
      text: name,
      chip: false,
      align: 'left',
      fontSize: ROW_LABEL_PX,
      font: 'text',
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
  ];
}

export function scene(params: {
  state: NoiseCancellationState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('noise-cancellation: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const parts: readonly NoisePartial[] = noisePartials(c);
  const sp = speakerState(timeline, c);
  const t = timeline.t;

  const noise = (x: number) => noiseAt(x, t, parts, c.speed);
  /** 스피커가 내는 소리의 모양 — 늦은 만큼 옛 소음을 뒤집은 것(크기는 따로). */
  const anti = (x: number) => sp.flip * noiseAt(x, t - sp.delay, parts, c.speed);
  const top = c.noisePeak;

  const out: Primitive[] = [];

  // ---- 위 줄: 바깥 소음 ----
  out.push(...frame('noise', ROW_NOISE_Y, top, text('label.noise')));
  out.push({
    type: 'trajectory',
    id: 'wave-noise',
    points: curve(ROW_NOISE_Y, noise),
    width: WAVE_WIDTH,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid' },
  });

  // ---- 가운데 줄: 뒤집은 소리 ----
  // 꺼진 동안은 마이크가 들은 복사본을 옅게 보이고, 그것이 위아래로 접혀 뒤집힌다.
  // 스피커가 켜지는 만큼 짙어진다 — 짙기는 「소리가 나오는가」 하나만 뜻한다.
  out.push(...frame('anti', ROW_ANTI_Y, top, text('label.anti')));
  const antiOpacity = sp.gain + (1 - sp.gain) * PREVIEW_OPACITY * sp.preview;
  if (antiOpacity > 0) {
    out.push({
      type: 'trajectory',
      id: 'wave-anti',
      points: curve(ROW_ANTI_Y, anti),
      width: WAVE_WIDTH,
      opacity: antiOpacity,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'solid' },
    });
  }

  // ---- 아래 줄: 귀에 닿는 합 ----
  out.push(...frame('ear', ROW_EAR_Y, top, text('label.ear')));
  // 지워지는 동안 원래 소음이 어땠는지를 가는 점선으로 남긴다 — 평평해진 합이
  // 「원래 조용했다」 가 아니라 「지웠다」 로 읽히게 하는 기준이다.
  if (sp.gain > 0) {
    out.push({
      type: 'trajectory',
      id: 'ghost-ear',
      points: curve(ROW_EAR_Y, noise),
      width: GHOST_WIDTH,
      opacity: sp.gain,
      style: { colorRole: 'muted', emphasis: 'subtle', lineStyle: 'dotted' },
    });
  }
  out.push({
    type: 'trajectory',
    id: 'wave-ear',
    points: curve(ROW_EAR_Y, (x) => noise(x) + sp.gain * anti(x)),
    width: SUM_WIDTH,
    style: { colorRole: 'ink', emphasis: 'strong', lineStyle: 'solid' },
  });

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
