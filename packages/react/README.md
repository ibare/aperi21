# @aperi21/react

aperi21 엔진의 React 통합 계층. `HostProvider` 로 `@aperi21/host` 인스턴스를 주입받아 내부 훅(`useHost`, `useTheme`, `useI18n`)이 동작하며, `Embed` 컴포넌트가 Bundle 을 받아 렌더한다. Phase 1 의 `Embed` 는 실제 Canvas 렌더러가 없으므로 Bundle 메타 정보를 표시하는 플레이스홀더만 제공하고, Phase 2 에서 Scene Graph 드로잉이 얹히게 된다.
