import type { PrimitiveRenderer, Trace, Vec2 } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';

/** 자국 하나의 기본 크기(화면 px). */
const DEFAULT_SIZE = 2;
/** `ring`·`tick` 의 기본 획 굵기(화면 px). */
/** 다 늙은 자국의 최소 알파. 0 으로 떨어뜨리면 마지막 한 칸이 툭 사라진다. */
const MIN_ALPHA = 0.05;

/**
 * Trace 렌더러 — 지나간 자국의 목록.
 *
 * **자리를 정하는 것은 조각이다.** 여기서 하는 일은 나이에 따라 옅어지고
 * 퍼지게 그리는 것뿐이다 — 사건을 감지하거나 배열을 쌓지 않는다 (S-render:
 * 렌더러는 선언과 theme 만 읽는다).
 *
 * `age` 를 주지 않은 자국은 늙지 않는다. 스트로보처럼 지나온 자리를 지우지 않고
 * 남기는 경우다 — 그때 점 사이 간격이 곧 속력이라 지우면 주장이 사라진다.
 */
export const renderTrace: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Trace;
  if (p.marks.length === 0) return;
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'secondary', emphasis: 'medium' });
  const shape = p.shape ?? 'dot';
  const size = p.size ?? DEFAULT_SIZE;
  const width = p.width ?? rc.theme.strokeWidth.regular;
  const life = p.life;

  c.fillStyle = color;
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = 'round';

  for (const m of p.marks) {
    // 나이가 없으면 늙지 않는다. 있으면 수명에 대한 비율로 옅어진다.
    const u = typeof m.age === 'number' && life && life > 0 ? Math.min(1, m.age / life) : 0;
    if (u >= 1) continue;
    const strength = m.strength ?? 1;
    setAlpha(c, Math.max(MIN_ALPHA, (1 - u) * strength));

    const [sx, sy] = rc.toScreen(m.pos);
    if (shape === 'dot') {
      c.beginPath();
      c.arc(sx, sy, size * strength, 0, Math.PI * 2);
      c.fill();
      continue;
    }
    if (shape === 'ring') {
      // `spreadTo` 를 주면 나이와 함께 퍼진다 — 사건이 일어난 순간의 짧은 강조가
      // 이 꼴이다. 링끼리의 반지름 차가 곧 일어난 시각의 차이가 된다.
      const r = p.spreadTo ? size + (p.spreadTo - size) * u : size;
      c.beginPath();
      c.arc(sx, sy, Math.max(0.5, r * strength), 0, Math.PI * 2);
      c.stroke();
      continue;
    }
    // tick — 방향을 준 짧은 획. 기준선을 가로지르는 눈금이나 벽을 때린 자국.
    const dir: Vec2 = p.direction ?? [0, 1];
    const len = Math.hypot(dir[0], dir[1]) || 1;
    const half = (size * strength) / 2;
    const dx = (dir[0] / len) * half;
    const dy = (dir[1] / len) * half;
    // 월드 방향을 화면으로 옮긴다 — y 가 뒤집히므로 화면 벡터로 다시 잰다.
    const [ex, ey] = rc.toScreen([m.pos[0] + dx, m.pos[1] + dy]);
    c.beginPath();
    c.moveTo(sx - (ex - sx), sy - (ey - sy));
    c.lineTo(ex, ey);
    c.stroke();
  }

  finalizeBaseMeta(rc, p);
};
