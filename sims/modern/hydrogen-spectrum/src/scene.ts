// ========================================================================
// hydrogen-spectrum — Scene Graph 선언
// ========================================================================
// 그리지 않는다, 선언한다. 겹침은 scene 에 쓴 순서(`drawOrder: 'scene'`) — 원본 그리기 순서 그대로.
//
// 색 — 원본대로 낙차 자국 · 광자 · 섬광 · 쌓인 선을 모두 그 전이의 **파장색**으로 칠한다. 「같은 낙차 =
// 같은 색 = 띠의 선 색」 이 이 연결로 선다. 색은 빛이라 역할이 아니라 빛 채널로 넘긴다.
//   · 낙차 자국 · 광자 · 섬광 — `light: { rgb }`. 한 선언에 빛이 하나라 **파장마다** 묶어 선언한다.
//   · 띠 — `scalarField` `colors: 'lightRgb'`. 옅은 무지개 바탕과 쌓인 선을 칸마다 한 색으로 합친다.
//   · 가시광 밖(자외선 · 적외선) 광자와 그 낙차 자국은 원본처럼 회색 — 빛의 색이 아니라 `muted`.
//   · 전자 · 준위 · 글자 · 들뜸 자국은 무채색 역할. 강조색은 쓰지 않는다.
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
  stripColors,
  wavelengthLight,
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

/**
 * 파장마다 묶는다 — 빛 채널은 선언 하나에 색 하나다. 수소 n ≤ 6 의 전이 파장은 반올림해도 서로 다르다.
 * 키는 반올림한 파장(nm)이라 선언 id 가 전이마다 안정하다.
 */
function byWavelength<T extends { l: number }>(items: readonly T[]): [number, T[]][] {
  const groups = new Map<number, T[]>();
  for (const it of items) {
    const k = Math.round(it.l);
    const g = groups.get(k);
    if (g) g.push(it);
    else groups.set(k, [it]);
  }
  return [...groups.entries()];
}

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

  // ── 낙차 자국 — 굵은 선, 0.9 초 동안 옅어짐. 색은 그 낙차가 낸 광자의 파장색 ──
  for (const [k, drops] of byWavelength(s.drops)) {
    const vis = isVisible(drops[0]!.l);
    out.push({
      type: 'lineSet',
      id: `drops-${k}`,
      lines: drops.map((d) => [at(d.x, d.y0), at(d.x, d.y1)]),
      opacities: drops.map((d) => ALPHA.drop * (1 - d.age / MARK_LIFE)),
      width: WIDTH.drop,
      ...(vis
        ? { light: { rgb: wavelengthLight(drops[0]!.l) } }
        : { style: { colorRole: 'muted', emphasis: 'strong' } }),
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

  // ── 스펙트럼 띠 — 가능한 자리의 옅은 무지개 + 쌓인 빛의 선, 칸마다 그 파장의 색 ──
  out.push({
    type: 'scalarField',
    id: 'strip',
    min: at(STRIP.x0, STRIP.y1),
    max: at(STRIP.x1, STRIP.y0),
    cols: STRIP_W,
    rows: 1,
    values: stripColors(s.bins),
    range: [0, 1],
    colors: 'lightRgb',
  } satisfies ScalarField);

  // ── 빛이 닿는 섬광 — 닿은 광자의 파장색 ─────────────
  for (const [k, flashes] of byWavelength(s.flashes)) {
    const rgb = wavelengthLight(flashes[0]!.l);
    FLASH.forEach((f, i) => {
      out.push({
        type: 'particleSystem',
        id: `flash-${k}-${i}`,
        positions: flashes.map((fl) => at(fl.x, fl.y)),
        sizes: f.size,
        opacities: flashes.map((fl) => ALPHA.flash * f.alpha * (1 - fl.age / MARK_LIFE)),
        light: { rgb },
      } satisfies ParticleSystem);
    });
  }

  // ── 광자 — 파장색 점과 꼬리 ─────────────────────────
  // 빛의 색은 라이트 바탕 위에서도 어두운 띠 위에서도 보여서 광자를 한 번만 선언한다(지난 이관의 이중 선언 없음).
  for (const [k, photons] of byWavelength(s.photons.filter((p) => isVisible(p.l)))) {
    const rgb = wavelengthLight(photons[0]!.l);
    out.push({
      type: 'lineSet',
      id: `photon-tails-${k}`,
      lines: photons.map((p) => [at(...photonAt(p, Math.max(0, p.s - TAIL_LAG))), at(...photonAt(p, p.s))]),
      opacity: ALPHA.tail,
      width: WIDTH.tail,
      light: { rgb },
    } satisfies LineSet);
    out.push({
      type: 'particleSystem',
      id: `photons-${k}`,
      positions: photons.map((p) => at(...photonAt(p, p.s))),
      sizes: DOT.photon,
      light: { rgb },
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
