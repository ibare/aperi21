import type { PrimitiveRenderer, Stream, Vec2 } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor, setAlpha } from '../common';
import { streak } from '../kit/draw';
import { livingParticles, stableRandom } from '../kit/particles';

/** 잔상 획의 길이 — 이만큼 전 자리에서 지금 자리까지 긋는다. */
const STREAK_DT = 0.02;
/** 나이가 들수록 가늘어지는 정도. */
const THINNING = 0.34;

/**
 * 방출·이류·수명을 가진 입자 흐름.
 *
 * 입자 배열을 들고 있지 않는다. 나이만으로 자리가 정해지므로 매 프레임 다시
 * 세어도 같은 결과가 나온다. 흩날림은 **출생 번호**에서 뽑는다 — 프레임마다
 * 새로 뽑으면 흐름이 부들부들 떤다.
 *
 * 점이 아니라 **획**으로 그린다. 그래야 정지 프레임에서도 빠른 흐름은 길고
 * 성기게, 느린 흐름은 짧고 촘촘하게 보인다. 속도가 색이나 숫자가 아니라
 * 획의 길이로 드러난다.
 */
export const renderStream: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Stream;
  const flow = Math.min(1, Math.max(0, p.flow ?? 1));
  if (flow <= 0.02) return;

  applyBaseMeta(rc, p);
  const color = primitiveColor(rc, p, { role: 'secondary', emphasis: 'strong' });
  const ax = p.acceleration?.[0] ?? 0;
  const ay = p.acceleration?.[1] ?? 0;
  const baseWidth = p.width ?? rc.theme.strokeWidth.thick;
  const jitter = p.jitter ?? 0;

  /** 나이 t 에서의 자리. 등가속 운동. */
  const at = (t: number): Vec2 => [
    p.from[0] + p.velocity[0] * t + 0.5 * ax * t * t,
    p.from[1] + p.velocity[1] * t + 0.5 * ay * t * t,
  ];

  for (const { index, age } of livingParticles({ time: rc.time, rate: p.rate * flow, life: p.life })) {
    const now = at(age);
    const before = at(Math.max(0, age - STREAK_DT));

    // 흩날림은 화면 픽셀이다. 물리량이 아니라 표현이라 배율을 따라가지 않는다.
    if (jitter > 0) {
      const spread = (age / p.life) * jitter;
      const dx = (stableRandom(index, 1) - 0.5) * spread;
      const dy = (stableRandom(index, 2) - 0.5) * spread;
      const [sx, sy] = rc.toScreen(now);
      const [bx, by] = rc.toScreen(before);
      const c = rc.ctx;
      setAlpha(c, 1 - (age / p.life) * 0.5);
      c.strokeStyle = color;
      c.lineWidth = Math.max(0.5, baseWidth * (1 - THINNING * (age / p.life)));
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bx + dx, by + dy);
      c.lineTo(sx + dx, sy + dy);
      c.stroke();
      setAlpha(c, 1);
    } else {
      streak(
        rc,
        before,
        now,
        baseWidth * (1 - THINNING * (age / p.life)),
        color,
        1 - (age / p.life) * 0.5,
      );
    }
  }

  finalizeBaseMeta(rc, p);
};
