/**
 * energy-flow-diagram 개념 선언.
 *
 * 형제는 `efficiency`. **하나의 사슬인가 둘의 견줌인가**로 갈랐다.
 *   energy-flow-diagram  사슬 하나를 따라 **어느 마디에서 새는가** — 갈래의 굵기가 양
 *   efficiency           기계 **둘**을 같은 입구로 맞춰 「몫은 크기에 매이지 않는다」
 * 이쪽만 단계 · 갈래 · 새는 자리 · 「끝에 남는 줄기가 얼마나 가는가」 어휘를 갖는다.
 * 비 · 크기 맞춤 · 순서 뒤집힘은 efficiency 의 몫이다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const energyFlowDiagramConcept: Aperi21ConceptSource = {
  id: 'energy-flow-diagram',
  label: 'Energy Flow Through a Chain',
  canonicalSim: 'aperi21:energy-flow-diagram',

  surface: {
    definition:
      'A chain drawn so that the thickness of every strand is an amount of energy, with a branch peeling away at each stage until what reaches the end is a thread beside what set out.',
    exemplarKeywords: [
      'Sankey diagram',
      'energy flow diagram',
      'from coal to light',
      'where does the energy actually go',
      'losses at each stage of a chain',
      'waste heat',
      'power station, transmission line and bulb',
      'thickness shows the amount',
      'how little energy reaches the light',
      'tracing energy through a system',
    ],
  },

  briefing: {
    observable: [
      'A thick strand enters from the left and runs through a row of stages, each drawn as a node with its name written beside it.',
      'At every stage a branch peels away and bends downward, and the thickness of that branch is the amount leaving there.',
      'The branches end in tails that spread out and fade as they go down, so leaving is drawn as scattering rather than as arriving somewhere else.',
      'The amount on each branch is written next to it, so the largest loss can be named as well as seen.',
      'Grains travel along the strands and take the branch when a strand divides, which lets the dividing be watched grain by grain instead of read off the widths.',
      'The strand still going forward is visibly thinner after every stage, and the strand that finally becomes light is a thin thread beside the thickness the chain began with.',
      'That last strand — the one that became light — is the only thing in the accent colour.',
    ],

    screen: {
      affordances: [
        'The flow runs by itself and repeats, and the grains keep moving whether or not anything is chosen.',
        'Two chips at the top right pick which kind of bulb ends the chain, and choosing the better one thickens the light strand several times over while the branch at the power station does not move at all — so where the biggest loss sits is settled by the reader rather than asserted.',
        'That change is carried across over about half a second rather than snapping, so the thickening can be followed.',
        'Thickness is the only thing that stands for an amount anywhere on the picture, which is what lets branches at different stages be compared against each other by eye.',
        'What leaks and what goes forward share one colour family and are told apart by lightness and by the spreading tails, since they are the same energy at different points of its life.',
      ],
    },

    useWhen: [
      'The article has listed the losses along a chain and the reader has no sense of their proportions. The branch thicknesses put them in order at a glance and name the amounts beside them.',
      'The article argues that improving the last stage cannot repair a loss that happened at the first, and the chips let the reader make exactly that change and watch the first branch refuse to move.',
      'The reader thinks of energy as being used up, and the grains taking a branch rather than vanishing are what replaces that with going somewhere else.',
    ],

    avoidWhen: [
      'The article compares two machines to establish that efficiency is a proportion rather than an amount. There is one chain here and it is never scaled or matched against another.',
      'The subject is energy conservation in mechanics — a swinging pendulum, a falling ball, kinetic turning into potential and back.',
      'The subject is what heat is, why losses are unavoidable, or entropy. The branches leave and are never followed or explained.',
      'The article needs percentages worked out, or an efficiency figure computed from the numbers shown.',
      'The chain in the article is not this one. The stages are fixed — a power station, a transmission line and a bulb — and nothing else can be put in their place.',
      'The point is a machine that trades force for distance rather than one that passes energy along.',
    ],

    contrastWith: [
      {
        concept: 'efficiency',
        note: 'One follows a single chain and asks at which stage the energy left; the other sets two machines side by side and asks whether the share that comes out depends on how big the machine is.',
      },
      {
        concept: 'inelastic-collision',
        note: 'One says how much energy left and at which stage of a chain; the other says how much left in a single impact, and that the same fraction goes at every one.',
      },
    ],
  },
};
