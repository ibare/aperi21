// ========================================================================
// law-of-reflection — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 자유 렌더 계층을 쓰지 않는다 — 거울(opticalElement) ·
// 광선(ray, plugin-optics `traceRay` 로 추적) · 법선(trajectory 점선) · 각의 호(sector) ·
// 이름표와 각도 글자(readout)가 모두 어휘로 있다.
//
// 색은 뜻마다 하나다 — 광선은 plugin 이 정한 강조색(빛 한 가지 뜻), 두 호는 같은 대상
// (법선에서 잰 각)이라 같은 primary, 법선은 두 호를 가르는 먹 점선, 법선 · 거울 이름표는
// 배경 정보라 muted, 각도 글자는 먹.
// 들어오는 빛과 나가는 빛을 색으로 가르지 않는다 — 화살촉 방향과 이름표로 가른다 (S-piece).
// ========================================================================

import type {
  Bounds,
  EnvironmentDef,
  OpticalElement,
  Primitive,
  SceneGraph,
  StageDef,
  TimelineFrame,
  Vec2,
  ViewDef,
} from '@aperi21/schema';
import { traceRay } from '@aperi21/plugin-optics';
import { heldAngle, incidenceDeg, readConstants } from './physics';
import {
  ARC_LABEL_RADIUS,
  ARC_RADIUS,
  MIRROR_HALF,
  MIRROR_LABEL_POS,
  NORMAL_LABEL_GAP,
  NORMAL_LENGTH,
  RAY_LABEL_GAP,
  RAY_LENGTH,
  SCENE_BOUNDS,
  text,
} from './schema';
import type { LawOfReflectionState } from './state';

/** 법선 점선 굵기(화면 px). 재는 기준선이라 광선보다 가늘다. 호 채움 위에서도 두 호를 가르도록 먹색으로 긋는다. */
const NORMAL_WIDTH_PX = 1.2;
/** 호 테두리 굵기(화면 px). */
const ARC_RIM_PX = 2;
/** 호 채움 짙기. 아래 법선이 비쳐 보이는 정도. */
const ARC_FILL = 0.14;
/** 각도 글자 크기(화면 px). 주장의 값이라 이름표보다 크다. */
const DEGREE_LABEL_PX = 14;
/** 이름표(법선 · 거울 · 광선) 글자 크기(화면 px). */
const NAME_LABEL_PX = 12;

const DEG = Math.PI / 180;
/** 법선 방향(월드 +y)의 각. 두 호가 여기서 출발한다. */
const NORMAL_DIR = Math.PI / 2;

/** 빛이 닿는 점 — 거울 한가운데. */
const HIT: Vec2 = [0, 0];

/** 평면거울. 면이 y = 0 이고 법선이 +y(빛이 오는 쪽)를 향한다. */
const MIRROR: OpticalElement = {
  type: 'opticalElement',
  id: 'mirror',
  subtype: 'mirror-flat',
  pos: HIT,
  orientation: NORMAL_DIR,
  size: MIRROR_HALF * 2,
};

const mid = (a: Vec2, b: Vec2): Vec2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const angleOf = (from: Vec2, to: Vec2): number => Math.atan2(to[1] - from[1], to[0] - from[0]);
/** `from` 에서 `to` 쪽으로 `to` 를 지나 `gap` 만큼 더 간 점. */
function beyond(from: Vec2, to: Vec2, gap: number): Vec2 {
  const a = angleOf(from, to);
  return [to[0] + Math.cos(a) * gap, to[1] + Math.sin(a) * gap];
}

