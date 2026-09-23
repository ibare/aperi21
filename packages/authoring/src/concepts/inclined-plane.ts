/**
 * inclined-plane 개념 선언.
 *
 * 경사면 형제는 `angle-of-friction`. 이쪽 주어는 **중력 벡터**이고 주장은 **면을 따라
 * 끄는 몫이 각과 함께 커진다**이다 — 물체는 어느 각에서도 움직이지 않는다. 저쪽 주어는
 * **각**이고 주장은 **버팀이 무너지는 문턱**이다. 이쪽만 분해·성분·수직 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const inclinedPlaneConcept: Aperi21ConceptSource = {
  id: 'inclined-plane',
  label: 'Inclined Plane',
  canonicalSim: 'aperi21:inclined-plane',

  surface: {
    definition:
      'A body’s weight on a slope split into a part pressing into the surface and a part dragging along it, the dragging part growing as the slope steepens.',
    exemplarKeywords: [
      'inclined plane',
      'resolving weight on a ramp',
      'component of gravity along a slope',
      'mg sin theta along the surface',
      'mg cos theta into the surface',
      'why a steeper ramp pulls harder',
      'splitting a force into two directions',
      'ramp angle and the pull down it',
      'perpendicular and parallel components of weight',
      'a gentle slope takes less of the weight along it',
    ],
  },

  briefing: {
    observable: [
      'A slope is drawn as a shaded wedge with an arc at its lower corner and the angle written in degrees beside it; a block rests on the face, turned to lie flat against it.',
      'An arrow for gravity leaves the block and points straight down, and it is exactly the same length at every angle the slope takes.',
      'Dashed guide lines close a rectangle on that arrow, and two further arrows come out of it — a thin one running into the surface, and a thick one in the accent colour running down along it, named as the pull along the slope.',
      'The slope steepens from ten degrees to sixty and lays back down again over twelve seconds, and the along-slope arrow lengthens and shortens with it.',
      'Through all of that the downward arrow neither grows nor shrinks; only how it is divided changes.',
      'Near ten degrees the along-slope arrow is barely a stub and almost the whole of the weight has gone into the surface; near sixty the two parts are close to each other in length.',
      'The block holds its place on the face at every angle, so nothing about the drawing depends on it moving.',
      'One sentence stands below the whole time: gravity stays the same, and the steeper the slope, the larger its pull along the slope.',
    ],

    screen: {
      affordances: [
        'A slider at the upper left sets the slope angle between five and seventy degrees, with the angle shown beside it.',
        'While the slider is held the angle belongs to the reader; three seconds after it is let go the slope eases back to the automatic swing over the course of a second.',
        'Left alone the slope swings between ten and sixty degrees and back, twelve seconds to the round.',
        'Both parts are redrawn at every angle out of the same unchanging arrow, so the division is something to watch rather than to work out.',
      ],
    },

    useWhen: [
      'The article has arrived at a sine or a cosine in a ramp problem and the reader is carrying it as a rule to apply. Holding the slider near five degrees and then near seventy, while the downward arrow keeps its length, is what makes the two parts one quantity shared out rather than two separate forces.',
      'The claim is that a gentle slope is easier because less of the weight is aimed along it, and a screen is wanted where that share can be made small and then large without gravity itself changing.',
    ],

    avoidWhen: [
      'Friction, or the surface pushing back as a force in its own right, is part of the argument. Only the weight and the two parts it is divided into are drawn.',
      'The body is meant to slide, roll or accelerate down the slope. The block keeps its place on the face at every angle the slider reaches.',
      'Numbers are wanted for the parts. Only the angle carries a value; the arrows carry names.',
      'The subject is the tilt at which something begins to slip. The slope passes through every angle up to seventy and nothing ever lets go.',
      'The article is about work, energy or how a ramp trades force for distance. Nothing travels along the slope, so no distance is covered.',
    ],

    contrastWith: [
      {
        concept: 'angle-of-friction',
        note: 'One says how a weight is shared out at whatever tilt the slope has; the other says at which single tilt the holding gives way.',
      },
      {
        concept: 'coordinate-choice',
        note: 'One divides gravity into a part along a slope and a part across it; the other is about laying the axes along that slope in the first place, and what the choice spares you.',
      },
    ],
  },
};
