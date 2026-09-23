/**
 * banked-curve 개념 선언.
 *
 * 원운동 형제 넷 가운데 하나다. 이쪽 주어는 **노면의 기울기**이고 주장은
 * **한 속력에 맞는 각은 하나뿐 — 모자라면 바깥, 넘치면 안쪽으로 실패한다**이다.
 * `centripetal-force` 는 그 힘을 없앴을 때, `conical-pendulum` 은 줄이 스스로 찾는 각,
 * `vertical-loop` 은 연직면에서 힘이 바닥나는 자리다. 이쪽만 노면·마찰 없음·양쪽 실패
 * 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const bankedCurveConcept: Aperi21ConceptSource = {
  id: 'banked-curve',
  label: 'Banked Curve',
  canonicalSim: 'aperi21:banked-curve',

  surface: {
    definition:
      'The tilt built into a curved road so the surface alone turns a car at a given speed, less tilt letting it drift outward and more letting it slide inward.',
    exemplarKeywords: [
      'banked curve',
      'banking angle of a road',
      'why race tracks are tilted on the bends',
      'banked turn without friction',
      'tangent of the angle equals v squared over r g',
      'camber on a bend',
      'velodrome banking',
      'icy curve with no grip at all',
      'the car slides up the bank if it goes too fast',
      'the one right angle for a given speed',
    ],
  },

  briefing: {
    observable: [
      'The road is shown twice at once — in cross-section on one side, with the car sitting on the tilted surface, and from above on the other, where the bend is a ring the car goes round.',
      'On the cross-section the bank angle is drawn as an arc against a horizontal dashed line, with its size written in degrees.',
      'Three arrows leave the car there: its weight, the push of the road at right angles to the surface, and the share of that push aimed toward the centre of the bend.',
      'A separate bar with ticks at both ends marks how much inward force the turn needs, and the inward share is set against it to be compared as a length.',
      'With the road flat the inward share is nothing more than a dot, and the car runs straight on and off the outside of the ring.',
      'As the tilt grows the inward share lengthens; short of the matching angle the car still works its way outward off the road, and beyond it the car slides down the inside.',
      'At the matching angle the inward share comes level with the tick on the bar, the car rides the ring round, and its trace closes on itself.',
      'Traces of earlier attempts stay behind faintly in the view from above, so a failure and a success can be held side by side as shapes.',
      'The caption names the tilt just now in force and says which of the four things is happening — the ungripped straight run off the flat road, the outward drift, the inward slide, or the clean turn.',
    ],

    screen: {
      affordances: [
        'A slider along the bottom sets the bank angle to a tenth of a degree, and taking hold of it stops the automatic round and repeats the attempt at that angle.',
        'A button appears beside the slider once the reader has taken over, and pressing it hands the running back to the automatic sequence.',
        'Left alone the road tilts through a set of angles and runs an attempt at each, so both kinds of failure and the clean turn come round without being asked for.',
        'The outcome is worked out before the attempt is drawn, so what the caption says will happen and what the car then does are the same thing at every angle.',
        'The cross-section and the view from above are drawn together, so the tilt of the surface and where the car ends up on the ring are read off in one look.',
      ],
    },

    useWhen: [
      'The article has produced an angle out of a speed and a radius, and the reader is taking it as one of several workable tilts. Sliding to either side of it and watching the car fail outward one way and inward the other is what makes it a single angle rather than a minimum.',
      'The claim is that a road can turn a car with no help at all from friction, and a screen is wanted where the surface is the only thing acting and the turn still comes off.',
    ],

    avoidWhen: [
      'Friction is what the article wants the bend to rely on, or the question is how fast a flat road can be taken. Nothing grips here, and the flat road always fails.',
      'Numbers are wanted for the speed, the radius, the mass or the force. Only the angle carries a value.',
      'The subject is circular motion in an upright plane, or a loop. Both views here are of a flat, level ring, one from the side and one from above.',
      'The article is about what the turn does to the passengers, or about apparent weight in a bend. Only the car is drawn, and only as a block on a surface.',
      'The point is that the road could be banked for a range of speeds, as real roads are. One speed is in play here and one angle answers it.',
    ],

    contrastWith: [
      {
        concept: 'centripetal-force',
        note: 'One asks whether a surface can supply enough inward force and what a mismatch does in either direction; the other asks what that force is for, and what its removal leaves behind.',
      },
      {
        concept: 'conical-pendulum',
        note: 'Both settle an angle from a rate of turning — here an angle a road must be built to, there an angle a hanging string finds for itself.',
      },
      {
        concept: 'vertical-loop',
        note: 'One is a level ring where the tilt of the surface has to match the speed; the other an upright loop where the speed at the top has to be enough.',
      },
      {
        concept: 'inclined-plane',
        note: 'Both are about what a tilted surface does to the forces on a body, one asking what the tilt drags a resting body toward, the other what the tilt can steer a moving one around.',
      },
    ],
  },
};
