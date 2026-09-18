// ========================================================================
// exchange-particles — 순수 계산
// ========================================================================
// 도형 좌표는 (x, t) — 가로가 공간, 세로가 시간이고 빛의 빠르기가 1 이다.
//
// 왼쪽 전자는 오른쪽으로 v 로 오다가 꼭짓점 A = (x_A, t_A) 에서 광자를 내놓고 −v 로 튕겨 난다.
// 광자는 빛의 빠르기로 오른쪽 위 45° 로 건너가 B = (x_A + d, t_A + d) 에서 오른쪽 전자에 흡수된다.
// 오른쪽 전자는 −v 로 오다가 B 에서 +v 로 밀려난다. 두 세계선은 서로 닿지 않는다.
//
// 모든 것이 주기 안 시각의 함수라 쌓는 상태가 없다 (S-sim 「상태가 시계뿐인 조각」).
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  DIAGRAM_TOP,
  ELECTRON_SPEED,
  EMIT_TIME,
  EMIT_X,
  GLUON_LOOP_PITCH,
  PHOTON_WAVELENGTH,
  VERTEX_GAP,
} from './schema';
import type { ExchangeParticlesState } from './state';

export function step(params: { state: ExchangeParticlesState }): ExchangeParticlesState {
  return params.state;
}

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface ExchangeParticlesConstants {
  /** 전자의 빠르기(v/c). */
  speed: number;
  /** 방출 꼭짓점 A. */
  emit: Vec2;
  /** 흡수 꼭짓점 B — A 에서 빛의 빠르기로 오른쪽 위. */
  absorb: Vec2;
  /** 도형 위 끝 시각. */
  top: number;
  photonWavelength: number;
  gluonLoopPitch: number;
}

export function readConstants(stage: StageDef): ExchangeParticlesConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  const tA = c.emitTime ?? EMIT_TIME;
  const xA = c.emitX ?? EMIT_X;
  const gap = c.vertexGap ?? VERTEX_GAP;
  return {
    speed: c.electronSpeed ?? ELECTRON_SPEED,
    emit: [xA, tA],
    // c = 1 — 가로로 gap 을 건너는 데 시간 gap 이 걸린다.
    absorb: [xA + gap, tA + gap],
    top: c.diagramTop ?? DIAGRAM_TOP,
    photonWavelength: c.photonWavelength ?? PHOTON_WAVELENGTH,
    gluonLoopPitch: c.gluonLoopPitch ?? GLUON_LOOP_PITCH,
  };
}

// ------------------------------------------------------------------------
// 세계선
// ------------------------------------------------------------------------

/** 왼쪽 전자의 자리 — A 앞에서는 +v, 뒤에서는 −v. */
export function leftX(t: number, c: ExchangeParticlesConstants): number {
  const [xA, tA] = c.emit;
  return t <= tA ? xA + c.speed * (t - tA) : xA - c.speed * (t - tA);
}

/** 오른쪽 전자의 자리 — B 앞에서는 −v, 뒤에서는 +v. */
export function rightX(t: number, c: ExchangeParticlesConstants): number {
  const [xB, tB] = c.absorb;
  return t <= tB ? xB - c.speed * (t - tB) : xB + c.speed * (t - tB);
}

/** 세계선을 시각 0 부터 `upTo` 까지 — 꺾이는 꼭짓점을 지나면 그 점을 넣는다. */
export function worldline(side: 'left' | 'right', upTo: number, c: ExchangeParticlesConstants): Vec2[] {
  const x = side === 'left' ? leftX : rightX;
  const kink = side === 'left' ? c.emit : c.absorb;
  const pts: Vec2[] = [[x(0, c), 0]];
  if (upTo > kink[1]) pts.push([kink[0], kink[1]]);
  pts.push([x(upTo, c), upTo]);
  return pts;
}

// ------------------------------------------------------------------------
// 주기 안 시각 → 화면에 무엇이 있나
// ------------------------------------------------------------------------

export interface Snapshot {
  /** 시간 조각이 지나는 도형 시각. */
  slice: number;
  /** 시간 조각의 짙기 — 도형이 다 그려지면 걷힌다. */
  sliceAlpha: number;
  /** 광자(글루온)가 A 에서 B 로 얼마나 건너갔나 0~1. */
  carrier: number;
  /** 광자 → 글루온 · 전자 → 쿼크로 바뀐 몫 0~1. */
  morph: number;
  /** 주기 끝에 흐려지는 몫을 뺀 전체 짙기. */
  alpha: number;
}

