/**
 * river-crossing 개념 선언.
 *
 * 형제는 `relative-velocity`. 같은 강·같은 배인데 **바꾸는 것**이 다르다 —
 *   river-crossing     **뱃머리 각도**를 바꾼다. 보는 사람은 강둑 붙박이, 물음은 「어디에 닿는가」
 *   relative-velocity  **보는 사람의 속도**를 바꾼다. 배는 그대로, 물음은 「어떻게 보이는가」
 * 이쪽만 겨냥·떠밀림·도착점·상류 보정 어휘를 갖는다. 기준틀·관측자는 이쪽 어휘가 아니다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const riverCrossingConcept: Aperi21ConceptSource = {
  id: 'river-crossing',
  label: 'Crossing a River',
  canonicalSim: 'aperi21:river-crossing',

  surface: {
    definition:
      'A body steered across a moving medium, whose landing point is carried off the aim by the flow, so that arriving opposite the start requires aiming upstream rather than straight across.',
    exemplarKeywords: [
      'crossing a river with a current',
      'boat aimed straight across lands downstream',
      'how far downstream will the boat drift',
      'aim upstream to land opposite',
      'swimmer crossing a flowing river',
      'plane flying in a crosswind',
      'heading versus actual course',
      'where the bow points is not where you go',
      'drift caused by a current',
      'steering to compensate for a crosswind',
    ],
  },

  briefing: {
    observable: [
      'A river runs between two banks with white streaks flowing downstream, a boat starting at the near bank and a marker on the far bank directly opposite the start, named as the opposite point.',
      'The boat holds its bow pointing straight across while it crosses, and yet it travels along a slant and lands well downstream of the marker.',
      'A faint outline of the boat travels the dashed line the bow alone would have taken — straight across — while the solid boat runs beside it further and further downstream.',
      'Between the two, an accented segment stands for how far the flow has carried the boat off that line, and it lengthens the whole way over.',
      'On arrival a line states the distance downstream of the opposite point that the boat actually landed.',
      'While the boat is crossing with the bow turned, the caption says that where the bow points is not where the boat goes — the current pushes it.',
      'The boat is held at the far bank for a moment and then the crossing begins again from the near bank.',
    ],

    screen: {
      affordances: [
        'A slider on the lower left turns the bow, in five degree steps, upstream or downstream, its label naming which sign is which; changing it starts the crossing over from the near bank.',
        'Turning the bow upstream shortens the accented drift segment, and at one setting the boat lands on the marker and the closing line reads that it landed at the opposite point — a setting the reader finds rather than is given.',
        'Turning it further upstream overshoots and the closing line reports landing upstream of the marker instead, so the right aim is bracketed from both sides.',
        'Turning the bow means a slower crossing as well as a different landing, since less of the boat’s effort goes across, and the run visibly takes longer.',
        'Left alone the boat crosses with the bow straight across and lands downstream, so the argument is complete without touching the slider.',
      ],
    },

    useWhen: [
      'The reader believes that pointing at a target is enough to reach it. The faint boat travelling the dashed straight line while the real one slides downstream of it is what separates aim from result.',
      'The article claims that a steering correction must be worked out rather than guessed, and needs a case where the reader can hunt for the aim that lands on the mark and see how narrow it is.',
      'The subject is a crosswind or current in a practical setting — a pilot, a swimmer, a ferry — and a picture is wanted where the correction is made by turning a heading, not by adding arrows.',
    ],

    avoidWhen: [
      'The point is that the description depends on who is watching. The viewpoint here is fixed on the bank and never moves.',
      'The subject is the addition rule itself, drawn as two arrows joined head to tail. No velocity arrows appear; the composition is shown as two paths and the gap between them.',
      'The flow needs to vary across the river, or the boat to change its aim part way over. The current is the same everywhere and the bow is held at one angle for a whole crossing.',
      'The crossing time, the boat’s speed or the current’s speed are wanted as figures. Only the bow angle and the final distance off the mark appear as numbers.',
      'The article is about a body carried along by something under gravity, or about a curved path. This crossing is at a steady speed along a straight slant.',
    ],

    contrastWith: [
      {
        concept: 'relative-velocity',
        note: 'One changes how the boat is aimed and asks where it lands; the other leaves the boat alone and changes who is watching, asking what the same crossing looks like.',
      },
      {
        concept: 'vector-addition',
        note: 'One is the rule for joining two arrows into a sum; the other is a case where the sum is a landing place, and the question is which of the two arrows to choose so that the sum comes out where it is wanted.',
      },
      {
        concept: 'uniform-motion',
        note: 'Both bodies move at unchanging velocity; one reads that off evenly spaced marks along a line, the other takes two such motions at once and asks where the combination arrives.',
      },
    ],
  },
};
