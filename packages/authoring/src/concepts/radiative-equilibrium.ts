/**
 * radiative-equilibrium 개념 선언.
 *
 * 들어온 빛과 온도 넷 중 하나. 주어를 **온도가 멎는 자리**로 잡았다 — 주장은
 * **어디서 출발해도 한 값으로 모인다** 이고, 그 값이 들어옴과 나감이 같아지는 자리다.
 * 반사(`albedo`)는 이미 빼고 들어오며, 층(`greenhouse-effect`)은 없다.
 *
 * `stefan-boltzmann-law` 와도 갈랐다 — 저쪽은 **네제곱** 자체, 이쪽은 그 때문에
 * 생기는 **한 자리로의 모임**이다. 화면에 네제곱 곡선이 없다.
 * `thermal-equilibrium` 과도 갈랐다 — 저쪽은 맞붙은 두 덩이가 서로에게 다가가고,
 * 이쪽은 각자 따로 같은 값에 선다.
 *
 * 조작기가 없다. affordances 에 **저절로 일어나는 것**을 적는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const radiativeEquilibriumConcept: Aperi21ConceptSource = {
  id: 'radiative-equilibrium',
  label: 'Radiative Equilibrium as a Settling Point',
  canonicalSim: 'aperi21:radiative-equilibrium',

  surface: {
    definition:
      'The single temperature a sunlit body settles at, reached from any starting temperature, where the radiation it gives off has grown or shrunk to match what it takes in.',
    exemplarKeywords: [
      'radiative equilibrium',
      'why does a planet settle at one particular temperature',
      'energy in equals energy out',
      'what stops a sunlit body from heating up forever',
      'the effective temperature of a planet',
      'balance between absorbed sunlight and emitted radiation',
      'planetary energy budget',
      'it warms until it stops warming',
      'the same temperature whether it starts hot or cold',
      'where the heating and the cooling cancel out',
    ],
  },

  briefing: {
    observable: [
      'Two identical planets stand side by side, alike in size and colour, with only a line beneath each saying the temperature it starts from — one cold, one hot.',
      'Above each planet a pair of bars rises from one baseline: the incoming bar, which is the same height on both, and the outgoing bar, which starts short on the cold planet and towers on the hot one.',
      'A dashed guideline carries the incoming height sideways across the outgoing bar, so that falling short and overshooting both read as a gap rather than as two numbers to compare.',
      'As the round runs, the cold planet’s outgoing bar grows toward the guideline and the hot planet’s shrinks toward it from above.',
      'A panel beside them draws a temperature curve for each planet from its own starting mark, steep while the gap is wide and flatter as it narrows.',
      'The two curves come together and run on as a single level line, with a dashed line and one written temperature naming the height they met at.',
      'At the same moment both outgoing bars have their tops on the guideline: the two bodies are not touching and have nothing to do with each other, yet they have arrived at the same place.',
      'No running temperature is written while the curves are moving, nothing is given in watts, and the time axis carries no marks — the only figures are the two starting temperatures and the one they meet at.',
      'Cold and hot are not told apart by colour; what says which is which is the height of a curve and of an outgoing bar.',
    ],

    screen: {
      affordances: [
        'One round has both planets settle and hold at the shared temperature before fading and starting over; nothing has to be pressed.',
        'Showing two planets at once rather than one twice is what makes the independence of the starting point visible in a single glance.',
        'Both pairs of bars are drawn from one baseline at one scale, so that comparing the two heights is the whole of the reading.',
        'The highlight colour carries a single meaning, the radiation being given off: the outgoing bars and their names wear it, and the incoming bars and the planets do not.',
        'The bar names sit below the baseline and stay put, so that a bar growing tall never pushes its own name into the guideline.',
        'The wording only says the curves have met once they have met.',
      ],
    },

    useWhen: [
      'The article has said that a body warms until what it radiates away matches what it takes in, and the reader cannot see why that should pick out any particular temperature. Two bars closing on one guideline while the two curves close on one line is what makes the balance into a place.',
      'The point being made is that the end state does not remember the beginning — that a body starting far too cold and one starting far too hot arrive at the same value — and the two planets give that without a word.',
    ],

    avoidWhen: [
      'The subject is how much of the arriving sunlight is turned away rather than taken in. No sunlight is drawn arriving here and nothing bounces; the incoming bar is already what was absorbed.',
      'The article is about an atmosphere or an absorbing layer raising the surface temperature. There is nothing above these planets.',
      'The point is the fourth-power law itself — how the output rises with temperature, or what doubling the temperature does. No such relation is drawn; the outgoing bar simply grows and shrinks.',
      'The article is about two bodies in contact coming to a common temperature by passing heat between them. These two exchange nothing whatever.',
      'What is wanted is how long it takes, in years or otherwise. The time axis is deliberately unmarked, and the pace on the screen is nothing like the real one.',
      'Figures are wanted in watts per square metre, or the constants behind them. Only temperatures are written.',
    ],

    contrastWith: [
      {
        concept: 'greenhouse-effect',
        note: 'One finds the temperature at which a bare body balances; the other puts a layer above it and finds that the balance is struck again higher up, with the sunlight unchanged.',
      },
      {
        concept: 'albedo',
        note: 'One begins after the reflecting is over, with what was absorbed; the other is entirely about the reflecting, and never asks what temperature follows.',
      },
      {
        concept: 'stefan-boltzmann-law',
        note: 'One is about how steeply the outgoing radiation depends on temperature; the other is about the consequence of that steepness, which is that a body cannot help but settle at one value.',
      },
      {
        concept: 'thermal-equilibrium',
        note: 'One has two touching bodies converge on each other, the end point lying between them; the other has two separate bodies each converge on a value neither of them started near, set by what arrives from outside.',
      },
    ],
  },
};
