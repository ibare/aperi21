/**
 * adiabatic-process 개념 선언.
 *
 * 과정 다섯 중 하나(가름은 `pv-diagram.ts` 머리 참조).
 * 이 조각은 **열을 막으면 무엇이 달라지는가** 를 주장한다 — 등온 곡선과 나란히 떠나
 * 찬 점이 빈 점 아래로 점점 벌어지고, 온도계가 내려간다.
 * 이쪽만 단열재 · 두 곡선의 가파름 견줌 · 내려가는 온도계 · 느려지는 분자 어휘를 갖는다.
 * 열 알갱이 · 더미(isothermal-process) 와 넓이(pv-diagram · cyclic-process) 는 두지 않았다 —
 * 곡선 아래를 칠하지 않아 avoidWhen 으로 되돌린다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const adiabaticProcessConcept: Aperi21ConceptSource = {
  id: 'adiabatic-process',
  label: 'Adiabatic Expansion of a Sealed Gas',
  canonicalSim: 'aperi21:adiabatic-process',

  surface: {
    definition:
      'An expansion with the heat path sealed off, in which the pressure falls away more steeply than it would at fixed temperature and the gas cools as it pushes.',
    exemplarKeywords: [
      'adiabatic process',
      'expansion with no heat exchange',
      'insulated cylinder',
      'why does a gas cool when it expands',
      'the adiabatic curve is steeper than the isotherm',
      'no heat in or out',
      'compressed air gets hot',
      'the gas cools because it did the work itself',
      'sealed against heat flow',
      'steeper than a constant temperature curve',
    ],
  },

  briefing: {
    observable: [
      'A cylinder wrapped on three sides in a hatched band of insulation, its piston rising from the starting volume to twice that.',
      'A thermometer beside the cylinder has its column fall from the upper mark to a mark well below it, and the short streaks standing for the molecules grow visibly shorter as it falls.',
      'On the right, two curves leave one shared starting point. One is dashed, fainter and a shade thinner, carrying a hollow marker; the other is solid and heavier, carrying a filled marker.',
      'The two markers travel to the same volume together, and the filled one sinks below the hollow one by more and more as they go — that opening gap is what "more steeply" looks like.',
      'Each curve wears a word beside it saying which it is, so the two are told apart by their line and their name rather than by being coloured differently.',
      'When the rise stops, dashed guide lines reach from the two end markers across to the upright axis, and a mark appears on it for each, written as a fraction of the starting pressure.',
      'The closing line names all three at once — the volume doubled, the two end pressures, and the temperature the thermometer has come down to.',
      'The accent colour is spent only on the thermometer’s column and bulb, so the falling temperature is the one thing on screen that is coloured.',
      'Both curves are drawn out to the left of the starting volume as well, so their shapes may be compared and not only their endpoints.',
      'A short return brings the piston down while the thermometer climbs again, and the round begins afresh.',
      'No exponent, no equation and no absolute pressures appear; the upright axis carries only the starting mark and the two end marks.',
    ],

    screen: {
      affordances: [
        'The round plays through by itself; nothing is pressed and no setting is offered.',
        'The dashed curve is present only as the thing to be outrun, drawn thinner and fainter so the eye takes the solid one for the subject.',
        'The end pressures are withheld until the rise has stopped, so the widening gap is watched first and only afterwards pinned to figures.',
        'The insulation is drawn as a band that wraps the cylinder rather than being stated in words, so the sealing is a visible part of the apparatus.',
        'The curves are cut off at the edge of the plotting area so that neither runs over the axis arrow.',
      ],
    },

    useWhen: [
      'The article has stated that an adiabatic curve is steeper than an isotherm and the reader has filed it away as a fact about exponents. Two markers leaving one point and drifting apart, with figures attached only at the end, makes it a gap that is watched opening.',
      'The reader is asking where the energy for the work came from if no heat was let in, and what settles it is a thermometer falling while the piston rises.',
    ],

    avoidWhen: [
      'The article is about a gas in contact with a bath, or about heat flowing in while it expands. The insulation stays on and nothing crosses it.',
      'Work is the subject, or the area under the curve. Neither curve here is shaded underneath — the argument is about steepness and temperature, not about amount.',
      'The point is a compression that heats something you can feel, such as a pump or an engine stroke. The motion here is outward only, and the return is a brief tidying.',
      'A value is wanted for the ratio of heat capacities, or the equation the curve obeys. Neither is written anywhere.',
      'The subject is what happens when pressure or volume is pinned while heat is supplied. Nothing is pinned here but the heat path.',
    ],

    contrastWith: [
      {
        concept: 'isothermal-process',
        note: 'Opposite answers to what may cross the cylinder wall — one holds the path open so the temperature cannot move, the other seals it so the temperature must.',
      },
      {
        concept: 'pv-diagram',
        note: 'One compares the shapes of two routes and what they do to the gas itself; the other compares the areas beneath two routes and what they cost in work.',
      },
      {
        concept: 'isobaric-isochoric',
        note: 'One asks what a gas must give up when nothing is supplied to it; the other supplies heat and asks what pinning one quantity or the other does with it.',
      },
      {
        concept: 'carnot-cycle',
        note: 'One is a single sealed stroke and what it does to pressure and temperature; the other strings two such strokes together with two at fixed temperature and asks what the closed loop must surrender.',
      },
    ],
  },
};
