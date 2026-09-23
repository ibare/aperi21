/**
 * keplers-second-law 개념 선언.
 *
 * 형제는 `keplers-third-law`. 둘 다 궤도와 시간을 다루므로 **주어를 갈랐다.**
 *   keplers-second-law  궤도 **하나** 안에서 빠르기가 달라지는데 무엇이 같은가 — 쓸고 간 넓이
 *   keplers-third-law   궤도 **둘** 을 견준다 — 반지름이 커지면 주기가 얼마나 더 길어지는가
 * 이쪽만 부채꼴 · 넓이 · 근일점/원일점 어휘를 갖고, 저쪽의 바퀴 수 · 긴반지름 · 주기의 비는 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const keplersSecondLawConcept: Aperi21ConceptSource = {
  id: 'keplers-second-law',
  label: "Kepler's Second Law — Equal Areas in Equal Times",
  canonicalSim: 'aperi21:keplers-second-law',

  surface: {
    definition:
      'A body on an elongated orbit sweeps out the same area from the focus in every equal interval: short broad fans where it races, long narrow ones where it creeps.',
    exemplarKeywords: [
      "Kepler's second law",
      'equal areas in equal times',
      'law of areas',
      'why a planet speeds up near the Sun',
      'fastest at perihelion and slowest at aphelion',
      'the line to the Sun sweeps area',
      'comets whip past the Sun and crawl back out',
      'a planet does not travel at a steady speed',
      'areal velocity stays constant',
      'radius vector sweeping equal areas',
    ],
  },

  briefing: {
    observable: [
      'A long, narrow orbit is drawn with the Sun off to one side of it rather than at the middle, and one planet runs round it.',
      'The journey is cut into twelve stretches of exactly the same duration, and each stretch leaves behind the fan of ground the line from the Sun swept during it.',
      'The finished fans stay on screen in two alternating tones with a thin seam between neighbours, so they can be counted and their shapes compared side by side.',
      'The fans are shaped very differently: near the Sun the planet crosses a short, broad wedge; on the far side of the orbit it inches through a long, thin sliver.',
      'Under the orbit a row of bars grows, one bar per stretch, and each bar is as tall as the area of that stretch’s fan actually measures.',
      'Every bar reaches the same dashed line across the top, so the differently shaped fans are shown to hold the same amount of ground.',
      'A sentence under the picture names where on the orbit the planet is at that moment — rushing past close in, creeping along far out, or crossing between — and each time ends by saying the bar fills to the same height as the others.',
      'Nothing is numbered: no area, no speed, no axis and no scale appear anywhere.',
    ],

    screen: {
      affordances: [
        'The orbit runs by itself, one equal stretch after another, and starts again once the twelve are complete; nothing has to be pressed.',
        'Arriving mid-orbit is the normal case — the planet is already most of the way round with nearly every fan filled in, so the accumulated comparison is there from the first glance.',
        'The comparison rests on two things being visible at once: the fan that is being swept now, and every fan swept before it, kept rather than erased.',
      ],
    },

    useWhen: [
      'The article has said that a planet moves fastest when it is closest, and the reader is left with an orbit that seems to have no rule at all. The fans of wildly different shape topped by bars of one height supply the thing that stays constant.',
      'A comet or a very eccentric orbit is being described and the prose needs a picture where the shape of the path and the change of speed are one single fact rather than two.',
    ],

    avoidWhen: [
      'The point is how long the whole trip takes, or how the period changes when the orbit is made larger. One orbit runs here and its period is never compared with anything.',
      'The article is about the shape of the orbit itself — the ellipse, its two foci, what eccentricity means. The orbit here is a fixed stage for the sweeping and never changes.',
      'Angular momentum is the quantity being carried, and the reader has to see it as a product of a distance and a speed. Nothing here is decomposed that way; the constant thing is an area.',
      'Numbers are wanted — how many times faster at closest approach, how large the area, what the speeds are. No value is written anywhere.',
      'The subject is why the planet curves at all, or the force that holds it. No force, no pull and no acceleration is drawn.',
    ],

    contrastWith: [
      {
        concept: 'keplers-third-law',
        note: 'One asks what stays constant while a single body races and creeps around one orbit; the other sets two different orbits beside each other and asks how the time for one lap grows with their size.',
      },
      {
        concept: 'conservation-of-angular-momentum',
        note: 'One is the same fact in the language of orbits, where it reads as an area swept per unit of time; the other states it as a quantity a spinning body carries and keeps as it pulls in or spreads out.',
      },
    ],
  },
};
