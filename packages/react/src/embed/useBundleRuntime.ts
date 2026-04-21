import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Bundle, BundleState, EnvironmentDef, StageDef, ViewDef } from '@aperi21/schema';

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

function buildDefaultValues(bundle: Bundle<BundleState>): Record<string, number> {
  const values: Record<string, number> = {};
  for (const p of bundle.schema.parameters) {
    values[p.id] = p.default;
  }
  return values;
}

export function useBundleRuntime<T extends BundleState>(
  bundle: Bundle<T>,
  initialStageId?: string,
  initialViewId?: string,
  initialEnvIds?: string[],
): BundleRuntime<T> {
  const [stageId, setStageId] = useState<string>(
    initialStageId ?? bundle.schema.stages[0]?.id ?? '',
  );
  const [viewId, setViewId] = useState<string>(
    initialViewId ??
      bundle.schema.views.find((v) => v.default)?.id ??
      bundle.schema.views[0]?.id ??
      '',
  );
  const [envIds, setEnvIds] = useState<string[]>(initialEnvIds ?? []);
  const [resetSignal, setResetSignal] = useState(0);
  const [paramValues, setParamValues] = useState<Record<string, number>>(() =>
    buildDefaultValues(bundle),
  );

  // bundle 이 바뀌면 파라미터 기본값 재적용.
  useEffect(() => {
    setParamValues(buildDefaultValues(bundle));
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
        .filter((e): e is EnvironmentDef => !!e),
    [bundle, envIds],
  );

  const [state, setState] = useState<T>(() =>
    computeInitial(bundle, stage, environments, paramValues),
  );
  const stateRef = useRef<T>(state);

  // bundle/stage/params 변경 또는 resetSignal 증가 시 재초기화
  useEffect(() => {
    const next = computeInitial(bundle, stage, environments, paramValues);
    stateRef.current = next;
    setState(next);
    // environments 는 런타임 개입용이므로 여기서는 stage 변경만 재초기화 트리거로 삼는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, stage, resetSignal, paramValues]);

  const toggleEnv = useCallback((id: string) => {
    setEnvIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const replaceState = useCallback((next: T) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const reset = useCallback(() => {
    setParamValues(buildDefaultValues(bundle));
    setResetSignal((n) => n + 1);
  }, [bundle]);

  const setParam = useCallback((id: string, value: number) => {
    setParamValues((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);

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
