/**
 * average-velocity 개념 선언.
 *
 * 위험한 이웃이 셋이다 — `uniform-motion` · `uniformly-accelerated-motion` ·
 * `position-time-graph`. 넷 다 위치와 시간을 말하므로 **주장**으로 갈랐다.
 *   average-velocity  값이 **운동이 아니라 고른 구간**에 붙어 있다 — 끝을 옮기면 값이 바뀐다
 *   uniform-motion    비율이 아예 변하지 않으므로 고를 구간이 없다
 *   position-time-graph  선 자체의 기울기가 빠르기를 말한다 (구간을 고르는 일이 없다)
 * 이쪽만 구간·끝점·선택·"0 이 나오는 이유" 어휘를 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const averageVelocityConcept: Aperi21ConceptSource = {
  id: 'average-velocity',
  label: 'Average Velocity',
  canonicalSim: 'aperi21:average-velocity',

  surface: {
    definition:
      'Displacement over elapsed time across a chosen interval, a figure belonging to the two endpoints picked rather than to the journey, so that moving an endpoint moves it.',
    exemplarKeywords: [
      'average velocity',
      'total displacement divided by total time',
      'average speed versus average velocity',
      'why did my average come out zero',
      'went out and came back to where it started',
      'choosing the start time and the end time',
      'the straight line joining two points on a graph',
      'mean velocity over an interval',
      'it says nothing about what happened in between',
      'average velocity of a round trip',
    ],
  },

  briefing: {
    observable: [
      'A graph of place against time is drawn with numbered ticks on both axes, and the journey on it goes forward for four seconds, holds still for two, then comes back.',
      'A shaded band marks the interval currently picked, with a dashed guide standing at each of its two ends.',
      'A straight line joins the two points where those guides meet the journey, carried faintly a little past each end, with a right-angled tilt triangle under it.',
      'A strip beside the graph acts as the road, with a dot for where the body is and an arrow along it for the displacement between the picked ends.',
      'A written line keeps the arithmetic in view — the two times, the displacement, the elapsed time and the quotient, in the same digits a reader would read off.',
      'The later end slides further out first, and the joining line starts steep and lies down flatter as the standing-still and the return are taken in.',
      'Then the earlier end slides forward, the line passes through level — where the quotient reads zero although the body was never at rest for the whole of it — and tilts below level into negative figures.',
      'The journey itself never moves. All that changes is the band and the line stretched across it.',
    ],

    screen: {
      affordances: [
        'The band walks its two ends out and back on its own and then begins again, so every position of the interval comes round without being asked for.',
        'The arithmetic is rewritten at every moment to the same precision as the drawn line, which lets the quotient and the tilt of the line be checked against each other.',
        'The journey and the band are drawn on one set of axes, so it is visible that only the band is being moved.',
      ],
    },

    useWhen: [
      'A round trip has come out with an average of zero and the reader suspects the arithmetic is broken. The joining line swinging through level while the journey underneath is untouched puts the zero where it belongs, in the choice of endpoints.',
      'The point being made is that an average reports nothing about the middle of the span it covers, and that the span is something the writer picked rather than a fact about the body.',
    ],

    avoidWhen: [
      'The subject is instantaneous velocity, the tangent, or shrinking an interval down to a point. The band here stays wide and is never taken to a limit.',
      'The text is about reading a gradient off a graph as a general skill. The line drawn here runs between two marked ends, and the whole claim is that those ends were chosen.',
      'The topic is velocity changing — how quickly it changes or which way the change points. The journey is fixed and only the interval moves.',
      'Numbers are unwelcome. Times, distances and the quotient are all written out and are meant to be read.',
    ],

    contrastWith: [
      {
        concept: 'uniform-motion',
        note: 'One says the answer depends on where the span is cut and may match no instant inside it; the other says nothing needs cutting, because the rate never varies in the first place.',
      },
      {
        concept: 'average-acceleration',
        note: 'One divides a change of place by time and answers where a body got to; the other divides a change of velocity by time and answers how its motion was altered.',
      },
      {
        concept: 'position-time-graph',
        note: 'One is about deliberately picking two moments and what the resulting figure conceals; the other is about the tilt of the drawn line itself reporting how fast the body goes.',
      },
    ],
  },
};
