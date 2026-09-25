# @aperi21/react

카탈로그 앱이 쓰는 React 통합 계층(private). `HostProvider` 로 `@aperi21/host` 인스턴스를 주입하고, `Embed` 가 조각 하나를
React 트리에 붙인다.

`Embed` 에는 시각화 코드가 없다 — 그리기 · 조작기 · 카메라 · 시간은 모두 `runBundle` 이 하고, `Embed` 는 붙일 자리를 만들고
라이프사이클을 잇는다. 외부 호스트와 카탈로그가 같은 조각을 같은 화면으로 여는 것은 이 덕분이다.
