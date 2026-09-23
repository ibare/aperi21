/**
 * coordinate-choice 개념 선언.
 *
 * 형제는 `reference-frame`. 갈림은 주어다 — 이쪽은 **축**, 저쪽은 **관찰자**다.
 * 관찰자는 하나로 고정해 두고, 축을 어디 두느냐가 식에 남는 일의 양을 바꾼다는 것만
 * 말한다. "어느 쪽도 틀리지 않았다" 가 아니라 "한쪽이 품이 덜 든다" 가 이쪽의 주장이다.
 *
 * 또 하나 갈라 둔 자리는 `uniformly-accelerated-motion` 이다. 화면에 등가속 미끄럼이
 * 나오지만 주장은 운동에 대한 것이 아니라 그 위에 씌운 숫자 틀에 대한 것이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const coordinateChoiceConcept: Aperi21ConceptSource = {
  id: 'coordinate-choice',
  label: 'Choice of Coordinate Axes',
  canonicalSim: 'aperi21:coordinate-choice',

  surface: {
    definition:
      'Where the axes are laid over a problem, and how lining them up with a slope leaves one component unchanging so that its equation has nothing left to say.',
    exemplarKeywords: [
      'choosing a coordinate system',
      'why tilt the axes on an inclined plane',
      'taking x along the slope',
      'components parallel and perpendicular to the incline',
      'setting up axes before writing the equations',
      'rotated axes make the working shorter',
      'which direction to call positive',
      'resolving on a ramp',
      'block sliding down a frictionless incline',
      'the motion is the same whichever axes you pick',
    ],
  },

  briefing: {
    observable: [
      'The same incline and the same sliding block are drawn twice, side by side, and the two drawings run off one clock.',
      'On the left a pair of axes stands horizontal and upright; on the right the pair is tilted to lie along the incline and across it.',
      'Dashed lines run from the block to each axis, and a filled dot sits where they meet it — the block’s shadow on that axis.',
      'Every quarter second a short stroke is stamped beside each axis at wherever its shadow stands, so the stamps keep a record of how that shadow has moved.',
      'Three of the four shadows creep along, and their stamps open out further and further apart as the block picks up pace.',
      'The fourth shadow, the one on the axis running across the incline, stays exactly where it began, and its stamps pile on top of each other into a single dark stroke.',
      'The block is one and the same slide in both drawings — same start, same finish, same instant of arrival.',
      'The slide replays; arriving partway through, the block is already a little way down.',
    ],

    screen: {
      affordances: [
        'The slide, the pause at the bottom and the replay run on their own, and the two sets of axes are driven off the same slide so neither can be ahead of the other.',
        'Both choices are drawn at once against one motion, so what the tilt buys is read by looking across rather than by swapping one set of axes for the other.',
        'The stamps stay on screen as they accumulate, which turns standing still into a mark that builds up rather than a thing that merely fails to happen.',
      ],
    },

    useWhen: [
      'The reader has been told to tilt the axes on an incline and has taken it as a ritual. A stack of stamps piling into a single stroke on the perpendicular axis is what the tilt actually buys, and the prose can point straight at it.',
      'The argument is that a coordinate system is chosen rather than handed down, and needs a case where the motion is visibly untouched while the bookkeeping over it changes.',
    ],

    avoidWhen: [
      'The subject is forces on an incline — weight split into components, the normal force, friction. Nothing here pushes or pulls; only the sliding and its shadows are drawn.',
      'The question is whether two observers in relative motion can disagree. One watcher is assumed throughout, and what differs is only where the axes were put.',
      'The text is about breaking a vector into components as an operation in its own right, with arrows and arithmetic. No arrow and no number appear.',
      'The angle of the slope matters to the argument. One angle is drawn and it cannot be altered, because the shadow would stand still at any angle anyway.',
    ],

    contrastWith: [
      {
        concept: 'reference-frame',
        note: 'One keeps a single watcher and weighs where to lay the axes by how much work the equations are left with; the other changes the watcher and says the two accounts are equally true.',
      },
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One claims something about the motion itself — that a constantly accelerated body adds a fixed extra distance each step; the other claims nothing about the motion at all, only about the frame of numbers written over it.',
      },
    ],
  },
};
