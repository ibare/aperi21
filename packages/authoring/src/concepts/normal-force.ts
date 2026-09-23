/**
 * normal-force 개념 선언.
 *
 * 위험한 짝은 `apparent-weight`. 둘 다 "받치는 힘이 무게와 다를 수 있다" 를 말한다.
 * **주어를 갈랐다.**
 *   normal-force     **접촉면**이 얼마나 미는가 — 뚫리지 않을 만큼만, 밖에서 힘 화살표로 본다
 *   apparent-weight  **저울 눈금**이 무엇을 가리키는가 — 속도가 바뀌는 동안에만 평소와 다르다
 * 이쪽에서 달라지는 까닭은 **다른 힘이 더해지거나 접촉이 끊기는 것**이고, 저쪽은
 * **가속하는 것**이다. 이쪽은 N 단위 수치를, 저쪽은 kg 눈금판을 갖는다.
 *
 * 화면에 기울인 면이 없다. 주제 visualNote 의 경사는 장부에 남겼다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const normalForceConcept: Aperi21ConceptSource = {
  id: 'normal-force',
  label: 'Normal Force',
  canonicalSim: 'aperi21:normal-force',

  surface: {
    definition:
      'The push a contact surface gives back, sized at whatever is needed to keep the body from being driven into it, so that it falls when the body is lifted and rises when the body is pressed.',
    exemplarKeywords: [
      'normal force',
      'the support force from a surface',
      'is the normal force always equal to the weight',
      'how hard does the floor push up',
      'perpendicular push of a contact surface',
      'reaction from the ground',
      'normal force when something pulls the object up',
      'normal force goes to zero when contact is lost',
      'support force on a resting object',
      'the floor pushes back only as much as needed',
    ],
  },

  briefing: {
    observable: [
      'A box sits on a floor with a rod reaching down to it from above, and three arrows are drawn with their sizes written in newtons beside them — the weight, the rod’s force and the floor’s push.',
      'The floor’s push is the only arrow in the accent colour, so what is being tracked needs no legend.',
      'The rod pulls upward and grows stronger; as it does, the number on the floor’s push comes down while the weight stays exactly as it was.',
      'The floor itself dents under the box, and the dent shallows as the floor’s push weakens, so the surface is seen doing work rather than merely labelled.',
      'When the pull matches the weight the floor’s push reads zero, and the caption says the floor does not push at all.',
      'Pull harder still and the box leaves the floor and hangs in the air with no push arrow at all — the caption says the floor has nothing left to push.',
      'The rod lets go, the box comes down through the air with the floor still pushing nothing, and lands.',
      'The rod then presses downward instead, the dent deepens, and the number on the floor’s push climbs above the weight by exactly what the press adds.',
      'With the rod giving nothing the floor’s push reads the weight and no more, which is the one case in which the two numbers agree.',
    ],

    screen: {
      affordances: [
        'The pulling, the lifting off, the fall, the landing and the pressing run in one cycle on their own and repeat, so every case — less than the weight, zero, more than the weight, equal to it — is reached without anything being asked for.',
        'The three numbers are on screen together at every instant, so a change in one can be checked against what the others did.',
        'The caption is chosen from what the numbers actually show rather than from the clock, so the sentence and the figures cannot disagree.',
      ],
    },

    useWhen: [
      'The reader has learnt the normal force as "equal to the weight" and is applying it everywhere. The rod pulling up while the weight stays fixed and the support number falls is the case that breaks the rule.',
      'The article needs a surface whose push is a response rather than a property, and wants the reading to reach zero while the body is still an instant from leaving.',
      'The writing is about contact forces vanishing at separation, and a moment is wanted where the arrow is gone and the body is in the air.',
    ],

    avoidWhen: [
      'The surface is tilted or the body is on a slope. The floor is level throughout and no incline is drawn.',
      'The article is about a scale reading inside an accelerating vehicle, or about weight seeming to change while moving. The box is pulled and pressed by a rod, not carried by anything.',
      'The subject is friction, sliding or a body being dragged along the surface. All the forces here are vertical and the box never moves sideways.',
      'The point is that the two halves of a contact are equal and opposite. Only the push on the box is drawn; the push the box gives the floor is not.',
      'The article is about listing the forces on a chosen body, or deciding which forces to draw at all. The same three are drawn the whole time and only their sizes change.',
    ],

    contrastWith: [
      {
        concept: 'apparent-weight',
        note: 'One is the surface’s push changing because something else pulls or presses on the body; the other is a reading changing because the body and the surface are accelerating together.',
      },
      {
        concept: 'free-body-diagram',
        note: 'One asks what fixes the size of the support at a contact; the other asks which body the support goes on when the two are separated.',
      },
      {
        concept: 'newtons-third-law',
        note: 'One says the size of a surface’s push is settled by what it must resist; the other says whatever that size is, the body gives the same back.',
      },
      {
        concept: 'static-friction',
        note: 'Both are pushes a surface supplies to order — one at right angles to the surface, matched to what would drive the body through it, the other along the surface, matched to what would slide it.',
      },
    ],
  },
};
