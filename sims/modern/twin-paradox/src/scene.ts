// ========================================================================
// twin-paradox — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 세계선(trajectory) · 해마다의
// 점(trace dot) · 두 쌍둥이(body 원) · 「지금」 선과 그 부채(trajectory · lineSet) ·
// 건너뛴 토막(region 쐐기 + trajectory) · 햇수 · 사건 이름표(readout) 가 모두 표준 어휘로 있다.
//
// 색은 뜻마다 하나다 — 두 쌍둥이와 세계선은 먹색(같은 사람의 둘이다), 「지금」 선과 부채는
// muted, **강조색은 「돌아설 때 건너뛴 지구의 세월」 한 가지 뜻에만** (쐐기 · 세계선 위 토막).
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
  birthdayLines,
  earthTicks,
  readConstants,
  travelerTicks,
  trip,
  twinFrame,
  yearsCounted,
} from './physics';
import { SCENE_BOUNDS, text } from './schema';
import type { TwinParadoxState } from './state';

/** 앞으로 갈 세계선(점선) 굵기 · 짙기. 두 길이 처음부터 보이되 지나온 길보다 옅다. */
const AHEAD_WIDTH_PX = 1.5;
const AHEAD_OPACITY = 0.45;
/** 지나온 세계선 굵기(화면 px). */
const WORLDLINE_WIDTH_PX = 2.5;
/** 해마다의 점 반지름(화면 px). */
const TICK_DOT_PX = 3;
/** 쌍둥이 머리(월드 반지름). */
const HEAD_RADIUS = 0.32;
/** 지금의 「지금」 선 굵기(화면 px). */
const NOW_WIDTH_PX = 1.5;
/** 「지금」 선이 지구 세계선에 닿는 자리의 고리(화면 px) · 굵기. */
const HIT_RING_PX = 5;
const HIT_RING_WIDTH_PX = 1.5;
/** 생일마다 남는 「지금」 선(부채) 굵기 · 짙기. */
const FAN_WIDTH_PX = 1;
const FAN_OPACITY = 0.5;
/** 건너뛴 토막 — 세계선 위 굵은 선(화면 px)과 쐐기 채움. */
const SKIP_WIDTH_PX = 5;
const SKIP_FILL_OPACITY = 0.22;
/** 햇수 · 속력 · 사건 이름표 글자 크기(화면 px). */
const AGE_PX = 13;
const LABEL_PX = 12;
/** 이름표를 머리 · 사건에서 띄우는 거리(화면 px). */
const AGE_GAP_PX = 12;
const SPEED_DROP_PX = 16;
const EVENT_GAP_PX = 14;
/** 재회 이름표는 두 햇수 글자 위로 더 띄운다. */
const MEET_GAP_PX = 20;

