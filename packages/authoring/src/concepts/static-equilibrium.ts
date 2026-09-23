/**
 * static-equilibrium 개념 선언.
 *
 * 돌림힘의 균형 형제 셋 가운데 **두 조건을 말하는 쪽**이다.
 *   torque              한 번의 돌림이 일어난다 — 팔 길이가 크기를 정한다
 *   static-equilibrium  합이 0 인데도 돈다 — **둘 다** 0 이어야 멈춰 있다
 *   center-of-gravity   기울인 몸이 되돌아오나 넘어지나 — 선이 받침 안인가 밖인가
 * 이쪽만 두 조건 · 짝힘 · 작용선 · 강체의 정지 어휘를 갖는다. 팔 길이 · 손잡이(저쪽 것)도,
 * 받침 · 넘어짐 · 무게(저쪽 것)도 쓰지 않는다. `equilibrium-of-forces` 와는 대상이 갈린다 —
 * 저쪽은 점, 이쪽은 크기를 지닌 물체다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const staticEquilibriumConcept: Aperi21ConceptSource = {
  id: 'static-equilibrium',
  label: 'Static Equilibrium',
  canonicalSim: 'aperi21:static-equilibrium',

  surface: {
    definition:
      'The state of a rigid body truly at rest, needing both the forces on it and their turnings to cancel, since either condition alone still leaves it moving.',
    exemplarKeywords: [
      'static equilibrium',
      'the two conditions for equilibrium',
      'sum of forces zero and sum of torques zero',
      'balanced forces but it still rotates',
      'a couple',
      'rigid body in equilibrium',
      'why is zero net force not enough',
      'equal and opposite forces that are not in line',
      'equilibrium of an extended body',
      'keeping a beam from turning as well as from moving',
    ],
  },

  briefing: {
    observable: [
      'Two identical bars lie on a frictionless table, seen from directly above, each pushed by two arrows of the same length from opposite sides, so that the forces on each bar add to nothing.',
      'To begin with, both pairs press along one and the same line, drawn as a dotted line through the bar, and both bars simply lie there.',
      'One of the two arrows on the right-hand bar is then slid out towards the end of that bar. Neither its length nor its direction changes, so the forces still add to nothing.',
      'From the moment that dotted line splits into two parallel lines, the right-hand bar begins to turn, and it turns faster as it goes.',
      'The arrows stay fixed to the bar and turn with it, always square to its face.',
      'The ground each half of the bar sweeps is left behind as an accent-coloured sector, and the two sectors meet at a small crosshair that is fixed to the table and never moves.',
      'The right-hand bar turns through about a hundred and thirty degrees while its centre stays exactly on that crosshair.',
      'The left-hand bar lies flat through the whole of it, so the case where both conditions hold is on the screen beside the case where only one does.',
      'A dotted outline of the starting position stays behind, which is what the swept sector is read from.',
    ],

    screen: {
      affordances: [
        'The still stage, the sliding of the one arrow, the turning and the fading run in order by themselves and then come round with both bars set flat again.',
        'The two bars are put side by side rather than shown one after another, so the balanced case is still on the screen while the unbalanced one is turning.',
        'Only one of the four arrows is ever moved, which keeps the difference between the two bars down to a single thing.',
        'The bars are free to slide on the table, so a centre that stays put is a result and not a fixing.',
        'The turning is stopped short of a full revolution, so the two swept sectors stay readable rather than closing into a circle.',
        'The accent colour is kept for the swept angle of the right-hand bar; the bars, the arrows, the lines of action and the crosshair are all drawn in the same neutral ink.',
      ],
    },

    useWhen: [
      'The article has given the two equilibrium conditions as a pair and the reader is treating the second as a formality. A bar with no net force on it turning steadily in place is what the second condition is for.',
      'A couple has to be introduced — two equal and opposite forces that add to nothing and still turn a body — and a case is wanted in which the centre demonstrably stays where it was.',
    ],

    avoidWhen: [
      'The body in question is a point rather than an extended one, and the only question is whether the pulls on it close. The whole claim here is that closing them is not enough.',
      'Weight, a support or a fixed pivot is part of the argument, or the body hangs from or rests on something. These bars float on a frictionless table with two forces each.',
      'Whether a tilted body rights itself or goes over is the question. Nothing tips here; the turning is in the plane of the table.',
      'Values are wanted — forces, torques, angles. Nothing on the screen is numbered.',
      'The subject is one force turning a body and how far out from the pivot it is applied. Here the two forces are always equal and opposite, and it is their lines rather than their size that is at issue.',
    ],

    contrastWith: [
      {
        concept: 'torque',
        note: 'One says a body can be left with no force at all on it and still be turned; the other says how much turning a single force produces.',
      },
      {
        concept: 'equilibrium-of-forces',
        note: 'One is about a point that has nothing left to move it; the other about an extended body that has nothing left to move it and still has something left to turn it.',
      },
      {
        concept: 'center-of-gravity',
        note: 'One asks what a body needs in order not to move at all; the other asks, of a body already tilted, which way it will go.',
      },
      {
        concept: 'balance-scale',
        note: 'One shows the second condition failing, so the body turns; the other shows it holding, with weight and distance traded against each other.',
      },
    ],
  },
};
