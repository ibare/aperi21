import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Bundle, BundleState, EnvironmentDef, StageDef, ViewDef } from '@aperi21/schema';
import { readPath, writePath } from '@aperi21/host';

/**
 * Embed 내 bundle runtime 상태.
 * - bundle/stage/view/environments 변경 시 state 를 initialState 로 리셋
 * - RAF 루프는 stateRef 를 통해 최신 상태를 읽고 setStateExternal 로 쓴다.
 * - Controller/Reset 은 replaceState 로 직접 갈아끼운다.
 */
export interface BundleRuntime<T extends BundleState = BundleState> {
  stageId: string;
  stage: StageDef;
  viewId: string;
  view: ViewDef;
  envIds: string[];
  environments: EnvironmentDef[];
  state: T;
  stateRef: React.MutableRefObject<T>;

  /** 파라미터 라이브 값. */
  paramValues: Record<string, number>;
  /** 개별 파라미터 갱신 — 즉시 initialState 로 재초기화. */
  setParam(id: string, value: number): void;

  setStageId(id: string): void;
  setViewId(id: string): void;
  toggleEnv(id: string): void;
  setEnvIds(ids: string[]): void;
  replaceState(next: T): void;
  reset(): void;
  resetSignal: number;
}

function computeInitial<T extends BundleState>(
  bundle: Bundle<T>,
  stage: StageDef,
  environments: EnvironmentDef[],
  values: Record<string, number>,
): T {
  return bundle.initialState({ values, stage, environments });
}

/** 모든 파라미터 default 를 모은 dict — initialState 의 values 인자용. */
function buildAllDefaults(bundle: Bundle<BundleState>): Record<string, number> {
  const values: Record<string, number> = {};
  for (const p of bundle.schema.parameters) {
    values[p.id] = p.default;
  }
  return values;
}

/** statePath 가 없는 파라미터만 모은 dict — paramValues state 의 초기값. */
function buildScalarDefaults(bundle: Bundle<BundleState>): Record<string, number> {
  const values: Record<string, number> = {};
  for (const p of bundle.schema.parameters) {
    if (!p.statePath) values[p.id] = p.default;
  }
  return values;
}

/**
 * 현재 state + paramValues 를 합쳐 initialState 에 넘길 values dict 를 만든다.
 * statePath 가 있는 파라미터는 state 에서 readPath 로 가져와 stage 전환 시에도
 * 슬라이더로 잡아둔 값을 보존한다.
 */
function mergeValues(
  bundle: Bundle<BundleState>,
  state: BundleState,
  scalarValues: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of bundle.schema.parameters) {
    if (p.statePath) {
      const v = readPath<number>(state, p.statePath);
      out[p.id] = typeof v === 'number' && Number.isFinite(v) ? v : p.default;
    } else {
      out[p.id] = scalarValues[p.id] ?? p.default;
    }
  }
  return out;
}

function isEnvAvailable(env: EnvironmentDef, stageId: string): boolean {
  return !env.availableInStages || env.availableInStages.includes(stageId);
}

