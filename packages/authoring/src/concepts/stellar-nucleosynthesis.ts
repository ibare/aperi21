/**
 * stellar-nucleosynthesis 개념 선언.
 *
 * 별의 일생 넷 중 하나. 이쪽만 **무엇이 만들어지고 왜 멎는가**를 주장한다.
 *   stellar-nucleosynthesis         재가 연료가 되어 한 겹씩 — 곡선을 오르다 **철에서 멎는다**
 *   star-radiation-gravity-balance  층마다 두 힘이 같아 **크기를 지킨다**
 *   star-life-cycle                 질량이 가르는 **경로와 빠르기**
 *   supernova-and-neutron-star      받침을 잃은 뒤의 **1 초**
 * 이쪽만 원소 기호 · 양파 겹 · 핵자당 결합 에너지 · 「더 붙이면 내려간다」 어휘를 갖는다.
 * 화살표 · 충격파 · HR 도라는 말은 쓰지 않는다.
 */

import type { Aperi21ConceptSource } from '../concept-types.js';

export const stellarNucleosynthesisConcept: Aperi21ConceptSource = {
  id: 'stellar-nucleosynthesis',
  label: 'Fusion up the Binding-Energy Curve and Why It Halts at Iron',
  canonicalSim: 'aperi21:stellar-nucleosynthesis',

  surface: {
    definition:
      'The ladder of fusion in a massive core, each spent ash becoming the next fuel while the gain in binding per nucleon shrinks, until iron caps the climb.',
    exemplarKeywords: [
      'stellar nucleosynthesis',
      'why fusion stops at iron',
      'binding energy per nucleon curve',
      'onion shell structure of a massive star',
      'the ash becomes the next fuel',
      'hydrogen to helium to carbon to oxygen to silicon',
      'where do the elements come from',
      'iron peak of the curve',
      'gold and uranium are not made by fusion in a star',
      'fusing past iron costs energy instead of releasing it',
    ],
  },

  briefing: {
    observable: [
      'A cross-section of a core is drawn at the left, and at its very middle a new region grows outward with a bright burning rim marking where the making is happening.',
      'Once that region is full, the next one begins growing inside it and the earlier one stays as a layer, so shell after shell accumulates from the outside in and each carries an element symbol.',
      'At the right a curve is drawn with the lighter nuclei to the left and the heavier to the right, the vertical direction being how tightly bound each nucleon is.',
      'A stepped arrow climbs that curve from the symbol just completed to the one now being made, and its head arrives at a symbol in the same moment the burning rim does — the two pictures are saying one thing twice.',
      'The first step, from the lightest element to the next, is a long one, and every step after it is shorter than the one before, so the dwindling return is a matter of step length.',
      'The steps jump straight from one element’s point to the next rather than tracing the curve, because the intermediate nuclei are not passed through.',
      'The curve keeps the small irregularities of the real nuclei rather than being smoothed into an arc.',
      'When the last region has filled, the burning rim goes out, a vertical dashed wall rises at that element’s place on the curve, and a dashed arrow drawn past it goes downhill instead of up.',
      'Two further symbols then appear along that downhill stretch, and the closing line says such elements are made by events of another kind rather than by this fire.',
      'All the shells share one colour and deepen inward, and no number, mass figure or unit is written on either picture.',
    ],

    screen: {
      affordances: [
        'The shells fill one after another, the wall rises and the downhill arrow is drawn, all without anything being pressed, and then the cycle repeats.',
        'The picture opens with the second shell already growing, so there is no empty frame to wait through.',
        'Each successive shell takes less time to fill than the one before, following the direction of the real timescales without pretending to their ratio.',
        'Neither axis of the curve carries numbers — the horizontal is spaced so that the middle elements can be told apart and the vertical is there to be climbed, not read.',
        'The burning rim is put on the region now growing and on nothing else, so what is being made at this instant is never ambiguous.',
        'The shell thicknesses are chosen so that all the symbols can be read, and are not in proportion to a real core.',
      ],
    },

    useWhen: [
      'The article states that fusion in stars stops at iron and the reader takes it as an arbitrary boundary. Watching the steps shorten and then a dashed arrow head downhill turns the boundary into a consequence of the curve’s shape.',
      'The text describes a massive core as layered, and a picture is wanted in which the layering is produced — each layer visibly the leftover of the one that came before.',
    ],

    avoidWhen: [
      'The subject is where the elements heavier than the cap come from. They appear here only as two symbols on a downhill stretch with the making itself left unshown.',
      'What follows the fire going out — the collapse, the blast, the remnant — is the point. The picture ends with the rim dark and nothing moves afterwards.',
      'How long a star lives, what route it takes, or how its mass decides either, is at issue. Only one core is shown and no time is marked.',
      'What holds the star up while all this is going on is the claim. Nothing here is drawn pushing, pulling or balancing.',
      'Reaction equations, energy releases in useful units, or which temperature ignites which fuel, are required. No figure, symbol of a process or unit appears.',
      'The reader should choose a mass or a stage and inspect it. The ladder runs through once in a fixed order.',
      'The layers are to be taken at their real proportions. Their thicknesses are set so the symbols fit, not to scale.',
    ],

    contrastWith: [
      {
        concept: 'star-life-cycle',
        note: 'One follows what is being built inside the core and why the building has a last rung; the other follows where the star as a whole goes and how long it takes to get there.',
      },
      {
        concept: 'supernova-and-neutron-star',
        note: 'One ends the moment the core fire dies; the other begins there and is entirely about what the loss of that fire sets off.',
      },
      {
        concept: 'potential-energy-curve',
        note: 'Both read a curve by where a system can climb and where it cannot, treating an uphill direction as costly and a peak as a place things stop.',
      },
    ],
  },
};
