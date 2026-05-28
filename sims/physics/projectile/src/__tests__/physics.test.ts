import { describe, expect, it } from 'vitest';
import { boundsHint, derivedValues, initialState, step } from '../physics';
import { schema } from '../schema';

function stageById(id: string) {
  const s = schema.stages.find((x) => x.id === id);
  if (!s) throw new Error(`unknown stage ${id}`);
  return s;
}

function envById(ids: string[]) {
  return ids.map((id) => {
    const e = schema.environments.find((x) => x.id === id);
    if (!e) throw new Error(`unknown env ${id}`);
    return e;
  });
}

describe('projectile initialState', () => {
  it('45° 에서 수평·수직 성분이 동일', () => {
    const st = initialState({
      values: { v0: 20, theta: 45 },
      stage: stageById('earth'),
      environments: [],
    });
    expect(st.pos).toEqual([0, 0]);
    expect(st.vel[0]).toBeCloseTo(20 / Math.SQRT2, 3);
    expect(st.vel[1]).toBeCloseTo(20 / Math.SQRT2, 3);
    expect(st.phase).toBe('idle');
  });
});

describe('projectile step — 중력만', () => {
  it('환경 없음: 궤적이 포물선(수평 대칭)', () => {
    let st = initialState({
      values: { v0: 30, theta: 45 },
      stage: stageById('earth'),
      environments: [],
    });
    st = { ...st, phase: 'flying' };
    const dt = 0.02;
    for (let i = 0; i < 500 && st.phase === 'flying'; i++) {
      st = step({ state: st, dt, stage: stageById('earth'), environments: [] });
    }
    expect(st.phase).toBe('landed');
    // 공중 체공 시간 ≈ 2·v0·sinθ/g ≈ 2·30·sin45/9.8 ≈ 4.33s
    expect(st.t).toBeGreaterThan(4);
    expect(st.t).toBeLessThan(4.7);
    // 수평 비거리 ≈ v0²sin(2θ)/g ≈ 900/9.8 ≈ 91.8m
    expect(st.pos[0]).toBeGreaterThan(85);
    expect(st.pos[0]).toBeLessThan(100);
  });
});

describe('projectile step — 환경 효과', () => {
  it('비(drag) 가 적용되면 비거리가 줄어든다', () => {
    const stage = stageById('earth');
    function simulate(envs: string[]) {
      let st = initialState({ values: { v0: 30, theta: 45 }, stage, environments: envById(envs) });
      st = { ...st, phase: 'flying' };
      for (let i = 0; i < 1000 && st.phase === 'flying'; i++) {
        st = step({ state: st, dt: 0.02, stage, environments: envById(envs) });
      }
      return st.pos[0];
    }
    const plain = simulate([]);
    const rainy = simulate(['rain']);
    expect(rainy).toBeLessThan(plain);
  });

  it('뒷바람(tailwind)이 수평 속도를 증가시켜 비거리가 늘어난다', () => {
    const stage = stageById('earth');
    function simulate(envs: string[]) {
      let st = initialState({ values: { v0: 30, theta: 45 }, stage, environments: envById(envs) });
      st = { ...st, phase: 'flying' };
      for (let i = 0; i < 1000 && st.phase === 'flying'; i++) {
        st = step({ state: st, dt: 0.02, stage, environments: envById(envs) });
      }
      return st.pos[0];
    }
    const plain = simulate([]);
    const helped = simulate(['tailwind']);
    expect(helped).toBeGreaterThan(plain);
  });
});

describe('projectile step — stage 비교', () => {
  it('달에서 체공 시간이 지구보다 길다', () => {
    function simulate(stageId: string) {
      const stage = stageById(stageId);
      let st = initialState({ values: { v0: 20, theta: 60 }, stage, environments: [] });
      st = { ...st, phase: 'flying' };
      for (let i = 0; i < 3000 && st.phase === 'flying'; i++) {
        st = step({ state: st, dt: 0.02, stage, environments: [] });
      }
      return st.t;
    }
    const earth = simulate('earth');
    const moon = simulate('moon');
    expect(moon).toBeGreaterThan(earth * 2); // g 차이가 ~6배지만 dt 해상도 고려해 여유
  });
});

describe('projectile derivedValues — 에너지 보존', () => {
  it('환경 없음: 중간 시점에서 ke+pe ≈ 초기 ke', () => {
    const stage = stageById('earth');
    let st = initialState({ values: { v0: 30, theta: 45 }, stage, environments: [] });
    const initial = derivedValues(st, stage).initialTotal;
    st = { ...st, phase: 'flying' };
    for (let i = 0; i < 50; i++) {
      st = step({ state: st, dt: 0.02, stage, environments: [] });
    }
    const dv = derivedValues(st, stage);
    // semi-implicit Euler 드리프트 허용: 초기 total 대비 2 J 이내
    expect(Math.abs(dv.total - initial)).toBeLessThan(2);
    expect(dv.lost).toBeLessThan(2);
  });

  it('비(drag) 환경에서 에너지가 손실된다', () => {
    const stage = stageById('earth');
    let st = initialState({ values: { v0: 30, theta: 45 }, stage, environments: envById(['rain']) });
    st = { ...st, phase: 'flying' };
    for (let i = 0; i < 100; i++) {
      st = step({ state: st, dt: 0.02, stage, environments: envById(['rain']) });
    }
    const dv = derivedValues(st, stage);
    expect(dv.lost).toBeGreaterThan(5);
  });
});

describe('projectile boundsHint', () => {
  it('launch.v0 에 비례해 월드 너비/높이가 확장된다', () => {
    const stage = stageById('earth');
    const small = initialState({ values: { v0: 5, theta: 45 }, stage, environments: [] });
    const big = initialState({ values: { v0: 50, theta: 45 }, stage, environments: [] });
    const bSmall = boundsHint(small, stage);
    const bBig = boundsHint(big, stage);
    expect(bBig.maxX).toBeGreaterThanOrEqual(bSmall.maxX);
    expect(bSmall.minY).toBe(0);
  });
});
