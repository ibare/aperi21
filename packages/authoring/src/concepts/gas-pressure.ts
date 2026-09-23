/**
 * gas-pressure 개념 선언.
 *
 * 알갱이 넷 중 하나. 넷이 전부 「분자의 운동」 이라 **무엇을 묻는가**로 갈랐다.
 *   gas-pressure        **합** — 수많은 두드림이 쌓여 매끈한 한 값이 된다, 데우면 커진다
 *   pressure-from-collisions       **두 곱** — 세기 × 횟수, 속력을 두 배 하면 네 배
 *   maxwell-boltzmann-distribution **퍼짐** — 분자마다 속력이 다르고 그 분포가 온도를 탄다
 *   mean-free-path                 **사이 거리** — 다음 분자에 부딪히기까지 얼마나 가나
 * 이쪽만 매끈함 · 들썩임 · 수많음 · 온도를 직접 올려 봄 어휘를 갖는다.
 * 세기 · 횟수 · 곱 · 분포 · 꼬리 · 행로는 쓰지 않는다.
 *
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const kineticTheoryOfGasesConcept: Aperi21ConceptSource = {
  id: 'gas-pressure',
  label: 'Pressure as an Accumulation of Molecular Taps',
  canonicalSim: 'aperi21:gas-pressure',

  surface: {
    definition:
      'The steady push a gas seems to exert is the piled-up result of enormous numbers of separate molecular taps, growing as warming speeds the molecules up.',
    exemplarKeywords: [
      'kinetic theory of gases',
      'what is pressure really',
      'molecules drumming on the wall of a container',
      'why does a sealed can burst when it gets hot',
      'temperature is molecular motion',
      'a steady reading made of countless tiny events',
      'explaining something you can measure by something you cannot see',
      'gas pressure comes from molecules not from a substance pressing',
      'heating makes the molecules move faster',
      'the microscopic picture behind a macroscopic quantity',
    ],
  },

  briefing: {
    observable: [
      'Several hundred molecules drift inside a box, each drawn as a small dot trailing a short streak whose length is how fast it is going.',
      'The right-hand wall is drawn thicker than the other three: it is the one being measured.',
      'Whenever a molecule reaches that wall a mark is left on it in the one colour reserved for a strike, and the mark fades over the next moment.',
      'An upright bar beside the box stands for the push on that wall and is never quite still — it trembles all the time, because it is the sum of a finite number of events rather than a smooth quantity.',
      'Cold, the streaks are short, the marks on the wall are sparse and far apart in time, and the bar is low and visibly jumpy.',
      'Hot, the streaks are long, the marks crowd the wall so thickly that individual ones stop being distinguishable, and the bar stands about four times as high and trembles proportionally less.',
      'The round warms the gas and cools it again without being asked; the marks thin out and the bar settles back as it cools.',
      'No scale, gridline or number is drawn beside the bar, so what is read off it is “higher” and “steadier”, not a value.',
      'A handle at the lower right can be taken over to set the temperature; the reading beside it carries two decimal places for a quantity that is only ever wanted as a whole number.',
    ],

    screen: {
      affordances: [
        'The round warms and cools by itself and finishes what it has to say; the handle is there afterwards, for readers who do not believe that turning it up really speeds the molecules.',
        'Once the handle has been taken over the round stops running and the gas stays at whatever temperature was left; it does not spring back.',
        'The strike colour is spent on one meaning only — a molecule has just reached the measured wall — so the marks on the wall and the bar are legibly the same events counted twice.',
        'The trembling of the bar is passed through untouched rather than smoothed, because the trembling is itself part of the claim: a push made of separate taps cannot be perfectly steady.',
        'Only one of the four walls is thickened, so the bar is unambiguously about that wall and not about the box in general.',
      ],
    },

    useWhen: [
      'The article has said that a gas exerts pressure and the reader pictures a substance pressing outward. The marks appearing one by one on the wall while the bar trembles is what replaces the substance with a tally of events.',
      'The reader has been told that heating raises the pressure and wants the reason rather than the rule, and the moment wanted is the one where the streaks lengthen and the wall marks crowd together at once.',
      'The article turns on why a measured quantity looks smooth at all, and the handle lets the reader run the gas cold enough that the marks separate and the bar becomes visibly unsteady.',
    ],

    avoidWhen: [
      'The point is arithmetic — how many times the push grows for a given change of speed, or that it is one factor multiplied by another. Nothing here is counted or multiplied; the bar has no scale.',
      'The article is about molecules differing from one another in speed, or about a spread of speeds. Every molecule here is drawn the same way and no speeds are compared.',
      'The subject is how far a molecule gets before it meets another one. The molecules here pass through one another and only the walls are ever struck.',
      'A volume is to be changed, or a piston moved, or a quantity held while others vary. The box here is rigid and the amount of gas never changes.',
      'Values in pascals or kelvin are to be quoted from the picture. The bar is in arbitrary units and the temperature reading is dressed with two decimals it does not deserve.',
      'The article accounts for heat as energy — where it went, what it was spent on. Nothing here is added up as energy.',
    ],

    contrastWith: [
      {
        concept: 'pressure-from-collisions',
        note: 'One says that a push is nothing but a heap of separate blows; the other takes that for granted and works out how the heap grows, as a strength multiplied by a rate.',
      },
      {
        concept: 'maxwell-boltzmann-distribution',
        note: 'One treats the molecules as a crowd whose collective effect is all that matters; the other insists they are not alike and sets out how their speeds are spread.',
      },
      {
        concept: 'mean-free-path',
        note: 'One is about molecules meeting the container; the other is about molecules meeting each other.',
      },
      {
        concept: 'pressure-isotropy',
        note: 'One asks where a fluid’s pressure comes from; the other takes it as given and asks in which directions it acts.',
      },
      {
        concept: 'ideal-gas-law',
        note: 'One explains what pressure is made of; the other states the rule that binds it to volume and temperature without asking what any of them are made of.',
      },
    ],
  },
};
