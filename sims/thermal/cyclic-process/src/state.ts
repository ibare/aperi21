export type CyclicProcessState = Record<string, never>;

export function initialState(): CyclicProcessState {
  return {};
}
