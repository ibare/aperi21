/**
 * vertical-throw 개념 선언.
 *
 * 연직 형제가 셋이라 **주어**로 갈랐다.
 *   vertical-throw              비행의 **두 반쪽** — 같은 높이에서 같은 빠르기, 방향만 거꾸로
 *   gravitational-acceleration  한 물체의 **속도 변화** — 꼭대기에서도 멈추지 않는다
 *   terminal-velocity           **저항이 붙은 낙하** — 균형에 닿으면 더 빨라지지 않는다
 * 이쪽만 대칭·짝·거울 어휘를 갖는다. 변화량(Δv)도 저항도 이쪽 어휘가 아니다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const verticalThrowConcept: Aperi21ConceptSource = {
  id: 'vertical-throw',
  label: 'Vertical Throw',
  canonicalSim: 'aperi21:vertical-throw',

  surface: {
    definition:
      'A flight straight up and back down whose two halves match height for height, each level being passed at one speed going up and the same speed reversed coming down.',
    exemplarKeywords: [
      'vertical throw',
      'thrown straight up and caught again',
      'same speed at the same height on the way down',
      'time going up equals time coming down',
      'the two halves of a throw are mirror images',
      'does it come back as fast as it left',
      'symmetry of upward motion',
      'ball tossed in the air and returning to the hand',
      'speed on the way up compared with the way down',
      'catching it at the height you threw it from',
    ],
  },

  briefing: {
    observable: [
      'A ball rises up the middle of the picture and comes back down along the same line, an arrow on it standing for its velocity — long at the throw, shrinking as it climbs, growing again as it drops.',
      'Every quarter second the flight leaves a stamp: a ringed circle carrying the velocity arrow it had at that instant.',
      'Stamps made on the way up slide off into a left-hand column; stamps made on the way down slide off into a right-hand column, so the two halves end up standing side by side.',
      'One stamp is different — the one at the top of the flight stays on the middle line and has no arrow at all.',
      'Each upward stamp then makes a copy of itself that travels across to its partner on the right, turning its arrow over as it goes, and fades out the instant it lands on top of it.',
      'Where a copy has landed, a faint dashed line is drawn joining the two columns, so partners are marked off at every height the ball passed twice.',
      'Left and right stamps at the same height carry arrows of the same length pointing opposite ways, and the two columns end up level rung for rung.',
      'The closing line states that coming down the ball passes each height at the speed it had going up, only reversed.',
      'The whole throw plays, the finished pair of columns is held, the stamps fade, and it begins again.',
    ],

    screen: {
      affordances: [
        'The throw runs and repeats by itself, and the reader arrives with the ball already in the air rather than waiting for a launch.',
        'The stamping interval divides the time to the top exactly, which is what makes a stamp on the way down fall at the same height as one on the way up rather than near it.',
        'The crossing copies arrive and vanish on their partners, so whether the two arrows really match is settled at the moment of overlap rather than by eye across a gap.',
        'Both columns and the ground line stay on screen together, so the pairing can be read at every height at once once the run has finished.',
      ],
    },

    useWhen: [
      'The reader has been told the flight is symmetric and is treating it as a formula result. Watching an upward stamp carry its arrow across and land flipped onto its downward partner is what makes the symmetry a thing that happened.',
      'The article wants to argue that catching a ball at the height it left is catching it at the launch speed, and needs the pairing drawn height by height rather than asserted for the endpoints alone.',
    ],

    avoidWhen: [
      'The article is about air resistance, parachutes or anything that makes the descent unlike the ascent. The mirroring here is exact, which is only true because nothing resists.',
      'The subject is what happens to the velocity at the top of the flight, or that the acceleration carries on while the speed is zero. The top stamp here is simply the one without an arrow; nothing is claimed about the instant itself.',
      'The point is that the fall does not depend on weight. One ball flies and it carries no weight.',
      'The body is thrown at an angle or moves forward at all. The flight is confined to one vertical line and the columns are only a place to park the stamps.',
      'Numbers are wanted — the launch speed, the height reached, the time of flight. Not one figure is written.',
    ],

    contrastWith: [
      {
        concept: 'gravitational-acceleration',
        note: 'One matches the two halves of a flight against each other height by height; the other watches a single velocity change by the same amount in every equal interval, which is the reason the two halves can match at all.',
      },
      {
        concept: 'terminal-velocity',
        note: 'One says rise and fall are exact reflections; the other says a resisted fall has no such reflection, because the speed it settles at is set by a balance rather than by where it started.',
      },
      {
        concept: 'free-fall',
        note: 'Both drop a body under gravity alone, but one asks whether the journey back repeats the journey out, and the other asks whether the journey depends on what is falling.',
      },
    ],
  },
};
