/**
 * uniform-motion 개념 선언.
 *
 * 형제는 `uniformly-accelerated-motion`. 두 조각의 화면이 거의 같은 얼개다(자국을 찍고
 * 간격을 떼어 쌓는다). 그래서 **쌓은 결과가 말하는 것**으로 갈랐다.
 *   uniform-motion               쌓인 막대의 오른쪽 끝이 **한 줄로 맞는다** — 간격이 같다
 *   uniformly-accelerated-motion 오른쪽 끝이 **같은 폭의 계단**이 된다 — 같은 만큼씩 늘어난다
 * definition 에서도 "같다" 와 "같은 만큼씩 늘어난다" 가 낱말을 공유하지 않게 썼다.
 *
 * `average-velocity` 와도 갈린다 — 저쪽은 구간을 고르는 일이 주장이고, 이쪽은 고를 것이
 * 없다는 것이 주장이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const uniformMotionConcept: Aperi21ConceptSource = {
  id: 'uniform-motion',
  label: 'Uniform Motion',
  canonicalSim: 'aperi21:uniform-motion',

  surface: {
    definition:
      'Motion at unchanging velocity, recognised by covering the same ground in equal times so that the gaps between marks stay alike however slow or brisk the pace.',
    exemplarKeywords: [
      'uniform motion',
      'constant velocity',
      'moving at a steady speed',
      'equal distances in equal times',
      'no acceleration at all',
      'ticker tape with evenly spaced dots',
      'cruising at the same rate',
      'straight-line motion at constant speed',
      'what does constant speed actually look like',
      'distance equals speed times time',
    ],
  },

  briefing: {
    observable: [
      'A round body travels along a ground line and leaves a short upright mark behind it once every second.',
      'The mark just laid is drawn longer than the others and a half ring spreads out below the line from it, so the beat of the seconds is heard as well as counted.',
      'Each gap between neighbouring marks is lifted out of the track and lowered into a stack below, every stacked bar aligned at its left end.',
      'Six bars accumulate, and their right ends come out level with one another.',
      'A written line under the drawing says that a mark is laid every second and that every gap is the same.',
      'Having run to the end of the track the whole drawing dims and starts over from an empty track.',
      'Turning the pace down narrows every gap together and turning it up widens them together, and the bars finish level either way.',
    ],

    screen: {
      affordances: [
        'A slider at the lower right sets the pace of the body, from a slow crawl up to the speed that carries it the length of the track in six seconds, and it shows its own numeric value.',
        'Taking hold of the slider starts the run again from the beginning, so gaps from an old pace and a new one are never stacked in the same set of bars.',
        'Six marks are laid in every run whatever the pace, so what the slider alters is the width of the gaps and not how many of them there are.',
        'Left alignment of the stacked bars is what does the comparing, so lengths are judged against each other rather than measured.',
      ],
    },

    useWhen: [
      'Constant velocity has been defined in words or with a formula and the reader has no picture to hang it on. Marks laid on the beat and bars stacking level is that picture, and the slider lets the levelling be tested at another pace.',
      'A reader is being led towards accelerated motion and the unaccelerated case has to be fixed first as the thing that will later be departed from.',
    ],

    avoidWhen: [
      'The subject is velocity changing in any way — gaining, losing, turning. The body holds one pace for a whole run and what the reader can alter is only which pace that is.',
      'The text is about how the motion would look to a different observer, or about velocities being combined. There is one watcher and one track.',
      'Actual values of speed or distance are wanted. No number is written anywhere except the slider’s own reading.',
      'The point turns on reading a graph. There are no axes here; the evidence is marks on a track and bars stacked beneath it.',
    ],

    contrastWith: [
      {
        concept: 'uniformly-accelerated-motion',
        note: 'One claims the gaps come out alike and keep coming out alike at whatever pace is set; the other claims they grow, and grow by a fixed extra amount every time.',
      },
      {
        concept: 'average-velocity',
        note: 'One is about a rate that never varies, so there is nothing for a span to be chosen out of; the other is about the figure a chosen span yields when the rate does vary.',
      },
    ],
  },
};
