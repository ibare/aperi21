# @aperi21/authoring

aperi21 개념(concept)의 authoring 메타데이터. 호스트의 글 작성 파이프라인이
**글에 넣을 시각화를 고르고**, 고른 시각화의 내용을 **writer 에게 전달**하는 데
쓰는 단일 출처다.

```sh
pnpm add @aperi21/authoring
```

## 쓰는 법

```ts
import { getAperi21Concepts, getAperi21Concept } from '@aperi21/authoring';

const all = getAperi21Concepts();                   // 전체
const one = getAperi21Concept('free-fall', 'ko');   // 하나
```

`locale` 을 주면 `briefing.screen.labels` 가 그 언어의 화면 문자열로 해석된다
(기본 `en`). 그 언어가 화면에 없으면 영어가 나오고 반환값의 `locale` 이 `'en'` 이
된다. 나머지 필드는 영어 단일이다.

## 두 종류의 필드

| | 쓰임 |
| --- | --- |
| `surface` | **임베딩 재료.** "이 글에 어떤 개념이 맞는가" 를 가리는 데만 쓴다. `definitionHash` 가 그대로면 다시 임베딩할 필요가 없다. |
| `briefing` | **선택 이후 재료.** 화면에서 실제로 무엇이 관찰되는지, 어떤 용어를 써야 글과 화면이 맞물리는지. |

`briefing.useWhen` 은 같은 개념에 화면이 둘 있을 때 무엇을 고를지 가리고,
`avoidWhen` 은 검색이 만드는 오검출을 되돌린다. `domain` 은 호스트 카탈로그
(`getAperi21Catalog`)의 `domain` 과 같은 값이다.

## 의존 0

이 패키지는 어떤 `@aperi21/*` 패키지도 import 하지 않는다. 소비자가 브라우저
런타임이 아니라 호스트의 LLM 서버이기 때문에, 개념 메타를 읽는 대가로 렌더러
코드가 딸려오면 안 된다.

## 라이선스

[MIT](./LICENSE) © Mintae Kim
