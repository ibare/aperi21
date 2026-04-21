# @aperi21/host

aperi21 엔진의 코어 호스트. Plugin Manager, Renderer Registry, Compute Service, Theme·I18n resolver, Scene Graph 전처리기를 제공한다. 실제 Canvas 렌더러와 Bundle 실행기는 이 위에서 단계별로 얹히며, Phase 1에서는 구조 골격과 타입만 갖춰둔다. `createHost(config)` 로 인스턴스화해서 `@aperi21/react` Embed에 넘기는 것이 기본 사용법이다.