export function scene(params: {
  state: TwinParadoxState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline: tl } = params;
  if (!tl) throw new Error('twin-paradox: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const tr = trip(c);
  const f = twinFrame(tl, c, tr);
  const out: Primitive[] = [];

  /** 남는 기록(지나온 세계선 · 점 · 부채 · 건너뛴 토막 · 햇수) — 주기 끝에서 흐려진다. */
  const keep = 1 - tl.at('fade');
  /** 재회 뒤에는 「지금」 선이 길이 0 이고 여행자는 지구 쌍둥이 곁에 섰다. */
  const moving = 1 - tl.at('meet');

  // ---- 건너뛴 토막(맨 아래) — 돌아서는 동안 「지금」 선이 쓸고 간 쐐기 ----
  if (f.swing > 0) {
    const top = tr.skipFrom + (tr.skipTo - tr.skipFrom) * f.swing;
    out.push({
      type: 'region',
      id: 'skip-wedge',
      points: [tr.turn, [0, tr.skipFrom], [0, top]],
      fillOpacity: SKIP_FILL_OPACITY,
      opacity: keep,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 앞으로 갈 세계선 — 두 길이 처음부터 보인다 ----
  out.push({
    type: 'trajectory',
    id: 'earth-ahead',
    points: [tr.depart, tr.meet],
    width: AHEAD_WIDTH_PX,
    opacity: AHEAD_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
  });
  out.push({
    type: 'trajectory',
    id: 'traveler-ahead',
    points: [tr.depart, tr.turn, tr.meet],
    width: AHEAD_WIDTH_PX,
    opacity: AHEAD_OPACITY,
    style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
  });

  // ---- 여행자의 생일마다 남는 「지금」 선 ----
  const fan = birthdayLines(f.travelerTau, c, tr);
  if (fan.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'birthday-now-lines',
      lines: fan.map((l) => [l.from, l.to]),
      width: FAN_WIDTH_PX,
      opacity: FAN_OPACITY * keep,
      style: { colorRole: 'muted', emphasis: 'strong' },
    });
  }

  // ---- 지나온 세계선 ----
  if (f.T > 0) {
    out.push({
      type: 'trajectory',
      id: 'earth-worldline',
      points: [tr.depart, f.earthHead],
      width: WORLDLINE_WIDTH_PX,
      opacity: keep,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
    const bent: Vec2[] = f.T > tr.turnT ? [tr.depart, tr.turn, f.travelerHead] : [tr.depart, f.travelerHead];
    out.push({
      type: 'trajectory',
      id: 'traveler-worldline',
      points: bent,
      width: WORLDLINE_WIDTH_PX,
      opacity: keep,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // 건너뛴 토막 — 지구 세계선 위에 덧그어 그 토막의 지구 세월을 강조색으로 가른다. 점은 그 위에 온다.
  if (f.swing > 0) {
    const top = tr.skipFrom + (tr.skipTo - tr.skipFrom) * f.swing;
    out.push({
      type: 'trajectory',
      id: 'skip-segment',
      points: [
        [0, tr.skipFrom],
        [0, top],
      ],
      width: SKIP_WIDTH_PX,
      opacity: keep,
      style: { colorRole: 'accent', emphasis: 'strong' },
    });
  }

  // ---- 해마다의 점 — 제 시간으로 센 한 해마다 ----
  out.push({
    type: 'trace',
    id: 'earth-years',
    marks: earthTicks(f.earthTau, c).map((pos) => ({ pos })),
    shape: 'dot',
    size: TICK_DOT_PX,
    opacity: keep,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'trace',
    id: 'traveler-years',
    marks: travelerTicks(f.travelerTau, c, tr).map((pos) => ({ pos })),
    shape: 'dot',
    size: TICK_DOT_PX,
    opacity: keep,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // ---- 지금의 「지금」 선 — 여행자 자리에서 지구 세계선까지 ----
  const nowAlpha = moving * keep;
  if (nowAlpha > 0 && f.T > 0) {
    out.push({
      type: 'trajectory',
      id: 'traveler-now',
      points: [f.travelerHead, [0, f.hit]],
      width: NOW_WIDTH_PX,
      opacity: nowAlpha,
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dashed' },
    });
    out.push({
      type: 'trace',
      id: 'traveler-now-hit',
      marks: [{ pos: [0, f.hit] }],
      shape: 'ring',
      size: HIT_RING_PX,
      width: HIT_RING_WIDTH_PX,
      opacity: nowAlpha,
      style: { colorRole: 'ink', emphasis: 'strong' },
    });
  }

  // ---- 세 사건 ----
  // 돌아섬 이름표는 돌아서기 시작할 때 나타난다 — 가는 길 끝에서 여행자의 속력 글자와 겹치지 않게.
  out.push(eventLabel('event-depart', tr.depart, 'label.depart', [0, EVENT_GAP_PX]));
  const turnLabel = tl.at('turn') * keep;
  if (turnLabel > 0) {
    out.push(eventLabel('event-turn', tr.turn, 'label.turn', [AGE_GAP_PX, EVENT_GAP_PX + SPEED_DROP_PX], 'left', turnLabel));
  }
  out.push(eventLabel('event-meet', tr.meet, 'label.meet', [0, -MEET_GAP_PX]));

  // ---- 두 쌍둥이 ----
  out.push(head('earth-head', f.earthHead));
  out.push(head('traveler-head', f.travelerHead));

  // 햇수 — 지나온 해마다의 점을 센 정수. 재회하면 굵게.
  const weight = tl.at('meet') > 0 ? 'bold' : 'normal';
  out.push({
    type: 'readout',
    id: 'earth-age',
    anchor: { world: f.earthHead, offset: [-AGE_GAP_PX, 0] },
    text: text('label.earthAge'),
    vars: { n: yearsCounted(f.earthTau, c.tickYears) },
    chip: false,
    font: 'text',
    fontSize: AGE_PX,
    weight,
    align: 'right',
    opacity: keep,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });
  out.push({
    type: 'readout',
    id: 'traveler-age',
    anchor: { world: f.travelerHead, offset: [AGE_GAP_PX, 0] },
    text: text('label.travelerAge'),
    vars: { n: yearsCounted(f.travelerTau, c.tickYears) },
    chip: false,
    font: 'text',
    fontSize: AGE_PX,
    weight,
    align: 'left',
    opacity: keep,
    style: { colorRole: 'ink', emphasis: 'strong' },
  });

  // 여행자의 속력 — 햇수 아래에 붙어 함께 간다. 돌아서는 동안에는 어느 쪽으로도 가지 않으므로 두지 않는다.
  const speedOut = f.swing > 0 ? 0 : keep;
  const speedBack = tl.at('back') > 0 ? moving * keep : 0;
  if (speedOut > 0) out.push(speedLabel('speed-out', f.travelerHead, 'label.speedOut', String(c.beta), speedOut));
  if (speedBack > 0) out.push(speedLabel('speed-back', f.travelerHead, 'label.speedBack', String(c.beta), speedBack));

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).

  return out;
}

function head(id: string, pos: Vec2): Primitive {
  return {
    type: 'body',
    id,
    pos,
    shape: 'circle',
    size: HEAD_RADIUS,
    glow: false,
    style: { colorRole: 'ink', emphasis: 'strong' },
  };
}

function eventLabel(
  id: string,
  at: Vec2,
  key: 'label.depart' | 'label.turn' | 'label.meet',
  offset: Vec2,
  align: 'left' | 'center' = 'center',
  opacity = 1,
): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align,
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

function speedLabel(id: string, at: Vec2, key: 'label.speedOut' | 'label.speedBack', beta: string, opacity: number): Primitive {
  return {
    type: 'readout',
    id,
    anchor: { world: at, offset: [AGE_GAP_PX, SPEED_DROP_PX] },
    text: text(key),
    vars: { beta },
    chip: false,
    font: 'text',
    fontSize: LABEL_PX,
    align: 'left',
    opacity,
    style: { colorRole: 'muted', emphasis: 'strong' },
  };
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
