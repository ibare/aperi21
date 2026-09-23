/**
 * tension 개념 선언.
 *
 * 줄 형제 셋 가운데 하나다. **주어와 주장을 셋으로 갈랐다.**
 *   tension           주어는 **한 가닥 줄** — 어디를 끊어 재도, 도르래로 꺾인 뒤에도 같은 크기다
 *   pulley-system     주어는 **장치** — 받치는 가닥이 늘면 힘이 줄고 당길 거리가 그만큼 는다
 *   connected-bodies  주어는 **묶인 물체들** — 어떻게 나눠 이어도 가속도는 하나다
 * 이쪽만 전달·꺾임·같은 눈금 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const tensionConcept: Aperi21ConceptSource = {
  id: 'tension',
  label: 'Tension in a Rope',
  canonicalSim: 'aperi21:tension',

  surface: {
    definition:
      'The pull carried along a single rope, arriving at the same size wherever it is measured and losing nothing where the rope bends around a pulley.',
    exemplarKeywords: [
      'tension in a rope',
      'is the tension the same throughout the string',
      'does a pulley reduce the tension',
      'tension on both sides of a pulley',
      'massless inextensible string',
      'force transmitted along a cord',
      'spring scale spliced into a rope',
      'tug of war rope pulls both ways',
      'the rope hands on what it is given',
      'tension after the rope turns a corner',
    ],
  },

  briefing: {
    observable: [
      'A rope runs from a hand at the left, straight across, up over a pulley hung from the ceiling on the right, and down to a ring anchored in the floor.',
      'Three spring scales are spliced into that one rope — two along the horizontal run, one near the hand and one just short of the pulley, and a third in the vertical run below it.',
      'Each scale has a graduated face, a needle and its reading written in newtons, and the three readings are the same number at every moment.',
      'When the pull grows the three springs lengthen together by the same amount, and when it eases they shorten together.',
      'The scripted pull works up to seventy newtons, down to fifteen, back to fifty and settles near thirty, and all three needles follow it in step the whole way.',
      'The third scale, hanging beyond the turn around the pulley, reads exactly what the two before it read although its stretch of rope points at right angles to theirs.',
      'The caption names the one number the three of them agree on and says it holds even past the turn.',
      'Hatching above the ceiling line and below the floor line marks both ends of the arrangement as fixed, so the only thing being varied is how hard the hand pulls.',
    ],

    screen: {
      affordances: [
        'The hand can be taken hold of and dragged; only how far it moves sideways counts, and that sets the pull anywhere from nothing up to eighty newtons.',
        'Let the hand go and the pull blends back into the script over about eight tenths of a second, so it never jumps.',
        'Left alone the script runs on its own — hard, slack, hard again, then settling — and repeats.',
        'The three faces are graduated alike, so the needles can be read against one another rather than against their numbers.',
      ],
    },

    useWhen: [
      'The reader suspects a rope hands on less than it was given, or that turning a corner over a pulley costs something on the way. Dragging the hand out to a pull of their own choosing and finding all three needles on the same mark, the one past the turn included, is what answers it.',
      'The article is about to write the same letter at both ends of a rope, and needs the step where a single rope is licensed to carry a single quantity.',
    ],

    avoidWhen: [
      'A heavy rope, a sagging cable or a rope that stretches is the subject. The scales stretch, but the rope between them does not, and nothing hangs in a curve.',
      'Two ropes meeting at an angle, a knot, or a load shared out between several ropes. One rope runs through here from the hand to the anchor.',
      'The point is that an arrangement of pulleys lets a small pull raise a large load. The pulley here only turns the rope; nothing is lifted and there is no load.',
      'The argument turns on what the rope does to the motion of bodies tied to it. Nothing here accelerates — the two ends are a hand and a fixed ring.',
      'A number is wanted for a weight, a mass or a length. The only values on screen are the three identical readings.',
    ],

    contrastWith: [
      {
        concept: 'pulley-system',
        note: 'One says what a single rope carries — the same amount everywhere; the other counts how many strands of such a rope hold a load, and what that count buys and costs.',
      },
      {
        concept: 'connected-bodies',
        note: 'One is about the rope itself and what it hands on; the other is about the bodies a rope ties together and the single acceleration they end up sharing.',
      },
      {
        concept: 'spring-force',
        note: 'Here a stretched spring is only a way of reading a pull; there the stretch is the subject and the pull is the thing proportional to it.',
      },
    ],
  },
};
