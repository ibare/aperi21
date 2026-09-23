/**
 * efficiency 개념 선언.
 *
 * 형제는 같은 묶음의 `energy-flow-diagram` 과 이미 선언된 `mechanical-advantage`.
 * **무엇을 견주는가**로 갈랐다.
 *   efficiency           기계 **둘**을 같은 입구로 맞춰 「몫은 크기에 매이지 않는다」
 *   energy-flow-diagram  사슬 **하나**를 따라가며 「어느 단계에서 새는가」
 *   mechanical-advantage 힘의 이득 — 에너지가 아니라 힘을 바꾼다
 * 이쪽만 비 · 크기 맞춤 · 순서 뒤집힘 어휘를 갖는다. 단계 · 사슬 · 어디서 새는가라는
 * 말은 energy-flow-diagram 에 넘겼다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const efficiencyConcept: Aperi21ConceptSource = {
  id: 'efficiency',
  label: 'Efficiency as a Ratio',
  canonicalSim: 'aperi21:efficiency',

  surface: {
    definition:
      'The share of what a machine is fed that leaves it as the wanted output — a proportion that survives being scaled, so the machine giving more can be the poorer one.',
    exemplarKeywords: [
      'efficiency',
      'percentage efficiency',
      'useful output over total input',
      'which machine is more efficient',
      'a bigger engine is not a better engine',
      'wasted energy as a fraction rather than an amount',
      'comparing two machines fairly',
      'same input different output',
      'efficiency does not depend on size',
      'it produces more but wastes more',
    ],
  },

  briefing: {
    observable: [
      'Two machines sit side by side, each fed by a band coming in from the left whose thickness is the amount of energy.',
      'Inside each machine the band parts into a strand that leaves to the right as the wanted output, drawn in the accent colour with an arrowhead, and a strand that bends away downward, drawn with a slanted hatch as the part that leaks.',
      'At their own sizes the left machine is fed a far thicker band and its useful strand is the thicker of the two, so the first impression is that the left machine is the better one.',
      'The right machine then grows until its incoming band is as thick as the left one’s, and all three of its strands thicken together by that same factor rather than the inlet alone.',
      'The figures beside the strands change from joules to percents while the growing happens, so after the matching they read as shares of what went in rather than as amounts.',
      'With the two inlets the same thickness the order has turned over: the right machine’s useful strand is now the thicker one, and the left machine’s leaking strand is the thicker one.',
      'The right machine then shrinks back to its own size, and the closing line says the thicknesses changed while the shares never did.',
      'Dots travel along the bands, one thread of them per joule, so at their own sizes the threads can be counted; when the right machine is grown its threads spread apart without becoming more numerous.',
    ],

    screen: {
      affordances: [
        'The running, the matching, the turned-over comparison and the shrinking back happen in order and then begin again; nothing has to be pressed.',
        'One single factor is applied to every strand of the machine being grown, so the growing is visibly unable to alter the shares.',
        'The accent colour is kept for the wanted output alone; the leaking part is the same colour as the incoming band and is told apart by its hatching, because it is the same energy and not another kind.',
        'No formula, scale or grid is drawn, and no efficiency figure is written out — the two matched inlets are what does the arithmetic.',
      ],
    },

    useWhen: [
      'The article has said that efficiency is a ratio and the reader keeps ranking machines by how much comes out. The moment the inlets are matched and the thicker useful strand changes sides is what unseats that ranking.',
      'The article needs a picture of scaling that leaves a proportion untouched, and a case is wanted where the same operation visibly changes every part by the same factor.',
    ],

    avoidWhen: [
      'The subject is a chain of stages and where along it the energy is going. There are only two machines here, each one stage deep, and they are not connected to each other.',
      'The subject is a machine that multiplies force — a lever, a pulley, a ramp — and what is paid for it in distance. Nothing here is pushed or lifted; the bands carry energy.',
      'The article needs efficiency worked out, or an efficiency figure compared against a standard. The figures shown are the strand amounts, and no division is performed on screen.',
      'The point is why a perfect machine is impossible, or what becomes of the energy that leaks — heat, friction, entropy. The leaking strand simply bends away and is never followed.',
      'The reader is to change the amounts and see what follows. The two machines are fixed and the matching happens on its own.',
    ],

    contrastWith: [
      {
        concept: 'energy-flow-diagram',
        note: 'One asks how much of the input a machine returns and whether that share depends on size; the other asks at which point along a chain the energy left, and which stage the biggest loss belongs to.',
      },
      {
        concept: 'mechanical-advantage',
        note: 'One is a ratio of energies and says nothing is gained overall; the other is a ratio of forces and is exactly about gaining one, at the price of distance.',
      },
    ],
  },
};
