/**
 * tangential-normal-acceleration 개념 선언.
 *
 * 형제 넷의 갈림은 주어다 (`centripetal-acceleration.ts` 의 주석에 표를 두었다).
 * 이쪽의 주어는 **속도와 비스듬하게 걸린 가속도**이고, 주장은 「두 몫으로 갈리며
 * 앞의 것은 길이만, 뒤의 것은 방향만 바꾼다」이다.
 *
 * 그래서 이쪽만 분해·몫·평행사변형·「빨라지면서 돈다」 어휘를 갖는다. 「중심을 향함」
 * 은 centripetal 의 몫이고, 「굽은 정도」는 radius-of-curvature 의 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const tangentialNormalAccelerationConcept: Aperi21ConceptSource = {
  id: 'tangential-normal-acceleration',
  label: 'Tangential and Normal Acceleration',
  canonicalSim: 'aperi21:tangential-normal-acceleration',

  surface: {
    definition:
      'An acceleration set at an angle to the velocity, resolved into a part along it that only lengthens or shortens it and a part across it that only turns it.',
    exemplarKeywords: [
      'tangential and normal acceleration',
      'resolving acceleration into components',
      'speeding up while going round a bend',
      'a_t and a_n',
      'which part of the acceleration changes the speed',
      'acceleration oblique to the velocity',
      'accelerating out of a corner',
      'the velocity arrow grows and swings at once',
      'splitting acceleration into two pieces',
      'along-track and cross-track',
    ],
  },

  briefing: {
    observable: [
      'A body travels a closed looping course drawn faintly, made of straight runs joined by bends.',
      'A dark arrow ahead of the body is its velocity, and the arrow’s length is how fast it is going.',
      'Two coloured arrows hang from the tip of that one — an accent arrow lying along the velocity, named "speed part" in words beside it, and a blue arrow square to it, named "turning part".',
      'When both have length a dashed parallelogram is completed between them and a thin arrow along its diagonal is the acceleration entire.',
      'On the straight runs only the accent arrow has any length, and the velocity arrow does nothing but grow or shrink.',
      'Through the steady bends only the blue arrow has any length, and the velocity arrow holds its length while swinging round.',
      'Through the other bends both have length at once, and the velocity arrow changes length and swings in the same stroke; where the accent arrow turns to point backward the velocity arrow shortens.',
      'A second panel to the right gathers the velocity at one point: an origin dot, the same velocity arrow drawn out from it at the same scale, and the same two coloured arrows hung at its tip.',
      'A dotted circle in that panel passes through the arrow’s tip and is redrawn as the speed changes, so a steady bend shows the tip running along the circle rather than off it.',
      'The tip leaves a fading trail of the last couple of seconds in the gathered panel, which runs round when only the turning part is at work and cuts inward or outward when the speed part is.',
      'A line under the picture names the leg in progress — straight and speeding up, turning at one speed, slowing while turning, speeding up while turning, straight and slowing.',
    ],

    screen: {
      affordances: [
        'The whole circuit runs and repeats by itself, bringing five cases round in turn, so the comparison between them arrives without anything being set.',
        'The two panels are drawn to one scale, which lets the same pair of coloured arrows be read on a body moving along a course and on its velocity gathered to a point.',
        'The two parts are named in words beside them rather than left to colour, so which is which can be said without a key.',
        'The dashed parallelogram is completed only where both parts have length, which makes the legs that have just one of them plain at a glance.',
        'The dotted circle through the tip stands as a reference while the tip moves, so holding length while swinging is something to look at rather than to work out.',
      ],
    },

    useWhen: [
      'The reader knows that acceleration along the motion changes the pace and acceleration across it turns the body, and now meets one that is neither; the slanted legs, where the parallelogram closes and each half is caught doing its own job, are what settles it.',
      'The prose is about to set up directions that travel with the body rather than with the ground, and the two of them need to be seen doing different work before they are given names.',
    ],

    avoidWhen: [
      'The case is turning at one unchanging speed and nothing else. That leg passes through here, but it is one of five and the argument being made is the splitting.',
      'Sizes are wanted — how large either part is, how the turning part answers to the speed or to the sharpness of the bend. Not a figure is written anywhere.',
      'The subject is what causes the acceleration: a force, an engine, friction, a banked road. Nothing pushes the body and no cause is drawn.',
      'The point is the shape of the course or how tightly it bends. The course is there to carry the body and its bend is never measured or marked.',
    ],

    contrastWith: [
      {
        concept: 'centripetal-acceleration',
        note: 'One takes an acceleration apart to say which half of it does which job; the other takes the case where the whole of it goes into turning and asks where it aims.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One is about acceleration along the motion, where the whole question is whether it points with or against; the other is about one set at an angle, where along and across can both be present at once.',
      },
      {
        concept: 'radius-of-curvature',
        note: 'One asks what an acceleration is doing to a velocity; the other asks how sharply the path itself bends, with no velocity in the account at all.',
      },
      {
        concept: 'coordinate-choice',
        note: 'One takes its directions from the moving velocity, along it and across it, so that each part is left with exactly one job; the other takes them from the standing scenery so that one component has nothing left to change.',
      },
    ],
  },
};
