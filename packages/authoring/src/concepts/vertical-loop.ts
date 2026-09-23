/**
 * vertical-loop 개념 선언.
 *
 * 원운동 형제 넷 가운데 하나다. 이쪽 주어는 **연직면 고리의 꼭대기 근처**이고 주장은
 * **레일이 미는 힘이 스스로 0 이 되는 자리에서 공이 레일을 떠난다 — 꼭대기에 닿기 전에**
 * 이다. `centripetal-force` 는 그 힘을 일부러 없앤 것, `banked-curve` 는 노면이 대는 양,
 * `conical-pendulum` 은 수평 원에서 줄이 찾는 각이다. 이쪽만 최소 속력·이탈·수직항력 0
 * 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const verticalLoopConcept: Aperi21ConceptSource = {
  id: 'vertical-loop',
  label: 'Vertical Loop',
  canonicalSim: 'aperi21:vertical-loop',

  surface: {
    definition:
      'Going round a loop in an upright plane, where a body slower than a certain speed at the top loses contact and leaves the track before it ever gets there.',
    exemplarKeywords: [
      'vertical circular motion',
      'minimum speed at the top of a loop',
      'roller coaster loop the loop',
      'bucket of water swung over your head',
      'why does the water not fall out',
      'the track stops pushing at the top',
      'normal force falls to zero',
      'ball comes off the loop before the top',
      'critical speed to get round',
      'falls off the track near the top',
    ],
  },

  briefing: {
    observable: [
      'Two loops of the same size stand side by side, each with a ball entering at the bottom, one having come in a little faster than the other, and each ball is named by that.',
      'An arrow on each ball gives its speed and a second arrow in another colour gives the push from the rail, and both shorten as the ball climbs.',
      'A standing mark gives the least speed needed at the top, so the speed arrow up there has something to be measured against.',
      'On the right-hand loop the push from the rail shrinks away to nothing before the ball has reached the top; at that instant a ring is drawn where it happened and the ball comes off the rail.',
      'From there it falls freely, its path drawn as a dotted curve, and it comes down inside the loop instead of carrying on round.',
      'On the left-hand loop the push from the rail is still there at the top, the speed arrow up there is longer than the standing mark, and the ball goes over and comes down the far side.',
      'The two run from one clock, so the moment one leaves the rail and the other does not is a single instant seen twice.',
      'The captions follow it: both pressed against the rail as they climb, slowing and pushed less as they rise; the right one coming away when the push reaches nothing; the left one passing the top still held.',
      'The ring marking where contact was lost stays put, plainly short of the top, so the failure can be located rather than only reported.',
    ],

    screen: {
      affordances: [
        'The pair of runs plays and repeats by itself — the climb, the one coming away from the rail, the fall and the landing, then a fade and a fresh start.',
        'The two loops are the same size and the balls set off at the same moment, so the whole argument is made by looking across from one to the other.',
        'The place where the rail stopped pushing is marked with a ring and left there through the rest of the run.',
        'The least speed needed at the top is drawn as a standing mark, which puts the two speeds on one measure instead of leaving them to be compared by eye.',
      ],
    },

    useWhen: [
      'The reader expects a body too slow at the top to reach the top and then drop straight down from it. The ring marking where the rail stopped pushing, clearly short of the top, is what corrects that — the failure happens before the top, not at it.',
      'The article has produced a condition for the least speed at the top and needs the step where that condition is read as the push from the rail falling to nothing, rather than as a rule about when things fall.',
    ],

    avoidWhen: [
      'The circle is level and the pace round it does not change. Both balls here slow as they climb and pick up speed as they come down.',
      'Numbers are wanted for the speed, the radius or the height. Speeds are drawn as arrows and set against a mark, never written.',
      'The article is about energy being stored on the way up and given back on the way down. Nothing here is totted up or carried along; only the speed and the push from the rail are shown.',
      'What holds the body is a string that could go slack, a rod that could also pull, or the outside of a hump. These balls press outward against a rail from the inside of it.',
      'The question is how the loop is entered, or how fast the body has to be at the bottom. Both balls are already moving when the run opens and nothing before that is drawn.',
    ],

    contrastWith: [
      {
        concept: 'centripetal-force',
        note: 'One takes the holding force away on purpose and asks where the body then goes; the other lets it run out by itself and asks where round the path that happens.',
      },
      {
        concept: 'banked-curve',
        note: 'One is an upright loop where the speed has to be enough at the top; the other a level ring where the tilt of the road has to suit the speed.',
      },
      {
        concept: 'conical-pendulum',
        note: 'One has the pace round the circle falling away with height until the hold fails; the other keeps one level circle at one unchanging pace, where nothing fails at all.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'The stretch after the ball comes off the rail is a body in flight under gravity alone; the other concept is about that flight in its own right, and what it does to the velocity.',
      },
    ],
  },
};
