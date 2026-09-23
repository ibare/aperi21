/**
 * relativistic-velocity-addition 개념 선언.
 *
 * 동시성 둘 중 하나. `relativity-of-simultaneity` 와 갈랐다 — 저쪽은 두 사건의 **순서**,
 * 이쪽은 더한 **빠르기의 상한**이다. 순서도 시계도 길이도 화면에 없고, 멈춘 뒤 재는 것은
 * 「같은 시간에 간 거리」 하나다. 이미 선언된 `relative-velocity` 는 그냥 더해지는 고전
 * 합성이라, 이 조각은 바로 그 덧셈이 어긋나는 자리를 유령으로 겹쳐 보인다.
 *
 * 조각에 조작기가 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const relativisticVelocityAdditionConcept: Aperi21ConceptSource = {
  id: 'relativistic-velocity-addition',
  label: 'Speeds That Refuse to Add Past Light Speed',
  canonicalSim: 'aperi21:relativistic-velocity-addition',

  surface: {
    definition:
      'Something fired forward from an already fast carrier is measured slower than the two speeds put together, while light sent from that same carrier is measured at its usual rate.',
    exemplarKeywords: [
      'relativistic velocity addition',
      'can you beat light by firing forward from a fast ship',
      'half of light speed plus half of light speed is not light speed',
      'speeds do not simply add up',
      'nothing can be made to exceed the speed of light',
      'firing a bullet from a moving spacecraft',
      'light from a moving source still goes at the same rate',
      'combining two velocities close to light speed',
      'why adding velocities the ordinary way breaks down',
      'the speed limit that no amount of adding gets past',
    ],
  },

  briefing: {
    observable: [
      'Two lanes run across the picture. A ship travels along the upper lane at half of light speed, and a lamp stands still on the lower lane.',
      'A dotted upright line rising from the lamp marks the firing place, and a ruler lies along the bottom underneath it with its zero at that line.',
      'The instant the ship\'s nose reaches that line, rings spread from the firing place in both lanes: the ship sends out a bullet and a flash of light, and the standing lamp sends out a flash of its own.',
      'The two flashes stay in exactly the same column as one another the whole way, so the one that came from the moving ship gains nothing from the ship\'s own motion.',
      'The bullet pulls ahead of the ship but falls steadily further behind the light, the gap between them opening all the way.',
      'Everything stops at once at the end of the run. Because they all ran for the same time, how far each got is its speed, and dropped lines carry those stopping places down to the ruler, which reads zero, half, four fifths, and light speed.',
      'The bullet\'s own label says that the ship measures it at half of light speed, so the figure the ruler gives it is plainly not that.',
      'A faint row then appears above, showing where ordinary addition would have put things: a hollow bullet drawn at the mark for light speed, and a dotted flash beyond the far end of the ruler altogether.',
      'Neither of the real things reaches its ghost, and the ghost of the light has nowhere on the ruler to stand.',
      'The written figures are the two half-speeds, the result of four fifths, and the two sums spelled out beside the ghosts; no addition formula is written.',
    ],

    screen: {
      affordances: [
        'The approach, the firing, the run, the stopping and the ghosts go round by themselves; nothing has to be pressed.',
        'The stop is what turns the picture into a measurement — with all of them run for the same time, distance along the ruler simply is speed.',
        'The standing lamp is there so that the ship\'s light has something already known to be compared against; the two flashes are drawn identically and separated only by their lanes.',
        'The ordinary-addition result is held back until everything has stopped and is drawn faint and hollow on a row of its own, so it never competes with what is actually happening.',
        'Everything is measured from the ground; the ship\'s own account appears only as the wording on the bullet\'s label.',
      ],
    },

    useWhen: [
      'The reader has been told that velocities do not add and is quietly certain that firing forward from a fast enough ship must eventually beat light. Two ghosts left standing where simple addition put them, with nothing having reached either, is what removes the certainty.',
      'The article needs the constancy of the speed of light shown as something measured rather than assumed, and a flash from a moving source running level with a flash from a standing one does it in one look.',
    ],

    avoidWhen: [
      'The speeds in the article are everyday ones and the point is simply how to combine them — closing speed, a boat across a river, one vehicle overtaking another. Ordinary addition appears here only as the thing being ruled out.',
      'The subject is a clock that runs slow, a body that measures short, or the order of two events. Nothing on screen is timed, measured for length, or ordered.',
      'What is wanted is the expression that combines two speeds. The result appears as a mark on a ruler and never as a formula.',
      'The article is giving the ship\'s own account of the bullet. That figure is stated on a label and nothing is drawn from the ship\'s point of view.',
      'The point is momentum or energy rising without limit as light speed is approached. Only positions along a ruler are shown.',
    ],

    contrastWith: [
      {
        concept: 'relative-velocity',
        note: 'One is the ordinary rule that two speeds along a line simply add or subtract; the other is the case where that rule visibly overshoots and a ceiling appears that no combination gets past.',
      },
      {
        concept: 'relativity-of-simultaneity',
        note: 'Both follow from light travelling at one rate for everybody, one ending at a limit on how fast anything can be found to go, the other at a disagreement over which things happened together.',
      },
      {
        concept: 'light-cone',
        note: 'One shows the speed limit holding under an attempt to break it by adding; the other draws the boundary in space and time that the same limit carves out.',
      },
      {
        concept: 'reference-frame',
        note: 'One is about two observers disagreeing over the shape of a path while agreeing on every number; the other is about them assigning different numbers to the same motion and those numbers never combining past a ceiling.',
      },
    ],
  },
};
