/**
 * torque 개념 선언.
 *
 * 돌림힘의 균형을 다루는 형제 둘(`static-equilibrium` · `center-of-gravity`)과 **주장을 갈랐다.**
 *   torque              한 번의 돌림이 **일어나는 것** — 같은 힘도 두 배 먼 자리면 두 배 각
 *   static-equilibrium  두 조건이 **둘 다** 필요하다 — 합이 0 이어도 돈다
 *   center-of-gravity   기울인 몸이 **되돌아오나 넘어지나** — 선이 받침 안인가 밖인가
 * 이쪽만 팔 길이 · 미는 자리 · 손잡이 · 렌치 어휘를 갖는다. 「균형」 · 「받침」 · 「넘어진다」 는
 * 쓰지 않는다. `moment-of-inertia` 와는 무엇을 움직이는가로 갈린다 — 이쪽은 힘의 자리,
 * 저쪽은 물체의 질량.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const torqueConcept: Aperi21ConceptSource = {
  id: 'torque',
  label: 'Torque',
  canonicalSim: 'aperi21:torque',

  surface: {
    definition:
      'The turning a push produces on a hinged body, set by how far out from the hinge it acts, so the same force applied twice as far out sweeps twice the angle.',
    exemplarKeywords: [
      'torque',
      'moment of a force',
      'lever arm',
      'why the door handle sits far from the hinges',
      'a longer spanner loosens a tight bolt',
      'turning effect of a force',
      'pushing near the hinge barely moves the door',
      'force times distance from the pivot',
      'where you push matters as much as how hard',
      'the arm is what does the work',
    ],
  },

  briefing: {
    observable: [
      'Two identical doors are seen from directly above, each on its own hinge, drawn in the same ink and starting shut.',
      'An arrow of the same length, marked F, presses on each door and stays square to the door face throughout; the one thing that differs between the two is where it presses — one at a distance r from the hinge, the other at 2r.',
      'A dimension line with the mark r or 2r runs along each door on the side the door swings away from, so the arm is given as a length rather than described.',
      'Both doors start from rest and the ground they sweep stays behind them, filled in the accent colour.',
      'The right-hand sector is twice as wide as the left one at every moment of the swing, not only at the end, and the marks θ and 2θ sit just outside the two arcs.',
      'A dotted line keeps the shut position, which is what the swept angle is read from.',
      'The right-hand door reaches about a quarter turn while the left one is about half that.',
      'The arrows stay pressed while the doors fade out at the end of the run, so no door is ever seen to stop with a force still on it; the next run sets both doors shut again with the same two arrows.',
    ],

    screen: {
      affordances: [
        'The swing, the fading and the resetting run in order on their own and then begin again, so the whole comparison comes round without being asked for.',
        'The two doors are given the same ink, the same size and arrows of the same length, which leaves the place of the push as the single difference.',
        'The pushing stage runs about three seconds, long enough that the two sectors can be compared while they are still widening rather than only once they have stopped.',
        'The accent colour is kept for the swept angle alone, so which part of the picture is the result needs no legend.',
        'The view is taken from above, in the plane the doors turn in, so the angles are seen at their full size.',
      ],
    },

    useWhen: [
      'The article has given torque as a force times a distance and the reader is treating the distance as bookkeeping. Two identical doors taking the same push and opening by different amounts makes the arm a thing that acts.',
      'An everyday case is wanted for why handles, spanners and pedals are put far from their pivots, and the ratio has to be seen rather than worked out.',
    ],

    avoidWhen: [
      'The article turns on a force meeting the body at a slant, with only part of it doing the turning. Both arrows here stay square to the door face from beginning to end.',
      'Values in newton metres are wanted, or a number has to be read off. The screen carries only the marks for the arm and for the swept angle.',
      'The subject is a body held still because its turnings cancel. Nothing is balanced here; both doors open and go on opening.',
      'The point is that the same turning meets different resistance depending on how a body carries its mass. The two doors are the same door, and only the place of the push differs.',
      'A direction along the axis, or the right-hand rule, is what the article needs. The picture is flat and the turning is seen as a widening angle.',
    ],

    contrastWith: [
      {
        concept: 'moment-of-inertia',
        note: 'One is about what the force brings to a turning — where it is applied; the other about what the body brings to it — where its mass sits.',
      },
      {
        concept: 'static-equilibrium',
        note: 'One says how much a force turns a body; the other says a body can be left with no force at all on it and still be turned.',
      },
      {
        concept: 'balance-scale',
        note: 'One watches a single turning with nothing to oppose it, so something happens; the other watches two turnings matched against each other, so nothing does.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'One stops at the turning a force produces from a distance; the other follows the trade through to what the hand pays in distance for the force it saves.',
      },
      {
        concept: 'angular-acceleration',
        note: 'One names what makes a body start turning; the other names the growth in the rate of turning itself, however it was brought about.',
      },
    ],
  },
};