export function scene(params: {
  state: LawOfReflectionState;
  view: ViewDef;
  stage: StageDef;
  environments: EnvironmentDef[];
  timeline?: TimelineFrame;
}): SceneGraph {
  const { stage, timeline } = params;
  if (!timeline) throw new Error('law-of-reflection: schema.timeline 이 선언되어야 한다');
  const c = readConstants(stage);
  const theta = incidenceDeg(timeline, c) * DEG;
  const out: Primitive[] = [];

  // ---- 광선 추적 ----
  // 들어오는 빛은 법선에서 θ 만큼 왼쪽으로 기운 자리에서 거울 한가운데로 온다. 나가는
  // 빛은 조각이 정하지 않는다 — `traceRay` 가 거울에 반사시켜 돌려준다.
  const source: Vec2 = [HIT[0] - Math.sin(theta) * RAY_LENGTH, HIT[1] + Math.cos(theta) * RAY_LENGTH];
  const traced = traceRay(source, [Math.sin(theta), -Math.cos(theta)], [MIRROR], {
    maxBounces: 1,
    maxLength: RAY_LENGTH * 2,
  });
  const [start, hit, exit] = traced.segments as [Vec2, Vec2, Vec2];

  // 두 호의 끝 각도 추적 결과에서 읽는다 — 들어온 쪽은 빛이 온 방향, 나간 쪽은 간 방향.
  const inAngle = angleOf(hit, start);
  const outAngle = angleOf(hit, exit);

  // ---- 호 ----
  // 법선에서 각 광선까지. 같은 대상(법선에서 잰 각)이라 같은 색 · 같은 반지름이다 —
  // 두 호가 법선을 접는 선으로 한 거울상인지가 곧바로 보인다.
  out.push(
    {
      type: 'sector',
      id: 'arc-incidence',
      center: hit,
      radius: ARC_RADIUS,
      from: NORMAL_DIR,
      to: inAngle,
      fillOpacity: ARC_FILL,
      rimWidth: ARC_RIM_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    },
    {
      type: 'sector',
      id: 'arc-reflection',
      center: hit,
      radius: ARC_RADIUS,
      from: NORMAL_DIR,
      to: outAngle,
      fillOpacity: ARC_FILL,
      rimWidth: ARC_RIM_PX,
      style: { colorRole: 'primary', emphasis: 'strong' },
    },
  );

  // ---- 법선 ----
  const normalTop: Vec2 = [HIT[0], HIT[1] + NORMAL_LENGTH];
  out.push({
    type: 'trajectory',
    id: 'normal',
    points: [HIT, normalTop],
    width: NORMAL_WIDTH_PX,
    // 두 호 **위**에 긋는다 — 같은 색 두 호가 맞닿아 한 부채꼴로 읽히지 않게, 법선이 둘을 가른다.
    style: { colorRole: 'ink', emphasis: 'medium', lineStyle: 'dashed' },
  });

  // ---- 거울 ----
  out.push(MIRROR);

  // ---- 광선 ----
  // 가운데에 화살촉을 달려고 한 광선을 두 토막으로 선언한다 — `ray` 의 촉은 끝에만 붙어,
  // 들어오는 빛의 촉이 거울면에 묻힌다.
  const inMid = mid(start, hit);
  const outMid = mid(hit, exit);
  out.push(
    { type: 'ray', id: 'incident-a', segments: [start, inMid], showArrow: true },
    { type: 'ray', id: 'incident-b', segments: [inMid, hit] },
    { type: 'ray', id: 'reflected-a', segments: [hit, outMid], showArrow: true },
    { type: 'ray', id: 'reflected-b', segments: [outMid, exit] },
  );

  // ---- 이름표 ----
  out.push(
    {
      type: 'readout',
      id: 'name-normal',
      anchor: { world: [normalTop[0], normalTop[1] + NORMAL_LABEL_GAP] },
      text: text('label.normal'),
      chip: false,
      font: 'text',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'name-mirror',
      anchor: { world: MIRROR_LABEL_POS },
      text: text('label.mirror'),
      chip: false,
      font: 'text',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: { colorRole: 'muted', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'name-incident',
      anchor: { world: beyond(hit, start, RAY_LABEL_GAP) },
      text: text('label.incident'),
      chip: false,
      font: 'text',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
    {
      type: 'readout',
      id: 'name-reflected',
      anchor: { world: beyond(hit, exit, RAY_LABEL_GAP) },
      text: text('label.reflected'),
      chip: false,
      font: 'text',
      fontSize: NAME_LABEL_PX,
      align: 'center',
      style: { colorRole: 'ink', emphasis: 'strong' },
    },
  );

  // ---- 각도 글자 ----
  // 멈춤 단계에서만, 선언값 그대로. 두 호의 이등분선 위 같은 반지름에 둔다 — 두 글자도
  // 법선을 사이에 둔 거울상 자리다. 도는 동안은 띄우지 않는다(계산값을 반올림하지 않는다).
  const held = heldAngle(timeline, c);
  if (held !== null) {
    const deg = String(held);
    const inMidAngle = (NORMAL_DIR + inAngle) / 2;
    const outMidAngle = (NORMAL_DIR + outAngle) / 2;
    out.push(
      {
        type: 'readout',
        id: 'degree-incidence',
        anchor: {
          world: [hit[0] + Math.cos(inMidAngle) * ARC_LABEL_RADIUS, hit[1] + Math.sin(inMidAngle) * ARC_LABEL_RADIUS],
        },
        text: text('label.degree'),
        vars: { deg },
        fontSize: DEGREE_LABEL_PX,
        align: 'center',
        style: { colorRole: 'ink', emphasis: 'strong' },
      },
      {
        type: 'readout',
        id: 'degree-reflection',
        anchor: {
          world: [hit[0] + Math.cos(outMidAngle) * ARC_LABEL_RADIUS, hit[1] + Math.sin(outMidAngle) * ARC_LABEL_RADIUS],
        },
        text: text('label.degree'),
        vars: { deg },
        fontSize: DEGREE_LABEL_PX,
        align: 'center',
        style: { colorRole: 'ink', emphasis: 'strong' },
      },
    );
  }

  // 캡션은 선언의 캡션 슬롯이 그린다 (`schema.caption`).
  return out;
}

/** 고정 경계. 매 프레임 같은 값이라야 카메라가 흔들리지 않는다 (원칙 6). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
