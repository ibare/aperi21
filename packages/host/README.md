# @aperi21/host

aperi21 시각화 런타임. Scene Graph 전처리 · Canvas 렌더러 · 시간 엔진 · 카메라 ·
컨트롤러 · 테마 · i18n resolver · Plugin Manager, 그리고 **번들 레지스트리**를 담는다.

## 왜 별도 패키지로 발행되는가

이 패키지는 `registerBundle` / `registerBundleLoader` / `loadBundle` 이 공유하는
**모듈 레벨 레지스트리**를 갖는다. 소비 번들이 이것을 자기 안에 inline 하면 레지스트리
사본이 둘이 되어, 한쪽이 등록한 시각화를 다른 쪽이 찾지 못한다. 예외도 나지 않고
타입도 통과하므로 원인을 찾기 어렵다.

그래서 `@aperi21/host-tiptap-bundle` 같은 소비 번들은 이 패키지를 `external` +
`peerDependency` 로 두고, **호스트 앱이 단일 인스턴스를 설치해 공유한다.**

## 설치

```sh
npm install @aperi21/host
```

Tiptap 에디터에 시각화를 붙이려면 번들과 함께 설치한다.

```sh
npm install @aperi21/host @aperi21/host-tiptap-bundle
```

## 사용

```ts
import { createHost, runBundle, registerBundleLoader } from '@aperi21/host';

const host = createHost({ theme: 'light', lang: 'ko' });
const handle = runBundle(bundle, mountEl, { host, locale: 'ko' });
// ...
handle.destroy();
```

대부분의 호스트는 이 패키지를 직접 부르지 않고 `@aperi21/host-tiptap-bundle` 의
`createAperi21Extension()` 을 쓴다. 이 패키지는 그 아래에서 단일 인스턴스로 공유되는
런타임이다.

## 의존

런타임 의존이 없다. 타입 정의(`@aperi21/schema`)는 빌드 시 `.d.ts` 에 인라인된다.

## 라이선스

[MIT](./LICENSE) © Mintae Kim