export function snapshot(tl: TimelineFrame, c: ExchangeParticlesConstants): Snapshot {
  const [, tA] = c.emit;
  const [, tB] = c.absorb;
  // 세 단계 진행도를 꼭짓점 시각으로 이어 붙인다 — 단계 경계를 코드로 가르지 않는다.
  const slice = tA * tl.at('approach') + (tB - tA) * tl.at('travel') + (c.top - tB) * tl.at('apart');
  return {
    slice,
    sliceAlpha: 1 - tl.at('settle'),
    carrier: tl.at('travel'),
    morph: tl.at('morph'),
    alpha: 1 - tl.at('fade'),
  };
}

// ------------------------------------------------------------------------
// 매개 입자 선 모양 — 도형 위의 배치 계산
// ------------------------------------------------------------------------

/**
 * 광자 물결선 — A 에서 B 쪽으로 몫 `upTo` 만큼. 양 끝이 꼭짓점에 붙도록 반 파장의 정수 배로 맞춘다.
 * `amplitude` 는 도형 단위, `samplesPerWave` 는 물결 한 번에 찍는 표본 수.
 */
export function photonLine(
  c: ExchangeParticlesConstants,
  upTo: number,
  amplitude: number,
  samplesPerWave: number,
): Vec2[] {
  const { u, n, len } = carrierFrame(c);
  const halves = Math.max(1, Math.round((2 * len) / c.photonWavelength));
  const count = Math.max(2, Math.ceil((halves / 2) * samplesPerWave * upTo));
  const pts: Vec2[] = [];
  for (let i = 0; i <= count; i++) {
    const s = (upTo * i) / count;
    const off = amplitude * Math.sin(Math.PI * halves * s);
    pts.push(along(c.emit, u, n, s * len, off));
  }
  return pts;
}

/**
 * 글루온 고리 감긴 선 — 긴 사이클로이드(x = aφ − b sin φ, y = b(1 − cos φ), b > a 이면 고리가 진다).
 * 양 끝이 꼭짓점에 붙도록 고리 수를 정수로 맞춘다. `loopRatio` 는 b / a.
 */
export function gluonLine(
  c: ExchangeParticlesConstants,
  upTo: number,
  loopRatio: number,
  samplesPerLoop: number,
): Vec2[] {
  const { u, n, len } = carrierFrame(c);
  const loops = Math.max(1, Math.round(len / c.gluonLoopPitch));
  const a = len / (2 * Math.PI * loops);
  const b = loopRatio * a;
  const count = Math.max(2, Math.ceil(loops * samplesPerLoop * upTo));
  const pts: Vec2[] = [];
  for (let i = 0; i <= count; i++) {
    const phi = 2 * Math.PI * loops * ((upTo * i) / count);
    pts.push(along(c.emit, u, n, a * phi - b * Math.sin(phi), b * (1 - Math.cos(phi))));
  }
  return pts;
}

/** 매개 입자 선의 한가운데 — 이름표 자리. 선의 왼쪽 법선도 함께. */
export function carrierMid(c: ExchangeParticlesConstants): { at: Vec2; normal: Vec2 } {
  const { u, n, len } = carrierFrame(c);
  return { at: along(c.emit, u, n, len / 2, 0), normal: n };
}

function carrierFrame(c: ExchangeParticlesConstants): { u: Vec2; n: Vec2; len: number } {
  const dx = c.absorb[0] - c.emit[0];
  const dy = c.absorb[1] - c.emit[1];
  const len = Math.hypot(dx, dy) || 1;
  const u: Vec2 = [dx / len, dy / len];
  // 진행 방향의 왼쪽 — 오른쪽 위로 가는 선이면 왼쪽 위.
  const n: Vec2 = [-u[1], u[0]];
  return { u, n, len };
}

function along(o: Vec2, u: Vec2, n: Vec2, s: number, off: number): Vec2 {
  return [o[0] + u[0] * s + n[0] * off, o[1] + u[1] * s + n[1] * off];
}
