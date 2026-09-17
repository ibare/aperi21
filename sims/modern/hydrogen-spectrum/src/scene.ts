// ========================================================================
// hydrogen-spectrum — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침은 scene 에 쓴 순서(`drawOrder: 'scene'`) — 원본 그리기 순서 그대로.
//
// 색 — 원본은 낙차 자국 · 광자 · 섬광 · 쌓인 선을 모두 그 전이의 **파장색**으로 칠했다. 엔진에 빛의 색
// 어휘가 없어(장부 G60 · G61) 다음처럼 근사한다.
//   · 띠에 닿아 쌓인 빛과 섬광은 밝기 자체가 주장이라 빛의 세기 채널(`light`)로 칠한다 — 두 테마에서
//     띠는 늘 어둡고 선은 늘 밝다. 파장의 색은 없다.
//   · 날아가는 광자와 낙차 자국은 대상 그림이라 먹색(`ink`). 가시광 밖 광자는 회색(`muted`) 속빈 점과 점선.
//   · 준위 · 글자 · 들뜸 자국은 무채색(`muted`). 강조색은 쓰지 않는다.
// ========================================================================

import type {
  Body,
  Bounds,
  LineSet,
  ParticleSystem,
  Primitive,
  Readout,
  SceneGraph,
  ScalarField,
  Trajectory,
  Vec2,
} from '@aperi21/schema';
import {
  electronY,
  isVisible,
  levelY,
  photonAlpha,
  photonAt,
  stripLight,
} from './physics';
import {
  CANVAS,
  LADDER,
  MARK_LIFE,
  N_MAX,
  SCENE_BOUNDS,
  STRIP,
  STRIP_W,
  UV_X,
  IR_X,
  text,
  type HydrogenSpectrumMessageKey,
} from './schema';
import type { HydrogenSpectrumState } from './state';

/** 원본 픽셀(y 아래로) → 월드(y 위로). */
const worldY = (py: number): number => CANVAS.height - py;
const at = (px: number, py: number): Vec2 => [px, worldY(py)];

/** 원본 선 굵기 · 점 크기(화면 px) — 준위 1.2 · 끊김 1 · 들뜸 1 · 낙차 4 · 꼬리 2 · 전자 4 · 광자 3.2. */
const WIDTH = { level: 1.2, brk: 1, rise: 1, drop: 4, tail: 2 } as const;
const DOT = { electron: 4, photon: 3.2 } as const;
/** 원본 알파 — 들뜸 0.5 · 낙차 0.95 · 꼬리 0.45 · 섬광 0.9. */
const ALPHA = { rise: 0.5, drop: 0.95, tail: 0.45, flash: 0.9 } as const;
/** 광자 꼬리 — 진행률 0.12 뒤의 자리에서 긋는다. */
const TAIL_LAG = 0.12;
/**
 * 섬광 — 원본은 반지름 16 px 방사형 그라데이션이다. 그라데이션 채움이 없어(장부 G31) 크기가 다른
 * 원 둘을 겹쳐 가운데가 짙게 근사한다.
 */
const FLASH = [
  { size: 9, alpha: 0.3 },
  { size: 4, alpha: 0.6 },
] as const;
/**
 * 「가능한 색의 자리」 의 옅은 바탕 빛. 원본은 파장색 무지개를 불투명도 0.07 로 깔았다.
 * 무지개가 없어(장부 G60) 옅은 빛 한 겹으로 띠가 비어 있는 자리임을 남긴다.
 */
const STRIP_BASE_LIGHT = 0.012;
/** 글자 크기(화면 px) — 원본 12 px. */
const LABEL_FONT_PX = 12;

function label(
  id: string,
  key: HydrogenSpectrumMessageKey,
  pos: Vec2,
  align: Readout['align'],
): Readout {
  return {
    type: 'readout',
    id,
    anchor: { world: pos },
    text: text(key),
    chip: false,
    font: 'text',
    fontSize: LABEL_FONT_PX,
    align,
    style: { colorRole: 'muted', emphasis: 'medium' },
  };
}

