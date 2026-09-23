/**
 * trajectory-equation 개념 선언.
 *
 * 포물선 셋 중 **경로 자체**가 이쪽 몫이다.
 *   trajectory-equation  시각 딱지를 지워도 **곡선은 그대로 남는다** — 시간이 빠진 관계
 *   projectile-motion    **두 성분이 서로를 건드리지 않는다**
 *   projectile-range     **각도가 닿는 거리를 정한다**
 * 이쪽만 소거·시각 딱지·「언제가 없는 어디」 어휘를 갖는다.
 * `position-time-graph` 와도 갈린다 — 저쪽은 시간축이 그림의 축이고 이쪽엔 시간축이 없다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const trajectoryEquationConcept: Aperi21ConceptSource = {
  id: 'trajectory-equation',
  label: 'Trajectory Equation',
  canonicalSim: 'aperi21:trajectory-equation',

  surface: {
    definition:
      'The path of a flight taken on its own terms, as a relation between how far across and how high, which survives unchanged when the instants that produced it are stripped away.',
    exemplarKeywords: [
      'trajectory equation',
      'eliminating time from the equations of motion',
      'path equation y as a function of x',
      'the shape of the path without time',
      'substituting t out of the two component equations',
      'parabolic path of a projectile',
      'where it goes rather than when',
      'the curve left when the clock is removed',
      'relation between horizontal and vertical position',
      'path in space versus motion in time',
    ],
  },

  briefing: {
    observable: [
      'A ball flies an arch above a ground line, and the path it has covered so far is drawn behind it as a curve.',
      'At evenly spaced instants a dot is dropped on that curve, and beside each dot a small label names the instant it belongs to.',
      'The dots crowd together near the top of the arch and spread apart toward each end, even though they were laid at equal intervals of the clock.',
      'When the flight is over, the curve stands complete with its whole row of time-labelled dots.',
      'A vertical line then sweeps across the picture from one side to the other, with a soft smear trailing behind it, and everything it passes loses its dot and its label.',
      'Behind the sweeping line the curve is left bare; ahead of it the dots and their labels are still standing, so for a moment the same path is half labelled and half not.',
      'When the sweep has finished, the curve is exactly the curve it was — same arch, same endpoints, same height — with nothing left to say when any of it happened.',
      'The captions follow the steps: at each instant the ball passes one point; every point it passed carries a time; erase the times; without the times, the path stays just the same.',
      'The bare curve is held, fades, and the flight begins again.',
    ],

    screen: {
      affordances: [
        'The flight, the labelling, the sweep and the bare curve run in order and repeat by themselves, so the erasure comes round again without being asked for.',
        'The reader arrives partway through a flight already in progress, with some of the path and some of its labels already laid down.',
        'The sweep crosses the middle of the arch, which puts labelled and unlabelled halves of the same curve side by side for the length of the sweep.',
        'Nothing but the labels is touched — the curve is never redrawn, moved or rescaled — so that its being unchanged is something to look at rather than to take on trust.',
      ],
    },

    useWhen: [
      'The article works through substituting the time out of two component equations and the reader cannot see what is gained. The sweep taking the labels while the arch stands unchanged is what the substitution amounts to.',
      'The claim is that where a body goes and when it got there are separable questions, and a case is wanted where one of them is visibly removed and the other is untouched.',
      'The reader is treating the path as a picture of the motion and needs to be shown that the path is an object in its own right, with its own relation between across and up.',
    ],

    avoidWhen: [
      'The subject is the two directions going on independently during the flight, or bodies launched differently landing together. One ball flies here and nothing is compared with it.',
      'The point is how far a launch carries or which angle throws furthest. This flight is fixed and there is no ground scale to measure against.',
      'The article is about reading a graph with a time axis. There is no time axis here; the time appears only as tags attached to points on the path itself.',
      'The equation itself is wanted on screen — a formula relating height to distance. The screen argues that the curve survives the erasure; it does not write down what the curve satisfies.',
      'Air resistance matters. The arch is symmetric, which is only true because nothing resists.',
    ],

    contrastWith: [
      {
        concept: 'projectile-motion',
        note: 'One takes the path as a thing that outlives the timetable that made it; the other is about what the two directions do to each other during the flight, which is nothing.',
      },
      {
        concept: 'projectile-range',
        note: 'One is about the whole curve considered without its clock; the other is about one point of it, where the body comes down, and the launch conditions that put it there.',
      },
      {
        concept: 'position-time-graph',
        note: 'One is a path in space with the times removed; the other is a drawing whose very axis is the clock, so removing time there would leave nothing.',
      },
      {
        concept: 'uniform-motion',
        note: 'One erases the instants to show the path is indifferent to them; the other reads the instants as the whole point, since equal gaps between marks in equal times is the claim.',
      },
    ],
  },
};
