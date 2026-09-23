/**
 * capacitors-in-circuit 개념 선언.
 *
 * 축전기 넷 가운데 이쪽은 **둘을 합치면 어떤 하나와 같은가** 다 — 판은 하나도 바꾸지 않는다.
 *   capacitors-in-circuit      나란히 = **넓이가 합쳐진** 하나, 한 줄 = **간격이 합쳐진** 하나
 *   parallel-plate-capacitor   한 쌍의 **넓이 · 간격**을 직접 바꾼다 (전하가 드나든다)
 *   dielectric                 한 쌍의 **속**을 채운다
 *   energy-in-capacitor        한 쌍에 전하를 **담는 데 든 일**
 * 이쪽만 「두 축전기 · 나란히와 한 줄 · 합쳐 하나로 · 가운데 도체가 걷힌다」 어휘를 갖는다.
 * 합치는 동안 전하가 드나들지 않으므로 전류 · 충전 곡선 · 전압 분배는 검색어에도 두지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const capacitorsInCircuitConcept: Aperi21ConceptSource = {
  id: 'capacitors-in-circuit',
  label: 'What Two Capacitors Together Come To',
  canonicalSim: 'aperi21:capacitors-in-circuit',

  surface: {
    definition:
      'That two equal capacitors wired side by side come to one with twice the plate area, holding twice the charge, while wired one after another they come to one with twice the gap, holding half.',
    exemplarKeywords: [
      'capacitors in series and parallel',
      'combining two capacitors',
      'equivalent capacitance of a pair',
      'why do capacitors add in parallel',
      'series capacitors add as reciprocals',
      'capacitors combine the opposite way from resistors',
      'two capacitors across one battery',
      'total capacitance of a simple network',
      'series capacitors hold less than one alone',
      'which way round are the capacitor combination rules',
    ],
  },

  briefing: {
    observable: [
      'Two panels stand side by side, each with its own battery named 6 V and its own small wiring diagram above, one showing two capacitor symbols on separate branches and one showing them one after another in a single line, each symbol named 2μF, the panels themselves named Parallel and Series.',
      'Below each diagram the plates are drawn from the side.',
      'In the parallel panel two pairs of plates stand apart, each pair carrying four plus and four minus marks and named +Q and −Q, and each plate length named A.',
      'In the series panel two pairs are stacked one above the other, the outer plates carrying two marks each and named +Q/2 and −Q/2, while between them a middle conductor shows minus on its upper face and plus on its lower, with each of the two gaps named d.',
      'The two parallel pairs then slide together until their plates join into single plates, while in the series panel the middle conductor thins toward nothing and fades away, the marks on its faces fading with it, and the outer plates close in exactly as far as it thins.',
      'Through all this the number of marks on the outer plates of both panels does not change.',
      'It is then held: the parallel panel is one pair of plates named 2A carrying eight plus and eight minus, named +2Q and −2Q; the series panel is one pair whose gap is named 2d carrying two plus and two minus, named +Q/2 and −Q/2.',
      'Then both come apart again and the run begins over.',
      'No arrow of flow is drawn on any wire at any point, and the names A, 2A, d, 2d and the Q names appear only while everything is standing still.',
      'The combined values are nowhere written — no total capacitance, no charge in coulombs.',
    ],

    screen: {
      affordances: [
        'Nothing has to be pressed; the pairs merge, are held merged, and part again.',
        'Both arrangements are shown at once on one screen, so their opposite outcomes can be set against each other rather than held in memory from one to the next.',
        'The same battery value and the same capacitor value are written on both sides, so the only difference between the panels is the wiring.',
        'No charge is drawn moving while the merging happens, because what is merged is the very same thing as the two it came from.',
        'In the series panel the outer plates close in exactly as far as the middle conductor thins, so the gap that decides the outcome is unchanged at every moment of the clearing away.',
        'Each panel names only the quantity that is being combined — the length on one side, the gap on the other — since the other one is not changing.',
        'The accent colour is kept for the charge on the plates; the two panels are told apart by their diagrams and names rather than by colour.',
      ],
    },

    useWhen: [
      'The article gives the two combination rules and the reader can only keep them straight by checking against resistors. Plates joining into one wider pair on the one hand, and a middle conductor being cleared away to leave one wider gap on the other, gives each rule a shape to be remembered by.',
      'The prose needs the part readers find least believable — that wiring two in a line holds less than one alone. Two of them ending as a single pair with twice the gap, carrying the very marks the outer plates had all along, is where that is settled.',
    ],

    avoidWhen: [
      'The subject is how the voltage divides between capacitors in a line, or that each of them carries the same charge. Neither is named or drawn here.',
      'The subject is resistors in series and parallel, or a mixed network, or three and more capacitors. There are two, identical, in each panel.',
      'Numbers are wanted — an equivalent capacitance worked out, unequal values, a calculation to follow.',
      'Charge flowing in or out is wanted, or a charging curve, or a time constant. No flow is drawn anywhere.',
      'The interest is in changing the area or the gap of one capacitor to change what it holds. Every pair here keeps the area and gap it was given.',
      'The energy held by a combination, or how it divides between the two, is the subject.',
    ],

    contrastWith: [
      {
        concept: 'parallel-plate-capacitor',
        note: 'One keeps every pair of plates exactly as it is and changes only how two of them are wired; the other has a single pair whose area and gap are themselves altered.',
      },
      {
        concept: 'dielectric',
        note: 'One reaches a larger or smaller store by rearranging identical parts; the other reaches it by changing what fills the gap of one of them.',
      },
      {
        concept: 'energy-in-capacitor',
        note: 'One asks what a combination is equivalent to; the other stays with a single capacitor and asks what putting charge on it cost.',
      },
      {
        concept: 'uniform-field',
        note: 'One works only with plate lengths, gap widths and counts of charge and never draws what is in a gap; the other is about the field in such a gap and nothing else.',
      },
      {
        concept: 'series-parallel-resistors',
        note: 'Both join two identical components in the same two ways and ask what the pair amounts to, but joining them end to end raises a resistance while it lowers a capacitance, because one counts what gets through and the other what is held.',
      },
    ],
  },
};
