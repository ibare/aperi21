import type { ParticleSystem, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 입자 하나의 기본 반지름(화면 px). */
const DEFAULT_SIZE = 3;
/** 자취 알파. 입자보다 옅어야 지금 자리가 읽힌다. */
const TRAIL_ALPHA = 0.3;
/** 자취 길이 = 속도 × 이 시간(초). 짧은 잔상이라 속력이 길이로 읽힌다. */
const TRAIL_SECONDS = 0.085;

/**
 * ParticleSystem 렌더러 — 자리 목록으로 오는 입자 떼.
 *
 * 선언만 있고 렌더러가 없던 어휘다. 01-broad 의 `gas-pressure`(분자 280개)와
 * `apparent-brightness`(빛 알갱이 36개)가 이 자리를 밟아 구현했다.
 *
 * **입자마다 경로를 하나로 모아 한 번에 그린다.** 수백 개를 낱개로 그리면
 * 프레임이 무너진다 — `gas-pressure` 가 손으로 짤 때 발견한 것이고, 승격한다면
 * 그 일괄 처리까지 함께 와야 한다고 적었다.
 *
 * `trail` 은 속도 반대 방향의 짧은 획이다. 속력을 공간에 새겨, 정지 화면에서도
 * 빠른 입자와 느린 입자가 갈린다.
 */
export const renderParticleSystem: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as ParticleSystem;
  if (p.positions.length === 0) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'primary', emphasis: 'medium' });
  const sizes = p.sizes;
  const sizeAt = (i: number): number =>
    typeof sizes === 'number' ? sizes : Array.isArray(sizes) ? (sizes[i] ?? DEFAULT_SIZE) : DEFAULT_SIZE;

  // 자취 먼저 — 입자 아래로 깔린다.
  if (p.trail && p.velocities) {
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.lineCap = 'round';
    setAlpha(c, TRAIL_ALPHA);
    c.beginPath();
    for (let i = 0; i < p.positions.length; i++) {
      const pos = p.positions[i]!;
      const v = p.velocities[i];
      if (!v) continue;
      const [sx, sy] = rc.toScreen(pos);
      const [bx, by] = rc.toScreen([
        pos[0] - v[0] * TRAIL_SECONDS,
        pos[1] - v[1] * TRAIL_SECONDS,
      ]);
      c.moveTo(bx, by);
      c.lineTo(sx, sy);
    }
    c.stroke();
  }

  // 입자 — 경로 하나에 모아 한 번에 채운다.
  setAlpha(c, 1);
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < p.positions.length; i++) {
    const [sx, sy] = rc.toScreen(p.positions[i]!);
    const r = sizeAt(i);
    c.moveTo(sx + r, sy);
    c.arc(sx, sy, r, 0, Math.PI * 2);
  }
  c.fill();

  finalizeBaseMeta(rc, p);
};
