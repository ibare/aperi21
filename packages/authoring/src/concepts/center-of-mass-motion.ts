/**
 * center-of-mass-motion 개념 선언.
 *
 * 형제는 `conservation-of-momentum` · `explosion-and-recoil`. 셋 다 「안에서 주고받는
 * 힘은 계를 바꾸지 못한다」 에서 나오지만 **주장하는 것이 다르다.**
 *   center-of-mass-motion     한 점이 **미리 그어 둔 길**을 벗어나지 않는다 — 기하
 *   conservation-of-momentum  합이 그대로라는 것, 그리고 계 밖이 밀면 옮겨 간다 — 경계
 *   explosion-and-recoil      합 0 이 강제하는 두 속력의 비 — 결과
 * 이쪽만 질량 중심 · 「어느 점이 궤적을 따르는가」 · 도는 · 출렁이는 어휘를 갖는다.
 * 운동량 화살표도 합도 화면에 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const centerOfMassMotionConcept: Aperi21ConceptSource = {
  id: 'center-of-mass-motion',
  label: 'Motion of the Centre of Mass',
  canonicalSim: 'aperi21:center-of-mass-motion',

  surface: {
    definition:
      'The single point of a thrown body that keeps the path it was given at release, untouched by whatever the parts do to one another as they turn, stretch and finally fly apart.',
    exemplarKeywords: [
      'centre of mass',
      'center of mass motion',
      'internal forces cannot shift the centre of mass',
      'a tumbling hammer thrown through the air',
      'a spanner spinning as it flies',
      'which point actually follows the parabola',
      'a firework shell bursting in flight',
      'the system as a whole keeps going',
      'the pieces scatter but the average does not',
      'treating an object as a single point',
    ],
  },

  briefing: {
    observable: [
      'The whole curved path is drawn as a dashed line from the very start, before anything has been thrown, so it stands as a prediction waiting to be met.',
      'An accent point and the accent trail it leaves cover that dashed line as they go, so the prediction and the outcome lie one on top of the other.',
      'Around that point two lumps of different size, joined by a spring, turn end over end and stretch and shorten, leaving two thin grey trails that wander and cross each other.',
      'One smooth accent curve and two winding grey curves are therefore on the screen at the same time, running side by side.',
      'Partway through, the spring lets go and pushes the lumps apart; for that moment alone a pair of arrows named `F` and `−F` appear on them, always the same length as each other and pointing opposite ways.',
      'The lumps then scatter far apart, a faint dotted line drawn between them, and the accent point sits on that line nearer the heavier lump, still riding the dashed path down.',
      'The lumps fade out before anything could reach a ground, and no ground, axis or number is drawn anywhere.',
      'The point is named once, beside where the throw began, in the same colour as the point and its trail.',
    ],

    screen: {
      affordances: [
        'One row of chips picks how hard the two lumps are pushed apart — not at all, gently, or hard — and picking one throws again from the beginning.',
        'The chips change the two lumps’ paths enormously while the accent trail does not move at all, which is how the reader settles for themselves that the sameness is not an accident of one setting.',
        'The dashed path is drawn in full in advance rather than being traced out, so the accent trail arrives on a line that was already there.',
        'The accent colour is kept for the centre of mass alone — point, trail and name — and the two lumps share one colour, their masses said by their sizes.',
        'Nothing is measured or numbered, because what is being read is whether a point lies on a line.',
      ],
    },

    useWhen: [
      'The article has said that internal forces cannot move the centre of mass, and a case is wanted where the inside is made as violent as it can be — turning, stretching, and then coming apart — while the prediction still holds.',
      'The reader has been told a thrown object follows a parabola and is troubled because real thrown objects wobble. Naming which point follows it is what settles that.',
      'The article needs the reader to check the claim themselves rather than take it, and the chips make the internal push something they choose.',
    ],

    avoidWhen: [
      'The subject is where the centre of mass of a shape lies, or how to find it — balancing a plate, hanging a shape from two points, adding up weighted positions. Here the point is simply drawn and never located.',
      'The article follows the pieces to the ground, or to a bounce or landing. Nothing reaches a ground here, and the claim would end at the moment it did.',
      'The bodies in the article begin at rest and the point is the speeds they fly apart with.',
      'The subject is turning itself — how fast it spins, angular momentum, torque about the centre. The turning happens but is never measured or named.',
      'The article wants momentum arrows, a total, or a boundary drawn around the system. None of that is on the screen.',
      'Values are wanted — a height, a range, a mass ratio in numbers.',
    ],

    contrastWith: [
      {
        concept: 'conservation-of-momentum',
        note: 'One is the geometric form of the same fact — a particular point keeps its path; the other is the bookkeeping form — a total keeps its value, and only an outside push can move it.',
      },
      {
        concept: 'explosion-and-recoil',
        note: 'One says the average point is untouched by the bursting apart; the other says what the bursting does to each piece, which speed each is left with.',
      },
      {
        concept: 'projectile-motion',
        note: 'One takes the parabola as settled and asks which point of a complicated body actually rides it; the other is about the parabola itself, and why a single body traces one.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One shows what the equal and opposite pair cannot do — move the average point; the other is about the pair itself and that neither push comes without the other.',
      },
    ],
  },
};
