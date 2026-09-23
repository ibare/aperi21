/**
 * static-friction 개념 선언.
 *
 * 위험한 짝은 `kinetic-friction`. **주장을 갈랐다.**
 *   static-friction   움직이기 **전** — 당기는 만큼 똑같이 커지며 버티다 한계에서 놓친다
 *   kinetic-friction  미끄러지는 **동안** — 빠르기와 상관없이 크기가 하나다
 * 이쪽만 문턱 · 한계 · "따라 커진다" · "아직 움직이지 않는다" 어휘를 갖는다. 저쪽의
 * 「같은 만큼씩 느려진다」 · 두 줄 견줌은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const staticFrictionConcept: Aperi21ConceptSource = {
  id: 'static-friction',
  label: 'Static Friction',
  canonicalSim: 'aperi21:static-friction',

  surface: {
    definition:
      'The hold a surface keeps on a body that has not moved yet, growing to match the pull exactly however that pull grows, until a limit past which it cannot match and lets go.',
    exemplarKeywords: [
      'static friction',
      'friction before something starts to move',
      'why does it not move when I push it',
      'the force needed to get it going',
      'limiting friction',
      'threshold at which it starts to slide',
      'friction matches the applied force',
      'maximum static friction',
      'pushing a heavy box that will not budge',
      'it suddenly gives way and slides',
    ],
  },

  briefing: {
    observable: [
      'A box rests on a floor drawn with hatching so the surface reads as rough, and two arrows come out of it in opposite directions — the pull applied to it, and the friction from the floor.',
      'The pull grows steadily, and the friction arrow grows with it and stays exactly the same length at every instant, so the matching is read from the picture rather than asserted.',
      'A dashed line with an upright tick beside it marks how far the friction can go, carrying a written name for the limit, and it darkens as the arrows approach it.',
      'All the while the box has not moved at all — the arrows change and the box does not.',
      'The friction arrow reaches the limit mark and at that moment the box begins to slide.',
      'Once sliding, the friction arrow is shorter than the limit it had just reached, and it stays that one length while the box goes.',
      'The caption before the threshold says friction grows just as much as the pull and holds; at the threshold it says the hold is lost and the box slides.',
      'The scene fades and comes round again with the pull already part way up, so the run is met in the middle of the growing rather than at the start.',
    ],

    screen: {
      affordances: [
        'The pull grows on its own from small to past the limit, so the whole approach to the threshold is watched in one unbroken stretch and the moment of giving way is not missed.',
        'The limit mark stays in place while the arrows grow against it, which is what makes "how much is left" something to see.',
        'The pull, the friction and the limit are drawn in three different colours and the limit alone is in the accent colour, so which arrow is the floor’s answer and which is the boundary needs no legend.',
      ],
    },

    useWhen: [
      'The reader treats friction as one fixed number. Watching the friction arrow track a growing pull step for step, with the box still not moving, makes it a response rather than a constant.',
      'The article is about a threshold — a quantity that holds and then gives way all at once — and a case is wanted where the approach to it is drawn against a marked boundary.',
      'The writing needs the fact that the force it takes to start something moving is larger than the force it takes to keep it going, and the drop in the arrow at the moment of slipping is the evidence.',
    ],

    avoidWhen: [
      'The body is already sliding and the question is what friction does during the slide. Almost all of this run is spent before anything moves.',
      'The point is that friction does not depend on how fast the body goes. There is only one box here and only one speed history.',
      'A coefficient of friction is needed, or the limit has to be related to the weight or the normal force. Neither the weight nor the surface’s upward push is drawn and no values appear.',
      'The subject is a surface pushing at right angles to itself. Both arrows here lie along the floor.',
      'The article is about a body held still by forces that balance in general. The balance here is of one particular kind — a surface answering a pull — and the box is always on the verge.',
    ],

    contrastWith: [
      {
        concept: 'kinetic-friction',
        note: 'One is friction before motion, whose size is set by whatever is trying to move the body; the other is friction during motion, whose size is set by nothing the motion does.',
      },
      {
        concept: 'normal-force',
        note: 'Both are what a surface supplies as needed — one along the surface against being slid, the other across it against being driven through — and only one of the two has a limit it can reach.',
      },
      {
        concept: 'net-force',
        note: 'One is a force that keeps the remainder at nothing until it cannot any longer; the other is what happens once a remainder exists.',
      },
      {
        concept: 'newtons-first-law',
        note: 'One shows a body kept at rest by a force that answers every attempt to move it; the other shows a body kept in motion because nothing acts on it at all.',
      },
    ],
  },
};
