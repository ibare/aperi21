// ========================================================================
// ionizing-radiation — 순수 계산
// ========================================================================
// 두 광자가 차례로 물에 들어온다.
//
//   자외선(문턱 아래) — 표적 분자에 닿고 사라진다. 이온은 생기지 않는다.
//   X선(문턱의 수십 배) — 표적 분자에 닿고 사라지며 전자 하나를 떼어 낸다(첫 이온). 떨어진 전자는
//                          지그재그로 나아가며 제 길 위의 물 분자를 하나씩 이온화한다.
//
// 이온화 자리는 모두 `ionCount` 곳이다(첫 이온 포함). 걸음은 끝으로 갈수록 짧아진다 — 전자가
// 느려질수록 같은 길이에서 더 자주 이온화한다. 길은 시드 하나의 함수라 매 주기 같다.
//
// 모든 것이 시각의 함수다. 쌓는 상태가 없다.
// ========================================================================

import type { StageDef, TimelineFrame, Vec2 } from '@aperi21/schema';
import {
  ION_COUNT,
  IONIZATION_EV,
  MEDIUM,
  MEDIUM_CLEAR,
  MEDIUM_COLS,
  MEDIUM_JITTER,
  MEDIUM_ROWS,
  PACKET_AMPLITUDE,
  PACKET_LENGTH,
  PHOTON_START_X,
  SEED,
  START_ANGLE,
  STEP_END,
  STEP_START,
  TURN_MAX,
  UV_EV,
  UV_TARGET_X,
  UV_TARGET_Y,
  UV_WAVE,
  XRAY_KEV,
  XRAY_TARGET_X,
  XRAY_TARGET_Y,
  XRAY_WAVE,
} from './schema';
import type { IonizingRadiationState } from './state';

// ------------------------------------------------------------------------
// 스테이지 상수
// ------------------------------------------------------------------------

export interface IonizingConstants {
  /** 물 분자 하나의 이온화 에너지(eV) — 이름표에 그대로 띄운다. */
  ionizationEv: number;
  /** 자외선 광자(eV) · X선 광자(keV) — 이름표에 그대로 띄운다. */
  uvEv: number;
  xrayKev: number;
  /** X선 광자 하나가 남기는 이온 수(첫 이온 포함). */
  ionCount: number;
  seed: number;
  /** 물결 간격(월드) · 뭉치 길이 · 흔들림 폭. */
  uvWave: number;
  xrayWave: number;
  packetLength: number;
  packetAmplitude: number;
  /** 광자가 들어오는 x · 두 표적 자리(월드). */
  photonStartX: number;
  uvTargetX: number;
  uvTargetY: number;
  xrayTargetX: number;
  xrayTargetY: number;
  /** 전자 궤적 — 걸음 처음 · 끝(월드), 최대 꺾임 · 처음 방향(라디안). */
  stepStart: number;
  stepEnd: number;
  turnMax: number;
  startAngle: number;
  /** 물 분자 흩뿌림 — 격자 열 · 행 · 칸 안 흔들림 비율 · 비움 반지름(월드). */
  mediumCols: number;
  mediumRows: number;
  mediumJitter: number;
  mediumClear: number;
}

export function readConstants(stage: StageDef): IonizingConstants {
  const c = (stage.constants ?? {}) as Record<string, number>;
  return {
    ionizationEv: c.ionizationEv ?? IONIZATION_EV,
    uvEv: c.uvEv ?? UV_EV,
    xrayKev: c.xrayKev ?? XRAY_KEV,
    ionCount: c.ionCount ?? ION_COUNT,
    seed: c.seed ?? SEED,
    uvWave: c.uvWave ?? UV_WAVE,
    xrayWave: c.xrayWave ?? XRAY_WAVE,
    packetLength: c.packetLength ?? PACKET_LENGTH,
    packetAmplitude: c.packetAmplitude ?? PACKET_AMPLITUDE,
    photonStartX: c.photonStartX ?? PHOTON_START_X,
    uvTargetX: c.uvTargetX ?? UV_TARGET_X,
    uvTargetY: c.uvTargetY ?? UV_TARGET_Y,
    xrayTargetX: c.xrayTargetX ?? XRAY_TARGET_X,
    xrayTargetY: c.xrayTargetY ?? XRAY_TARGET_Y,
    stepStart: c.stepStart ?? STEP_START,
    stepEnd: c.stepEnd ?? STEP_END,
    turnMax: c.turnMax ?? TURN_MAX,
    startAngle: c.startAngle ?? START_ANGLE,
    mediumCols: c.mediumCols ?? MEDIUM_COLS,
    mediumRows: c.mediumRows ?? MEDIUM_ROWS,
    mediumJitter: c.mediumJitter ?? MEDIUM_JITTER,
    mediumClear: c.mediumClear ?? MEDIUM_CLEAR,
  };
}

