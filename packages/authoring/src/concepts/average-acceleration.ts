/**
 * average-acceleration 개념 선언.
 *
 * 형제 둘과 갈라야 한다.
 *   average-acceleration      **크기가 두 끝 속도만으로 정해진다** — 중간 이력은 떨어져 나간다
 *   direction-of-acceleration 크기 이야기는 하지 않는다 — **속도와 같은 쪽인가 반대쪽인가**
 *   average-velocity          나누는 것이 위치 변화이고, 답하는 것은 "어디까지 갔나"
 * 이쪽만 두 이력의 견줌 · 처음과 끝 · 할선이 하나로 겹치는 일을 어휘로 갖는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const averageAccelerationConcept: Aperi21ConceptSource = {
  id: 'average-acceleration',
  label: 'Average Acceleration',
  canonicalSim: 'aperi21:average-acceleration',

  surface: {
    definition:
      'Change of velocity over elapsed time, a quantity settled by the first and last velocities alone, so that two bodies which got there quite differently still share it.',
    exemplarKeywords: [
      'average acceleration',
      'delta v over delta t',
      'change in velocity divided by the time taken',
      'metres per second squared',
      'zero to sixty in five seconds',
      'does it matter how it got up to speed',
      'two cars reaching the same final speed',
      'gradient of the chord on a velocity-time graph',
      'mean acceleration over an interval',
      'the middle of the interval drops out',
    ],
  },

  briefing: {
    observable: [
      'Two cars run in two marked lanes, each carrying a velocity arrow with its speed written beside it.',
      'Both leave the start line at ten metres per second, and both are at twenty when five seconds are up.',
      'Under the lanes a graph of velocity against time is drawn, its axes named, ticked only at the values the argument uses.',
      'One velocity curve climbs as a straight line; the other dips below it early, then swings up steeply to meet the first at the same final height.',
      'Beneath each curve lies a broad faint dashed band running from the starting point to the point reached now, which is the line joining start to present.',
      'While the cars are still running the two bands sit at different tilts, and the dipping car’s band is plainly not where its own curve is.',
      'At five seconds the two bands turn into one solid accent line with its value written along it.',
      'A dashed right angle then appears beneath that line, with the elapsed time written on one side and the gain in velocity on the other.',
      'The joined line stands for a while before the whole run begins again.',
    ],

    screen: {
      affordances: [
        'The run, the fusing of the two lines and the measuring appear in that order and then repeat, so the moment of fusing arrives without being triggered.',
        'The lanes and the graph are on screen together and share a clock, so a car’s arrow and its own curve can be checked against each other while it runs.',
        'Ticks are put only at the values the claim rests on, which leaves the two tilts to be compared against each other rather than measured off a grid.',
      ],
    },

    useWhen: [
      'The reader accepts the formula but doubts that two histories as unlike as steady climbing and dipping-then-surging can carry one value. The instant the two joining lines fuse is the moment to write against.',
      'What has to be established is that this average discards the middle of the span by construction rather than by approximation, and a case is needed where the discarded middles are wildly different.',
    ],

    avoidWhen: [
      'The subject is instantaneous acceleration or a tangent at a moment. The lines drawn here reach from the start to the present and are never shrunk down.',
      'The question is whether a body gains or loses speed. Both cars gain throughout and neither is ever pushed against its motion.',
      'The text is about ground covered, or about the area shut in beneath a velocity curve. Nothing is shaded and no distance is quoted.',
      'The argument rests on a body under gravity, or on a particular constant such as nine point eight. These two run on level ground and the value that comes out is two.',
    ],

    contrastWith: [
      {
        concept: 'average-velocity',
        note: 'One divides a change of velocity by time and answers how a motion was altered; the other divides a change of place by time and answers where the body got to.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One says the size is fixed by the two end velocities whatever happened between; the other says nothing about size and everything about which way it points relative to the velocity.',
      },
      {
        concept: 'velocity-time-graph',
        note: 'Both read the same kind of graph but take different things from it — one the tilt of a line joining two moments, the other the area shut in beneath the curve.',
      },
    ],
  },
};
