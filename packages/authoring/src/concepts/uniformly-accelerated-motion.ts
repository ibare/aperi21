/**
 * uniformly-accelerated-motion 개념 선언.
 *
 * 형제는 `uniform-motion`. 화면 얼개가 거의 같으므로(자국 · 간격 · 쌓기) 갈림은
 * **쌓인 것이 무엇을 말하는가**다.
 *   uniform-motion               오른쪽 끝이 한 줄로 맞는다 — 간격이 같다
 *   uniformly-accelerated-motion 오른쪽 끝이 같은 폭의 계단이 된다 — 같은 만큼씩 늘어난다
 * definition 에서 낱말을 겹치지 않게 썼다(저쪽 "gaps stay alike", 이쪽 "each stretch runs
 * longer by the same fixed extra amount").
 *
 * `gravitational-acceleration` 과도 갈린다 — 저쪽은 일정한 가속도가 **속도**에 하는 일을,
 * 이쪽은 **거리**에 하는 일을 말한다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const uniformlyAcceleratedMotionConcept: Aperi21ConceptSource = {
  id: 'uniformly-accelerated-motion',
  label: 'Uniformly Accelerated Motion',
  canonicalSim: 'aperi21:uniformly-accelerated-motion',

  surface: {
    definition:
      'Motion under constant acceleration, in which each successive stretch covered in one step of the clock runs longer than the stretch before it by the same fixed extra amount.',
    exemplarKeywords: [
      'uniformly accelerated motion',
      'constant acceleration in a straight line',
      'kinematic equations',
      'v equals u plus a t',
      's equals u t plus half a t squared',
      'distances covered in successive seconds',
      'the gaps grow by the same amount each time',
      'steadily speeding up',
      'suvat problems',
      'distance grows with the square of the time',
    ],
  },

  briefing: {
    observable: [
      'A body runs along a track, already moving when it sets out, and stamps a short upright mark at its place every half second.',
      'As a gap opens between the last mark and the body, a bar grows under the track to match the width of that gap.',
      'Once a gap is finished its bar leaves the track and drops onto a ladder of rows below, every row lined up at its left end.',
      'Within each bar, the length by which it exceeds the bar above is drawn in the accent colour at its right-hand end.',
      'Six rows accumulate, and those accent lengths line up into a staircase of equal-width steps down the right side of the ladder.',
      'A written line first names what is happening, that the body’s place is being stamped at equal steps of the clock, and then states the claim about the extra distance.',
      'The finished ladder stands for a few seconds, fades out, and the run begins again.',
    ],

    screen: {
      affordances: [
        'The running, stamping, stacking and starting over all happen by themselves, so the finished ladder arrives without being asked for.',
        'Left alignment of the rows does the comparing, so the staircase at the right-hand end is something to look at rather than a set of lengths to measure.',
        'Only the excess over the previous row is given the accent colour, which keeps the claim about the extra amount separate from the growing length itself.',
      ],
    },

    useWhen: [
      'The reader has been told that distance grows with the square of the time and cannot see it. A staircase of accent steps all of one width is that squaring turned into something to look at.',
      'The difference between a rate that is constant and a rate that is constantly changing is the thing being drawn out, for a reader who can already picture steady motion.',
    ],

    avoidWhen: [
      'The subject is the formulae themselves and which of them to reach for. No expression, symbol or numerical value is written here.',
      'The point is what a constant acceleration does to the velocity rather than to the ground covered. No velocity arrow is drawn and the body’s speed is never named.',
      'The body is meant to start from rest and the ratio one to three to five is the argument. This one is already moving when it sets off, which was a deliberate choice.',
      'The text is about reading a graph with axes. The evidence is marks on a track and bars stacked beneath it.',
      'The motion wanted is vertical or under gravity. The track is level and nothing here falls.',
    ],

    contrastWith: [
      {
        concept: 'uniform-motion',
        note: 'One claims the gaps grow, and grow by a fixed extra amount every time; the other claims they come out alike and keep coming out alike at whatever pace is set.',
      },
      {
        concept: 'gravitational-acceleration',
        note: 'One is about the ground covered piling up by a fixed extra amount each step; the other is about the velocity itself shifting by a fixed amount, including through the instant it passes zero.',
      },
    ],
  },
};