export function useBundleRuntime<T extends BundleState>(
  bundle: Bundle<T>,
  initialStageId?: string,
  initialViewId?: string,
  initialEnvIds?: string[],
): BundleRuntime<T> {
  const [stageId, setStageIdState] = useState<string>(
    initialStageId ?? bundle.schema.stages[0]?.id ?? '',
  );
  const [viewId, setViewId] = useState<string>(
    initialViewId ??
      bundle.schema.views.find((v) => v.default)?.id ??
      bundle.schema.views[0]?.id ??
      '',
  );
  const [envIds, setEnvIdsState] = useState<string[]>(initialEnvIds ?? []);
  const [resetSignal, setResetSignal] = useState(0);
  // statePath 가 없는 파라미터만 모음. statePath 있는 파라미터(예: 발사체의
  // launch.v0/theta)는 Bundle state 자체가 단일 소스이므로 여기에 두지 않는다.
  const [paramValues, setParamValues] = useState<Record<string, number>>(() =>
    buildScalarDefaults(bundle),
  );

  // bundle 이 바뀌면 파라미터 기본값 재적용.
  useEffect(() => {
    setParamValues(buildScalarDefaults(bundle));
  }, [bundle]);

  const stage = useMemo(
    () => bundle.schema.stages.find((s) => s.id === stageId) ?? bundle.schema.stages[0]!,
    [bundle, stageId],
  );
  const view = useMemo(
    () => bundle.schema.views.find((v) => v.id === viewId) ?? bundle.schema.views[0]!,
    [bundle, viewId],
  );
  const environments = useMemo(
    () =>
      envIds
        .map((id) => bundle.schema.environments.find((e) => e.id === id))
        .filter((e): e is EnvironmentDef => !!e && isEnvAvailable(e, stageId)),
    [bundle, envIds, stageId],
  );

  const [state, setState] = useState<T>(() =>
    computeInitial(bundle, stage, environments, buildAllDefaults(bundle)),
  );
  const stateRef = useRef<T>(state);

  // bundle/stage/scalar params 변경 또는 resetSignal 증가 시 재초기화.
  // statePath 파라미터의 변경은 setParam 이 stateRef 를 직접 갱신하므로 여기로
  // 들어오지 않는다.
  useEffect(() => {
    const merged = mergeValues(bundle, stateRef.current, paramValues);
    const next = computeInitial(bundle, stage, environments, merged);
    stateRef.current = next;
    setState(next);
    // environments 는 런타임 개입용이므로 stage/bundle 변경만 재초기화 트리거.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, stage, resetSignal, paramValues]);

  // stage 변경 시 미가용 env 자동 정리.
  const setStageId = useCallback(
    (id: string) => {
      setStageIdState(id);
      setEnvIdsState((cur) =>
        cur.filter((eid) => {
          const env = bundle.schema.environments.find((e) => e.id === eid);
          return !!env && isEnvAvailable(env, id);
        }),
      );
    },
    [bundle],
  );

  const toggleEnv = useCallback(
    (id: string) => {
      setEnvIdsState((cur) => {
        if (cur.includes(id)) return cur.filter((x) => x !== id);
        const env = bundle.schema.environments.find((e) => e.id === id);
        if (!env || !isEnvAvailable(env, stageId)) return cur;
        return [...cur, id];
      });
    },
    [bundle, stageId],
  );

  const setEnvIds = useCallback(
    (ids: string[]) => {
      setEnvIdsState(
        ids.filter((id) => {
          const env = bundle.schema.environments.find((e) => e.id === id);
          return !!env && isEnvAvailable(env, stageId);
        }),
      );
    },
    [bundle, stageId],
  );

  const replaceState = useCallback((next: T) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const reset = useCallback(() => {
    const defaults = buildAllDefaults(bundle);
    setParamValues(buildScalarDefaults(bundle));
    const next = computeInitial(bundle, stage, environments, defaults);
    stateRef.current = next;
    setState(next);
    setResetSignal((n) => n + 1);
  }, [bundle, stage, environments]);

  const setParam = useCallback(
    (id: string, value: number) => {
      const p = bundle.schema.parameters.find((x) => x.id === id);
      if (!p) return;
      if (p.statePath) {
        // 단일 소스: state 의 path 만 직접 갱신. initialState 재호출 안 함.
        const next = writePath(stateRef.current, p.statePath, value) as T;
        stateRef.current = next;
        setState(next);
        return;
      }
      setParamValues((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
    },
    [bundle],
  );

  return {
    stageId,
    stage,
    viewId,
    view,
    envIds,
    environments,
    state,
    stateRef,
    paramValues,
    setParam,
    setStageId,
    setViewId,
    toggleEnv,
    setEnvIds,
    replaceState,
    reset,
    resetSignal,
  };
}
