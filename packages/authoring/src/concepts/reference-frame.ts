/**
 * reference-frame 개념 선언.
 *
 * 형제는 `coordinate-choice`. 둘 다 "기술하는 쪽을 바꾸면 같은 운동이 달리 적힌다" 를
 * 말하므로 definition 이 수렴하기 쉽다. **주어를 갈랐다.**
 *   reference-frame    **관찰자** — 누가 보느냐로 경로의 모양이 달라지고, 둘 다 옳다
 *   coordinate-choice  **축** — 한 관찰자가 축을 어디 두느냐로 식의 품이 달라진다
 * 이쪽만 상대 운동 · 두 관찰자 · "어느 쪽도 틀리지 않았다" 어휘를 갖는다.
 *
 * 조각에 조작기가 없다. affordances 에 "조작이 없다" 가 아니라 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const referenceFrameConcept: Aperi21ConceptSource = {
  id: 'reference-frame',
  label: 'Reference Frame',
  canonicalSim: 'aperi21:reference-frame',

  surface: {
    definition:
      'The same event described by two observers in relative motion, where the path one of them draws as a bending curve the other draws as a straight drop, both being right.',
    exemplarKeywords: [
      'frame of reference',
      'dropping a ball inside a moving train',
      'what the person on the platform sees',
      'is motion absolute or relative',
      'the same motion looks different to different observers',
      'ball falls straight down inside the carriage',
      'curved path seen from outside the vehicle',
      'moving observer versus standing observer',
      'who is right about the shape of the path',
      'coin dropped in a moving lift or bus',
    ],
  },

  briefing: {
    observable: [
      'Two panels stand side by side, each carrying a written label naming whose eyes it belongs to — someone standing on the ground, someone riding the train.',
      'In the left panel the carriage runs along a ground line past telegraph poles that stay put; in the right panel the carriage holds still and the poles and the ground stream backwards behind it.',
      'A rider inside the carriage holds a ball and lets it go, and the release happens in both panels at the same instant off the same clock.',
      'The ball leaves a trail of dots stamped at even steps of time — bent into a curve on the left, stacked into a straight upright column on the right.',
      'Both trails end at the rider’s feet, so however differently the two paths are drawn, the ball arrives at the same place in the carriage.',
      'On the left the dots are evenly spread sideways and open out further and further downward; on the right they only open out downward.',
      'Whatever runs past the edge of a panel is cut off there, so each panel keeps to its own view and the two never spill into each other.',
      'The drop replays; arriving partway through, both trails are already half drawn.',
    ],

    screen: {
      affordances: [
        'The release, the fall and the replay run by themselves, and the two panels are driven off one clock so the two accounts are always of the same moment.',
        'Both accounts are on screen at once, so the comparison is made by looking across rather than by switching a view.',
        'The trail of dots is stamped at a fixed time step in both panels, which makes the two trails comparable mark for mark.',
      ],
    },

    useWhen: [
      'The reader has been told that a ball dropped in a moving vehicle lands at the dropper’s feet and cannot square that with the curve a bystander would report. Two trails drawn side by side from one release is what lets both answers stand.',
      'Relative motion is about to be introduced and the point needed first is that the shape of a path, not merely a number attached to it, depends on who is describing it.',
    ],

    avoidWhen: [
      'The subject is how strong gravity is, or how a fall speeds up. The drop is used here only as a shared event for two observers to describe differently.',
      'The question is which set of axes to lay over a single observer’s view. Each panel already has its observer settled and no axes are drawn in either.',
      'The matter is adding velocities as numbers — closing speed, a boat across a river, one vehicle overtaking another. No speed or number is written anywhere here.',
      'The point is a projectile launched at an angle by a thrower. The ball is simply let go from a hand, and the curve belongs to the observer rather than to a throw.',
    ],

    contrastWith: [
      {
        concept: 'coordinate-choice',
        note: 'One says the account changes with who is watching and that rival accounts are equally true; the other keeps a single watcher and says the account changes with where the axes are laid, some placings leaving less work to do.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One asks what gravity does to a velocity as a fall goes on; the other asks whose account of one and the same fall is being given, and answers that there is more than one correct answer.',
      },
    ],
  },
};
