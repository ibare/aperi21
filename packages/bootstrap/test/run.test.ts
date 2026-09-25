/**
 * 조각 실행 — 등록된 모든 조각을 러너가 하는 순서대로 실제로 돌려 본다.
 *
 * 다른 테스트는 선언이 맞물리는지(키 · 번역 · 시간표)만 본다. 그것만으로는 physics 나
 * scene 이 던지거나 NaN 을 내는 조각이 그대로 통과한다 — 러너는 첫 프레임에서 죽거나,
 * 좌표가 NaN 인 도형을 조용히 건너뛰어 빈 캔버스를 그린다. 둘 다 예외가 호스트의 글
 * 한복판에서야 드러난다.
 *
 * 러너(`runBundle`)의 순서를 그대로 따른다: 기본값으로 initialState → preroll →
 * 시간표가 정한 배속으로 step → 각 view 로 scene → 캡션을 더하고 전처리.
 * 캔버스는 만들지 않는다 — 그리는 쪽은 host 테스트의 몫이다.
 */
import { describe, expect, it } from 'vitest';
import type { Bundle, BundleState, SceneGraph } from '@aperi21/schema';
import {
  evaluateTimeline,
  listBundleLoaderIds,
  loadBundle,
  preprocessScene,
  prerollState,
  withCaption,
} from '@aperi21/host';
import { registerAperi21Bundles } from '../src/index.js';

registerAperi21Bundles();

/** 러너와 같은 걸음. */
const DT = 1 / 60;
/** 굴려 볼 시간(초). 시간표의 첫 전환과 대부분의 캡션 문턱을 넘는 길이다. */
const SECONDS = 3;
/** scene 을 찍어 볼 시각(걸음 수). 처음 · 중간 · 끝. */
const SNAPSHOTS = new Set([0, Math.round(SECONDS / DT / 2), Math.round(SECONDS / DT)]);

/**
 * 값 안의 유한하지 않은 수를 찾아 경로를 돌려준다. 없으면 null.
 *
 * `Infinity` 는 뜻이 있는 값으로 쓰는 조각이 있을 수 있어(무한 원점 등) NaN 만 잡는다.
 */
function findNaN(value: unknown, path: string, seen: Set<object>, depth = 0): string | null {
  if (typeof value === 'number') return Number.isNaN(value) ? path : null;
  if (!value || typeof value !== 'object' || depth > 12) return null;
  if (seen.has(value)) return null;
  seen.add(value);
  if (ArrayBuffer.isView(value)) {
    const arr = value as unknown as ArrayLike<number>;
    for (let i = 0; i < arr.length; i++) if (Number.isNaN(arr[i])) return `${path}[${i}]`;
    return null;
  }
  for (const [k, v] of Object.entries(value)) {
    const hit = findNaN(v, `${path}.${k}`, seen, depth + 1);
    if (hit) return hit;
  }
  return null;
}

function checkScene(id: string, where: string, scene: SceneGraph): void {
  expect(Array.isArray(scene), `${id} ${where}: scene 은 배열이다`).toBe(true);
  scene.forEach((p, i) => {
    expect(typeof p.type, `${id} ${where}: primitive type`).toBe('string');
    // `scalarField.values` 의 NaN 은 선언된 뜻이다 — 「그 칸은 칠하지 않는다」
    // (schema `ScalarField.values`). 원판 · 기울어진 판처럼 사각형이 아닌
    // 영역을 그렇게 칠한다. 나머지 필드는 여느 primitive 처럼 본다.
    const target = p.type === 'scalarField' ? { ...p, values: [] } : p;
    const nan = findNaN(target, `scene.${i}`, new Set());
    expect(nan, `${id} ${where}: NaN`).toBeNull();
  });
}

function runPiece(id: string, bundle: Bundle): void {
  const { schema } = bundle;
  const values: Record<string, number> = {};
  for (const p of schema.parameters) values[p.id] = p.default;
  const environments: never[] = [];

  for (const stage of schema.stages) {
    const where = `stage=${stage.id}`;
    let state: BundleState = bundle.initialState({ values, stage, environments });
    state = prerollState(bundle, state, stage, environments);
    expect(findNaN(state, 'state', new Set()), `${id} ${where}: preroll 뒤 NaN`).toBeNull();

    let clock = schema.startAt ?? 0;
    const totalSteps = Math.round(SECONDS / DT);
    for (let i = 0; i <= totalSteps; i++) {
      const timeline = schema.timeline ? evaluateTimeline(schema.timeline, clock) : undefined;

      if (SNAPSHOTS.has(i)) {
        for (const view of schema.views) {
          const at = `${where} view=${view.id} t=${clock.toFixed(2)}`;
          const scene = withCaption(
            bundle.scene({ state, view, stage, environments, timeline }),
            schema,
            timeline,
            state,
          );
          checkScene(id, at, scene);
          expect(() => preprocessScene(scene), `${id} ${at}: 전처리`).not.toThrow();
        }
      }
      if (i === totalSteps || bundle.isTerminated?.(state)) break;

      const dt = DT * (timeline?.timeScale ?? 1);
      state = bundle.step({ state, dt, stage, environments });
      clock += dt;
    }
    expect(findNaN(state, 'state', new Set()), `${id} ${where}: ${SECONDS}초 뒤 NaN`).toBeNull();
  }
}

describe('조각 실행', () => {
  it('등록된 조각이 있다', () => {
    expect(listBundleLoaderIds().length).toBeGreaterThan(0);
  });

  it('모든 조각이 스테이지마다 3초를 던지지 않고 NaN 없이 돈다', async () => {
    const failures: string[] = [];
    for (const id of listBundleLoaderIds()) {
      const bundle = await loadBundle(id);
      if (!bundle) {
        failures.push(`${id}: loadBundle 이 null`);
        continue;
      }
      try {
        runPiece(id, bundle);
      } catch (err) {
        failures.push(err instanceof Error ? err.message.split('\n')[0]! : `${id}: ${String(err)}`);
      }
    }
    // 하나씩 끊지 않고 전부 모은다 — 몇 개가 깨졌는지가 첫 정보다.
    expect(failures).toEqual([]);
  }, 300_000);
});
