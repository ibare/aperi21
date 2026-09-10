import type { Filament, PrimitiveRenderer } from '@aperi21/schema';
import { applyBaseMeta, finalizeBaseMeta, primitiveColor } from '../common';
import { sampleVortices } from '../kit/vortex';
import { stableRandom } from '../kit/particles';
import { emptyVortexState, vortexStoreKey, type VortexBagState } from './vortex-field';

/** 흐트러짐의 씨앗은 사라지지 않는다. 커지느냐 아니냐만 달라진다. */
const AMBIENT = 0.004;
/** 알갱이 최대 개수. 넘으면 오래된 것부터 나간다. */
const MAX_PARTICLES = 900;
/** 속도장이 실을 미는 세기. */
const SWIRL_GAIN = 0.36;
/** 한 프레임 성장률 상한. 폭주를 막는다. */
const MAX_GROWTH_PER_FRAME = 40;
/** 이 비율을 넘으면 안쪽으로 되돌리기 시작한다. */
const WALL_RETURN_FROM = 0.5;
/** 되돌리는 힘. */
const WALL_RETURN_GAIN = 0.85;
/** 교란이 포화해도 갈 수 있는 최대 거리 = halfWidth × (0.34 + 이 값). */
const WALL_LIMIT_GAIN = 0.44;
/**
 * 번짐 점 구름의 퍼짐(화면 px). 교란이 최대일 때 이만큼 벌어진다.
 *
 * 관 높이의 3분의 1쯤이다. 작게 잡으면 점이 선에 붙어 **번짐이 보이지 않고**
 * 도면의 선만 남는다.
 */
const BLUR_SPREAD = 26;
/**
 * 이웃 알갱이가 이보다 멀어지면 **잇지 않는다**(화면 px).
 *
 * 무조건 이으면 접힌 자리가 곧은 대각선이 되어 실이 커다란 삼각형으로 보인다 —
 * 휘저어진 물이 아니라 기하 도형이다. 끊으면 찢어진 실이 되고, 그것이 실제로
 * 일어나는 일이다.
 */
const BREAK_DISTANCE = 20;
/**
 * 교란이 이보다 세면 **선을 긋지 않는다.** 점 구름만 남는다.
 *
 * 실이 완전히 풀린 자리에 실을 그리면, 이미 물에 섞여 버린 것이 여전히 한 가닥의
 * 실인 것처럼 보인다. 흐트러진다는 것은 실이라는 정체가 사라지는 일이다.
 */
const DISSOLVE_AMP = 0.72;

interface Particle {
  /** 흐름 방향으로 흐른 거리(월드). */
  s: number;
  /** 중심선에서의 변위(월드). */
  off: number;
  /** 이 자리의 교란 세기. 0~1. */
  amp: number;
  /** 번짐 점의 고정 방향. */
  rx: number;
  ry: number;
}

interface FilamentState {
  parts: Particle[];
  emitAcc: number;
  pulseT: number;
  pulseIdx: number;
  seedOff: number;
  serial: number;
}

/**
 * 흐름을 따라 흐르며 교란이 커지거나 잦아드는 실.
 *
 * 변위는 **누적 적분**이라 시각만으로 자리를 구할 수 없다. 그래서 이 어휘는
 * `rc.store` 에 알갱이를 두고 매 프레임 앞으로 굴린다.
 *
 * 한 프레임에 여럿을 방출할 때는 **프레임 안의 하위 시간을 보정**한다 — 나중에
 * 나온 알갱이가 주입부 쪽에 오도록. 순서가 곧 실의 순서라, 뒤집으면 실에 눈에
 * 보이는 틈이 생긴다.
 */
