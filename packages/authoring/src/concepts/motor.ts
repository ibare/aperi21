/**
 * motor 개념 선언.
 *
 * 이쪽의 주장은 **「왜 한 번 기울고 마는 것이 아니라 계속 도는가」** — 정류자다.
 *   motor          두 변이 **반대 힘**을 받아 짝을 이루고, 수직 자리마다 전류를 **뒤집어** 한쪽으로 돈다
 *   ac-generation  같은 극 사이 같은 고리를 **손으로 돌려** 전압을 얻는 반대 방향
 *   torque         힘이 **어디에** 걸리느냐가 도는 정도를 정한다 (전류 · 장이 없다)
 * 이쪽만 「정류자 · 뒤집힘 · 없으면 흔들리다 멈춘다」 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const motorConcept: Aperi21ConceptSource = {
  id: 'motor',
  label: 'Why a Current-Carrying Loop Keeps Turning',
  canonicalSim: 'aperi21:motor',

  surface: {
    definition:
      'The two sides of a loop in a magnetic field carry current opposite ways and so are pushed opposite ways, and reversing the loop’s current each time it passes upright is what keeps it turning one way instead of rocking to a stop.',
    exemplarKeywords: [
      'electric motor',
      'commutator',
      'split ring',
      'why does the coil keep spinning instead of stopping halfway',
      'force on a current-carrying loop in a magnetic field',
      'brushes and the split ring',
      'how a direct current motor works',
      'the loop rocks and settles without a commutator',
      'reversing the current every half turn',
      'the couple on a coil between the poles',
      'turning effect on a current loop',
    ],
  },

  briefing: {
    observable: [
      'The loop is seen end-on down its axle, so its plane is a single line and its two sides are small circles, each marked to say whether the current there is coming toward the reader or going away.',
      'A pole piece sits on either side, lettered, and the field between them is drawn as quiet arrows running across the picture.',
      'With the loop lying flat, the side whose current comes forward is pushed up and the side whose current goes back is pushed down, the two pushes drawn in the accent colour and pointing opposite ways, and the loop starts to turn.',
      'At the middle of the axle a ring split into two arcs turns with the loop while a contact on each side, marked with a sign, stays put; the gaps in the split ring come round to those contacts exactly when the loop stands upright.',
      'As the loop passes upright, the marks on both sides swap over and both pushes flip, so the pair goes on turning the loop the same way round rather than dragging it back.',
      'The loop then keeps going round, half turn after half turn, with faint tails behind its two sides showing the direction of travel.',
      'The split ring is then replaced by an unbroken one — a single circle at the same place — and the loop is set going again from the same flat position with the same pushes.',
      'This time nothing swaps as the loop comes upright: past that position the same pushes are pulling it back the way it came.',
      'The loop rocks about the upright position and settles there, with the two pushes stretched along its own plane, one up and one down, doing nothing to turn it.',
      'There are no figures anywhere — no current, no force, no rate of turning — and the only writing is the letters on the poles and the signs on the two contacts.',
    ],

    screen: {
      affordances: [
        'Nothing is offered to switch or to hold; the run with the split ring, the swap to the unbroken one and the rocking to rest follow one another and begin again.',
        'The one thing that differs between the two arrangements is the ring at the axle — two arcs against one circle — with the same loop, the same poles and the same pushes on either side of the comparison.',
        'Certain stretches are shown much slower than the rest — the first turning, the passage through upright and the pulling-back — because the swap happens too quickly to be caught at the pace of the rest.',
        'The accent colour is kept for the pushes alone; the poles are told apart by lettering and depth of ink rather than by the customary colours, and the two ways of wiring the axle are not given colours at all.',
        'No battery or circuit is drawn, the signs on the two fixed contacts standing in for the supply, so nothing away from the axle competes with what is happening at it.',
        'The rate of turning is exaggerated so that keeping on round and rocking to rest can each be seen within the time they are given.',
      ],
    },

    useWhen: [
      'The article has explained the force on a current in a field and the reader is left asking why the loop does not simply line up and stop. Running the same loop with and without the split ring answers that in one screen.',
      'The prose needs the commutator to be a mechanism rather than a name — the gaps arriving at the contacts exactly at the upright position, and the marks on the two sides swapping as they pass, is what makes it one.',
      'A piece is about turning electricity into rotation and wants the turning effect to come plainly from a pair of opposite pushes on opposite sides rather than from a single force somewhere.',
    ],

    avoidWhen: [
      'The subject is a single straight wire jumping when a current is switched on. The whole point here is that there are two sides pushed opposite ways.',
      'The article is about the size of the force, the torque, or how either depends on the current, the field or the angle. Nothing is measured and the pushes are drawn at one length throughout.',
      'The point is the rule for finding which way the force acts from the directions of the current and the field. The directions are shown as settled facts here, not worked out.',
      'The article is about a coil being turned to make a voltage, about rings that do not reverse for that purpose, or about the difference between the two kinds of ring for an output. Here the ring is only ever about keeping the turning going.',
      'What is wanted is a real motor — many windings, a laminated armature, speed, or load. One rectangular loop is drawn, and seen end-on at that, so its length does not even appear.',
    ],

    contrastWith: [
      {
        concept: 'ac-generation',
        note: 'The same loop between the same poles, run the two ways round: one feeds it and gets rotation, the other turns it and gets an output, and where the second dwells on the shape of that output the first dwells on what keeps the rotation from stalling.',
      },
      {
        concept: 'torque',
        note: 'Both are about turning produced by pushes rather than by a single force, but one asks how far from the hinge the push acts, while the other takes the geometry as fixed and asks what has to be reversed, and when, for the turning to continue.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One is a body already going round and what must act on it to keep it on the circle; the other is about getting something to go round at all and why it would otherwise stop after a quarter of a turn.',
      },
    ],
  },
};