export function scene(params: { state: HydrogenSpectrumState }): SceneGraph {
  const s = params.state;
  const out: Primitive[] = [];

  // ── 에너지 준위 ───────────────────────────────────
  const levels: Vec2[][] = [];
  for (let n = 1; n <= N_MAX; n++) {
    const y = Math.round(levelY(n)) + 0.5;
    levels.push([at(LADDER.x0 + 22, y), at(LADDER.x1, y)]);
  }
  out.push({
    type: 'lineSet',
    id: 'levels',
    lines: levels,
    width: WIDTH.level,
    style: { colorRole: 'muted', emphasis: 'medium' },
  } satisfies LineSet);

  // ── 준위 번호 ─────────────────────────────────────
  const numberKeys = ['label.n1', 'label.n2', 'label.n3', 'label.n4'] as const;
  numberKeys.forEach((k, i) => {
    out.push(label(`level-${i + 1}`, k, at(LADDER.x0 + 16, levelY(i + 1)), 'right'));
  });
  out.push(label('level-more', 'label.more', at(LADDER.x0 + 16, levelY(6) - 2), 'right'));

  // ── 축 끊김 표시 ──────────────────────────────────
  const bx = LADDER.x0 + 30;
  out.push({
    type: 'lineSet',
    id: 'axis-break',
    lines: [
      [at(bx - 6, LADDER.breakY + 3), at(bx + 6, LADDER.breakY - 1)],
      [at(bx - 6, LADDER.breakY + 8), at(bx + 6, LADDER.breakY + 4)],
    ],
    width: WIDTH.brk,
    style: { colorRole: 'muted', emphasis: 'medium' },
  } satisfies LineSet);

  // ── 들뜸 자국 — 점선, 0.9 초 동안 옅어짐 ────────────
  s.rises.forEach((r, i) => {
    out.push({
      type: 'trajectory',
      id: `rise-${i}`,
      points: [at(r.x, r.y0), at(r.x, r.y1)],
      width: WIDTH.rise,
      opacity: ALPHA.rise * (1 - r.age / MARK_LIFE),
      style: { colorRole: 'muted', emphasis: 'strong', lineStyle: 'dotted' },
    } satisfies Trajectory);
  });

  // ── 낙차 자국 — 굵은 선, 0.9 초 동안 옅어짐 ─────────
  if (s.drops.length > 0) {
    out.push({
      type: 'lineSet',
      id: 'drops',
      lines: s.drops.map((d) => [at(d.x, d.y0), at(d.x, d.y1)]),
      opacities: s.drops.map((d) => ALPHA.drop * (1 - d.age / MARK_LIFE)),
      width: WIDTH.drop,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies LineSet);
  }

  // ── 전자 ─────────────────────────────────────────
  out.push({
    type: 'particleSystem',
    id: 'electrons',
    positions: s.electrons.map((e) => at(e.x, electronY(e))),
    sizes: DOT.electron,
    style: { colorRole: 'ink', emphasis: 'strong' },
  } satisfies ParticleSystem);

  // ── 스펙트럼 띠 — 가능한 자리의 옅은 바탕 + 쌓인 빛 ──
  out.push({
    type: 'scalarField',
    id: 'strip',
    min: at(STRIP.x0, STRIP.y1),
    max: at(STRIP.x1, STRIP.y0),
    cols: STRIP_W,
    rows: 1,
    values: s.bins.map((amount) => STRIP_BASE_LIGHT + (1 - STRIP_BASE_LIGHT) * stripLight(amount)),
    range: [0, 1],
    colors: 'light',
  } satisfies ScalarField);

  // ── 빛이 닿는 섬광 ─────────────────────────────────
  if (s.flashes.length > 0) {
    FLASH.forEach((f, i) => {
      out.push({
        type: 'particleSystem',
        id: `flash-${i}`,
        positions: s.flashes.map((fl) => at(fl.x, fl.y)),
        sizes: f.size,
        opacities: s.flashes.map((fl) => ALPHA.flash * f.alpha * (1 - fl.age / MARK_LIFE)),
        light: 1,
      } satisfies ParticleSystem);
    });
  }

  // ── 광자 ─────────────────────────────────────────
  // 띠 밖에서는 먹색, 띠 위에서는 빛 채널로 한 번 더 긋는다. 라이트 테마의 먹색은 짙어서 어두운 띠
  // 위에서 사라진다 — 띠에 닿는 광자는 늘 밝아야 「그 자리에 빛이 닿는다」 가 보인다.
  const visible = s.photons.filter((p) => isVisible(p.l));
  if (visible.length > 0) {
    const tails = visible.map((p) => [at(...photonAt(p, Math.max(0, p.s - TAIL_LAG))), at(...photonAt(p, p.s))]);
    const heads = visible.map((p) => at(...photonAt(p, p.s)));
    const onStrip = { min: at(STRIP.x0, STRIP.y1), max: at(STRIP.x1, STRIP.y0) };
    out.push({
      type: 'lineSet',
      id: 'photon-tails',
      lines: tails,
      opacity: ALPHA.tail,
      width: WIDTH.tail,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies LineSet);
    out.push({
      type: 'particleSystem',
      id: 'photons',
      positions: heads,
      sizes: DOT.photon,
      style: { colorRole: 'ink', emphasis: 'strong' },
    } satisfies ParticleSystem);
    out.push({
      type: 'lineSet',
      id: 'photon-tails-on-strip',
      lines: tails,
      opacity: ALPHA.tail,
      width: WIDTH.tail,
      light: 1,
      clip: onStrip,
    } satisfies LineSet);
    out.push({
      type: 'particleSystem',
      id: 'photons-on-strip',
      positions: heads,
      sizes: DOT.photon,
      light: 1,
      clip: onStrip,
    } satisfies ParticleSystem);
  }
  s.photons.forEach((p, i) => {
    if (isVisible(p.l)) return;
    const a = photonAlpha(p);
    if (a <= 0) return;
    out.push({
      type: 'trajectory',
      id: `photon-away-tail-${i}`,
      points: [at(...photonAt(p, Math.max(0, p.s - TAIL_LAG))), at(...photonAt(p, p.s))],
      width: WIDTH.tail,
      opacity: ALPHA.tail * a,
      style: { colorRole: 'muted', emphasis: 'medium', lineStyle: 'dashed' },
    } satisfies Trajectory);
    out.push({
      type: 'body',
      id: `photon-away-${i}`,
      pos: at(...photonAt(p, p.s)),
      shape: 'circle',
      size: DOT.photon,
      fill: 'none',
      outline: 'role',
      glow: false,
      opacity: a,
      style: { colorRole: 'muted', emphasis: 'medium' },
    } satisfies Body);
  });

  // ── 영역 이름 ─────────────────────────────────────
  // 원본은 띠 아래 8 px 에 글자 위쪽을 맞췄다 — 12 px 글자의 가운데는 14 px 아래.
  const nameY = STRIP.y1 + 8 + LABEL_FONT_PX / 2;
  out.push(label('region-uv', 'label.uv', at(UV_X, nameY), 'center'));
  out.push(label('region-ir', 'label.ir', at(IR_X - 16, nameY), 'center'));
  out.push(label('region-visible', 'label.visible', at((STRIP.x0 + STRIP.x1) / 2, nameY), 'center'));

  return out;
}

/** 프레이밍은 고정 — 매 프레임 같은 값이라 카메라가 흔들리지 않는다 (S-piece). */
export function boundsHint(): Bounds {
  return { ...SCENE_BOUNDS };
}