// ------------------------------------------------------------------------
// 결정적 난수 — (시드, 번호, 갈래)의 함수
// ------------------------------------------------------------------------

/** 0~1 난수 하나. mulberry32 의 섞기를 정수 셋에 건다. */
export function hash01(seed: number, index: number, salt: number): number {
  let t = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul(index | 0, 0xc2b2ae35) ^ Math.imul(salt | 0, 0x27d4eb2f)) >>> 0;
  t = (t + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ------------------------------------------------------------------------
// 전자의 길 — 이온화 자리
// ------------------------------------------------------------------------

/**
 * 이온화 자리 `ionCount` 곳. 첫 자리는 X선 광자의 표적(광자가 전자를 떼어 낸 분자)이고, 나머지는
 * 떨어진 전자의 걸음 끝마다 하나다. 걸음은 `stepStart` 에서 `stepEnd` 로 줄고, 꺾임은 끝으로 갈수록
 * 커진다. 물 상자 밖으로 나갈 걸음은 그 벽에서 방향을 되돌린다.
 */
export function ionSites(c: IonizingConstants): Vec2[] {
  const sites: Vec2[] = [[c.xrayTargetX, c.xrayTargetY]];
  let angle = c.startAngle;
  for (let i = 1; i < c.ionCount; i++) {
    const f = c.ionCount > 2 ? (i - 1) / (c.ionCount - 2) : 0;
    const step = c.stepStart + (c.stepEnd - c.stepStart) * f;
    angle += c.turnMax * (0.35 + 0.65 * f) * (2 * hash01(c.seed, i, 1) - 1);
    const [px, py] = sites[i - 1]!;
    let nx = px + step * Math.cos(angle);
    let ny = py + step * Math.sin(angle);
    if (nx < MEDIUM.minX || nx > MEDIUM.maxX) {
      angle = Math.PI - angle;
      nx = px + step * Math.cos(angle);
    }
    if (ny < MEDIUM.minY || ny > MEDIUM.maxY) {
      angle = -angle;
      ny = py + step * Math.sin(angle);
    }
    sites.push([nx, ny]);
  }
  return sites;
}

/** 첫 자리부터 각 자리까지의 길이(월드). */
export function arcLengths(sites: readonly Vec2[]): number[] {
  const out = [0];
  for (let i = 1; i < sites.length; i++) {
    const [ax, ay] = sites[i - 1]!;
    const [bx, by] = sites[i]!;
    out.push(out[i - 1]! + Math.hypot(bx - ax, by - ay));
  }
  return out;
}

/**
 * 전자가 길의 몫 `f`(0~1)까지 왔을 때 — 지나온 꺾은선(첫 자리 → 머리)과 이미 이온이 된 자리 수.
 * 자리에 닿는 순간 그 분자가 이온이 된다. 첫 자리는 전자가 떠나는 순간(f = 0)부터 이온이다.
 */
export function trackAt(sites: readonly Vec2[], arcs: readonly number[], f: number): { path: Vec2[]; head: Vec2; ions: number } {
  const total = arcs[arcs.length - 1]!;
  const s = total * Math.min(1, Math.max(0, f));
  const path: Vec2[] = [sites[0]!];
  let ions = 1;
  for (let i = 1; i < sites.length; i++) {
    if (arcs[i]! <= s) {
      path.push(sites[i]!);
      ions = i + 1;
      continue;
    }
    const [ax, ay] = sites[i - 1]!;
    const [bx, by] = sites[i]!;
    const g = (s - arcs[i - 1]!) / (arcs[i]! - arcs[i - 1]!);
    const head: Vec2 = [ax + (bx - ax) * g, ay + (by - ay) * g];
    path.push(head);
    return { path, head, ions };
  }
  return { path, head: sites[sites.length - 1]!, ions };
}

// ------------------------------------------------------------------------
// 물 분자 흩뿌림
// ------------------------------------------------------------------------

/**
 * 물 한 판의 분자 자리 — 격자 칸마다 하나를 시드로 흔들어 둔다. 이온 자리 · 자외선 표적에서
 * `mediumClear` 안에 드는 점은 뺀다. 그 자리의 분자는 따로 그린다(같은 모양 · 같은 색).
 */
export function mediumMolecules(c: IonizingConstants, reserved: readonly Vec2[]): Vec2[] {
  const out: Vec2[] = [];
  const dx = (MEDIUM.maxX - MEDIUM.minX) / c.mediumCols;
  const dy = (MEDIUM.maxY - MEDIUM.minY) / c.mediumRows;
  let n = 0;
  for (let r = 0; r < c.mediumRows; r++) {
    for (let k = 0; k < c.mediumCols; k++, n++) {
      const x = MEDIUM.minX + (k + 0.5 + c.mediumJitter * (hash01(c.seed, n, 2) - 0.5)) * dx;
      const y = MEDIUM.minY + (r + 0.5 + c.mediumJitter * (hash01(c.seed, n, 3) - 0.5)) * dy;
      if (reserved.some(([rx, ry]) => Math.hypot(rx - x, ry - y) < c.mediumClear)) continue;
      out.push([x, y]);
    }
  }
  return out;
}

// ------------------------------------------------------------------------
// 광자 — 가로로 날아 표적에 닿는다
// ------------------------------------------------------------------------

export interface PhotonNow {
  /** 뭉치의 뒤 · 머리 x(월드). */
  from: number;
  head: number;
  /** 뭉치가 나는 높이(월드). */
  y: number;
  /** 물결 간격(월드). */
  wave: number;
}

/** 단계 진행도 `p`(0~1)의 광자 — 들어오는 x 에서 표적 x 까지 머리가 간다. 닿으면 사라진다. */
export function photonAt(p: number, targetX: number, y: number, wave: number, c: IonizingConstants): PhotonNow | null {
  if (p <= 0 || p >= 1) return null;
  const head = c.photonStartX + (targetX - c.photonStartX) * p;
  return { from: Math.max(c.photonStartX, head - c.packetLength), head, y, wave };
}

// ------------------------------------------------------------------------
// 지금 화면
// ------------------------------------------------------------------------

export interface Snapshot {
  /** 날고 있는 광자와 그 종류 — 없으면 null. */
  photon: { now: PhotonNow; kind: 'uv' | 'xray' } | null;
  /** 떨어진 전자 — X선 광자가 닿은 뒤. */
  electron: { path: Vec2[]; head: Vec2; ions: number } | null;
  /** 이온화 자리 전부(그릴 때 앞의 `ions` 개만 이온). */
  sites: Vec2[];
  /** 흩뿌린 물 분자. */
  medium: Vec2[];
  /** 전체 보이는 정도 — 나타남 · 흐려짐. */
  alpha: number;
}

export function snapshot(tl: TimelineFrame, c: IonizingConstants): Snapshot {
  const sites = ionSites(c);
  const arcs = arcLengths(sites);
  const medium = mediumMolecules(c, [...sites, [c.uvTargetX, c.uvTargetY]]);
  const alpha = tl.at('appear') * (1 - tl.at('fade'));

  let photon: Snapshot['photon'] = null;
  const uv = photonAt(tl.at('uvIn'), c.uvTargetX, c.uvTargetY, c.uvWave, c);
  if (uv) photon = { now: uv, kind: 'uv' };
  const xr = photonAt(tl.at('xrayIn'), c.xrayTargetX, c.xrayTargetY, c.xrayWave, c);
  if (xr) photon = { now: xr, kind: 'xray' };

  const electron = tl.at('xrayIn') >= 1 ? trackAt(sites, arcs, tl.at('track')) : null;
  return { photon, electron, sites, medium, alpha };
}

/** 쌓는 상태가 없다 — 모든 것이 시각의 함수다. */
export function step(params: { state: IonizingRadiationState }): IonizingRadiationState {
  return params.state;
}
