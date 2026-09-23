/**
 * charged-particle-in-magnetic-field 개념 선언.
 *
 * 힘 다섯 가운데 이쪽은 **한 바퀴 시간**이다 — 화면에 힘 화살표가 없고, 다섯 전하가 서로
 * 다른 반지름을 돌되 늘 한 줄로 서서 같은 순간 출발점에 겹친다.
 *   charged-particle-in-magnetic-field 반지름은 속력을 따라가는데 **주기는 따라가지 않는다**
 *   lorentz-force                      멈춘 전하의 **힘 방향** (직각 · 0 · 뒤집힘)
 *   mass-spectrometer                  속력을 묶고 **질량**을 풀어 반지름을 가른다
 *   velocity-selector                  두 힘의 크기 경쟁
 *   force-on-current-wire              도선 전체가 받는 힘
 * 주제 설명이 약속한 「속도에 수직인 힘」 은 화면에 없다 — 장부에 올리고 avoidWhen 으로 되돌렸다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const chargedParticleInMagneticFieldConcept: Aperi21ConceptSource = {
  id: 'charged-particle-in-magnetic-field',
  label: 'Lap Time That Ignores the Speed',
  canonicalSim: 'aperi21:charged-particle-in-magnetic-field',

  surface: {
    definition:
      'That the time a charge takes to go once round in a magnetic field does not depend on how fast it travels: charges of five different speeds keep to five circles of different widths yet stay in a single line and come back together.',
    exemplarKeywords: [
      'charge circling in a magnetic field',
      'cyclotron period',
      'does a faster charge take longer to go round',
      'radius grows in proportion to speed',
      'r equals m v over q B',
      'period independent of speed',
      'circular motion of a charged particle',
      'why a cyclotron can be driven at one frequency',
      'same time per lap whatever the speed',
      'particles of different speeds arriving back together',
    ],
  },

  briefing: {
    observable: [
      'A field of small circled crosses fills the picture, standing for a field running into the page.',
      'Five charges set off together from one point at the bottom, all in the same direction but at five different speeds.',
      'Each keeps to a circle of its own, the fastest taking the widest, and all five circles touch at the point they left from.',
      'A straight coloured segment joins all five charges at every moment, so however far round they have gone the five are always in one line.',
      'Each charge drags a short trail behind it covering the same stretch of time as the others, so the trail lengths stand in the same order as the speeds.',
      'The five arrive back at the starting point in the same instant, and the segment joining them shrinks away to nothing and disappears.',
      'The five circles themselves stay faintly drawn throughout, so the width each charge keeps to can be compared while it is going round.',
      'A plus is cut into each charge in the background colour, and all five go round the same way.',
      'No arrow for the force is drawn anywhere, and no speed, radius or time is written.',
      'The lap replays without a break.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the five are released together, go round and come back, and the lap repeats.',
        'The five are drawn alike and in one colour, so what separates them is the width of the circle and the length of the trail and nothing else.',
        'The segment joining the five is the only thing in the accent colour, so the single claim it makes, that they keep step, is not confused with anything else in the picture.',
        'The same stretch of time is used for every trail, which is what lets trail length stand for speed without a figure being written.',
        'The field is shown by a pattern of circled crosses laid over the whole area rather than by an arrow, because it runs out of the plane of the drawing.',
        'The circles are left drawn after the charges have passed, so the widths can still be compared at the moment the five come back together.',
      ],
    },

    useWhen: [
      'The article has given the radius as growing with speed and the reader concludes that a faster charge must take longer to get round. Five charges on five circles staying exactly in line is where that conclusion is contradicted in one picture.',
      'The prose is building toward a machine driven at a single steady frequency, and needs the reader to accept that the lap time is the same for every charge before the driving is brought in.',
    ],

    avoidWhen: [
      'The article is about where the magnetic force points, or about that force being square to the velocity. No force is drawn here and the circles are already being travelled.',
      'The charges differ in mass or in charge rather than in speed. All five here are alike but for the speed they set out with.',
      'An electric field acts as well, or paths are to be bent in order to sort or select. One field acts and every charge completes its own full circle.',
      'A number is wanted — a radius, a period, a field strength, a speed. Nothing in the picture carries a figure.',
      'The article is about a charge that spirals, drifts or gets away. Each of these closes its circle and returns to where it began.',
      'The reader is meant to change a speed or the field. The five speeds are fixed and the lap repeats unchanged.',
    ],

    contrastWith: [
      {
        concept: 'lorentz-force',
        note: 'One is about the lap that results and finds its time free of the speed; the other holds the charge still and is about which way the force points at a single instant.',
      },
      {
        concept: 'mass-spectrometer',
        note: 'One keeps charge and mass alike and lets the speed vary, so the widths differ while the timing does not; the other keeps the speed alike and lets the mass vary, and the differing widths are what does the separating.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'One is about lap times being equal across circles of different sizes, because the speed rises exactly in step with the width; the other is about a single circle and what the velocity does while it is travelled.',
      },
      {
        concept: 'centripetal-force',
        note: 'One takes the circling for granted and asks how long a lap takes; the other asks what holds a body on its circle at all, and what happens when that is taken away.',
      },
    ],
  },
};
