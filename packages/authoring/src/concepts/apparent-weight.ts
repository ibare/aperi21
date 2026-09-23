/**
 * apparent-weight 개념 선언.
 *
 * 위험한 짝은 `normal-force`. **주어를 갈랐다.**
 *   apparent-weight  **저울 눈금** — 빠를 때가 아니라 속도가 **바뀌는 동안에만** 평소를 벗어난다
 *   normal-force     **접촉면의 밂** — 다른 힘이 더해지거나 접촉이 끊겨서 달라진다
 * 이쪽만 가속·등속의 구별, 눈금판, kg, 엘리베이터 어휘를 갖는다. 저쪽의 N 수치·바닥 눌림·
 * 뚫리지 않을 만큼이라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const apparentWeightConcept: Aperi21ConceptSource = {
  id: 'apparent-weight',
  label: 'Apparent Weight',
  canonicalSim: 'aperi21:apparent-weight',

  surface: {
    definition:
      'The reading a scale gives to someone riding with it, which departs from the usual figure only while the ride is gaining or losing speed and returns to it whenever the speed holds.',
    exemplarKeywords: [
      'apparent weight',
      'weight in an accelerating elevator',
      'why do you feel heavy when the lift starts',
      'scale reading in a moving lift',
      'feeling light on the way down',
      'does the reading change while moving at constant speed',
      'heavier at the start and lighter when stopping',
      'weightlessness in a falling lift',
      'that sinking feeling in an elevator',
      'bathroom scale inside a lift',
    ],
  },

  briefing: {
    observable: [
      'A lift car runs in a shaft with floor markings, and inside it a person stands on a scale whose dial is drawn large beside the shaft, marked in kilograms from thirty to ninety with the usual reading at the top.',
      'An arrow on the car shows the velocity, with its own written name, and it lengthens, holds and shortens as the ride goes.',
      'The needle leaves the usual mark only during the intervals when that arrow is changing length, and a sector opens between the usual mark and the needle showing how far it has strayed and on which side.',
      'Starting upward the needle goes above the usual reading; while the ride continues upward at a steady speed it sits exactly on the usual mark even though the car is plainly moving fast; slowing to a stop it goes below.',
      'Going down the same three intervals give the mirror of that — below, then usual, then above — so the direction of travel by itself decides nothing.',
      'A dotted line marks where the needle usually sits and stays drawn whether the needle is there or not, which is what makes a departure readable at a glance.',
      'The caption names each interval in terms of the speed rather than the direction — speed being gained, speed held, speed being lost — and says which way the reading went.',
      'The whole up-and-down round runs by itself and comes back, so the steady stretches and the changing stretches alternate in view.',
    ],

    screen: {
      affordances: [
        'The ride works through its eight intervals on its own — starting up, steady up, slowing at the top, resting, starting down, steady down, slowing at the bottom, resting — and repeats.',
        'The velocity arrow and the dial are on the screen at the same moment, so what the needle is doing can be checked against whether the arrow is changing.',
        'The needle swings to its new reading rather than jumping, so the moment a stretch of steady speed begins is seen as the needle settling back onto the usual mark.',
      ],
    },

    useWhen: [
      'The reader believes the reading depends on how fast the lift is going. The steady stretch, where the car is at its quickest and the needle is exactly on the usual mark, is the one to write against.',
      'The article distinguishes acceleration from velocity and needs an instrument whose reading answers to one and ignores the other.',
      'The writing is about what "feeling heavy" actually measures, and a case is wanted where the body has not changed at all and only the reading has.',
    ],

    avoidWhen: [
      'The article is about the floor’s push changing because something else pulls or presses on the body. Nothing touches this rider but the scale, and the lift never varies its load.',
      'The subject is free fall or weightlessness proper. The car always slows to a stop and the needle never reaches the bottom of the dial.',
      'Forces in newtons are wanted, or the relation N = m(g + a) has to be shown. The dial is marked in kilograms and no force arrow is drawn anywhere.',
      'The point is that mass and weight are different quantities, or that gravity differs from place to place. Gravity is the same throughout and the person is unchanged.',
      'The article needs a body whose acceleration the reader controls or chooses. The ride follows its own fixed round.',
    ],

    contrastWith: [
      {
        concept: 'normal-force',
        note: 'One is a reading that strays while the body accelerates; the other is a surface’s push that changes because something else has been added at the same contact.',
      },
      {
        concept: 'direction-of-acceleration',
        note: 'One is an instrument that answers to the acceleration and ignores the velocity; the other is the acceleration itself drawn beside the velocity so the two can disagree.',
      },
      {
        concept: 'newtons-second-law',
        note: 'One shows a body being accelerated and what that does to a reading; the other shows what fixes how large the acceleration is.',
      },
      {
        concept: 'uniform-motion',
        note: 'One shows a stretch of unchanging velocity by an instrument that goes quiet during it; the other shows the same stretch by the record the motion leaves behind.',
      },
    ],
  },
};
