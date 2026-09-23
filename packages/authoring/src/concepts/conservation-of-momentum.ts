/**
 * conservation-of-momentum 개념 선언.
 *
 * 형제는 `explosion-and-recoil` · `center-of-mass-motion` · 충돌 다섯. **무엇이 주장인가**로
 * 갈랐다.
 *   conservation-of-momentum  합이 그대로라는 것 자체 — 그리고 **계 밖이 밀면 옮겨 간다**
 *   explosion-and-recoil      합 0 에서 나오는 결과(속력이 질량에 반비례)
 *   center-of-mass-motion     합이 그대로라는 것의 기하 — 한 점이 제 길을 간다
 *   충돌 다섯                 종류별로 무엇이 남는가 · 어떻게 갈리는가
 * 이쪽만 계의 안팎 · 외력 · 「언제 안 지켜지는가」 어휘를 갖는다. 에너지 · 성분 · 붙어
 * 가는 속력은 말하지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const conservationOfMomentumConcept: Aperi21ConceptSource = {
  id: 'conservation-of-momentum',
  label: 'Conservation of Momentum and the Boundary of the System',
  canonicalSim: 'aperi21:conservation-of-momentum',

  surface: {
    definition:
      'The momentum a group of bodies holds between them, which keeps its value however fiercely the shares move while they push one another, and moves only when something outside pushes.',
    exemplarKeywords: [
      'conservation of momentum',
      'isolated system',
      'closed system',
      'total momentum before and after',
      'internal forces cannot change the total',
      'what counts as inside the system',
      'when is momentum not conserved',
      'an outside force breaks the conservation',
      'momentum of a pair of carts',
      'why the sum stays the same',
    ],
  },

  briefing: {
    observable: [
      'Two carts run on a rail, the right-hand one about twice the size of the left, and above them three rows of arrows keep their momenta.',
      'The upper two rows hold one cart’s momentum each, laid so that the second starts where the first ends, joined by a dotted line, which makes the far end of the pair the total.',
      'The lower row is the total itself, drawn in the accent colour from zero to that far end, with a dashed upright marker standing where the total began and staying there for the whole run.',
      'While the carts press on each other through a spring bumper for more than a second, the left arrow shrinks, passes through nothing and turns around, and the right arrow swings from one side to the other and grows — and through all of that the far end does not leave the marker.',
      'Inside each cart during that push there is one arrow, and the two are the same length and point opposite ways.',
      'The left cart then runs into a bumper on a wall. This time there is only one such arrow, inside that cart alone, with nothing to pair it.',
      'While the wall is pushing, the far end of the total leaves the marker and travels to the right, and a gap is left standing between the marker and the end for the rest of the run.',
      'The same bumper is used for both pushes, so the two look alike and the only thing that differs is who is doing the pushing.',
      'Nothing on the screen carries a number; the carts are drawn hollow so the arrows inside them can be read.',
    ],

    screen: {
      affordances: [
        'The approach, the push between the carts, the drifting apart and the push from the wall run in order and then begin again; nothing has to be pressed.',
        'The push is spread over more than a second rather than happening in an instant, so the shares can be watched changing while the end stands still.',
        'The joining of the two arrows end to end turns the total into a place rather than a sum to be worked out, and the marker gives that place something to be compared against.',
        'The accent colour is kept for the total alone; a pair of arrows against a lone arrow is the whole of what says inside or outside.',
        'No number or scale is drawn — what is being read is whether a tip is where it was.',
      ],
    },

    useWhen: [
      'The article has stated that momentum is conserved in an isolated system and the reader has no picture of what the word isolated is paying for. Running the same push once between the carts and once against a wall is what gives the condition a shape.',
      'The reader believes conservation means nothing much is happening, and a case is wanted where both shares move violently — one of them reversing outright — while the total does not stir.',
    ],

    avoidWhen: [
      'The question is what becomes of the kinetic energy in the collision, or whether it is kept. Nothing about energy is drawn here, and the article would find no purchase.',
      'The collision in the article is a glancing one and the point is that the sideways and up-and-down totals hold separately. Everything here happens along one rail.',
      'The bodies in the article stick together and the point is the speed they go on at.',
      'The bodies begin at rest and fly apart, and the point is the speeds that follow.',
      'The subject is a single body and what one push does to it — how much momentum an impact delivers.',
      'Values in kilogram metres per second are needed, or a before-and-after sum is to be worked out.',
    ],

    contrastWith: [
      {
        concept: 'two-dimensional-collision',
        note: 'One keeps a single total along one line and asks what can move it; the other asks what the total even means once the motion leaves that line — two sums that hold apart from each other.',
      },
      {
        concept: 'explosion-and-recoil',
        note: 'One is about the total holding its value; the other takes that total to be nothing at the start and reads off what it then forces on the two speeds.',
      },
      {
        concept: 'center-of-mass-motion',
        note: 'One says the sum of the momenta cannot be changed from inside; the other says what that costs geometrically — one particular point keeps the path it was given.',
      },
      {
        concept: 'energy-in-collision',
        note: 'One asks when the total momentum holds and when an outside push breaks it; the other holds the system closed throughout and asks which of two quantities survives the collision.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One is about what the equal and opposite pair leaves untouched — the total; the other is about the pair itself, that a push is never one-sided.',
      },
    ],
  },
};
