/**
 * triple-point 개념 선언.
 *
 * 상변화 셋 중 하나. 축으로 갈랐다 — 이쪽은 축이 아니라 **한 점**이다.
 *   latent-heat    시간과 온도 — 데우는데 멈춘다
 *   phase-diagram  압력과 온도 — 경계선을 몇 번 건너는가
 *   triple-point   **그 점에서만 셋이 함께 머물고, 조금만 벗어나면 하나만 남는다**
 * 이쪽만 「한 그릇에 셋이 함께 · 붙들고 하나만 옮긴다 · 벗어난 폭 · 하나만 남는다」 어휘를
 * 갖는다. 가열 경로 · 승화 · 잠열 · 경계선을 건넌 횟수는 쓰지 않는다 — 삼중점 둘레만 확대한
 * 그림이라 경로가 없다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const triplePointConcept: Aperi21ConceptSource = {
  id: 'triple-point',
  label: 'The One Condition Where Three Phases Hold Together',
  canonicalSim: 'aperi21:triple-point',

  surface: {
    definition:
      'The single pressure and temperature at which solid, liquid and vapour of one substance persist side by side, any small move in either leaving only one of the three.',
    exemplarKeywords: [
      'triple point',
      'three phases coexisting',
      'triple point of water',
      '0.01 degrees and 611.657 pascals',
      'why is the triple point used as a fixed point',
      'ice, water and vapour together in one vessel',
      'the condition for coexistence',
      'what happens just off the triple point',
      'where the three boundaries meet',
      'a reference point that does not drift',
    ],
  },

  briefing: {
    observable: [
      'A sealed vessel on the left holds floating pieces of ice, a body of water and drifting grains of vapour all at the same time, in one colour, told apart by texture and by shape.',
      'On the right is a close view of the neighbourhood where three boundaries meet, with a marked dot sitting exactly at the meeting, and the only two tick labels on the whole chart are 0.01 ℃ and 611.657 Pa.',
      'One quantity is moved at a time: the dot runs along a horizontal dashed line when the pressure is being held, and along a vertical one when the temperature is, so what is held is shown by the track rather than announced.',
      'Beside the arrow that moves it, the size of the departure is written — +1 ℃, −1 ℃, −40 Pa, +40 Pa — and never the value arrived at.',
      'Once the dot is inside a region, the contents of the vessel shift until only that one thing is left: the ice shrinking and the water draining away to leave only vapour, or the water and vapour going to leave a single grown block of ice, or the ice and vapour going to leave only water.',
      'The dot is then returned to the meeting point and the three are laid out again as before, and the cycle goes on through all four directions.',
      'The regions on the chart carry the same textures as the contents of the vessel, so what the dot is standing in and what is left in the vessel are visibly the same thing.',
      'The lean of the boundary that separates ice from water is drawn far steeper than it really is, so that a dot moved up in pressure lands plainly on one side of it.',
    ],

    screen: {
      affordances: [
        'Four departures — warmer, cooler, thinner, denser — run in order in one round and then begin again; nothing has to be pressed.',
        'Only one quantity moves at a time, so what is being tested is always a departure in a single direction.',
        'The chart shows only the immediate neighbourhood, which is what makes a move of one degree a long visible travel rather than an imperceptible one.',
        'The figures written are the departures, never the positions reached, so nothing on the screen is a value computed on the way.',
        'Returning to the start is stated as the picture being set out again, since the three do not reassemble on their own.',
      ],
    },

    useWhen: [
      'The article has said the three phases coexist at exactly one condition, and the reader hears "exactly" as loose talk. Watching a single degree empty the vessel down to one phase is what makes it literal.',
      'The point is why this condition is used as a reference that does not drift — and what is wanted is the demonstration that it cannot be nudged and still be itself.',
    ],

    avoidWhen: [
      'The article needs the whole map, a heating path across it, or sublimation as a route. Only the immediate neighbourhood is shown and nothing is heated through it.',
      'The subject is the heat a change of state costs, or a temperature standing still while it runs. No energy appears and there is no time axis.',
      'The claim rests on the true lean of the ice-water boundary, or on how much pressure it takes to melt ice. That lean is drawn exaggerated on purpose.',
      'The substance is not water, or the critical point is at issue. The two figures on the chart are water’s, and the view stops well short of anything else.',
      'The article is about supercooling, metastable states, or how long coexistence lasts.',
    ],

    contrastWith: [
      {
        concept: 'phase-diagram',
        note: 'One is a single point and how unforgiving it is; the other is the map that point sits on, and what different routes across it run into.',
      },
      {
        concept: 'latent-heat',
        note: 'One has three states standing together with nothing arriving; the other has them arrive one after another as heat keeps going in.',
      },
      {
        concept: 'thermal-equilibrium',
        note: 'Both are states that stay put, but of different kinds — one is two bodies having settled on a common temperature, the other is three phases of one substance holding together at a condition that permits it.',
      },
      {
        concept: 'charles-law',
        note: 'Both end at one temperature that a scale can be anchored to, but one is a condition a substance actually occupies and can be brought back to, while the other is arrived at only by continuing a line past everything measured, with nothing sitting there.',
      },
    ],
  },
};