export const renderFilament: PrimitiveRenderer = (rc, p0) => {
  const p = p0 as Filament;
  const id = p.id ?? 'filament';
  const dir = p.direction ?? [1, 0];
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / len;
  const uy = dir[1] / len;
  // 중심선에 수직인 방향 — 변위는 이쪽으로 쌓인다.
  const nx = -uy;
  const ny = ux;
  const dt = Math.min(0.05, Math.max(0, rc.deltaTime));
  const flow = p.speed * dt;
  // 간격은 화면 px 로 받아 월드로 환산한다 — 배율이 달라도 실의 결이 같다.
  const spacing = Math.max(1e-6, (p.spacing ?? 2) / Math.max(1e-6, rc.scale));
  const halfWidth = p.halfWidth;

  /**
   * 프리롤 — 첫 프레임에 이미 실이 흐르고 있다.
   *
   * 조각은 문단 옆에 놓인다. 독자가 눈을 돌렸을 때 빈 관이 채워지길 몇 초씩
   * 기다리게 하지 않는다. *아무것도 누르지 않아도 화면이 할 말을 마친다* 의
   * 짝은 *독자가 도착한 순간 이미 진행 중이다* 이고, 그건 런타임의 일이다.
   */
  const state = rc.store?.<FilamentState>(`filament:${id}`, () => {
    const parts: Particle[] = [];
    const count = Math.min(MAX_PARTICLES, Math.floor(p.length / spacing));
    for (let i = 0; i < count; i++) {
      const s0 = p.length - i * spacing;
      // 교란도 이미 자란 상태로 깐다. `amp` 를 0 으로 깔면 첫 화면이 언제나
      // 곧은 실이어서, 난류인데도 층류처럼 보이는 몇 초가 생긴다.
      const amp = Math.min(1, Math.max(AMBIENT, AMBIENT * Math.exp((p.growth * s0) / p.length)));
      parts.push({
        s: s0,
        off: 0,
        amp,
        rx: stableRandom(i, 7) - 0.5,
        ry: stableRandom(i, 8) - 0.5,
      });
    }
    return { parts, emitAcc: 0, pulseT: 0, pulseIdx: 0, seedOff: 0, serial: count };
  });
  if (!state) return;

  // 장을 조회한다. 아직 없으면 **빈 껍데기를 만들어 둔다** — `vortexField` 가
  // 나중에 돌면서 채운다. undefined 를 저장하면 저장소가 그것을 캐시해 영원히
  // 장이 없는 상태가 된다.
  const field = p.field
    ? rc.store?.<VortexBagState>(vortexStoreKey(p.field), emptyVortexState)
    : undefined;

  // ---- 주사기 바늘 — 늘 같은 크기의 흔들림을 주기적으로 넣는다 ----
  const period = p.seed.period;
  const duration = p.seed.duration ?? Math.min(0.13, period * 0.12);
  state.pulseT += dt;
  if (state.pulseT > period) {
    state.pulseT -= period;
    state.pulseIdx += 1;
  }
  let kick = 0;
  if (state.pulseT < duration) {
    const phase = state.pulseT / duration;
    kick = Math.sin(Math.PI * phase) * p.seed.amplitude * (state.pulseIdx % 2 ? 1 : -1);
  }
  state.seedOff += (kick - state.seedOff) * (1 - Math.exp(-dt / 0.03));

  // ---- 방출 — 화면상 일정 간격으로. 실의 밀도를 일정하게 ----
  state.emitAcc += flow;
  const n = Math.floor(state.emitAcc / spacing);
  if (n > 0) {
    state.emitAcc -= n * spacing;
    for (let e = 0; e < n && state.parts.length < MAX_PARTICLES; e++) {
      // 이번 프레임 안에서 방출된 시각만큼만 떠내려간 자리에 놓는다.
      const back = flow * (1 - (e + 0.5) / n);
      const serial = state.serial++;
      state.parts.push({
        s: back,
        off: kick,
        amp: Math.min(1, AMBIENT * (1 + 2.2 * Math.abs(kick) / (p.seed.amplitude || 1))),
        rx: stableRandom(serial, 7) - 0.5,
        ry: stableRandom(serial, 8) - 0.5,
      });
    }
  }

  // ---- 이류 + 성장/감쇠 ----
  const alive: Particle[] = [];
  for (const q of state.parts) {
    const fw = Math.abs(q.off) / halfWidth;
    const worldX = p.from[0] + ux * q.s + nx * q.off;
    const worldY = p.from[1] + uy * q.s + ny * q.off;
    const swirl = field && field.bag.length > 0
      ? sampleVortices(field.bag, worldX, worldY)
      : { vx: 0, vy: 0 };

    // 벽에 가까울수록 느리다. 그리고 소용돌이가 앞뒤로도 민다.
    let along = p.speed * (1 - 0.45 * fw * fw) * (1 + q.amp * 0.2 * swirl.vx);
    if (along < p.speed * 0.15) along = p.speed * 0.15;
    const before = q.s;
    q.s += along * dt;

    const g = Math.min(MAX_GROWTH_PER_FRAME, Math.exp((p.growth * (q.s - before)) / p.length));
    q.off *= g;
    // 배경 교란도 같은 법칙을 따른다. 다만 밑바닥은 늘 있다.
    q.amp = Math.min(1, Math.max(AMBIENT, q.amp * g));

    // 벽 쪽으로 미는 성분만 줄인다 — 안쪽으로는 그대로. 이게 없으면 실이
    // 벽에 눌러붙는다.
    //
    // 그것만으로는 모자랐다. 억제는 **더 밀리는 것**을 막을 뿐 이미 벽에 닿은
    // 알갱이를 되돌리지 못해서, 바깥으로 나간 것들이 그대로 누워 위아래 벽에만
    // 염료가 끼고 가운데가 비는 껍질이 됐다. 그래서 (1) 벽에 닿기 전에 되돌리는
    // 복원력을 더 일찍·세게 걸고, (2) 갈 수 있는 최대 거리를 벽에서 떼어 놓는다.
    let across = p.speed * q.amp * SWIRL_GAIN * swirl.vy;
    if (fw > 0.55 && q.off * across > 0) {
      const t = Math.min(1, (fw - 0.55) / 0.45);
      across *= 1 - t * t;
    }
    if (fw > WALL_RETURN_FROM) {
      const t = (fw - WALL_RETURN_FROM) / (1 - WALL_RETURN_FROM);
      across -= (q.off > 0 ? 1 : -1) * p.speed * q.amp * WALL_RETURN_GAIN * t;
    }
    q.off += across * dt;

    const limit = halfWidth * (0.34 + WALL_LIMIT_GAIN * q.amp);
    q.off = Math.max(-limit, Math.min(limit, q.off));

    if (q.s <= p.length) alive.push(q);
  }
  state.parts = alive;

  // ---- 그리기 ----
  applyBaseMeta(rc, p);
  const c = rc.ctx;
  const color = primitiveColor(rc, p, { role: 'primary', emphasis: 'strong' });
  const width = p.width ?? 2;

  // 접힌 실. **이웃이 멀어지면 끊는다** — 이어 버리면 접힌 자리가 곧은
  // 대각선이 되어 커다란 삼각형으로 보인다.
  const screen = state.parts.map((q) =>
    rc.toScreen([
      p.from[0] + ux * q.s + nx * q.off,
      p.from[1] + uy * q.s + ny * q.off,
    ]),
  );
  const breakSq = BREAK_DISTANCE * BREAK_DISTANCE;

  // 두 번 긋는다 — 굵고 진한 심 위에 가늘고 흐린 겉선. 한 번만 그으면 실이
  // 도면의 선처럼 보이고, 물에 풀린 염료로 읽히지 않는다.
  c.lineJoin = 'round';
  c.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    c.globalAlpha = pass ? 0.38 : 0.88;
    c.lineWidth = pass ? width * 0.65 : width;
    c.strokeStyle = color;
    c.beginPath();
    let open = false;
    for (let i = 0; i < screen.length; i++) {
      const [x, y] = screen[i]!;
      // 풀려 버린 자리는 건너뛴다 — 거기 실은 없다.
      if (state.parts[i]!.amp >= DISSOLVE_AMP) {
        open = false;
        continue;
      }
      if (!open) {
        c.moveTo(x, y);
        open = true;
        continue;
      }
      const [px0, py0] = screen[i - 1]!;
      const dx = x - px0;
      const dy = y - py0;
      if (dx * dx + dy * dy > breakSq) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.globalAlpha = 1;

  // 번짐 — 선 하나로는 "휘저어진 물" 이 되지 않는다. 흐트러진 곳일수록 이웃한
  // 알갱이가 서로 멀어져 번진다. 알갱이마다 **고정된** 방향 셋으로 벌어지는
  // 흐린 점을 얹는다. 방향이 매 프레임 바뀌면 구름이 끓는다.
  c.globalAlpha = 0.2;
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < state.parts.length; i++) {
    const q = state.parts[i]!;
    const [x, y] = screen[i]!;
    const spread = BLUR_SPREAD * q.amp;
    const radius = 0.9 + 1.3 * q.amp;
    const ax = q.rx;
    const ay = q.ry;
    const bx = (ax - ay) * 0.72;
    const by = (ax + ay) * 0.72;
    c.moveTo(x + ax * spread + radius, y + ay * spread);
    c.arc(x + ax * spread, y + ay * spread, radius, 0, Math.PI * 2);
    c.moveTo(x + ay * spread + radius, y - ax * spread);
    c.arc(x + ay * spread, y - ax * spread, radius, 0, Math.PI * 2);
    c.moveTo(x + bx * spread + radius, y + by * spread);
    c.arc(x + bx * spread, y + by * spread, radius, 0, Math.PI * 2);
  }
  c.fill();
  c.globalAlpha = 1;

  finalizeBaseMeta(rc, p);
};
