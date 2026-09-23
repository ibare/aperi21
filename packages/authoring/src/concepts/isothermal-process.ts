/**
 * isothermal-process 개념 선언.
 *
 * 과정 다섯 중 하나(가름은 `pv-diagram.ts` 머리 참조).
 * 이 조각은 **들어온 열이 어디로 가는가** 하나를 주장한다 — 항온조에서 온 알갱이가
 * 기체에 하나도 머물지 않고 모두 피스톤으로 빠져나가 Q 더미와 W 더미가 같은 높이가 된다.
 * 이쪽만 항온조 · 지나가는 알갱이 · 두 더미 · 변하지 않는 온도 글자 어휘를 갖는다.
 * 곡선 모양(P×V 일정)은 화면이 주장하지 않아 avoidWhen 으로 되돌린다(간극 장부 참조).
 * 넓이 = 일(pv-diagram) · 식는다(adiabatic-process) 는 형제 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const isothermalProcessConcept: Aperi21ConceptSource = {
  id: 'isothermal-process',
  label: 'Isothermal Expansion on a Heat Bath',
  canonicalSim: 'aperi21:isothermal-process',

  surface: {
    definition:
      'An expansion held at one temperature by a bath, in which every unit of heat entering the gas leaves again as work on the piston and none is kept.',
    exemplarKeywords: [
      'isothermal process',
      'expansion at constant temperature',
      'heat bath holds the temperature fixed',
      'the gas stays at the same temperature while it expands',
      'all the heat that goes in comes out as work',
      'where does the heat go in an isothermal expansion',
      'thermal reservoir in contact with the cylinder',
      'slow expansion against a piston',
      'nothing is stored in the gas',
      'heat in equals work out',
    ],
  },

  briefing: {
    observable: [
      'A cylinder stands in a wide bath labelled with its temperature, and the piston rises slowly from its starting volume to about three times it.',
      'The temperature written on the gas is the same at the end as at the beginning, and the short streaks standing for the molecules keep the same length throughout, so their speed is plainly unaltered.',
      'Grains of heat in the accent colour rise one at a time out of the bath, cross the floor of the cylinder, pass straight through the gas and leave over the piston, arcing across the wall to land on a pile at the right.',
      'A pile at the left gains one the instant a grain crosses into the cylinder, so it always runs a grain or so ahead of the right-hand pile.',
      'Only one grain is ever in transit, and at no moment does a grain sit inside the gas — that absence is what "all of it" looks like.',
      'When the rise is over the two piles stand at exactly the same height, six against six, and the closing line says six came in and six went out with none left in the gas.',
      'Places not yet filled are drawn as empty outlines in both piles, so how many are still to come can be read before they arrive.',
      'The grains come thick and fast early in the rise and thin out towards the end, while the piston keeps an even pace throughout.',
      'On the right a marker runs down a curve along which the pressure falls as the volume grows, and the strip from the starting volume across to the present one fills in beneath it; the letter `W` written in that strip is the same letter that names the right-hand pile.',
      'A short closing move brings the piston back down while the piles and the filled strip fade, and the round begins again.',
    ],

    screen: {
      affordances: [
        'The whole round plays by itself from the first grain to the last; nothing is pressed and no amount is set.',
        'The grains are deliberately not evenly spaced in time — each stands for the same slice of the finished work — so their thinning out is itself a reading of how hard the gas is still pushing.',
        'One accent colour is spent on the heat alone, and the very same grains simply change which pile they rest on, so what came in and what went out are told apart by where they land rather than by being coloured differently.',
        'Only the outward stroke is argued; the piston’s return is a brief tidying rather than a compression to be read.',
        'There is no separate column for what the gas kept, because the claim is that there is nothing to put in one — the unchanged temperature and the empty gas carry that instead.',
      ],
    },

    useWhen: [
      'The article has said that in a change at constant temperature the internal energy does not move, so the heat in equals the work out, and the reader is holding it as a cancelled equation. Grains crossing the gas without ever stopping in it, and two piles finishing level, is that equation happening.',
      'The reader is asking what the bath is actually for, and the answer wanted is a written temperature and a set of molecule streaks that do not change across the whole expansion.',
    ],

    avoidWhen: [
      'The point is how pressure and volume trade off, or that their product stays constant. The curve is drawn but never argued — no rectangle is laid out and no product is checked.',
      'The article is about an expansion with the heat shut off, or about a gas cooling as it pushes. The bath is in contact the whole time and the temperature never moves.',
      'A compression is wanted, or heat leaving a gas. Everything here runs outward with heat coming in.',
      'The subject is how molecules share out their speeds, or what temperature is made of. One temperature is written and the streaks show only that it has held.',
      'Values in joules are needed, or a figure for the work. The grains are counted, never measured.',
    ],

    contrastWith: [
      {
        concept: 'adiabatic-process',
        note: 'Opposite answers to what a gas may exchange while it expands — one leaves the heat path open so the temperature cannot move, the other seals it so the temperature must.',
      },
      {
        concept: 'pv-diagram',
        note: 'One follows the heat that paid for the work; the other takes the work as an area and asks only how the route changes its size.',
      },
      {
        concept: 'cyclic-process',
        note: 'One tracks a single outward change and where its heat finished up; the other closes the change into a loop and asks what survives the round trip.',
      },
      {
        concept: 'heat-engine',
        note: 'One is a single stroke in which nothing of the heat is left over; the other is a machine that must come back to its start every turn, and for that a share of the heat has to be given up.',
      },
    ],
  },
};
