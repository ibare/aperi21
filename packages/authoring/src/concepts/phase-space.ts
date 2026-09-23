/**
 * phase-space 개념 선언.
 *
 * 이 묶음에서 유일하게 **읽는 평면**이 주제다 — 시간축이 없고 가로가 각도, 세로가 각속도다.
 * 형제(진동 셋 · 주고받는 셋)와는 주어가 다르다. 갈림은 「무엇을 그리는가」 로 선다.
 *   phase-space          운동을 **위치-속도 평면의 한 점**으로 그린다. 마찰이 없으면 닫힌 고리,
 *                        있으면 고리를 가로질러 한 점으로 감겨 든다
 *   velocity-time-graph  속도를 **시간에 대해** 그리고 넓이를 읽는다
 *
 * 화면 세로축은 **각속도**다(운동량이 아니다). definition 도 속도로 쓴다 — 간극 장부 참조.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const phaseSpaceConcept: Aperi21ConceptSource = {
  id: 'phase-space',
  label: 'Phase Space',
  canonicalSim: 'aperi21:phase-space',

  surface: {
    definition:
      'Drawing a motion as a single point on a plane of position against velocity, where a body losing no energy retraces one closed loop, and one that loses energy cuts across the loops into a single resting point.',
    exemplarKeywords: [
      'phase space',
      'phase plane',
      'phase portrait of a pendulum',
      'plotting velocity against position instead of against time',
      'closed orbits in the phase plane',
      'spiralling into a fixed point',
      'state of a system as one point',
      'trajectories that never cross',
      'separatrix between swinging and going right over the top',
      'attractor at the bottom',
      'reading a motion without a time axis',
    ],
  },

  briefing: {
    observable: [
      'A wide plane is drawn with its across direction named as angle and its up direction as angular velocity, and labels mark which end of the across direction is the hanging-down position and which is standing on end.',
      'Faint closed rings are drawn on the plane, nested inside one another, each ring being the set of states a body of one fixed energy can be in. Outside the outermost ring the lines no longer close but run off across the plane.',
      'A dotted line separates those two families — inside it the motion swings back and forth, outside it the motion carries right over the top.',
      'A pendulum is drawn to one side, and one state point on the plane is marked in the accent colour to go with it, so a place on the plane can be matched to a position and a speed of a real object.',
      'That accent point leaves a trail. It does not come back to where it started: each time round it sits on a slightly smaller ring than the time before, and the trail winds inward over many turns.',
      'The winding ends at one place, the point standing for hanging still at the bottom, and both the trail and the pendulum stop there together.',
      'Hundreds of faint points are scattered across the plane at once, each one its own copy of the same body started differently, with short fading tails behind them showing which way they are going.',
      'The whole scattered crowd, however widely it was spread at the start, is drawn in over time towards that same one place — first squeezed into the shape enclosed by the dotted line, then bunched at the bottom of it.',
      'With the resistance turned right down the picture changes in kind: points keep to the rings they began on, going round and round without ever moving to an inner ring, and the crowd never gathers.',
      'The crowd is thrown out afresh and the picture starts again at regular intervals.',
    ],

    screen: {
      affordances: [
        'A slider along the bottom sets how much resistance the motion meets, from none up to a good deal, and the picture answers immediately in kind rather than in degree.',
        'The picture arrives already running, with the crowd part-way through being drawn in.',
        'The accent colour is kept for one meaning only — the one body being followed, its point, its trail and the drawn pendulum — so which of the many points is the story never has to be said.',
        'The rings, the dotted boundary and the axis names are all drawn faintly in the same grey, which keeps them as a backdrop the moving points are read against.',
        'The trails behind the crowd fade towards their older end, so which way round the plane the motion runs can be read from a still picture.',
        'A line of text below states which of the two pictures is on show.',
        'The plane carries no scale marks and no figures — positions on it are read against the named ends and against the rings.',
      ],
    },

    useWhen: [
      'The article has introduced the phase plane and the reader has no feel for what a point on it means. A pendulum drawn beside the plane with its own state marked in the same colour is what ties the two together.',
      'The claim being made is that losing energy shows up as crossing from one loop to an inner one, and a case is wanted where the loops themselves are drawn so the crossing is something to watch.',
      'The article is about many different starts ending in the same place, and what is wanted is a whole crowd of states being gathered in rather than one trajectory shown as representative.',
    ],

    avoidWhen: [
      'The subject is how a quantity develops as time passes, or anything read off against a time axis. Time is nowhere on this plane; a whole history is one curve.',
      'The article is about a mass on a spring and the shape of its motion. What is drawn here is a pendulum, and the outer part of the plane is about going right over the top, which a spring has no counterpart for.',
      'What is wanted is how quickly the dying away happens, measured in swings or in seconds. No time is marked and the winding-in is watched rather than counted.',
      'The point is an outside rhythm applied to keep the motion going. Nothing drives this pendulum; it only ever loses.',
      'Values are needed — angles, speeds, energies. The plane has no scale on it.',
    ],

    contrastWith: [
      {
        concept: 'velocity-time-graph',
        note: 'Both put velocity on the upright direction, but one sets it against position so that a whole repeating motion becomes one closed curve, while the other sets it against time and reads the area beneath it.',
      },
      {
        concept: 'position-time-graph',
        note: 'One drops the time axis so that the state of a body at an instant is a single point and its history is a path; the other keeps time across the bottom and reads the tilt of the line.',
      },
      {
        concept: 'uniform-circular-motion',
        note: 'Both produce a closed loop gone round again and again, but one is a loop in a plane of position against velocity standing for a back-and-forth motion, while the other is a real circular path in space.',
      },
    ],
  },
};
