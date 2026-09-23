/**
 * net-force 개념 선언.
 *
 * 형제는 `newtons-second-law` 와 `free-body-diagram`. **주장을 갈랐다.**
 *   net-force           여러 화살표를 끝과 끝으로 이어 **하나로 줄인다** — 남은 하나가 방향을 정한다
 *   newtons-second-law  힘과 결과의 **비례** — 배수만큼 속도가 붙는다
 *   free-body-diagram   힘이 **누구 것인가** — 목록에 오를 자격
 * 이쪽만 합성 · 이어 붙이기 · "가장 센 힘 쪽이 아니다" 어휘를 갖는다. 배수 · 비례라는 말과
 * 물체를 떼어 낸다는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const netForceConcept: Aperi21ConceptSource = {
  id: 'net-force',
  label: 'Net Force',
  canonicalSim: 'aperi21:net-force',

  surface: {
    definition:
      'The single arrow that several forces on one body come to when laid tip to tail, whose direction the body then takes rather than the direction of the strongest one among them.',
    exemplarKeywords: [
      'net force',
      'resultant force',
      'adding forces as vectors',
      'tip to tail addition of arrows',
      'which way will it actually move',
      'combining several pushes and pulls',
      'vector sum of forces',
      'the strongest force is not the direction of motion',
      'replacing many forces with one',
      'resultant of three forces',
    ],
  },

  briefing: {
    observable: [
      'A body is drawn as a single filled circle with three arrows of different lengths and directions reaching out from it.',
      'The second arrow slides until its tail meets the tip of the first, then the third slides until its tail meets the tip of the second, so a chain is built out of arrows that had all started at the body.',
      'The three chained arrows fade back as one new arrow, drawn in the accent colour and thicker than the rest, grows from the tail of the first to the tip of the last.',
      'That single arrow points somewhere none of the three original arrows pointed.',
      'The body then sets off, and its direction is the direction of the grown arrow and not the direction of the longest of the three.',
      'Dots are dropped behind the body at equal intervals of time, and they open out as it goes, so the motion is seen to be a speeding up rather than a drift.',
      'The caption names each step — join the three tip to tail, one arrow remains, the object speeds up along this arrow rather than along the strongest force.',
      'Each time the run comes round a different combination of three forces is used, so the result is not read as a property of one arrangement.',
    ],

    screen: {
      affordances: [
        'The sliding, the growing of the single arrow and the setting off happen in order and then begin again with the next of three force combinations.',
        'The accent colour is kept for the resulting arrow alone, so which arrow is the outcome and which are the ingredients needs no legend.',
        'The three original arrows all start at the body before the chaining begins, so the chain is visibly a rearrangement of forces that act at one place.',
      ],
    },

    useWhen: [
      'The reader has been told to add forces as vectors and is treating it as arithmetic. Watching arrows walk into a chain and a different arrow emerge makes the sum a thing that happened to the picture.',
      'The article needs to break the habit of predicting motion from the biggest arrow, and a case is wanted where the outcome points somewhere none of the ingredients did.',
    ],

    avoidWhen: [
      'The forces named in the article act on different bodies and the point is the pair. Every arrow here belongs to the one circle.',
      'The question is how much speed a given force produces, or what happens when the force is doubled. The combinations change direction and arrangement, not a multiple of one push.',
      'The subject is a body at rest because its forces balance. The remainder here is never nothing; the body always sets off.',
      'A force has to be split into components along chosen directions. The chaining here only goes the other way, from several arrows to one.',
      'Sizes in newtons are needed, or the arrows have to be measured. No values are written.',
      'The article is about deciding which forces act on a chosen body in the first place. The three are given from the start and nothing is added or struck out.',
    ],

    contrastWith: [
      {
        concept: 'newtons-second-law',
        note: 'One reduces several forces to one; the other takes one force and says how much motion it produces.',
      },
      {
        concept: 'free-body-diagram',
        note: 'One adds up a list that is already settled; the other is about how that list is settled — which forces are on this body and which belong to its neighbour.',
      },
      {
        concept: 'newtons-first-law',
        note: 'One is what the remainder does when there is one; the other is the case where there is none, and the motion is simply left as it was.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One says which way the forces leave a body pointed; the other says what a body pointed that way does to its velocity, including when the two disagree.',
      },
    ],
  },
};
